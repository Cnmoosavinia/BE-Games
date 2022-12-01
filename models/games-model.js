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

exports.selectReviews = (category, sort_by = "created_at", order = "desc") => {
  const queryValue = [];
  let queryTable = `SELECT reviews.owner, reviews.title, reviews.review_id, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, COUNT(comments.review_id)::int AS comment_count  FROM reviews LEFT JOIN users ON reviews.owner = users.username LEFT JOIN comments ON reviews.review_id = comments.review_id`;

  if (
    ![
      "owner",
      "title",
      "reivew_id",
      "category",
      "votes",
      "comment_count",
      "created_at",
    ].includes(sort_by)
  ) {
    return Promise.reject({ status: 400, message: "Invalid sort query" });
  }

  if (!["ASC", "DESC", "asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, message: "Invalid order query" });
  }

  if (category) {
    queryValue.push(category);
    queryTable += ` WHERE reviews.category = $1 GROUP BY reviews.review_id, users.username ORDER BY ${sort_by} ${order};`;
  } else {
    queryTable += ` GROUP BY reviews.review_id, users.username ORDER BY ${sort_by} ${order};`;
  }

  return db.query(queryTable, queryValue).then((reviews) => {
    return reviews.rows;
  });
};

exports.selectReviewById = (review_id) => {
  return db
    .query(
      `
    SELECT reviews.owner, reviews.title, reviews.review_body, reviews.review_id, reviews.category, reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, COUNT(comments.review_id)::int AS comment_count 
    FROM reviews
    LEFT JOIN users ON reviews.owner = users.username
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id, users.username
    ORDER BY reviews.created_at DESC; 
    `,
      [review_id]
    )
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

exports.insertComment = ({ username, body }, { review_id }) => {
  return db
    .query(
      `INSERT INTO comments
    (
      body, author, review_id
    ) VALUES (
      $1, $2, $3
    ) RETURNING *;
    `,
      [body, username, review_id]
    )
    .then((newComment) => {
      return newComment.rows[0];
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

exports.selectUsers = () => {
  return db.query(`SELECT * FROM users;`).then((users) => {
    return users.rows;
  });
};
