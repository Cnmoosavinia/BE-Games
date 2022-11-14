const express = require("express");
const app = express();
const { getCategories } = require("./controller/games.controller.js");

app.get("/api/categories", getCategories);

app.use("*", (req, res, next) => {
  res.status(404).send({ message: "route does not exist" });
});

app.use((err, req, res, next) => {
  console.log(err, "unhandled error");
  res.status(500).send({ message: "internal server error" });
});

module.exports = app;
