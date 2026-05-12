const cors = require("cors");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Joi = require("joi"); // define a bunch of rules to validate data

const dns = require("dns");
const { error } = require("console");
dns.setServers(["8.8.8.8", "4.4.4.4"]);

// load environment variables from .env file
require("dotenv").config();
const app = express();
app.use(cors());

app.use(express.static(__dirname + "/public"));

//set up EJS as the view engine
app.set("view engine", "ejs");

const navLinks = [
  { name: "Home", url: "/" },
  { name: "Members", url: "/members" },
  { name: "Admin", url: "/admin" },
  { name: "Image", url: "/image" },
  { name: "Login", url: "/login" },
  { name: "404", url: "/404" },
];

app.use((req, res, next) => {
  const pathFolders = req.path.split("/").slice(1);
  const folder = "/" + (pathFolders[0] || "home");
  app.locals.folder = folder;
  app.locals.navLinks = navLinks;
  next();
});

// problem on broswer 500
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).send("");
});
// leave the port in front
const PORT = process.env.PORT || 3000;

// connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_SESSION_SECRET = process.env.NODE_SESSION_SECRET;
const MONGODB_SESSION_SECRET = process.env.MONGODB_SESSION_SECRET;

// ==============================================
// MongoDB
// ==============================================
let userCollection;

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  .then(async () => {
    console.log("MongoDB connect successfully ");
    const db = mongoose.connection;
    userCollection = db.collection("users");
    console.log("userCollection is ready");

    await createRequiredUsers();

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("server is running on http://localhost:" + PORT);
    });
  })
  .catch((err) => {
    console.log("MongoDB failed to connect:", err);
    process.exit(1);
  });
// ==============================================
// Session save
// ==============================================
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

store.on("error", (error) => {
  console.log("Session error:", error);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const saltRounds = 12;
const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour  (hours * minutes * seconds * millis)

app.use(
  session({
    secret: NODE_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: expireTime },
  }),
);

function isAdmin(req) {
  if (req.session.user && req.session.user.role === "admin") {
    return true;
  }
  return false;
}

function adminAuthorization(req, res, next) {
  if (!isAdmin(req)) {
    res.status(403);
    return res.send("403 - Not Authorized");
  }
  next();
}

function sessionValidation(req, res, next) {
  if (!req.session.user) {
    return res.render("login", {
      error: "Please log in first to access this page.",
    });
  }
  next();
}

// ==============================================
// Routes
// ==============================================

//1. Homepage
//if the user is logged in, this home page will (get form)
app.get("/", (req, res) => {
  const folder = "home"; // Set the current page name
  res.render("index", {
    navLinks: navLinks, // Your navigation links array
    folder: folder, // The current folder/page name (e.g., 'home', etc.)
    user: req.session.user || null, // Optional user object
  });
});

//2. Start Signup and Login in homepage (get form)
app.get("/signup", (req, res) => {
  res.render("signup");
});

//3 Login page – site: /login method: GET
app.get("/login", (req, res) => {
  res.render("login");
});

// 2. Sign up page – signup form method: GET
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // joi validation for NoSQL
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error)
      return res.send("Invalid input.<br><a href='/signup'>Try again</a>");
    //testing if the email exist
    const exist = await userCollection.findOne({ email });
    if (exist)
      return res.send(
        "Email already exists.<br><a href='/signup'>Try again</a>",
      );

    //important for password bcrypt hashing
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //save to database
    await userCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    // save session
    req.session.user = {
      name: name,
      email: email,
      role: "user",
    };
    res.redirect("/members");
  } catch (err) {
    console.error(err);
    res.render("signup", { error: "Signup failed. Please try again." });
  }
});

// 3. Login page –  login form method: POST
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // joi validation for NoSQL again
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    //check user
    const user = await userCollection.findOne({ email });
    if (!user)
      return res.send(
        "Invalid email or password. <a href='/login'>Try again</a>",
      );
    //check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.send(
        "Invalid email or password. <a href='/login'>Try again</a>",
      );
    // save session and login
    req.session.user = { name: user.name, email: user.email, role: user.role }; // add user incase there is undefined email, so that it can be used in members area to display name
    
    res.redirect("/members");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "Login error" });
  }
});

//4. Members Area
app.get("/members", sessionValidation, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  const images = ["image1.jpg", "image2.jpg", "image3.jpg"];
  res.render("members", {
    user: req.session.user,
    images: images,
  });
});

app.get("/image", (req, res) => {
  res.render("image", {
    folder: "image",
    user: req.session.user || null,
  });
});

//middleware
app.get("/loggedin", sessionValidation, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

//5. logout page – site: /logout method: GET
app.get("/logout", (req, res) => {
  req.session.destroy();
  var html = `
    You are logged out.
    `;
  res.redirect("/");
});
//new admin apage
app.get("/admin", sessionValidation, adminAuthorization, async (req, res) => {
  try {
    const users = await userCollection.find().toArray();
    res.render("admin", {
      users: users,
      user: req.session.user,
    });
  } catch (err) {
    res.redirect("/");
  }
});

app.post(
  "/admin/update-role",
  sessionValidation,
  adminAuthorization,
  async (req, res) => {
    try {
      const { email, role } = req.body;

      await userCollection.updateOne(
        { email: email }, // filter by email
        { $set: { role: role } }, // update the role
      );
      res.redirect("/admin");
    } catch (err) {
      console.error(err);
      res.redirect("/admin");
    }
  },
);

app.use((req, res) => {
  res.status(404);
  res.render("404", { navLinks: navLinks });
});

// ==============================================
// creating default users for testing
// ==============================================
async function createRequiredUsers() {
  if (!userCollection) return;

  const bcrypt = require("bcrypt");
  const saltRounds = 12;

  // 1. create admin user
  const adminExist = await userCollection.findOne({ email: "admin@email.com" });
  if (!adminExist) {
    const hashedPw = await bcrypt.hash("Password123!", saltRounds);
    await userCollection.insertOne({
      name: "Admin",
      email: "admin@email.com",
      password: hashedPw,
      role: "admin",
    });
    console.log("Admin user has been created");
  }

  // 2. create normal user
  const userExist = await userCollection.findOne({ email: "user@email.com" });
  if (!userExist) {
    const hashedPw = await bcrypt.hash("Password123!", saltRounds);
    await userCollection.insertOne({
      name: "User",
      email: "user@email.com",
      password: hashedPw,
      role: "user",
    });
    console.log("Normal user has been created");
  }
}
