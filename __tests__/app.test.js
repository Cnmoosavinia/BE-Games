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
  test("Get: 404 - error when .get /api/nonsense", () => {
    return request(app)
      .get("/api/nonsense")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("route does not exist");
      });
  });
});
