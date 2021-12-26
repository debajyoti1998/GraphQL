const Sequelize = require('sequelize');
const db = require('../database/sequilize.init.js')
const sequelize = db();

const Product = sequelize.define('product',{
    id:{
        type:Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
    },
    productName:{
        type:Sequelize.STRING,
        allowNull: false
    },
    pruchesPrice:{
        type:Sequelize.INTEGER
    },
    sellingPrice:{
        type:Sequelize.INTEGER
    }
});

module.exports={Product}