const request = require("supertest");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const app = require("../app.js");
const connection = require("../db/connection.js");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return connection.end();
});

describe("GET /api/categories", () => {
  test("GET: 200 - responds with a 200 status and an array of objects containing slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body }) => {
        const { categories } = body;
        expect(categories).toHaveLength(4);
        categories.forEach((category) => {
          expect(category).toEqual({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test("GET: 404 - error when .get /api/nonsense", () => {
    return request(app)
      .get("/api/nonsense")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("route does not exist");
      });
  });
});

describe("GET /api/reviews", () => {
  test("GET: 200 - responds with a 200 status and an array of objects containing correct properties", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toHaveLength(13);
        reviews.forEach((review) => {
          expect(review).toEqual({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET: 200 - responds with a 200 status and an array of objects in the correct order", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("GET /api/reviews/review_id", () => {
  test("GET: 200 - returns object with the relevant ID", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toMatchObject({
          review_id: 1,
          title: expect.any(String),
          designer: expect.any(String),
          owner: expect.any(String),
          review_img_url: expect.any(String),
          review_body: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
        });
      });
  });
  test("GET: 400 - return message bad request when a non appliable input is added to :review_id", () => {
    return request(app)
      .get("/api/reviews/nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("GET: 404 - return message review not found when a review_id input is not found", () => {
    return request(app)
      .get("/api/reviews/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("No review found for review_id: 1000");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("GET: 200 - responds with a 200 status with an empty array if there is a valid review but no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });
  test("GET: 200 - responds with a 200 status and an array of comments which match the input review_id", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(3);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: 2,
          });
        });
      });
  });
  test("GET: 200 - responds with a 200 status with array ordered by created_at from most recent comment", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeSortedBy("created_at", { ascending: true });
      });
  });
  test("GET: 404 return message not found when a review_id input is not found", () => {
    return request(app)
      .get("/api/reviews/1000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("No comments found for review_id: 1000");
      });
  });
  test("GET: 400 return message bad request when a non appliable input is added to :review_id", () => {
    return request(app)
      .get("/api/reviews/nonsense/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("POST: 201 - responds with a 201 status with a newly added comment to the db", () => {
    const newComment = {
      username: "dav3rid",
      body: "first comment woop",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment.body).toBe("first comment woop");
      });
  });
  test("POST: comment object is unaffected by input if information is valid", () => {
    const newComment = {
      username: "dav3rid",
      body: "first comment woop",
      extra: "something bad tdd wise",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "first comment woop",
          review_id: 1,
          author: "dav3rid",
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST: 404 - responds with a 404 staus if the user doesn't exist in the database", () => {
    const newComment = {
      username: "garyyy",
      body: "first comment woop",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not Found");
      });
  });
  test("POST: 400 - responds with a 400 status and a Bad Request comment when req.body is empty", () => {
    const newComment = {};
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("POST: 400 - responds with a 400 status and a Bad Request comment when req.body is incomplete", () => {
    const newComment = { username: "dav3rid" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("POST: 400 - responds with a 400 status and a Bad Request comment when req.body is incomplete", () => {
    const newComment = { body: "first comment woop" };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("POST: 400 - responds with a 400 status and a Bad Request comment when req.body is incomplete", () => {
    const newComment = {
      usename: "dav3rid",
      body: "first comment woop",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("POST: 400 - responds with a 400 status and a Bad Request comment when req.body is incomplete", () => {
    const newComment = {
      username: "dav3rid",
      boody: "first comment woop",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("POST: 404 - review_id doesn't exist", () => {
    const newComment = {
      username: "dav3rid",
      body: "first comment woop",
    };
    return request(app)
      .post("/api/reviews/1000/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not Found");
      });
  });
  test("POST: 400 - Bad Request if review_id is not a number", () => {
    const newComment = {
      username: "dav3rid",
      body: "first comment woop",
    };
    return request(app)
      .post("/api/reviews/nonsense/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/reviews/review_id", () => {
  test("PATCH: 200 - responds with the updated vote in reivew object when a postive is input", () => {
    const votesUpdate = { inc_votes: 1 };
    return request(app)
      .patch("/api/reviews/2")
      .send(votesUpdate)
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toMatchObject({
          votes: 6,
        });
      });
  });
  test("PATCH: 200 - responds with the updated vote in reivew object when a negative is input", () => {
    const votesUpdate = { inc_votes: -3 };
    return request(app)
      .patch("/api/reviews/2")
      .send(votesUpdate)
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toMatchObject({
          votes: 2,
        });
      });
  });
  test("GET: 400 - return message bad request when input is empty", () => {
    const votesUpdate = {};
    return request(app)
      .patch("/api/reviews/nonsense")
      .send(votesUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("GET: 400 - return message bad request when a non appliable input is added to :review_id", () => {
    const votesUpdate = { inc_votes: 1 };
    return request(app)
      .patch("/api/reviews/nonsense")
      .send(votesUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("GET: 404 - return message review not found when a review_id input is not found", () => {
    const votesUpdate = { inc_votes: 1 };
    return request(app)
      .patch("/api/reviews/1000")
      .send(votesUpdate)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("No review found for review_id: 1000");
      });
  });
  test("GET: 400 - return message Bad Request when inc_votes is not a number", () => {
    const votesUpdate = { inc_votes: "hello" };
    return request(app)
      .patch("/api/reviews/2")
      .send(votesUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("GET: 400 - return message Bad Request when inc_votes is spelt wrong", () => {
    const votesUpdate = { inc_voes: 1 };
    return request(app)
      .patch("/api/reviews/2")
      .send(votesUpdate)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("GET: 200 - responds with a 200 status and an array of objects containing correct properties", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
  test("GET: 404 - responds with a 404 error when .get is pathed incorrectly", () => {
    return request(app)
      .get("/api/user")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("route does not exist");
      });
  });
});

describe("GET /api/reviews/:review_id/comment count", () => {
  test("GET: 200 - returns object of review with the correct ID and comment count of 0", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toMatchObject({
          review_id: 1,
          title: expect.any(String),
          designer: expect.any(String),
          owner: expect.any(String),
          review_img_url: expect.any(String),
          review_body: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          comment_count: 0,
        });
      });
  });
  test("GET: 200 - returns object of review with the correct ID and comment count of 3", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body }) => {
        const { review } = body;
        expect(review).toMatchObject({
          review_id: 2,
          title: expect.any(String),
          designer: expect.any(String),
          owner: expect.any(String),
          review_img_url: expect.any(String),
          review_body: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          comment_count: 3,
        });
      });
  });
  test("GET: 400 - return message bad request when a non appliable input is added to :review_id", () => {
    return request(app)
      .get("/api/reviews/nonsense")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request");
      });
  });
  test("GET: 404 - return message review not found when a review_id input is not found", () => {
    return request(app)
      .get("/api/reviews/1000")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("No review found for review_id: 1000");
      });
  });
});

describe("GET /api/reviews?queries", () => {
  describe("category queries", () => {
    test("GET: 200 - query returns reviews by the input category", () => {
      return request(app)
        .get("/api/reviews?category=dexterity")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(1);
          reviews.forEach((review) => {
            expect(review).toEqual({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              category: "dexterity",
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });
  });
  describe("sort queries", () => {
    test("GET: 200 - query returns reviews by the input category", () => {
      return request(app)
        .get("/api/reviews?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(13);
          expect(reviews).toBeSortedBy("title", { descending: true });
        });
    });
    test("GET: 400 - query responds with a 400 error when sort_by isn't valid", () => {
      return request(app)
        .get("/api/reviews?sort_by=nonsense")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid sort query");
        });
    });
  });
  describe("order queries", () => {
    test("query returns reviews in ascending order", () => {
      return request(app)
        .get("/api/reviews?order=asc")
        .expect(200)
        .then(({ body }) => {
          const { reviews } = body;
          expect(reviews).toHaveLength(13);
          expect(reviews).toBeSortedBy("created_at", { ascending: true });
        });
    });
    test("GET: 400 - query responds with a 400 error when order is empty string", () => {
      return request(app)
        .get("/api/reviews?order=")
        .expect(400)
        .then(({ body }) => {
          expect(body.message).toBe("Invalid order query");
        });
    });
  });
});
