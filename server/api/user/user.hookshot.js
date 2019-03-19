const { URLS_SSO } = require('../../config/environment');
const hookshot = require('../../conn/hookshot');

exports.magiclink = ({ email, otp }) => {
  hookshot.trigger('user:magiclink', {
    object: 'user',
    event: 'magiclink',
    user: {
      email,
    },
    otp,
    ENV: { URLS_SSO },
  });
};

exports.loginPassword = ({ email, password, name, inviter, loginLink }) => {
  hookshot.trigger('user:loginPassword', {
    object: 'user',
    event: 'loginPassword',
    user: {
      email,
      password,
      name,
      inviter,
      loginLink,
    },
  });
};
