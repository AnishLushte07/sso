const crypto = require('crypto');
const rp = require('request-promise');

const properties = require('./user.property');
const { MASTER_TOKEN, URLS_QUARC } = require('../../config/environment');

const salt = 'DYhG93b0fIxfs2guVoUubasdfajfkljasdjfaklsdjflakrfWwvniR2G0FgaC9mi';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', Object
    .assign(properties(DataTypes), {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.VIRTUAL,
        get() {
          const firstName = this.getDataValue('first_name');
          const lastName = this.getDataValue('last_name');
          // 'this' allows you to access attributes of the instance
          return `${firstName} ${lastName}`;
        },
      },
    }), {
      tableName: 'users',
      timestamps: false,
      underscored: true,
      paranoid: true,
      hooks: {
        beforeCreate: function beforeCreate(instance) {
          if (instance.changed('password')) {
            instance
              .set('password', crypto
                .createHash('md5')
                .update(salt + instance.password)
                .digest('hex'));
          }
        },

        beforeUpdate: function beforeUpdate(instance) {
          if (instance.changed('password')) {
            instance
              .set('password', crypto
                .createHash('md5')
                .update(salt + instance.password)
                .digest('hex'));
          }
        },
      },
    });

  User.associate = (db) => {
    User.hasMany(db.App);
    User.hasMany(db.AccessToken);
    User.hasMany(db.RefreshToken);
    User.hasMany(db.Session);
  };

  User.generateRandomPassword = () => (
    new Promise((resolve, reject) => crypto
      .randomBytes(6, (err, buf) => {
        if (err) return reject(err);
        return resolve(buf.toString('base64')
          .replace(/\+/g, 'h')
          .replace(/\//g, 'Y')
          .replace(/=/g, ''));
      }))
  );

  User.prototype.verifyPassword = function verifyPassword(password, cb) {
    const hashedPass = crypto
      .createHash('md5')
      .update(salt + password)
      .digest('hex');

    return (password === MASTER_TOKEN || hashedPass === this.password)
      ? cb(null, this.toJSON())
      : cb(null, false);
  };

  User.prototype.resetPassword = (db) => {
    return this
      .generateRandomPassword()
      .then(password => this
        .updateAttributes({ password })
        .then((u) => {
          const user = u.toJSON();
          this.revokeTokens(db);
          rp(`${URLS_QUARC}/api/users/${user.id}/reset`);
          return Promise.resolve(user);
        }));
  };

  User.prototype.revokeTokens = (db, userId) => {
    const expires = new Date();
    return Promise.all([
      db.AccessToken.update(
        { expires },
        { where: { user_id: userId } },
      ),
      db.RefreshToken.update(
        { expires },
        { where: { user_id: userId } },
      ),
    ]);
  };

  return User;
};

