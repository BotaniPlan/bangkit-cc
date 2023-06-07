const request = require('request');
const config = require('./config');

function getPredictiveData(temp, humidity, rainfall, elevation) {
  const url = `${config.flaskApiUrl}/predict?temp=${temp}&humidity=${humidity}&rainfall=${rainfall}&elevation=${elevation}`;
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

module.exports = { getPredictiveData };