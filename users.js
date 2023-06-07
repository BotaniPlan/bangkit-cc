const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('../jwt');
const pool = require('../db');
const router = express.Router();

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  pool.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to register user' });
    }
    const user = { id: result.insertId, username, email };
    const token = jwt.generateToken(user);
    return res.status(201).json({ user, token });
  });
});

router.post('/login', (req, res) => {
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('../jwt');
const pool = require('../db');
const router = express.Router();
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  pool.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to register user' });
    }
    const user = { id: result.insertId, username, email };
    const token = jwt.generateToken(user);
    return res.status(201).json({ user, token });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const sql = 'SELECT * FROM users WHERE email = ?';
  pool.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate user' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.generateToken({ id: user.id, username: user.username, email });
    return res.status(200).json({ user, token });
  });
});

router.post('/logout', (req, res) => {
  // Logout logic here
});

module.exports = router;