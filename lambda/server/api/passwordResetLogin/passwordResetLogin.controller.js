const ses = require('../../conn/email/ses');
const { SMTP_USER, BCC_EMAIL } = require('./../../config/environment');

exports.create = async (req, res, next) => {
  try {
    const {
      ENV: {
        URLS_SSO,
      },
      user,
      token,
    } = req.body;

    await ses.sendTemplatedEmail({
      ConfigurationSetName: 'high_priority',
      Source: `"QuezX.com" <${SMTP_USER}>`,
      Destination: {
        ToAddresses: [user.email],
        BccAddresses: [BCC_EMAIL],
      },
      Template: 'trans-new_u-password-reset',
      TemplateData: JSON.stringify({
        userName: user.name,
        forgotPwdLink: `${URLS_SSO}/password-reset?id=${user.id}&token=${token}`,
      }),
    });

    return res.end();
  } catch (ex) {
    return next(ex);
  }
};
