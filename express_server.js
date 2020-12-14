
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


// Database templates to show the db structure. 
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const userDatabase = {
  "abc123": {
    id: "abc123",
    email: "example@gmail.com",
    password: "123" // Newly registered users have hashed passwords.
  }
}
const emailDatabase = ["example@gmail.com"];

// PORT = 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Landing page
app.get("/", (req, res) => {
  res.send("Hello!");
});


// Displays the users urls.
app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const urls = urlDatabase;
  const user = userDatabase[userId];
  const templateVars = { urls, user, userId }

  if (!userId) {
    return res.redirect("/login")
  }

  res.render("urls_index", templateVars);
});


// Displays a newly generated shortURL, with a link to the website. 
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = userDatabase[userId];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL
  const templateVars = { user, shortURL, longURL }

  if (userId === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send('Sorry you do not own this url.')
  }
})


app.get("/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = userDatabase[userId]
  const templateVars = { user }

  if (!userId) {
    return res.redirect("/login")
  }

  res.render("urls_new", templateVars);
})


// Redirects to website.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const usersURLs = urlDatabase[req.params.shortURL].userID;
  const userId = req.cookies["user_id"];

  if (longURL && userId === usersURLs) {
    res.redirect(longURL);
  } else {
    res.send('Sorry the short url does not exist, or you do not own that short url.')
  }

})


// Login page.
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = userDatabase[userId]
  const templateVars = { user }

  res.render("urls_login", templateVars)
});


// Register page. 
app.get("/register", (req, res) => {
  const username = req.cookies["user_id"];
  const user = userDatabase[username]
  const templateVars = { username, userDatabase, user };

  res.render("urls_register", templateVars)
});


// Takes the longURL from /new and turns it into a shortURL. Stored in db. 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }

  res.redirect(`/urls/${shortURL}`)
});


// Deletes url. 
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"];
  const usersURL = urlDatabase[req.params.shortURL].userID;

  if (userId === usersURL) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("You cannot delete this short url.")
  }

});


// When submit button is clicked from /urls/:shortURL
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = newLongURL;
  const userId = req.cookies["user_id"];
  const userUrl = urlDatabase[shortURL].userID;

  if (userId === userUrl) {
    res.redirect('/urls');
  } else {
    res.status(400).send('Sorry cannot edit this short url.')
  }
})


// When the user logs in. Or tries to. 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userInfo = Object.values(userDatabase);

  // If login is left blank.
  if (email === "" || password === "") {
    return res.status(400).send("Please fill out form.");
  };

  // Validating email and password. 
  for (let info of userInfo) {
    if (email === info.email) {
      const isPasswordMatch = bcrypt.compareSync(password, info.password);

      if (isPasswordMatch) {
        res.cookie("user_id", info.id);
        return res.redirect("/urls");
      }
    }
  };
  // If email and/or password are not valid.
  res.status(400).send("Username or password does not exist.");
});


// Receives the register form 
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // If input is submitted blank by user
  if (email === "" || password === "") {
    return res.status(400).send('Please make sure to fill in email and password.');
  };

  // If email already exits
  for (let existingEmail of emailDatabase) {
    if (email === existingEmail) {
      return res.status(400).send('Sorry that email is already in use.');
    }
  };

  // Adding new user to the database, and setting cookie
  const newRegistrant = {
    id: generateRandomString(),
    email: email,
    password: hashedPassword,
  };

  userDatabase[newRegistrant.id] = newRegistrant;
  emailDatabase.push(email);
  res.cookie("user_id", newRegistrant.id).redirect('/urls');

});

// Clears cookie when user logs out
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

