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

describe.only("GET /api/reviews", () => {
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
        expect(reviews).toHaveLength(13);
        expect(reviews[0]).toEqual({
          owner: "mallionaire",
          title: "Mollit elit qui incididunt veniam occaecat cupidatat",
          review_id: 7,
          category: "social deduction",
          review_img_url:
            "https://images.pexels.com/photos/278888/pexels-photo-278888.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
          created_at: "2021-01-25T11:16:54.963Z",
          votes: 9,
          designer: "Avery Wunzboogerz",
          comment_count: 0,
        });
      });
  });
  test("GET: 200 - responds with a 200 status and an array of objects in descending order by date", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toHaveLength(13);
        expect(reviews[12]).toEqual({
          owner: "mallionaire",
          title: "Settlers of Catan: Don't Settle For Less",
          review_id: 13,
          category: "social deduction",
          review_img_url:
            "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
          created_at: "1970-01-10T02:08:38.400Z",
          votes: 16,
          designer: "Klaus Teuber",
          comment_count: 0,
        });
      });
  });
});
