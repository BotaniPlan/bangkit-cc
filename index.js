const express = require('express');
const config = require('./config');
const routes = require('./routes');
const users = require('./users');
const app = express();

app.use(express.json());
app.use(users);
app.use(routes);

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});