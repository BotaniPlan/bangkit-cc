const jwt = require('jsonwebtoken');
const config = require('./config');

function generateToken(user) {
  const token = jwt.sign({ user }, config.jwtSecret, { expiresIn: '1h' });
  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded.user;
  } catch (err) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };