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
