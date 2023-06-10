const express = require('express');
const auth = require('./auth');
const { getWeather, getElevation } = require('./weather');
const { getPredictiveData } = require('./flask');
const router = express.Router();
const pool = require('./db');
const axios = require('axios');
const config = require('./config');

router.get('/weather', auth.authenticate, async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const weatherData = await getWeather(lat, lon);
    const dailyData = weatherData.daily;
    let totalHumidity = 0;
    let totalTemp = 0;
    for (let i = 0; i < dailyData.length; i++) {
      totalHumidity += dailyData[i].humidity;
      totalTemp += dailyData[i].temp.day;
    }
    const avgHumidity = totalHumidity / dailyData.length;
    const avgTemp = totalTemp / dailyData.length;
    // Karena rain data tidak selalu ada, jadi di filter terlebih dahulu
    const rainData = dailyData.filter(data => data.rain !== undefined);
    let sumRain = 0;
    if (rainData.length > 0) {
      sumRain = rainData.reduce((acc, curr) => acc + curr.rain, 0);
    }
    const avgRain = sumRain / rainData.length;

    return res.status(200).json({ avgTemp, avgHumidity, avgRain });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve weather data' });
  }
});

router.get('/elevation', auth.authenticate, async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const elevationData = await getElevation(lat, lon);
    const elevation = elevationData.elevation || 0;
    return res.status(200).json({ elevation });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve elevation data' });
  }
});

router.get('/city', auth.authenticate, async (req, res) => {
  const { lat, lon } = req.query;

  axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    .then(response => {
      let cityName = response.data.address.city;
      if (!cityName) {
        cityName = response.data.address.town;
      }
      if (cityName) {
        cityName = cityName.replace(/(Kota|Kabupaten)\s/gi, '');
      }
      res.json({ city: cityName });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error: 'Failed to get city name' });
    });
});

router.post('/recommend', async (req, res) => {
  const { lat, lon } = req.body;

  // Retrieve weather data
  const weatherUrl = `${config.endpointUrl}/weather?lat=${lat}&lon=${lon}`;
  let weatherData = null;
  try {
    const weatherResponse = await axios.get(weatherUrl);
    weatherData = weatherResponse.data;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve weather data' });
  }

  // Retrieve elevation data
  const elevationUrl = `${config.endpointUrl}/elevation?lat=${lat}&lon=${lon}`;
  let elevationData = null;
  try {
    const elevationResponse = await axios.get(elevationUrl);
    elevationData = elevationResponse.data;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve elevation data' });
  }

  // Retrieve city name
  const cityUrl = `${config.endpointUrl}/city?lat=${lat}&lon=${lon}`;
  let cityData = null;
  try {
    const cityResponse = await axios.get(cityUrl);
    cityData = cityResponse.data;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve city data' });
  }

  // Prepare data for recommendation API
  const { avgTemp, avgHumidity, avgRain } = weatherData;
  const { elevation } = elevationData;
  const { city } = cityData;
  const rain = getRainfallCategory(avgRain);
  const elev = getElevationCategory(elevation);

  try {
    const predictiveData = await getPredictiveData(avgTemp, avgHumidity, rain, elev, city);
    return res.status(200).json({ predictiveData });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve recommendation data' });
  }
});

router.post('/predict', auth.authenticate, async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const weatherData = await getWeather(lat, lon);
    const elevationData = await getElevation(lat, lon);
    const { temp, humidity } = weatherData.main;
    const rainfall = weatherData.rain ? weatherData.rain['1h'] : 0;
    const elevation = elevationData.elevation || 0;
    const predictiveData = await getPredictiveData(temp, humidity, rainfall, elevation);
    return res.status(200).json({ weatherData, elevationData, predictiveData });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to retrieve weather data' });
  }
});



router.get('/plants', auth.authenticate, async (req, res) => {
  const ids = req.query.id;
  if (!ids) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const sql = 'SELECT * FROM plants WHERE id IN (?)';
  pool.query(sql, [ids], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to get plants data' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Plants data not available' });
    }
    const plants = results;
    return res.status(200).json({ plants });
  });
});

module.exports = router;