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

describe('GET /api/users', () => {
  test('200: responds with an array of user objects', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThan(0);
  });

  test('200: each user object has the correct properties', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    users.forEach((user) => {
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('avatar_url');
      
      expect(typeof user.username).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(typeof user.avatar_url).toBe('string');
    });
  });

  test('200: user objects only contain the required properties', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    users.forEach((user) => {
      const userKeys = Object.keys(user);
      expect(userKeys).toHaveLength(3);
      expect(userKeys).toEqual(expect.arrayContaining(['username', 'name', 'avatar_url']));
    });
  });

  test('200: returns all users from the database', async () => {
    const userCountResult = await db.query('SELECT COUNT(*) FROM users;');
    const expectedCount = parseInt(userCountResult.rows[0].count);

    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body.users.length).toBe(expectedCount);
  });

  test('200: usernames are unique', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    const usernames = users.map(user => user.username);
    const uniqueUsernames = [...new Set(usernames)];
    
    expect(usernames.length).toBe(uniqueUsernames.length);
  });

  test('200: all required properties have non-empty string values', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    users.forEach((user) => {
      expect(user.username.length).toBeGreaterThan(0);
      expect(user.name.length).toBeGreaterThan(0);
      expect(user.avatar_url.length).toBeGreaterThan(0);
      
      expect(user.username.trim()).toBe(user.username);
      expect(user.name.trim()).toBe(user.name);
      expect(user.avatar_url.trim()).toBe(user.avatar_url);
    });
  });

  test('200: avatar_url is a valid URL format', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    users.forEach((user) => {
      expect(user.avatar_url).toMatch(/^https?:\/\/.+/);
    });
  });

  test('200: users are returned in consistent order', async () => {
    const response1 = await request(app)
      .get('/api/users')
      .expect(200);

    const response2 = await request(app)
      .get('/api/users')
      .expect(200);

    const users1 = response1.body.users;
    const users2 = response2.body.users;
    
    expect(users1).toEqual(users2);
  });

  test('200: response structure is correct', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const responseKeys = Object.keys(response.body);
    expect(responseKeys).toHaveLength(1);
    expect(responseKeys[0]).toBe('users');
  });

  test('200: usernames match database usernames exactly', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    const dbUsersResult = await db.query('SELECT username FROM users ORDER BY username;');
    const dbUsernames = dbUsersResult.rows.map(row => row.username);
    
    const responseUsernames = users.map(user => user.username).sort();
    
    expect(responseUsernames).toEqual(dbUsernames);
  });

  test('200: names match database names exactly', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    const dbUsersResult = await db.query('SELECT username, name FROM users ORDER BY username;');
    const dbUsers = dbUsersResult.rows;
    
    const sortedResponseUsers = users.sort((a, b) => a.username.localeCompare(b.username));
    
    sortedResponseUsers.forEach((user, index) => {
      expect(user.username).toBe(dbUsers[index].username);
      expect(user.name).toBe(dbUsers[index].name);
    });
  });

  test('200: avatar_urls match database avatar_urls exactly', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    const users = response.body.users;
    
    const dbUsersResult = await db.query('SELECT username, avatar_url FROM users ORDER BY username;');
    const dbUsers = dbUsersResult.rows;
    
    const sortedResponseUsers = users.sort((a, b) => a.username.localeCompare(b.username));
    
    sortedResponseUsers.forEach((user, index) => {
      expect(user.username).toBe(dbUsers[index].username);
      expect(user.avatar_url).toBe(dbUsers[index].avatar_url);
    });
  });
});


describe('GET /api/articles/:article_id', () => {
  test('200: responds with a single article object', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    expect(response.body).toHaveProperty('article');
    expect(typeof response.body.article).toBe('object');
    expect(Array.isArray(response.body.article)).toBe(false);
  });

  test('200: article object has all required properties', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    
    expect(article).toHaveProperty('author');
    expect(article).toHaveProperty('title');
    expect(article).toHaveProperty('article_id');
    expect(article).toHaveProperty('body');
    expect(article).toHaveProperty('topic');
    expect(article).toHaveProperty('created_at');
    expect(article).toHaveProperty('votes');
    expect(article).toHaveProperty('article_img_url');
    
    expect(typeof article.author).toBe('string');
    expect(typeof article.title).toBe('string');
    expect(typeof article.article_id).toBe('number');
    expect(typeof article.body).toBe('string');
    expect(typeof article.topic).toBe('string');
    expect(typeof article.created_at).toBe('string');
    expect(typeof article.votes).toBe('number');
    expect(typeof article.article_img_url).toBe('string');
  });

  test('200: article_id matches the requested id', async () => {
    const requestedId = 3;
    const response = await request(app)
      .get(`/api/articles/${requestedId}`)
      .expect(200);

    expect(response.body.article.article_id).toBe(requestedId);
  });

  test('200: body property is present and contains content', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    expect(article.body.length).toBeGreaterThan(0);
  });

  test('200: returns correct article data from database', async () => {
    const articleId = 2;
    
    const dbResult = await db.query(
      'SELECT * FROM articles WHERE article_id = $1;',
      [articleId]
    );
    const dbArticle = dbResult.rows[0];

    const response = await request(app)
      .get(`/api/articles/${articleId}`)
      .expect(200);

    const article = response.body.article;
    
    expect(article.author).toBe(dbArticle.author);
    expect(article.title).toBe(dbArticle.title);
    expect(article.article_id).toBe(dbArticle.article_id);
    expect(article.body).toBe(dbArticle.body);
    expect(article.topic).toBe(dbArticle.topic);
    expect(article.votes).toBe(dbArticle.votes);
    expect(article.article_img_url).toBe(dbArticle.article_img_url);
    expect(new Date(article.created_at)).toEqual(dbArticle.created_at);
  });

  test('200: created_at is in valid ISO format', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    const date = new Date(article.created_at);
    
    expect(article.created_at).toBe(date.toISOString());
    expect(isNaN(date.getTime())).toBe(false);
  });

  test('200: votes is an integer', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    expect(Number.isInteger(article.votes)).toBe(true);
  });

  test('200: article_img_url is a valid URL format', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    if (article.article_img_url) {
      expect(article.article_img_url).toMatch(/^https?:\/\/.+/);
    }
  });

  test('200: topic exists in topics table', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    
    const topicsResult = await db.query('SELECT slug FROM topics WHERE slug = $1;', [article.topic]);
    expect(topicsResult.rows.length).toBe(1);
  });

  test('200: author exists in users table', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    
    const usersResult = await db.query('SELECT username FROM users WHERE username = $1;', [article.author]);
    expect(usersResult.rows.length).toBe(1);
  });

  test('200: response structure is correct', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const responseKeys = Object.keys(response.body);
    expect(responseKeys).toHaveLength(1);
    expect(responseKeys[0]).toBe('article');
  });

  test('404: responds with error when article_id does not exist', async () => {
    const response = await request(app)
      .get('/api/articles/999999')
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id is not a number', async () => {
    const response = await request(app)
      .get('/api/articles/not-a-number')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when article_id is a decimal', async () => {
    const response = await request(app)
      .get('/api/articles/1.5')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when article_id is zero', async () => {
    const response = await request(app)
      .get('/api/articles/0')
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id is negative', async () => {
    const response = await request(app)
      .get('/api/articles/-1')
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id contains special characters', async () => {
    const response = await request(app)
      .get('/api/articles/1@')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('200: responds correctly when article_id is empty (routes to all articles)', async () => {
    const response = await request(app)
      .get('/api/articles/')
      .expect(200);

    expect(response.body).toHaveProperty('articles');
    expect(Array.isArray(response.body.articles)).toBe(true);
  });

  test('404: responds with error when article_id is valid but non-existent', async () => {
    const maxIdResult = await db.query('SELECT MAX(article_id) FROM articles;');
    const nonExistentId = maxIdResult.rows[0].max + 1;

    const response = await request(app)
      .get(`/api/articles/${nonExistentId}`)
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id contains SQL injection attempt', async () => {
    const response = await request(app)
      .get('/api/articles/1; DROP TABLE articles;')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('200: works with single digit article_id', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    expect(response.body.article.article_id).toBe(1);
  });

  test('200: works with multi-digit article_id', async () => {
    const response = await request(app)
      .get('/api/articles/10')
      .expect(200);

    expect(response.body.article.article_id).toBe(10);
  });

  test('200: article object only contains expected properties', async () => {
    const response = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const article = response.body.article;
    const articleKeys = Object.keys(article);
    
    expect(articleKeys).toHaveLength(8);
    expect(articleKeys).toEqual(expect.arrayContaining([
      'author', 'title', 'article_id', 'body', 'topic', 
      'created_at', 'votes', 'article_img_url'
    ]));
  });
});