const express = require("express");
const app = express();
const { getCategories } = require("./controller/games.controller.js");

app.use(express.json());

app.get("api/categories", getCategories);

module.exports = app;
