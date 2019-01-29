const { URLS_SSO } = require('../../config/environment');
const hookshot = require('../../conn/hookshot');

exports.create = ({ user, token }) => {
  hookshot.trigger('passwordResetLogin:create', {
    object: 'passwordResetLogin',
    event: 'create',
    user,
    token,
    ENV: { URLS_SSO },
  });
};
