
const authenticate = require('./../authenticate');
const oAuth = require('./../');
const directLogin = require('./directLogin');
const loginAs = require('./loginAs');
const db = require('./../../../conn/sqldb');
const google = require('./google');

module.exports = (a, routes, rateLimit) => {
  const app = a;
  app.oauth = oAuth;
  // OAuth Token authorization_code, password, refresh_token
  app.all('/oauth/token', rateLimit, directLogin, app.oauth.grant());
  app.all('/oauth/google', google.login);

  app.all('/oauth/revoke', rateLimit, (req, res, next) => {
    db.RefreshToken
      .find({
        attributes: [['session_id', 'sessionId']],
        where: {
          refresh_token: req.body.token,
        },
        raw: true,
      })
      .then(s => (s && s.sessionId ? db.Session.logout(db, s.sessionId) : Promise.resolve()))
      .then(s => res.json(s))
      .catch(next);
  });

  app.post('/api/authorise', rateLimit, loginAs, authenticate(), app.oauth
    .authCodeGrant((req, callback) => {
      if (req.body.allow !== 'true') return callback(null, false);
      return callback(null, true, req.user);
    }));

  app.post('/authorise', rateLimit, loginAs, authenticate(), app.oauth
    .authCodeGrant((req, callback) => {
      if (req.body.allow !== 'true') return callback(null, false);
      return callback(null, true, req.user);
    }));
  // OAuth Authorise from Third party applications
  routes(app);
  app.use(app.oauth.errorHandler());
};
