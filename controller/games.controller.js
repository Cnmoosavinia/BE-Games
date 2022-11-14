const { application } = require("express");
const { selectCategories } = require("../models/games-model.js");

exports.getCategories = (req, res) => {
  selectCategories().then((categories) => {
    res.status(200).send({ categories });
  });
};
