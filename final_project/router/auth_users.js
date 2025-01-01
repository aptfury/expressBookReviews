const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
    return res.status(404).json({
      message: "Error logging in"
    });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).send("User successfully logged in!");
  } else {
    return res.status(208).json({
      message: "Invalid login. Check username and password."
    });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const review = req.query.review;
  const name = req.session.authorization['username'];
  const isbn = req.params.isbn;
  const book = books[isbn];
  const title = book["title"];
  const reviews = book['reviews'];
  const hasReview = `${name}` in reviews; // true if review from user already exists; false if no review from user exists
  const upToDate = hasReview ? reviews[`${name}`] === review : false; // true if saved review and submitted review match; false if review needs updating

  if (!isbn) {
    console.log(`ISBN-${isbn}`);
    return res.status(400).json({
      message: `A valid ISBN must be used to leave a review. Please check the ISBN and try again.`
    })
  }

  if (!book) {
    console.log(`Book:\n\n${book}`)
    return res.status(404).json({
      message: `We couldn\'t find a book under ISBN-${isbn}. Try finding the ISBN by searching for Title or Author.`
    });
  }

  if (!review) {
    console.log(`Review Submitted:\n\n${review}`);
    return res.status(400).json({
      message: `You cannot leave a blank review.`
    });
  }

  if (!users.filter((user) => user.username === name)) {
    console.log(`Name: ${name}`);
    return res.status(400).json({
      message: `We couldn\'t find a user with the name ${name}. You may need to login again. \(This should not show up and is just there as a catch all. Something is wrong with auth if this result appears.\))`
    });
  }

  if (hasReview) { // Not their first review
    if (upToDate)  { // Review matches previous review
      // No Update
      console.log(book["reviews"][`${name}`]);
      return res.status(400).json({
        message: `The review submitted for ${title} matches one that has already been submitted under your name for this title. Please submit an updated review if you would like to make any changes to it.`,
        current_review: book["reviews"][`${name}`],
        submitted_review: review,
        submitted_by: name
      });
    } else { // Review does not match new submission and needs to be updated
      // Update review to match
      const old_review = book["reviews"][`${name}`];

      book["reviews"][`${name}`] = review;

      const new_review = book["reviews"][`${name}`];

      if (new_review === review) {
        console.log(`All Reviews:\n\n${book["reviews"]}\n\nYour Review:\n\n${book["reviews"][`${name}`]}\n\nSubmitted Review:\n\n${review}`);

        return res.status(200).json({
          message: `Your review for ${title} has been updated. Check information below to verify that the update is correct.`,
          review_for: title,
          submitted_by: name,
          submitted_review: review,
          old_review: old_review,
          new_review: new_review,
          updated_on: Date()
        });
      }

      return res.status(400).json({
        message: "We ran into an error when trying to update your review."
      });
    }
  } else { // Their first review
    // Add new review
    book["reviews"][`${name}`] = review;

    const new_review = book["reviews"][`${name}`];

    return res.status(200).json({
      message: `Your review of ${title} has been added successfully. Please review the information below to ensure accuracy. If you need to update your review, submit it as though adding a review for the first time and we\'ll update it for you.`,
      review_for: title,
      submitted_by: name,
      submitted_review: review,
      new_review: new_review,
      added_on: Date(),
      all_reviews: book["reviews"]
    })
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const name = req.session.authorization['username'];
  const isbn = req.params.isbn;
  const title = books[isbn]['title'];
  const reviews = books[isbn]['reviews'];
  const removed = reviews[`${name}`];
  const reviewExists = `${name}` in reviews; // True review by this user exists; False if there is no review by this user

  if (!reviewExists) {
    return res.status(400).json({
      message: `We could not find a review by ${name} for ${title}. See a list of the reviews below to make sure this is correct.`,
      request_by: name,
      reviews: reviews
    })
  } else {
    delete reviews[`${name}`];

    return res.status(200).json({
      message: `${name}\'s review has been successfully removed from ${title}. Check the reviews list below to verify removal.`,
      removed_review_by: name,
      removed_review: removed,
      updated_reviews_list: reviews
    });
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
