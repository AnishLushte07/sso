/**
 * Main application routes
 */
const express = require('express');
const rp = require('request-promise');
const path = require('path');

const { name, version } = require('../package.json');

const { PREFIX, DOMAIN } = require('./config/environment');
const logger = require('./components/logger');
const errors = require('./components/errors');
const { authenticate: jwtAuthenticate, sign } = require('./components/jwt');
const authenticate = require('./components/oauth/authenticate');
const user = require('./api/user');
const passwordResetLogin = require('./api/passwordResetLogin');

// - Routers
module.exports = (app) => {
  app.use(express.static(app.get('appPath')));

  app.use('/api/users', user, authenticate);
  app.use('/api/password_reset', passwordResetLogin);

  app.get('/', (req, res) => res.json({ version, name }));
  app.get('/signedUrl', (req, res) => res.json(`http://aapi.quezx.test/l?access_token=${sign({ email: 'manjeshpv@gmail.com' })}`));
  app.get('/l', jwtAuthenticate, (req, res, next) => rp({
    uri: `${PREFIX}aapi.${DOMAIN}/authorise`,
    method: 'POST',
    form: {
      username: req.user.email,
      grant_type: 'loginAs',
    },
  })
    .then(url => res.redirect(url))
    .catch(next));
  // All undefined asset or api routes should return a 404
  app.use(app.oauth.errorHandler());
  app.use(logger.transports.sentry.raven.errorHandler());
  app.use((e, req, res, next) => {
    if (!next) return null;
    const err = e;
    const { body, headers, user: u } = req;

    logger.error(err.message, err, {
      url: req.originalUrl,
      body,
      headers,
      user: u,
    });

    return res.status(500).json({ message: err.message, stack: err.stack });
  });
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);
  app.route('/*').get((req, res) => res.sendFile(path.resolve(`${app.get('appPath')}/index.html`)));

  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
};
