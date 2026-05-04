const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt");
const saltRounds = 12;

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const expireTime = 24 * 60 * 60 * 1000; //expires after 1 day  (hours * minutes * seconds * millis)

const path = require("path");
require("dotenv").config();

// session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  databaseName: process.env.MONGODB_DATABASE,
  collection: "sessions",
});

app.use(
  session({
    secret: process.env.NODE_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  }),
);

//1. Homepage
//if the user is logged in, this home page will (get form)
app.get("/", (req, res) => {
  if (req.session.user) {
    res.send(`
            <h1>Hello, ${req.session.user.username}!</h1>
            <br>
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
app.get("/Signup", (req, res) => {
  var missingEmail = req.query.missingEmail;
  var html = `
    <h3>Sign Up</h3>
    <form action = '/Signup' method='post'>
    <h3>create user</h3>
         <input type="text" name="name" placeholder="name" required><br>
      <input type="email" name="email" placeholder="email" required><br>
      <input type="password" name="password" placeholder="password" required><br>
      <button type="submit">Submit</button>
    </form> `;
  res.send(html);
});
//3 Login page – site: /login method: GET
app.get("/Login", (req, res) => {
  var missingEmail = req.query.missingEmail;
  var html = `

    <h3>Log In</h3>
    <form action = '/Login' method="post">
        <input type="email" name="email" placeholder="email" required><br>
        <input type="password" name="password" placeholder="password" required><br>
      <button type="submit">Submit</button>
    </form>`;
  res.send(html);
});

// 2. Sign up page – signup form method: GET
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email) {
    return res.redirect("/signup?missingEmail=true");
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
});
// 3. Login page –  login form method: POST
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
});

//4. Members Area
app.get("/members", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  //get image from the public folder amd display it randomly
  const images = ["image_1.jpg", "image_2.jpg", "image_3.jpg"];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  res.send(`
    <h1>Hello, ${req.session.user.name}!</h1>
    <br>
    <img src="${randomImage}" alt="Random image" style="width:400px;">
    <br>
    <a href="/sign out">Sign Out</a>
  `);
});

//5. logout page – site: /logout method: GET
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    var html = `
You are logged out. `;
    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log("server is running at http://localhost:" + PORT);
});
