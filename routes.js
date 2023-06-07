const express = require('express');
const auth = require('./auth');
//const users = require('./users');
const { getWeather, getElevation } = require('./weather');
const { getPredictiveData } = require('./flask');
const router = express.Router();

//router.use('/users', users);

router.get('/weather', auth.authenticate, async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const weatherData = await getWeather(lat, lon);
    //
    const dailyData = weatherData.daily;
    let totalRain = 0;
    let totalHumidity = 0;
    let totalTemp = 0;
    for (let i = 0; i < dailyData.length; i++) {
      totalRain += dailyData[i].rain;
      totalHumidity += dailyData[i].humidity;
      totalTemp += dailyData[i].temp.day;
    }
    const avgRain = totalRain / dailyData.length;
    const avgHumidity = totalHumidity / dailyData.length;
    const avgTemp = totalTemp / dailyData.length;
    //const { temp, humidity } = weatherData.current;
    //const rainfall = weatherData.rain ? weatherData.rain['1h'] : 0;
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
    return res.status(500).json({ message: 'Failed to retrieve weather data' });
  }
});

router.get('/predict', auth.authenticate, async (req, res) => {
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

module.exports = router;