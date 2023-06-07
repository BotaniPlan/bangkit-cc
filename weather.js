const request = require('request');
const config = require('./config');

function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=${config.openWeatherApiKey}`;
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

function getElevation(lat, lon) {
  const url = `${config.openMeteoApiUrl}/elevation?latitude=${lat}&longitude=${lon}`;
  return new Promise((resolve, reject) => {
    request(url, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

module.exports = { getWeather, getElevation };