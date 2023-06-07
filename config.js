module.exports = {
    port: process.env.PORT || 8080,
    jwtSecret: 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY4NjE1MjAwMywiaWF0IjoxNjg2MTUyMDAzfQ.psGlhK3SxnsCbZQgvtfK1R00bV8ukGq0ayNbb5d5QWc', // https://www.javainuse.com/jwtgenerator HS256 c23@ps261
    dbConfig: {
      connectionLimit: 10,
      host: '34.101.195.31',
      user: 'root',
      password: 'c23@ps261',
      database: 'botaniplan',
      socketPath: `/cloudsql/c23-ps261:asia-southeast2:botaniplan`
    },
    openWeatherApiKey: '0c138a3868d5f4fc70bbf3b8a2354f6d',
    openMeteoApiUrl: 'https://api.open-meteo.com/v1',
    flaskApiUrl: 'https://flask-app.appspot.com' // ganti dengan app engine url
  };