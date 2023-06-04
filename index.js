const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(express.json());

const dbConfig = {
  connectionLimit: 1,
  user: 'root',
  password: 'rahasia-umum', // ganti sebelum di deploy
  database: 'botaniplan',
  socketPath: '/cloudsql/<connection_name>' // ganti sebelum di deploy
};

const pool = mysql.createPool(dbConfig);

const jwtSecret = '<insert_jwt_secret>'; // ganti sebelum di deploy

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Sign Up Endpoint
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  pool.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, password],
    (error, results) => {
      if (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'User already exists' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.sendStatus(201);
    }
  );
});

// Sign In Endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = results[0];
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
        expiresIn: '1h'
      });
      res.json({ token });
    }
  );
});

// Sign Out Endpoint
app.post('/logout', verifyToken, (req, res) => {
  res.sendStatus(200);
});

// OpenWeather Endpoint
// Untuk mengambil data temp, humidity, rainfall
app.get('/weather', verifyToken, async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=key`; // ganti sebelum di deploy, API Key OpenWeather
  try {
    const response = await axios.get(url);
    const { main, rain } = response.data;
    res.json({ temperature: main.temp, humidity: main.humidity, rainfall: rain?.['1h'] || 0 });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Open-Meteo Endpoint
// Untuk mengambil data elevation
app.get('/elevation', verifyToken, async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  const url = `https://api.open-meteo.com/v1/alti?lat=${lat}&lon=${lon}&model=dem10m`;
  try {
    const response = await axios.get(url);
    const { elevation } = response.data?.[0]?.elevation || {};
    res.json({ elevation: elevation || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// BotaniPlan Model Endpoint
// Untuk mendapatkan hasil prediksi dan rekomendasi
app.post('/predict', verifyToken, (req, res) => {
  const { temperature, humidity, rainfall, elevation } = req.body;
  if (!temperature || !humidity || !rainfall || !elevation) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  const url = 'https://<flask_app_url>/predict'; // ganti sebelum di deploy
  axios
    .post(url, { temperature, humidity, rainfall, elevation })
    .then((response) => {
      res.json({ prediction: response.data?.prediction || 0 });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
