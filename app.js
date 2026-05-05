const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Joi = require("joi"); // define a bunch of rules to validate data

// load environment variables from .env file
require("dotenv").config();
const app = express();

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_user_database =
  process.env.MONGODB_USER_DATABASE || process.env.MONGODB_DATABASE;
const mongodb_session_database =
  process.env.MONGODB_SESSION_DATABASE || process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

// connect to MongoDB

mongoose.connect(
  `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_user_database}`,
);

const userCollection = mongoose.connection.collection("users");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(express.json());

const saltRounds = 12;
const PORT = process.env.PORT || 3000;
const expireTime = 1 * 60 * 60 * 1000; //expires after 1 day  (hours * minutes * seconds * millis)

const store = new MongoDBStore({
  uri: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_session_database}`,
  collection: "sessions",
});

app.use(
  session({
    secret: node_session_secret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: expireTime },
  }),
);

//1. Homepage
//if the user is logged in, this home page will (get form)
app.get("/", (req, res) => {
  if (req.session.user) {
    res.send(`
<h1>Hello, ${req.session.user.name}!</h1>            <br>
            <a href="/members">Go to Members Area</a>
            <br>
            <a href="/logout">Logout</a>
        `);
  } else {
    res.send(`
             <a href="/signup">
                <button >Sign up</button>
            </a>
            <br><br>
            <a href="/login">
                <button>Log in</button>
            </a>
        `);
  }
});

//2. Start Signup and Login in homepage (get form)
app.get("/signup", (req, res) => {
  var missingEmail = req.query.missingEmail;
  var html = `
    <h3>Sign Up</h3>
    <form action = '/signup' method='post'>
    <h3>create user</h3>
         <input type="text" name="name" placeholder="name" required><br>
      <input type="email" name="email" placeholder="email" required><br>
      <input type="password" name="password" placeholder="password" required><br>
      <button type="submit">Submit</button>
    </form> `;
  res.send(html);
});

//3 Login page – site: /login method: GET
app.get("/login", (req, res) => {
  var missingEmail = req.query.missingEmail;
  var html = `

    <h3>Log In</h3>
    <form action = '/login' method="post">
        <input type="email" name="email" placeholder="email" required><br>
        <input type="password" name="password" placeholder="password" required><br>
      <button type="submit">Submit</button>
    </form>`;
  res.send(html);
});

// 2. Sign up page – signup form method: GET
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name)
    return res.redirect("Name is required. <a href='/signup'>Try again</a>");
  if (!email)
    return res.redirect("Email is required. <a href='/signup'>Try again</a>");
  if (!password)
    return res.redirect(
      "Password is required. <a href='/signup'>Try again</a>",
    );
  // joi validation for NoSQL
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error)
    return res.send("Invalid input.<br><a href='/signup'>Try again</a>");

  //important for password bcrypt hashing
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  //save to database
  await userCollection.insertOne({ name, email, password: hashedPassword });
  // dave session
  req.session.user = { name, email };
  res.redirect("/members");
});

// 3. Login page –  login form method: POST
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.redirect(
      "Email and password are required. <a href='/signup'>Try again</a>",
    );
  // joi validation for NoSQL again
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  //check user
  const user = await userCollection.findOne({ email });
  if (!user)
    return res.redirect(
      "Invalid email or password. <a href='/login'>Try again</a>",
    );
  //check password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch)
    return res.redirect(
      "Invalid email or password. <a href='/login'>Try again</a>",
    );
  // save session and login
  req.session.user = { name: user.name, email: user.email };
  res.redirect("/members");
});

//4. Members Area
app.get("/members", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  const images = ["/image_1.jpg", "/image_2.jpg", "/image_3.jpg"];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  res.send(`
<h1>Hello, ${req.session.user.name}!</h1>    
<br>
    <img src="${randomImage}" style="width:400px;">
    <br>
    <a href="/logout">Sign Out</a>
  `);
});

app.get("/loggedin", (req, res) => {
  if (!req.session.authenticated) {
    res.redirect("/login");
  }
  var html = `
    You are logged in!
    `;
  res.send(html);
});

//5. logout page – site: /logout method: GET
app.get("/logout", (req, res) => {
  req.session.destroy();
  var html = `
    You are logged out.
    `;
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404);
  res.send("Page not found - 404");
});

// Start server
app.listen(PORT, () => {
  console.log("server is running at http://localhost:" + PORT);
});
