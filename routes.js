const express = require('express');
const auth = require('./auth');
const { getWeather, getElevation } = require('./weather');
const { getPredictiveData } = require('./flask');
const router = express.Router();
const pool = require('./db');
const axios = require('axios');
const config = require('./config');
const { getRainfallCategory, getElevationCategory } = require('./convert');

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

// Endpoint POST /recommend
router.post('/recommend', auth.authenticate, async (req, res) => {
  const { lat, lon } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  try {
    // Mengambil data weather, elevation, dan city dari endpoint yang sudah ada
    const weatherResponse = await axios.get(`${config.endpointUrl}/weather?lat=${lat}&lon=${lon}`, { headers: { Authorization: `Bearer ${token}` } });
    const elevationResponse = await axios.get(`${config.endpointUrl}/elevation?lat=${lat}&lon=${lon}`, { headers: { Authorization: `Bearer ${token}` } });
    const cityResponse = await axios.get(`${config.endpointUrl}/city?lat=${lat}&lon=${lon}`, { headers: { Authorization: `Bearer ${token}` } });

    // Ekstraksi data dari response
    const { avgTemp, avgHumidity, avgRain } = weatherResponse.data;
    const { elevation } = elevationResponse.data;
    const { city } = cityResponse.data;
    const rain = getRainfallCategory(avgRain);
    const elev = getElevationCategory(elevation);

    // Membuat request ke API Flask untuk mendapatkan rekomendasi
    const avg_temp = avgTemp;
    const humid = avgHumidity;
    const rainfall = rain;
    const altitude = elev;
    const recommendationResponse = await axios.post(`${config.flaskApiUrl}/get-recommendation`, {
      avg_temp,
      humid,
      rainfall,
      altitude,
      city
    });

    // Mengirimkan response dari API Flask ke client
    res.status(200).json(recommendationResponse.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to retrieve recommendation data' });
  }
});


// Endpoint POST /predict
router.post('/predict', auth.authenticate, async (req, res) => {
  const { tanaman, luas_panen, produksi, daerah } = req.body;
  try {
    const predictResponse = await axios.post(`${config.flaskApiUrl}/get-price-prediction`, {
      tanaman,
      luas_panen,
      produksi,
      daerah
    });

    // Mengirimkan response dari API Flask ke client
    res.status(200).json(predictResponse.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to retrieve recommendation data' });
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