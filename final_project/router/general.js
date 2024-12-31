const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify({ books }, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (book) {
    res.send(JSON.stringify({book}, null, 4));
  } else {
    res.send("Unable to locate the book you were looking for.");
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let author = req.params.author;

  let book = [];

  for (let isbn in books) {
    if (books[isbn]["author"] === author) {
      book.push(books[isbn]);
    }
  }

  if (book.length > 0) {
    res.send(JSON.stringify({book}, null, 4));
  } else {
    res.send(`We couldn\'t find a book by ${author}.`)
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let title = req.params.title;

  let book = [];

  for (let isbn in books) {
    if (books[isbn]["title"] === title) {
      book.push(books[isbn]);
    }
  }

  if (book.length > 0) {
    res.send(JSON.stringify({book}, null, 4));
  } else {
    res.send(`We couldn\'t find a book by the name of ${title}.`);
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
