const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const DownloadedFiles = sequelize.define('downloadedFiles', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    fileUrl: Sequelize.STRING
})

module.exports = DownloadedFiles
