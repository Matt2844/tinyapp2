
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

app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  const shortURL = req.params.shortURL
  const templateVars = { shortURL, longURL };
  res.render("urls_show.ejs", templateVars);
})

app.get("/new", (req, res) => {
  res.render("urls_new");
})

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

