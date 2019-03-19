const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const root = path.normalize(`${__dirname}/../../..`);

if (!fs.existsSync(path.join(root, '.env'))) {
  fs.writeFileSync(path.join(root, '.env'), fs.readFileSync(path.join(root, '.env.sample')));
}
const env = dotenv.config({ path: path.join(root, '.env') }).parsed;
const IS_DEV = env.NODE_ENV === 'development';
const { PREFIX, DOMAIN } = env;
const config = {
  all: {
    env: process.env.NODE_ENV,
    // Server port
    port: process.env.PORT || 2000,
    ip: process.env.IP || '0.0.0.0',
    root,
    URLS_SSO: `${PREFIX}sso.${DOMAIN}`,
    URLS_QUARC: `${PREFIX}api.${DOMAIN}`,
    // Browser-sync port
    browserSyncPort: process.env.BROWSER_SYNC_PORT || 2001,
    auth: {
      google: {
        // scope: 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar',
        redirect_uri: IS_DEV ? 'http://localhost:3001/signin' : `${env.PREFIX}accounts.${env.DOMAIN}/signin`,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_SECRET,
      },
    },
  },
  development: {

  },

  staging: {

  },

  production: {

  },
};

const conf = Object.assign(env, config.all, config[process.env.NODE_ENV || 'development']);

module.exports = conf;

