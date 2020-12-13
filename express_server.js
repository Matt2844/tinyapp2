
// Environment setup such as dependencies, libraries, and/or imports. 

const { generateRandomString } = require('./helper-functions');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


// Database templates to show the structure. 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const userDatabase = {
  "abc123": {
    id: "abc123",
    email: "example@gmail.com",
    password: "123" // Newly registered users have hashed passwords.
  }
}
const emailDatabase = ["example@gmail.com"];


// Landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Displays the users urls.
app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username };

  res.render("urls_index", templateVars);
});


// Displays a newly generated shortURL, with a link to the website. 
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL]
  const username = req.cookies["username"];
  const templateVars = { shortURL, longURL, username };

  res.render("urls_show.ejs", templateVars);
})


app.get("/new", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username }
  res.render("urls_new", templateVars);
})


// Redirects to website.
app.get("/u/:shortURL", (req, res) => {
  const username = req.cookies["username"];
  const longURL = urlDatabase[req.params.shortURL]

  res.redirect(longURL);
})


// Login page.
app.get("/login", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };

  res.render("urls_login", templateVars)
})


// Register page. 
app.get("/register", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };

  res.render("urls_register", templateVars)
})


// Takes the longURL from /new and turns it into a shortURL. Stored in db. 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL

  res.redirect(`/urls/${shortURL}`)
});


// Deletes url. 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls")
})


// When submit button is clicked from /urls/:shortURL
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  const newShortURL = generateRandomString();

  urlDatabase[newShortURL] = longURL;
  delete urlDatabase[shortURL];

  console.log(urlDatabase);
  res.redirect("/urls")
})


// When the user logs in. Or tries to. 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfo = Object.values(userDatabase);

  // If login is left blank.
  if (email === "" || password === "") {
    return res.status(400).send("Please fill out form.")
  };

  // Validating email and password. 
  for (let info of userInfo) {
    if (email === info.email) {
      const isPasswordMatch = bcrypt.compareSync(password, info.password);

      if (isPasswordMatch) {
        res.cookie("username", req.body.email);
        return res.redirect("/urls");
      }
    }
  };
  // If email and/or password are not valid.
  res.status(400).send("Username or password does not exists.")
});


// Receives the register form 
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // If input is submitted blank by user
  if (email === "" || password === "") {
    return res.status(400).send('Please make sure to fill in email and password.');
  }

  // If email already exits
  for (let existingEmail of emailDatabase) {
    if (email === existingEmail) {
      return res.status(400).send('Sorry that email is already in use.');
    }
  }

  // Adding new user to the database, and setting cookie
  const newRegistrant = {
    id: generateRandomString(),
    email: email,
    password: hashedPassword,
  }

  userDatabase[newRegistrant.id] = newRegistrant;
  emailDatabase.push(email);
  res.cookie("username", newRegistrant.email).redirect('/urls');

})

// Clears cookie when user logs out
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

