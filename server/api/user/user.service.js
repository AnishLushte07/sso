const debug = require('debug');
const rp = require('request-promise');

const { User, App } = require('../../conn/sqldb');
const { APPS } = require('../../config/constants');
const { MASTER_TOKEN, URLS_QUARC } = require('../../config/environment');
const config = require('../../config/environment/index');
const hookshot = require('./user.hookshot');

const log = debug('user.service');

const checkDuplicate = email => User.findOne({
  attributes: ['id'],
  where: { email },
  raw: true,
});

const informToRelatedApps = ({ appId, user }) => {
  log('informToRelatedApps');
  return App
    .findOne({
      attributes: ['redirect_uri'],
      where: {
        id: appId,
      },
      raw: true,
    })
    .then(app => rp({
      uri: `${app.redirect_uri.split('/access').shift()}/api/users?token=${MASTER_TOKEN}`,
      method: 'POST',
      body: user,
      json: true,
    }));
};

exports.informToRelatedApps = informToRelatedApps;

// - this method currently called from quarc only
exports.signup = async ({ body }) => {
  try {
    const {
      title,
      first_name: firstName,
      last_name: lastName,
      source_app_id: appId,
      password,
      name,
    } = body;

    const e = body.email;
    const email = e.trim();
    // - Todo: Email Validation
    const found = await checkDuplicate(email);

    if (found) {
      return {
        code: 409,
        id: found.id,
        message: 'Duplicate',
      };
    }

    const user = Object.assign({
      title,
      first_name: firstName || name,
      last_name: lastName,
      email,
      password,
    },
      body.payload || {},
    );

    let passString = '';

    if (!user.password) {
      await User.generateRandomPassword()
        .then((pass) => {
          passString = pass;
          Object.assign(user, { password: pass });
        });
    }

    // - Saving User Details
    // Todo: known issue hooks for password
    const saved = await User
      .create(user);

    // informing to concenrned app
    if (appId === APPS.ANALYTICS) {
      await informToRelatedApps({ appId, user: Object.assign(user, { id: saved.id }) });
      hookshot.loginPassword({
        email: user.email,
        password: passString,
        name: `${user.first_name} ${user.last_name}`,
        inviter: body.payload.inviter,
        loginLink: `${config.PREFIX}analytics.${config.DOMAIN}`,
      });
    }

    return { code: 201, id: saved.id };
  } catch (err) {
    return err;
  }
};

exports.changePasswordNotify = (body) => rp({
  method: 'POST',
  uri: `${URLS_QUARC}/api/queuedTasks/changePasswordNotify?token=${MASTER_TOKEN}`,
  body,
  json: true,
  headers: { 'User-Agent': 'Request-Promise' },
});
