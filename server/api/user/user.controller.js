const debug = require('debug');
const moment = require('moment');
const jsonwebtoken = require('jsonwebtoken');
const rp = require('request-promise');

const { MASTER_TOKEN } = require('../../config/environment');
const authoriser = require('../../components/oauth/authorise');
const jwt = require('../../components/jwt');
const db = require('../../conn/sqldb');
const hookshot = require('./user.hookshot');
const service = require('./user.service');

const log = debug('server-api-applicant');
const { User, AccessToken } = db;

exports.index = async (req, res, next) => {
  try {
    const wild = `%${req.query.q}%`;
    const users = await User
      .findAll({
        attributes: ['id', 'first_name', 'last_name', 'name', 'email'],
        limit: 10,
        offset: Number(req.query.offset) || 0,
        where: {
          $or: {
            first_name: {
              $like: wild,
            },
            last_name: {
              $like: wild,
            },
            email: {
              $like: wild,
            },
          },
        },
      });

    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

exports.index = async (req, res, next) => {
  try {
    const wild = `%${req.query.q}%`;
    const users = await User
      .findAll({
        attributes: ['id', 'first_name', 'last_name', 'name', 'email'],
        limit: 10,
        offset: Number(req.query.offset) || 0,
        where: {
          $or: {
            first_name: {
              $like: wild,
            },
            last_name: {
              $like: wild,
            },
            email: {
              $like: wild,
            },
          },
        },
      });
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

exports.signupStatus = async (req, res, next) => {
  try {
    const count = await AccessToken.count({
      where: {
        app_id: req.user.app_id,
        user_id: req.params.id,
      },
    });

    return res.json({ data: !!count });
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['password_valid_till'], raw: true });
  const whatBlocked = [];
  if (req.oauth.bearerToken.app_id === 1 && !moment().isBefore(user.get('password_valid_till'))) {
    whatBlocked.push({ priority: 0, state: 'password-change' });
  }
  res.json(Object.assign({
    whatBlocked,
  }, req.user));
};

exports.authorise = async (req, res, next) => {
  log('authorise');
  try {
    const user = jsonwebtoken.verify(req.query.otp, MASTER_TOKEN);

    await User.upsert(user);

    const url = await authoriser(user.email);

    return res.redirect(url);
  } catch (err) {
    return next(err);
  }
};

const messagesMap = {
  201: 'Your account created in MarQ',
  409: 'Duplicate',
};

exports.create = async (req, res, next) => {
  try {
    log('register', req.body);

    const status = await service
      .signup({ body: req.body });

    return res
      .json({ message: messagesMap[status.code], id: status.id });
  } catch (err) {
    return next(err);
  }
};

exports.invite = async (req, res, next) => {
  try {
    log('register', req.body);

    const status = await service
      .signup({ body: req.body });

    return res
      .json({ message: messagesMap[status.code], id: status.id });
  } catch (err) {
    return next(err);
  }
};

exports.productSignup = async (req, res, next) => {
  try {
    log('productSignup', req.body);

    let user = await User
      .findByPk(req.params.id, {
        attributes: ['id', 'title', 'first_name', 'last_name', 'email', 'mobile'],
        raw: true,
      });

    user = Object.assign(user, req.body.payload);

    const status = await service
      .informToRelatedApps({
        appId: req.user.app_id,
        user,
      });

    return res
      .json({ message: messagesMap[status.code], id: status.id });
  } catch (err) {
    return next(err);
  }
};


exports.magiclink = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userCount = await User.count({
      where: {
        email: email.trim(),
      },
    });

    if (userCount !== 1) return res.sendStatus(403);

    const userJWT = await jwt.sign({ email });

    hookshot.magiclink({ email, otp: userJWT });

    return res.status(201).end();
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    await User.update(req.body, {
      where: { id },
    });

    return res.sendStatus(200);
  } catch (err) {
    return next(err);
  }
};

exports.password = (req, res, next) => {
  return db.User
    .findById(req.user.id, {
      attributes: ['id', 'first_name', 'email', 'password', 'password_valid_till'],
    })
    .then((user) => {
      if (!moment().isBefore(user.get('password_valid_till'))) {
        const validTill = moment().add(2, 'years');

        return user
          .updateAttributes({ password: req.body.password, password_valid_till: validTill })
          .then(() => res.status(204).end())
          .then(() => service.changePasswordNotify({
            password: req.body.password,
            user,
          }));
      }

      return user.verifyPassword(req.body.old_password, (err, userModel) => {
        if (err || !userModel) {
          return res.status(400)
            .json({ error: 'Invalid password', error_description: 'Invalid current password' });
        }

        return user.updateAttributes({ password: req.body.password })
          .then(() => {
            res.status(204).end();
            user.revokeTokens(db); // revoke all
            return service.changePasswordNotify({
              password: req.body.password,
              user: userModel,
            });
          });
      });
    })
    .catch(next);
};
