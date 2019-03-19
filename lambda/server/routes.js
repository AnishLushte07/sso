/**
 * Lambda application routes
 */
const { name, version } = require('../package.json');

const logger = require('./components/logger');

// - Routers
const user = require('./api/user');
const passwordResetLogin = require('./api/passwordResetLogin');

module.exports = (app) => {
  app.get('/api/health', (req, res) => res.json({ name, version }));
  app.use('/api/users', user);
  app.use('/api/passwordResetLogins', passwordResetLogin);

  app.use(logger.transports.sentry.raven.errorHandler());

  // All undefined asset or api routes should return a 404
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
  app.route('/*').get((req, res) => res.status(404).json({ message: '404' }));
};
