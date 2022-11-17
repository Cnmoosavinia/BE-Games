const { application } = require("express");
const {
  selectCategories,
  selectReviews,
  selectComments,
  selectReviewById,
  updateVotes,
} = require("../models/games-model.js");

exports.getCategories = (req, res, next) => {
  selectCategories().then((categories) => {
    res.status(200).send({ categories });
  });
};

exports.getReviews = (req, res, next) => {
  selectReviews().then((reviews) => {
    res.status(200).send({ reviews });
  });
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.getComments = (req, res, next) => {
  const { review_id } = req.params;
  selectComments(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.patchVotes = (req, res, next) => {
  updateVotes(req.body, req.params)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};
