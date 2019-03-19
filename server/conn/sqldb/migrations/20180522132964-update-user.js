module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'users',
      'username',
      Sequelize.STRING(32),
    ).then(() => queryInterface.addColumn(
      'users',
      'password_valid_till',
      Sequelize.DATE,
    ));

  },
  down(queryInterface) {
    return queryInterface.removeColumn(
      'users',
      'username',
    );
  },
};
