const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 8080;

const jwtSecret = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY4NjE1MjAwMywiaWF0IjoxNjg2MTUyMDAzfQ.psGlhK3SxnsCbZQgvtfK1R00bV8ukGq0ayNbb5d5QWc';

// create a MySQL connection pool
const pool = mysql.createPool({
  host: '34.101.195.31',
  user: 'root',
  password: 'c23@ps261',
  database: 'botaniplan',
  connectionLimit: 100
});

// middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// handle user registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }
    await pool.query('INSERT INTO users SET ?', { username, email, password });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// handle user login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ Role: rows[0].Role, Issuer: rows[0].Issuer, Username: rows[0].Username }, jwtSecret, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// handle user logout
app.post('/logout', verifyToken, (req, res) => {
  // simply return success message as there is nothing to do on the server
  return res.status(200).json({ message: 'Logged out successfully' });
});

// handle weather data retrieval
app.get('/weather', verifyToken, async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing latitude or longitude' });
  }
  try {
    // retrieve weather data from openweathermap.com
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=0c138a3868d5f4fc70bbf3b8a2354f6d`);
    const { temp, humidity } = weatherResponse.data.main;
    const { rain } = weatherResponse.data;
    const rainfall = rain ? rain['1h'] || rain['3h'] || rain['6h'] || 0 : 0; // retrieve rainfall in the last hour, 3 hours, or 6 hours; if not available, set to 0

    // retrieve elevation data from open-meteo.com
    const elevationResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&altitude=0`);
    const { elevation } = elevationResponse.data.data[0];

    // retrieve predictive data from Flask App Engine API
    const predictiveResponse = await axios.post('https://myflaskapp.appspot.com/predict', { temp, humidity, rainfall, elevation });

    return res.status(200).json({ temperature: temp, humidity, rainfall, elevation, predictiveData: predictiveResponse.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});