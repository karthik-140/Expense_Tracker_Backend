const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_ROOT_PASSWORD, {
  dialect: 'mysql',
  host: process.env.DATABASE_HOST,
  dialectModule: require('mysql2'),
})

module.exports = sequelize;
