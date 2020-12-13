
// Environment setup such as dependencies, libraries, and/or imports. 

const { generateRandomString } = require('./helper-functions');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {

  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Displays a newly generated shortURL, with a link to the website. 
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL };

  res.render("urls_show.ejs", templateVars);
})

app.get("/new", (req, res) => {
  res.render("urls_new");
})

// Redirects to website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]

  res.redirect(longURL);
})

// Takes the longURL from /new and turns it into a shortURL. Stored in db. 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL

  res.redirect(`/urls/${shortURL}`)
});

// Deletes url 
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


