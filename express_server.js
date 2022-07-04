const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  while (result.length < 6) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const getUserByID = (id) => {
  for (const userId in users) {
    if (userId === id) {
      return users[userId];
    }
  }
  return null;
};

const getUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};

const users = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/register", (req, res) => {
  res.render("register")
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")

});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);

});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");

});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email);

  if (email === "" || password === ""){
    res.send("400 Bad Request ")
  };

  if (foundUser) {
    return res.status(400).send("A user with that email already exists!");
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;

  console.log(users);

  

res.cookie("user_id", id);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});