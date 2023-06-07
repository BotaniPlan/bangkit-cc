const jwt = require('../jwt');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }
  const user = jwt.verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
  req.user = user;
  next();
}

module.exports = { authenticate };