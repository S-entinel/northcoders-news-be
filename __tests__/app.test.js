const db = require("../db/connection");
const request = require("supertest");
const app = require("../app.js");
const seed = require("../db/seeds/seed.js")
const testData = require('../db/data/test-data/index.js');


beforeEach(() => seed(testData));
afterAll(() => db.end());


describe("GET /api/topics", () => {
  test("200: responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toBeInstanceOf(Array);
        expect(body.topics.length).toBeGreaterThan(0);
      });
  });

  test("200: still works when database has no topics", async () => {
    await db.query("DELETE FROM topics;");
    
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toEqual([]);
      });
  });

  test("200: each topic object has the correct properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(topic).toHaveProperty("img_url");
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.img_url).toBe("string");
        });
      });
  });

  test("200: returns the correct number of topics from test data", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toHaveLength(3); 
      });
  });

  test("200: returns topics with expected slugs", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const slugs = body.topics.map((topic) => topic.slug);
        expect(slugs).toContain("mitch");
        expect(slugs).toContain("cats");
        expect(slugs).toContain("paper");
      });
  });

  
  test("200: response body has the correct structure", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveProperty("topics");
        expect(body.topics).toBeInstanceOf(Array);
      });
  });

  test("404: responds with error for non-existent endpoint", () => {
    return request(app)
      .get("/api/topic")
      .expect(404);
  });
});

