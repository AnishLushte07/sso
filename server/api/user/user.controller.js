const debug = require('debug');
const jsonwebtoken = require('jsonwebtoken');

const { MASTER_TOKEN } = require('../../config/environment');
const authoriser = require('../../components/oauth/authorise');
const jwt = require('../../components/jwt');

const { User, AccessToken } = require('../../conn/sqldb');
const hookshot = require('./user.hookshot');
const service = require('./user.service');

const log = debug('server-api-applicant');

exports.index = async (req, res, next) => {
  try {
    const wild = `%${req.query.q}%`;
    const users = await User
      .findAll({
        attributes: ['id', 'first_name', 'last_name', 'name', 'email', 'group_id'],
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

    return res.json(!!count);
  } catch (err) {
    return next(err);
  }
};

exports.me = (req, res) => {
  return res.json(req.user);
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

exports.magiclink = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userJWT = await jwt.sign({ email });

    hookshot.magiclink({ email, otp: userJWT });

    return res.status(201).end();
  } catch (err) {
    return next(err);
  }
};
