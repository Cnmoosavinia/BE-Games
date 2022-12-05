const { text } = require("express");
const express = require("express");
const app = express();
const cors = require("cors");
const {
  getCategories,
  getReviews,
  getReviewById,
  getComments,
  postComment,
  patchVotes,
  getUsers,
} = require("./controller/games.controller.js");

app.use(cors());

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewById);

app.get("/api/reviews/:review_id/comments", getComments);

app.post("/api/reviews/:review_id/comments", postComment);

app.patch("/api/reviews/:review_id", patchVotes);

app.get("/api/users", getUsers);

app.all("*", (req, res, next) => {
  res.status(404).send({ message: "route does not exist" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ message: err.message });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "Bad Request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "23502") {
    res.status(400).send({ message: "Bad Request" });
  } else next(err);
});
app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ message: "Not Found" });
  } else next(err);
});
app.use((err, req, res, next) => {
  if (err.code === "42703") {
    res.status(404).send({ message: "Not Found" });
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err, "unhandled error");
  res.status(500).send({ message: "internal server error" });
});

module.exports = app;
