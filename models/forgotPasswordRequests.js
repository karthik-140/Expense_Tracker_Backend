const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ForgotPasswordRequests = sequelize.define('forgotPasswordRequests', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    userId: Sequelize.INTEGER,
    active: Sequelize.BOOLEAN
})

module.exports = ForgotPasswordRequests
