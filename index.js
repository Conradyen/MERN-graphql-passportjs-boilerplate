const express = require("express");
const session = require("express-session");
const uuid = require("uuid/v4");
const passport = require("passport");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

//dummy users for now
const users = require("./users");

const cors = require("cors");

//session secrete to be changed
const SESSION_SECRECT = "to-be-changed";

//passport auth
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  const users = User.getUsers();
  const matchingUser = users.find((user) => user.id === id);
  done(null, matchingUser);
});

//apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    getUser: () => req.user,
    logout: () => req.logout(),
  }),
});

//express app
const app = express();
//allow cross-origin
app.use(cors());
//add express session
app.use(
  session({
    genid: (req) => uuid(),
    secret: SESSION_SECRECT,
    resave: false,
    saveUninitialized: false,
  })
);
//add passport auth to express
app.use(passport.initialize());
app.use(passport.session());

//express graphql server
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

server.applyMiddleware({ app });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
