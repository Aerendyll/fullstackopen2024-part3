// app.js

const express = require('express');
const app = express();
const cors = require('cors');
const personsRouter = require('./controllers/persons');
const { requestLogger, unknownEndpoint, errorHandler } = require('./utils/middleware');
const logger = require('./utils/logger');
const config = require('./utils/config');
const mongoose = require('mongoose');

logger.info('Connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());
app.use(requestLogger);

app.use('/api/persons', personsRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
