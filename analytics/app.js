const express = require('express');
require('dotenv').config();
require('./api/data/db');
const router = require('./api/routers');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', function (req, res, next) {
  res.set({
    [process.env.CROSS_ORIGIN]: [process.env.ALLOW_DOMAIN],
    [process.env.CROSS_ORIGIN_METHODS]: [process.env.ALLOW_METHODS],
    [process.env.CROSS_ORIGIN_HEADERS]: [process.env.ALLOW_HEADERS],
  });
  next();
});

app.use('/api', router);

const server = app.listen(process.env.PORT, function () {
  console.log(process.env.APP_LISTEN_PORT + server.address().port);
});
