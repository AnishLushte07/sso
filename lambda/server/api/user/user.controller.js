const { SMTP_USER, BCC_EMAIL } = require('../../config/environment');
const ses = require('../../conn/email/ses');

exports.magiclink = async (req, res, next) => {
  try {
    const { user: { email }, otp, ENV } = req.body;

    const magicLink = `${ENV.URLS_SSO}/api/users/authorise?otp=${otp}`;

    await ses.sendTemplatedEmailAsync({
      Source: `"QuezX.com" <${SMTP_USER}>`,
      Destination: {
        ToAddresses: [email],
        BccAddresses: [BCC_EMAIL],
      },
      Template: 'trans-new_login-magiclink',
      TemplateData: JSON.stringify({
        link: magicLink,
      }),
    });

    return res.sendStatus(201);
  } catch (err) {
    return next(err);
  }
};

exports.loginPassword = async (req, res, next) => {
  try {
    const {
      user: {
        email, password, name, inviter, loginLink,
      },
    } = req.body;

    await ses.sendTemplatedEmailAsync({
      Source: `"QuezX.com" <${SMTP_USER}>`,
      Destination: {
        ToAddresses: [email],
        BccAddresses: [BCC_EMAIL],
      },
      Template: 'trans-new_user-invite',
      TemplateData: JSON.stringify({
        password,
        invitee: name,
        username: email,
        loginLink,
        inviter,
      }),
    });

    return res.sendStatus(201);
  } catch (err) {
    return next(err);
  }
};
