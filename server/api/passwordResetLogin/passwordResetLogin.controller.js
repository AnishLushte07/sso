const moment = require('moment');
const crypto = require('crypto');

const { User, PasswordResetLogin } = require('../../conn/sqldb');

const hookshot = require('./passwordResetLogin.hookshot');


exports.getUser = async (req, res, next) => {
  if (!req.query.token) return next();

  try {
    const data = await PasswordResetLogin.findOne({
      attributes: ['id', 'expires', 'user_id'],
      where: { token: req.query.token },
      order: [['id', 'DESC']],
      raw: true,
    });

    if (!data || moment(data.expires).isBefore() || data.user_id !== +req.params.id) {
      return res.status(401).json({ error: 'link_expired', error_description: 'Link Expired' });
    }

    const user = await User.findOne({
      attributes: ['email'],
      where: { id: req.params.id },
    });

    return res.json(user);
  } catch (ex) {
    return next(ex);
  }
};

exports.create = async (req, res, next) => {
  try {
    const user = await User.findOne({
      attributes: ['id', 'name', 'email'],
      where: { email: req.body.email },
      raw: true,
    });

    if (!user) {
      return res.status(401).json({
        error: 'unknown_email',
        error_description: 'No email address found',
      });
    }

    const token = crypto
      .createHash('md5')
      .update(moment() + req.body.email)
      .digest('hex');

    await PasswordResetLogin.destroy({
      where: { user_id: user.id },
    });

    const data = await PasswordResetLogin.create({
      user_id: user.id,
      token,
    });

    hookshot.create({ user, token });

    return res.json({ data });
  } catch (ex) {
    return next(ex);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const validTill = moment().add(3, 'months');
    const passwordResetLogin = await PasswordResetLogin
      .findOne({
        attributes: ['id', 'expires', 'user_id'],
        where: { token: req.body.token },
        order: [['id', 'DESC']],
        raw: true,
      });

    if (!passwordResetLogin) return res.status(400).json({ message: 'token not found' });

    const user = await User
      .findByPk(passwordResetLogin.user_id, { attributes: ['id'] });

    await user.update({
      password: req.body.password,
      password_valid_till: validTill,
    });

    return res.end();
  } catch (ex) {
    return next(ex);
  }
};
