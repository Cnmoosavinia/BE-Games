const db = require("../db/connection.js");

exports.selectCategories = () => {
  return db
    .query(
      `
        SELECT * FROM categories;
        `
    )
    .then((categories) => {
      return categories.rows;
    });
};

exports.selectReviews = () => {
  return db
    .query(
      `
    SELECT reviews.owner, reviews.title, reviews.review_id, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, COUNT(comments.review_id)::int AS comment_count 
    FROM reviews
    LEFT JOIN users ON reviews.owner = users.username
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id, users.username
    ORDER BY reviews.created_at DESC;
    `
    )
    .then((reviews) => {
      return reviews.rows;
    });
};

exports.selectReviewById = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1;`, [review_id])
    .then(({ rows }) => {
      const review = rows[0];
      if (!review) {
        return Promise.reject({
          status: 404,
          message: `No review found for review_id: ${review_id}`,
        });
      }
      return review;
    });
};

exports.selectComments = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1;`, [review_id])
    .then(({ rows }) => {
      const review = rows[0];
      if (!review) {
        return Promise.reject({
          status: 404,
          message: `No comments found for review_id: ${review_id}`,
        });
      }
      return review;
    })
    .then(() => {
      return db
        .query(
          `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at`,
          [review_id]
        )
        .then((comments) => {
          return comments.rows;
        });
    });
};

exports.updateVotes = ({ inc_votes: newVote }, { review_id }) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1;`, [review_id])
    .then(({ rows }) => {
      const review = rows[0];
      if (!review) {
        return Promise.reject({
          status: 404,
          message: `No review found for review_id: ${review_id}`,
        });
      }
      return review;
    })
    .then(() => {
      return db
        .query(
          `UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *;`,
          [newVote, review_id]
        )
        .then(({ rows }) => {
          const updatedReview = rows[0];
          return updatedReview;
        });
    });
};
