const { ApolloError } = require("apollo-server-errors");
const {User} = require("../model/user.model")
const {Product} = require("../model/product.model")
const bcrypt = require("bcrypt");
const Jwt = require("jsonwebtoken");
const { PubSub } =require('graphql-subscriptions') ;
// const { user } = require("pg/lib/defaults");
const saltrRounds=10

const pubsub=new PubSub();
// subscription tag
const NEW_EMPLOYEE="NEW_EMPLOYEE"
const resolvers={
    Query:{
        getAllUsers:async()=>{
            return await User.findAll();
        },
        getAllProduct:async()=>{
            return await Product.findAll();
        },
        getoneUser:async(_parent,{id},_context,_info)=>{
            return await User.findByPk(id)
        },
        


        
    },
    Subscription: {
        somethingChanged: {
            subscribe: (
               
            ) =>
                pubsub.asyncIterator([NEW_EMPLOYEE])
        },

    },
    Mutation:{
        createUser:async (_parent,args,_context,_info)=>{
            const {id,name,email,password}=args;
            const newEmployee = {
                id: args.id,
                name: args.name,
                email: args.employerId,
                password:args.password
              };
            const post= new User({id,name,email,password})
            const salt = bcrypt.genSaltSync(saltrRounds);
            post.password = bcrypt.hashSync(post.password, salt);
            // const newUsers = await User.create(user);
            pubsub.publish(NEW_EMPLOYEE, { newEmployee });
            // post.push(newEmployee);
            await post.save()
            return post;
           
        },
        authenticateUser:async(_parent,{email,password},_context,_info)=>{
            try{
                // find user by email
                const user= await User.findOne({ where: { email } });
                if(!user){
                    throw new Error("user not found...")
                }
                console.log(user.password);
                // check for the password
                const valid = bcrypt.compareSync(password, user.password);
                console.log(valid);
                if (!valid) {
                    console.log("userInput",password);
                    console.log("database",user.password);
                    console.log(email);
                    console.log(user.email);
                   throw new Error("incorrect email & password")
                }
                // JWT generate - accessToken
                const accessToken = Jwt.sign(
                    {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      isAdmin: false,
                    },
                    process.env.accessTokenSecret,
                    {
                      expiresIn: "12h",
                    }
                  );
                    return accessToken
            }
            catch(err){
                throw new ApolloError(err.message,404)
            }
        },

        AddProduct:async (parent,args,context,info)=>{
            const {id,productName,pruchesPrice,sellingPrice}=args;
            const AddPro= new Product({id,productName,pruchesPrice,sellingPrice})
            // const newUsers = await User.create(user);
            await AddPro.save()
            return AddPro;
           
        },
        deleteProduct:async(parent,args,context,info)=>{
            const {id} = args
            // await User.destroy(id,{truncate: true})
            return await Product.destroy({
                where: {id}
              })
            
        },
        UpdateProduct:async(parent,args,context,info)=>{
            const {id}=args
            const{productName,pruchesPrice,sellingPrice}= args.product;
            const update=await Product.update({productName,pruchesPrice,sellingPrice}, {where: {id:id}}
            );
            return "product updated successfully"
        }
        

      
            
    },
    // Subscription: {
    //     somethingChanged: {
    //       subscribe: () => pubsub.asyncIterator(NEW_EMPLOYEE),
    //     },
    //   },


    // Subscription: {
    //     somethingChanged: {
    //         subscribe: (
               
    //         ) =>
    //             pubsub.asyncIterator([NEW_EMPLOYEE])
    //     },

    // },
    
}

module.exports={resolvers}