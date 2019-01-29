const moment = require('moment');

module.exports = function PasswordResetLoginModel(sequelize, DataTypes) {
  const PasswordResetLogin = sequelize.define('PasswordResetLogin', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    user_id: DataTypes.INTEGER,
    token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: function setExpires() {
        return moment().add(1, 'hours');
      },
    },
  }, {
    tableName: 'password_reset_logins',
    timestamps: true,
    underscored: true,
    updatedAt: false,
    paranoid: true,
    deletedAt: 'deleted_on',
    createdAt: 'created_on',
  });

  return PasswordResetLogin;
};
