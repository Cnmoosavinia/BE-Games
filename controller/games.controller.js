const { application } = require("express");
const {
  selectCategories,
  selectReviews,
<<<<<<< HEAD
  selectComments,
} = require("../models/games-model.js");
=======
  selectReviewById,
} = require("../models/games-model.js");

>>>>>>> 715a6f17b71e73e762e8480bcc6a3daf1cb749d1

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

exports.getComments = (req, res, next) => {
  const { review_id } = req.params;
  selectComments(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};
