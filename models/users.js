const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isPremiumUser: {
    type: Sequelize.BOOLEAN
  },
  totalExpenses: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  }
})

module.exports = users
