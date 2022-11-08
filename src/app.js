const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
// Must first load the models
require('./models/user');

// Pass the global passport object into the configuration function
require('./config/passport')(passport);
const routes = require('./routes');

/**
 * -------------- GENERAL SETUP ----------------
 */
module.exports.setup = function setup(app) {
  // This will initialize the passport object on every request
  app.use(passport.initialize());
  // Instead of using body-parser middleware, use the new Express implementation of the same thing
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));
  // Allows our Angular application to make HTTP requests to Express application
  app.use(cors());
  app.use((req, res, next) => {
    // res.append('Access-Control-Allow-Origin', ['*']);
    // res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Range');
    res.append('Access-Control-Expose-Headers', 'Content-Range');
    next();
  });
  // Where Angular builds to - In the ./angular/angular.json file, you will find this configuration
  // at the property: projects.angular.architect.build.options.outputPath
  // When you run `ng build`, the output will go to the ./public directory
  app.use(express.static(path.join(__dirname, 'public')));
  /**
   * -------------- ROUTES ----------------
   */
  // Imports all of the routes from ./routes/index.js
  app.use(routes);
};
