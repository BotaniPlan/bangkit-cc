const express = require('express');
const auth = require('./middlewares/auth');
const users = require('./routes/users');
const { getWeather, getElevation } = require('./weather');
const { getPredictiveData } = require('./flask');
const router = express.Router();

router.use('/users', users);

router.get('/weather', auth.authenticate, async (req, res) => {
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