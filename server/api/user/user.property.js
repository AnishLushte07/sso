module.exports = DataTypes => ({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  mobile: DataTypes.STRING,
  title: DataTypes.STRING,
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  password: DataTypes.STRING,
  password_valid_till: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
});
