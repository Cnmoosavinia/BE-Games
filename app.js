const express = require("express");
const app = express();
const {
  getCategories,
  getReviews,
  getComments,
} = require("./controller/games.controller.js");

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id/comments", getComments);

app.use("*", (req, res, next) => {
  res.status(404).send({ message: "route does not exist" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err, "unhandled error");
  res.status(500).send({ message: "internal server error" });
});

module.exports = app;
