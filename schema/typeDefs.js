const {gql} = require("apollo-server-express")
const typeDefs=gql`
    type Users{
        id:Int
        name:String
        email:String
        password:String
    }
    type AllUser{
        id:Int
        name:String
        email:String
    }
    type Product{
        id:Int
        productName:String
        pruchesPrice:Int
        sellingPrice:Int
    }
    type AuthResp{
        user:Users!
    }
    input NewProduct{
        id:Int
        productName:String
        pruchesPrice:Int
        sellingPrice:Int
    }
    type Query{
        getAllUsers:[AllUser]
        getoneUser(id:ID):Users
        getAllProduct:[Product]
    }
    input PostInput{
        id:Int
        name:String
        email:String
        password:String
    }
    input authh{
        email:String
        password:String
    }
    type Mutation{
        createUser(id:Int,name:String,email:String,password:String):Users!
        authenticateUser(email: String!, password: String!): String!
        AddProduct(id:Int,productName:String,pruchesPrice:Int,sellingPrice:Int):Product!
        deleteProduct(id:ID):String
        UpdateProduct(id:ID,product:NewProduct):String!

    }
    type Subscription {
        somethingChanged: Users!
}



    

`

module.exports={typeDefs}