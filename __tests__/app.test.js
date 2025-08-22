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


describe('GET /api/articles', () => {
  test('200: responds with an array of article objects', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    expect(response.body).toHaveProperty('articles');
    expect(Array.isArray(response.body.articles)).toBe(true);
    expect(response.body.articles.length).toBeGreaterThan(0);
  });

  test('200: each article object has the correct properties', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('article_id');
      expect(article).toHaveProperty('topic');
      expect(article).toHaveProperty('created_at');
      expect(article).toHaveProperty('votes');
      expect(article).toHaveProperty('article_img_url');
      expect(article).toHaveProperty('comment_count');
      
      expect(typeof article.author).toBe('string');
      expect(typeof article.title).toBe('string');
      expect(typeof article.article_id).toBe('number');
      expect(typeof article.topic).toBe('string');
      expect(typeof article.created_at).toBe('string');
      expect(typeof article.votes).toBe('number');
      expect(typeof article.article_img_url).toBe('string');
      expect(typeof article.comment_count).toBe('number');
    });
  });

  test('200: articles do not have a body property', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      expect(article).not.toHaveProperty('body');
    });
  });

  test('200: articles are sorted by created_at in descending order (newest first)', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  test('200: comment_count is accurate for articles with comments', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      expect(article.comment_count).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(article.comment_count)).toBe(true);
    });
  });

  test('200: comment_count is 0 for articles with no comments', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    const articlesWithNoComments = articles.filter(article => article.comment_count === 0);
    
    articlesWithNoComments.forEach((article) => {
      expect(article.comment_count).toBe(0);
    });
  });

  test('200: returns all articles from the database', async () => {
    const articleCountResult = await db.query('SELECT COUNT(*) FROM articles;');
    const expectedCount = parseInt(articleCountResult.rows[0].count);

    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    expect(response.body.articles.length).toBe(expectedCount);
  });

  test('200: articles have valid topic values', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    const topicsResult = await db.query('SELECT slug FROM topics;');
    const validTopics = topicsResult.rows.map(row => row.slug);
    
    articles.forEach((article) => {
      expect(validTopics).toContain(article.topic);
    });
  });

  test('200: articles have valid author values', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    const usersResult = await db.query('SELECT username FROM users;');
    const validAuthors = usersResult.rows.map(row => row.username);
    
    articles.forEach((article) => {
      expect(validAuthors).toContain(article.author);
    });
  });

  test('200: created_at dates are in valid ISO format', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      const date = new Date(article.created_at);
      expect(date.toISOString()).toBe(article.created_at);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  test('200: article_img_url is a valid URL format', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      if (article.article_img_url) {
        expect(article.article_img_url).toMatch(/^https?:\/\/.+/);
      }
    });
  });

  test('200: votes are integers', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      expect(Number.isInteger(article.votes)).toBe(true);
    });
  });
});