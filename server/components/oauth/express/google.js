const rp = require('request-promise');

const env = require('../../../config/environment');
const logger = require('../../../components/logger');
const db = require('./../../../conn/sqldb');

exports.login = (req, res) => {
  const basicScope = 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email';
  const path = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=${basicScope}&access_type=offline&redirect_uri=${env.auth.google.redirect_uri}&client_id=${env.auth.google.client_id}&include_granted_scopes=true&state=${req.query.continue}`;
  res.writeHead(302, { Location: path });
  return res.end();
};

exports.oauth = (req, res, next) => {
  if (req.body.grant_type !== 'google') return next();
  return rp({
    method: 'POST',
    uri: 'https://www.googleapis.com/oauth2/v4/token',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form: {
      grant_type: 'authorization_code',
      redirect_uri: env.auth.google.redirect_uri,
      client_id: env.auth.google.client_id,
      client_secret: env.auth.google.client_secret,
      code: req.body.code,
    },
    json: true,
  })
    .then(token =>
      Promise.all([
        token,
        rp({
          method: 'GET',
          uri: 'https://www.googleapis.com/plus/v1/people/me',
          headers: { Authorization: `Bearer ${token.access_token}` },
          json: true,
        }),
      ]))
    .then(([gToken, user]) => {
      logger.log('DETAILS', { gToken, user });
      const { emails } = user;
      const email = emails.filter(x => (x.type === 'account'))[0].value;
      req.body.grant_type = 'password';
      req.body = { username: email, password: env.CRON_TOKEN };
      logger.log('AFTER GOOGLE LOGIN', req.body);
      return next();
    })
    .catch((err) => {
      logger.error('error while google login', err);
      return res.status(400).json(err);
    });
};
