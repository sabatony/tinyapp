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

const getUserByEmail = (email) => {
  for(const userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}


const users = {};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/login", (req, res) => {
  if (req.cookies.userId) {
    res.redirect("/urls")
  }
  res.render("login")
});

app.get("/register", (req, res) => {
  if (req.cookies.userId) {
    res.redirect("/urls")
  }
  res.render("register")
});

app.get("/urls", (req, res) => {
  console.log(users[req.cookies["userId"]]);
  const templateVars = { urls: urlDatabase, user: users[req.cookies["userId"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["userId"]]
  };
  if (!req.cookies.userId) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.cookies["userId"]);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["userId"]]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.send("URL doesn't exist");
  }
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")

});

app.post("/urls", (req, res) => {
  if (!req.cookies["userId"]) {
    res.send("Login to shorten URLs");
  }
  
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
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email);
  

  if (!foundUser) {
    return res.status(400).send("No user with that email found!");
  }

  if (foundUser.password !== password) {
    return res.status(400).send("incorrect password")
  }

  res.cookie("userId", foundUser.id);

  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  console.log("test")
  res.clearCookie("userId");
  res.redirect("/urls");

});


app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email);

  if (email === "" || password === ""){
    res.send("400 Bad Request ")
  };

  if (foundUser) {
    return res.status(400).send("A user with that email already exists");
  }

  const id = generateRandomString();
  const newUser = {
    id,
    email,
    password
  };

  users[id] = newUser;
  console.log(users);
  res.cookie("userId", id);

  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});