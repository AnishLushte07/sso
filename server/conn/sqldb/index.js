const _ = require('lodash');
const Sequelize = require('sequelize');

const config = require('../../config/environment');
const oauthComponent = require('../../components/oauth/sequelize');

const { log } = console;

const sqlDefaults = {
  dialect: 'mysql',
  timezone: '+05:30',
  logging: config.NODE_ENV === 'development' ? log : false,
  define: {
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8mb4_general_ci',
    },
  },
};

const db = {
  Sequelize,
  sequelize: new Sequelize(config.MYSQL, sqlDefaults),
};

[
  // - Enums
  'User',

  // - Passowrd Reset
  'PasswordResetLogin',

  // - Others
  'Log',

].forEach((model) => {
  db[model] = db.sequelize.import(`../../api/${_.camelCase(model)}/${_.camelCase(model)}.model.js`);
});

oauthComponent(db);

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = db;
