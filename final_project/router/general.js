const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });

  return userswithsamename.length > 0;
}

// Register a new user
public_users.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      return res.status(400).json({
        message: "Username must be more than 3 characters and must contain only letters."
      })
    }

    if (!doesExist(username)) {
      users.push({
        "username": username,
        "password": password
      });

      return res.status(200).json({ message: "User successfully registered. You may now log in." });
    } else {
      return res.status(404).json({ message: "This user already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get available books list with promise
public_users.get('/', (req, res) => {
  new Promise((resolve, reject) => {
    try {
      resolve(JSON.stringify(books, null, 4));
    } catch (err) {
      reject(err);
    }
  }).then(
    (data) => res.send(data),
    (err) => console.log(`Error: ${err}`)
  );
});

// Get book by ISBN with promise
public_users.get('/isbn/:isbn', (req, res) => {
  new Promise((resolve, reject) => {
    try {
      const isbn = req.params.isbn;
      const book = books[isbn];

      book ? resolve(JSON.stringify(book, null, 4)) : resolve("Unable to locate the book you were looking for.");
    }
    catch (err) {
      reject(err);
    }
  }).then(
    (data) => res.send(data),
    (err) => console.log(`Error: ${err}`)
  );
});

// Get book by author with promise
public_users.get('/author/:author', (req, res) => {
  new Promise((resolve, reject) => {
    try {
      const author = req.params.author;
      let fromAuthor = {};
      
      for (let isbn in books) {
        if (books[isbn]['author'] === author) fromAuthor[isbn] = books[isbn];
      };

      if (Object.keys(fromAuthor).length === 0) resolve(`We didn\'t find any books by ${author}`);

      resolve(JSON.stringify(fromAuthor, null, 4));
    }
    catch (err) {
      reject(err);
    }
  }).then(
    (data) => res.send(data),
    (err) => console.log(`Error: ${err}`)
  )
});

// Get book by title with promise
public_users.get('/title/:title', (req, res) => {
  new Promise((resolve, reject) => {
    try {
      const title = req.params.title;
      let withTitle = {};
      
      for (let isbn in books) {
        if (books[isbn]["title"] === title) withTitle[isbn] = books[isbn];
      }

      if (Object.keys(withTitle).length === 0) resolve (`We didn\'t find any books named ${title}.`);

      resolve(JSON.stringify(withTitle, null, 4));
    }
    catch (err) {
      reject(err);
    }
  }).then(
    (data) => res.send(data),
    (err) => console.log(`Error: ${err}`)
  );
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  new Promise((resolve, reject) => {
    try {
      const isbn = req.params.isbn;
      const reviews = books[isbn]["reviews"];
      const title = books[isbn]["title"];
      const author = books[isbn]["author"];

      if (!isbn) resolve(`You must enter a known ISBN to look up reviews. We could not find a book with ISBN-${isbn}.`);

      resolve(`Here\'s what people have to say about ${title} by ${author}\n\n${JSON.stringify(reviews, null, 4)}`);
    }
    catch (err) {
      reject(err);
    }
  }).then(
    (data) => res.send(data),
    (err) => console.log(`Error: ${err}`)
  )
});

module.exports.general = public_users;
