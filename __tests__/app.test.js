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
  test("GET: 200 - responds with a 200 status and an array of objects containing correct properties", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe.only("GET /api/reviews/:review_id/comments", () => {
  test("GET: 200 - responds with a 200 status and an array of comments which match the input review_id", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        console.log(comments);
        expect(comments).toHaveLength(3);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            review_id: expect.any(Number),
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
  test("GET: 404 return message no comments when a review_id input has no comments against it", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("No comments found for review_id: 1");
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
