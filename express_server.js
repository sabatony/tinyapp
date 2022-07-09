const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcryptjs');

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
};

const urlsForUser = (id) => {
  let userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}


const users = {};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/login", (req, res) => {
  if (req.cookies.userId) {
    return res.redirect("/urls")
  }
  res.render("login")
});

app.get("/register", (req, res) => {
  if (req.cookies.userId) {
    return res.redirect("/urls")
  }
  res.render("register")
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["userId"];
  const userUrls = urlsForUser(userID);
  let templateVars = {urls: userUrls, user: users[userID]};
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
  const userID = req.cookies["userId"];
  const userUrls = urlsForUser(userID);
  if (urlDatabase[req.params.shortURL] && req.cookies["userId"] === urlDatabase[req.params.shortURL].userId) {
    let templateVars = {urls: userUrls, user: users[userID], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL};
  return res.render("urls_show", templateVars);
  } 
 
  res.send("URL does not belong to you.")
  
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("URL does not exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("URL does not exist");
  }

  if (!req.cookies["userId"]) {
    return res.send("Login to delete URLs")
  }

  if (req.cookies["userId"] !== urlDatabase[req.params.shortURL].userId) {
    return res.send("This URL does not belong to you.")
  }



  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")

});

app.post("/urls", (req, res) => {
  if (!req.cookies["userId"]) {
    return res.send("Login to shorten urls")
  }
  
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.cookies["userId"]
  }
  res.redirect(`/urls/${shortURL}`);

});

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.send("URL does not exist");
  }

  if (!req.cookies["userId"]) {
    return res.send("Login to delete URLs")
  }

  if (req.cookies["userId"] !== urlDatabase[req.params.shortURL].userId) {
    return res.send("This URL does not belong to you.")
  }
  let longURL = req.body.longURL
  urlDatabase[req.params.id].longURL = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const foundUser = getUserByEmail(email);

  const passwordMatches = bcrypt.compareSync(password, foundUser.password);
  

  if (!foundUser) {
    return res.status(400).send("No user with that email found!");
  }

  if (!passwordMatches) {
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
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

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
    password: hash
  };

  users[id] = newUser;
  console.log(users);
  res.cookie("userId", id);

  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});