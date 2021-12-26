const Sequelize = require('sequelize');
const db = require('../database/sequilize.init.js')
const sequelize = db();

const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING
  },
  isDeleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = {User}