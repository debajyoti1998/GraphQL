require("dotenv").config();
const cors =require ('cors');
const { createServer } =require("http") ;
const {  gql } = require('apollo-server');
const { execute, subscribe } =require("graphql") ;
const { SubscriptionServer } =require("subscriptions-transport-ws");
const { makeExecutableSchema } =require("@graphql-tools/schema") ;
const { PubSub } =require('graphql-subscriptions') ;
const express =require("express") ;
const { ApolloServer } =require("apollo-server-express") ;
const {typeDefs} = require("./schema/typeDefs")
const {resolvers} = require("./schema/resolver")
const DB= require("./database/sequilize.init")

DB().authenticate()
.then(() => {
  console.log(' DB Connection has been established successfully.');
})
.catch(err => {
    console.log(err);
  console.error('Unable to connect to the database:');
});
(async function () {
    const app = express();
    const pubsub = new PubSub();

    app.use(cors());

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    // Routes
    app.get('/heathcheck', (req, res) => {
        res.status(200).send('heath check OK');
    });

    //Required logic for integrating with Express
    const httpServer = createServer(app);
    // let employees = [
    //   {
    //     id: 1,
    //     name: 'John Smith',
    //     employerId: 1,
    //   },
    //   {
    //     id: 2,
    //     name: 'Lauren Armstrong',
    //     employerId: 1,
    //   },
    //   {
    //     id: 3,
    //     name: 'Henry Bautista',
    //     employerId: 1,
    //   },
    //   {
    //     id: 4,
    //     name: 'Jake Snarl',
    //     employerId: 2,
    //   },
    // ];

    // let employers = [
    //   {
    //     id: 1,
    //     name: 'Harrys pub',
    //   },
    //   {
    //     id: 2,
    //     name: 'UPS',
    //   },
    // ];

    // const typeDefs = gql`
    //   type Query {
    //     employers: [Employer]
    //     employees: [Employee]
    //     employer(id: Int): Employer
    //     employee(id: Int): Employee
    //   }
    //   type Employer {
    //     id: Int
    //     name: String
    //     employees: [Employee]
    //     numEmployees: Int
    //   }
    //   type Employee {
    //     id: Int
    //     name: String
    //     employer: Employer
    //   }
    //   type Mutation {
    //     addEmployee(name: String!, employerId: Int!): Employee
    //     removeEmployee(id: Int!): [Employee]
    //     changeEmployeeName(id: Int!, name: String!): Employee
    //     changeEmployer(id: Int!, employerId: Int!): Employee
    //   }
    //   type Subscription {
    //     newEmployee(employerId: Int): Employee
    //   }
    // `;

    // // const pubsub=new PubSub();
    // // subscription tag
    // const NEW_EMPLOYEE="NEW_EMPLOYEE"

    // const resolvers = {
    //   Subscription:{
    //     newEmployee:{
    //       subscribe:()=>pubsub.asyncIterator([NEW_EMPLOYEE])
    //     }
    //   },
    //   Query: {
    //     employer: (_, args) => employers.filter(e => e.id === args.id)[0],
    //     employee: (_, args) => employees.filter(e => e.id === args.id)[0],
    //     employers: () => employers,
    //     employees: () => employees,
    //   },
    //   Employer: {
    //     numEmployees: (parentValue) => {
    //       console.log('parentValue in Employer: ', parentValue);
    //       return employees.filter(e => e.employerId === parentValue.id).length;
    //     },
    //     employees: (parentValue) => {
    //       return employees.filter(e => e.employerId === parentValue.id);
    //     },
    //   },
    //   Employee: {
    //     employer: (parentValue) => {
    //       return employers.filter(e => e.id === parentValue.employerId)[0];
    //     },
    //   },
    //   Mutation: {
    //     addEmployee: (_, args) => {
    //       const newEmployee = {
    //         id: employees.length + 1,
    //         name: args.name,
    //         employerId: args.employerId,
    //       };
    //       pubsub.publish(NEW_EMPLOYEE, { newEmployee });
    //       employees.push(newEmployee);
    //       return newEmployee;
    //     },
    //     removeEmployee: (_, args) => {
    //       return employees.filter(e => e.id !== args.id)
    //     },
    //     changeEmployeeName: (_, args) => {
    //       let newEmployee;
    //       // Change employees
    //       employees = employees.map(e => {
    //         if(e.id === args.id) {
    //           newEmployee = {
    //             ...e,
    //             name: args.name,
    //           };
    //           return newEmployee
    //         };
    //         return e;
    //       });
    //       // Return change employee
    //       return newEmployee;
    //     },
    //     changeEmployer: (_, args) => {
    //       let newEmployee;
    //       // Change employees
    //       employees = employees.map(e => {
    //         if(e.id === args.id) {
    //           newEmployee = {
    //             ...e,
    //             employerId: args.employerId,
    //           };
    //           return newEmployee
    //         };
    //         return e;
    //       });
    //       // Return change employee
    //       return newEmployee;
    //     },

    //   }
    // }
    const schema = makeExecutableSchema({
        typeDefs,
        resolvers,
    });

    // Same ApolloServer initialization as before, plus the drain plugin.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req, res }= any) => ({ req, res, pubsub }),
        schema,
        plugins: [{
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
    });
    const subscriptionServer = SubscriptionServer.create(
        { schema, execute, subscribe },
        { server: httpServer, path: server.graphqlPath }
    );
    //// More required logic for integrating with Express
    await server.start();
    server.applyMiddleware({
        app,
    
        // By default, apollo-server hosts its GraphQL endpoint at the
        // server root. However, *other* Apollo Server packages host it at
        // /graphql. Optionally provide this to match apollo-server.
        path: '/',
        cors: false,
      });

    const PORT = Number(process.env.app_port) || 3030;
    // Modified server startup
    httpServer.listen(PORT, () =>
        console.log(`Server is now running on http://localhost:${PORT}/graphql`)
    );
})();







// const {  gql } = require('apollo-server');
// // const {PubSub}= require("graphql-yoga")
// const { PubSub }= require ('graphql-subscriptions');
// const { ApolloServer } =require("apollo-server-express") ;


// let employees = [
//   {
//     id: 1,
//     name: 'John Smith',
//     employerId: 1,
//   },
//   {
//     id: 2,
//     name: 'Lauren Armstrong',
//     employerId: 1,
//   },
//   {
//     id: 3,
//     name: 'Henry Bautista',
//     employerId: 1,
//   },
//   {
//     id: 4,
//     name: 'Jake Snarl',
//     employerId: 2,
//   },
// ];

// let employers = [
//   {
//     id: 1,
//     name: 'Harrys pub',
//   },
//   {
//     id: 2,
//     name: 'UPS',
//   },
// ];

// const typeDefs = gql`
//   type Query {
//     employers: [Employer]
//     employees: [Employee]
//     employer(id: Int): Employer
//     employee(id: Int): Employee
//   }
//   type Employer {
//     id: Int
//     name: String
//     employees: [Employee]
//     numEmployees: Int
//   }
//   type Employee {
//     id: Int
//     name: String
//     employer: Employer
//   }
//   type Mutation {
//     addEmployee(name: String!, employerId: Int!): Employee
//     removeEmployee(id: Int!): [Employee]
//     changeEmployeeName(id: Int!, name: String!): Employee
//     changeEmployer(id: Int!, employerId: Int!): Employee
//   }
//   type Subscription {
//     newEmployee(employerId: Int): Employee
//   }
// `;

// const pubsub=new PubSub();
// // subscription tag
// const NEW_EMPLOYEE="NEW_EMPLOYEE"

// const resolvers = {
//   Subscription:{
//     newEmployee:{
//       subscribe:()=>pubsub.asyncIterator([NEW_EMPLOYEE])
//     }
//   },
//   Query: {
//     employer: (_, args) => employers.filter(e => e.id === args.id)[0],
//     employee: (_, args) => employees.filter(e => e.id === args.id)[0],
//     employers: () => employers,
//     employees: () => employees,
//   },
//   Employer: {
//     numEmployees: (parentValue) => {
//       console.log('parentValue in Employer: ', parentValue);
//       return employees.filter(e => e.employerId === parentValue.id).length;
//     },
//     employees: (parentValue) => {
//       return employees.filter(e => e.employerId === parentValue.id);
//     },
//   },
//   Employee: {
//     employer: (parentValue) => {
//       return employers.filter(e => e.id === parentValue.employerId)[0];
//     },
//   },
//   Mutation: {
//     addEmployee: (_, args) => {
//       const newEmployee = {
//         id: employees.length + 1,
//         name: args.name,
//         employerId: args.employerId,
//       };
//       pubsub.publish(NEW_EMPLOYEE, { newEmployee });
//       employees.push(newEmployee);
//       return newEmployee;
//     },
//     removeEmployee: (_, args) => {
//       return employees.filter(e => e.id !== args.id)
//     },
//     changeEmployeeName: (_, args) => {
//       let newEmployee;
//       // Change employees
//       employees = employees.map(e => {
//         if(e.id === args.id) {
//           newEmployee = {
//             ...e,
//             name: args.name,
//           };
//           return newEmployee
//         };
//         return e;
//       });
//       // Return change employee
//       return newEmployee;
//     },
//     changeEmployer: (_, args) => {
//       let newEmployee;
//       // Change employees
//       employees = employees.map(e => {
//         if(e.id === args.id) {
//           newEmployee = {
//             ...e,
//             employerId: args.employerId,
//           };
//           return newEmployee
//         };
//         return e;
//       });
//       // Return change employee
//       return newEmployee;
//     },

//   }
// }

// // const server = new ApolloServer({ cors: {
// //   origin: '*',
// //   credentials: true},typeDefs, resolvers })

// const server = new ApolloServer({
//   cors: {
// 		origin: '*',			
// 		credentials: true},	
// 	typeDefs,
// 	resolvers,
  
//  });


// server.listen().then(({ url }) => {
//   console.log(`Server is ready at ${url}`)
// });








