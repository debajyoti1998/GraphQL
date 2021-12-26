require("dotenv").config();
const db = require('./sequilize.init.js');
const User = require('../model/user.model')
const Product = require("../model/product.model")
const sequelize = db();


const initiate = async()=>{
  try{
    const result = await sequelize.sync({force:true});
  }
  catch(err){
    console.log("error happen");
    console.log(err)
  }
}

initiate();