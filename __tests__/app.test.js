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

describe('GET /api/articles/:article_id/comments', () => {
  test('200: responds with an array of comments for the given article', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    expect(response.body).toHaveProperty('comments');
    expect(Array.isArray(response.body.comments)).toBe(true);
  });

  test('200: each comment object has all required properties', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    if (comments.length > 0) {
      comments.forEach((comment) => {
        expect(comment).toHaveProperty('comment_id');
        expect(comment).toHaveProperty('votes');
        expect(comment).toHaveProperty('created_at');
        expect(comment).toHaveProperty('author');
        expect(comment).toHaveProperty('body');
        expect(comment).toHaveProperty('article_id');
        
        expect(typeof comment.comment_id).toBe('number');
        expect(typeof comment.votes).toBe('number');
        expect(typeof comment.created_at).toBe('string');
        expect(typeof comment.author).toBe('string');
        expect(typeof comment.body).toBe('string');
        expect(typeof comment.article_id).toBe('number');
      });
    }
  });

  test('200: all comments belong to the specified article_id', async () => {
    const articleId = 1;
    const response = await request(app)
      .get(`/api/articles/${articleId}/comments`)
      .expect(200);

    const comments = response.body.comments;
    
    comments.forEach((comment) => {
      expect(comment.article_id).toBe(articleId);
    });
  });

  test('200: comments are sorted by created_at in descending order (most recent first)', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    if (comments.length > 1) {
      for (let i = 0; i < comments.length - 1; i++) {
        const currentDate = new Date(comments[i].created_at);
        const nextDate = new Date(comments[i + 1].created_at);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    }
  });

  test('200: created_at is in valid ISO format', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    comments.forEach((comment) => {
      const date = new Date(comment.created_at);
      expect(comment.created_at).toBe(date.toISOString());
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  test('200: votes are integers', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    comments.forEach((comment) => {
      expect(Number.isInteger(comment.votes)).toBe(true);
    });
  });

  test('200: authors exist in users table', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    if (comments.length > 0) {
      const usersResult = await db.query('SELECT username FROM users;');
      const validAuthors = usersResult.rows.map(row => row.username);
      
      comments.forEach((comment) => {
        expect(validAuthors).toContain(comment.author);
      });
    }
  });

  test('200: returns correct comments from database', async () => {
    const articleId = 1;
    
    const dbResult = await db.query(
      'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;',
      [articleId]
    );
    const dbComments = dbResult.rows;

    const response = await request(app)
      .get(`/api/articles/${articleId}/comments`)
      .expect(200);

    const comments = response.body.comments;
    
    expect(comments.length).toBe(dbComments.length);
    
    if (comments.length > 0) {
      comments.forEach((comment, index) => {
        expect(comment.comment_id).toBe(dbComments[index].comment_id);
        expect(comment.votes).toBe(dbComments[index].votes);
        expect(comment.author).toBe(dbComments[index].author);
        expect(comment.body).toBe(dbComments[index].body);
        expect(comment.article_id).toBe(dbComments[index].article_id);
        expect(new Date(comment.created_at)).toEqual(dbComments[index].created_at);
      });
    }
  });

  test('200: response structure is correct', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const responseKeys = Object.keys(response.body);
    expect(responseKeys).toHaveLength(1);
    expect(responseKeys[0]).toBe('comments');
  });

  test('200: comment objects only contain expected properties', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    if (comments.length > 0) {
      comments.forEach((comment) => {
        const commentKeys = Object.keys(comment);
        expect(commentKeys).toHaveLength(6);
        expect(commentKeys).toEqual(expect.arrayContaining([
          'comment_id', 'votes', 'created_at', 'author', 'body', 'article_id'
        ]));
      });
    }
  });

  test('200: returns empty array for article with no comments', async () => {
    const articlesResult = await db.query('SELECT article_id FROM articles;');
    const allArticleIds = articlesResult.rows.map(row => row.article_id);
    
    const commentsResult = await db.query('SELECT DISTINCT article_id FROM comments;');
    const articlesWithComments = commentsResult.rows.map(row => row.article_id);
    
    const articleWithoutComments = allArticleIds.find(id => !articlesWithComments.includes(id));
    
    if (articleWithoutComments) {
      const response = await request(app)
        .get(`/api/articles/${articleWithoutComments}/comments`)
        .expect(200);

      expect(response.body.comments).toEqual([]);
    }
  });

  test('200: handles articles with many comments correctly', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const comments = response.body.comments;
    
    const commentIds = comments.map(comment => comment.comment_id);
    const uniqueCommentIds = [...new Set(commentIds)];
    expect(commentIds.length).toBe(uniqueCommentIds.length);
  });

  test('404: responds with error when article_id does not exist', async () => {
    const response = await request(app)
      .get('/api/articles/999999/comments')
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id is not a number', async () => {
    const response = await request(app)
      .get('/api/articles/not-a-number/comments')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when article_id is a decimal', async () => {
    const response = await request(app)
      .get('/api/articles/1.5/comments')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('404: responds with error when article_id is zero', async () => {
    const response = await request(app)
      .get('/api/articles/0/comments')
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('404: responds with error when article_id is negative', async () => {
    const response = await request(app)
      .get('/api/articles/-1/comments')
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id contains special characters', async () => {
    const response = await request(app)
      .get('/api/articles/1@/comments')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('404: responds with error when article_id is valid but non-existent', async () => {
    const maxIdResult = await db.query('SELECT MAX(article_id) FROM articles;');
    const nonExistentId = maxIdResult.rows[0].max + 1;

    const response = await request(app)
      .get(`/api/articles/${nonExistentId}/comments`)
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id contains SQL injection attempt', async () => {
    const response = await request(app)
      .get('/api/articles/1; DROP TABLE comments;/comments')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('200: works with single digit article_id', async () => {
    const response = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    expect(response.body).toHaveProperty('comments');
    expect(Array.isArray(response.body.comments)).toBe(true);
  });

  test('200: works with multi-digit article_id', async () => {
    const response = await request(app)
      .get('/api/articles/10/comments')
      .expect(200);

    expect(response.body).toHaveProperty('comments');
    expect(Array.isArray(response.body.comments)).toBe(true);
  });

  test('200: handles different article_ids consistently', async () => {
    const response1 = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const response2 = await request(app)
      .get('/api/articles/2/comments')
      .expect(200);

    expect(Array.isArray(response1.body.comments)).toBe(true);
    expect(Array.isArray(response2.body.comments)).toBe(true);

    const comments1 = response1.body.comments;
    const comments2 = response2.body.comments;
    
    comments1.forEach(comment => expect(comment.article_id).toBe(1));
    comments2.forEach(comment => expect(comment.article_id).toBe(2));
  });

  test('200: returns consistent results on multiple requests', async () => {
    const response1 = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    const response2 = await request(app)
      .get('/api/articles/1/comments')
      .expect(200);

    expect(response1.body.comments).toEqual(response2.body.comments);
  });
});

describe('POST /api/articles/:article_id/comments', () => {
  test('201: responds with the posted comment', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201);

    expect(response.body).toHaveProperty('comment');
    expect(typeof response.body.comment).toBe('object');
    expect(Array.isArray(response.body.comment)).toBe(false);
  });

  test('201: posted comment has all required properties', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201);

    const comment = response.body.comment;
    
    expect(comment).toHaveProperty('comment_id');
    expect(comment).toHaveProperty('votes');
    expect(comment).toHaveProperty('created_at');
    expect(comment).toHaveProperty('author');
    expect(comment).toHaveProperty('body');
    expect(comment).toHaveProperty('article_id');
    
    expect(typeof comment.comment_id).toBe('number');
    expect(typeof comment.votes).toBe('number');
    expect(typeof comment.created_at).toBe('string');
    expect(typeof comment.author).toBe('string');
    expect(typeof comment.body).toBe('string');
    expect(typeof comment.article_id).toBe('number');
  });

  test('201: posted comment has correct values', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is a test comment'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201);

    const comment = response.body.comment;
    
    expect(comment.author).toBe('butter_bridge');
    expect(comment.body).toBe('This is a test comment');
    expect(comment.article_id).toBe(1);
    expect(comment.votes).toBe(0);
    expect(comment.comment_id).toBeGreaterThan(0);
    
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    expect(createdAt).toBeInstanceOf(Date);
    expect(now - createdAt).toBeLessThan(5000); 
  });

  test('201: comment is actually saved to database', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This comment should be saved'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201);

    const commentId = response.body.comment.comment_id;
    
    const dbResult = await db.query(
      'SELECT * FROM comments WHERE comment_id = $1',
      [commentId]
    );
    
    expect(dbResult.rows).toHaveLength(1);
    expect(dbResult.rows[0].author).toBe('butter_bridge');
    expect(dbResult.rows[0].body).toBe('This comment should be saved');
    expect(dbResult.rows[0].article_id).toBe(1);
  });

  test('201: works with different valid users', async () => {
    const newComment = {
      username: 'rogersop',
      body: 'Another test comment'
    };

    const response = await request(app)
      .post('/api/articles/2/comments')
      .send(newComment)
      .expect(201);

    expect(response.body.comment.author).toBe('rogersop');
    expect(response.body.comment.article_id).toBe(2);
  });

  test('404: responds with error when article_id does not exist', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This article does not exist'
    };

    const response = await request(app)
      .post('/api/articles/999999/comments')
      .send(newComment)
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('404: responds with error when username does not exist', async () => {
    const newComment = {
      username: 'nonexistent_user',
      body: 'This user does not exist'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(404);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when article_id is not a number', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'Test comment'
    };

    const response = await request(app)
      .post('/api/articles/not-a-number/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when username is missing', async () => {
    const newComment = {
      body: 'Test comment without username'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when body is missing', async () => {
    const newComment = {
      username: 'butter_bridge'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when request body is empty', async () => {
    const response = await request(app)
      .post('/api/articles/1/comments')
      .send({})
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when username is not a string', async () => {
    const newComment = {
      username: 123,
      body: 'Test comment'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when body is not a string', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 123
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when username is empty string', async () => {
    const newComment = {
      username: '',
      body: 'Test comment'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when body is empty string', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: ''
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('201: ignores extra properties in request body', async () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'Test comment',
      votes: 100,
      extraProperty: 'This should be ignored'
    };

    const response = await request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201);

    const comment = response.body.comment;
    expect(comment.votes).toBe(0); 
    expect(comment).not.toHaveProperty('extraProperty');
  });
});

describe('PATCH /api/articles/:article_id', () => {
  test('200: responds with the updated article', async () => {
    const voteUpdate = { inc_votes: 5 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    expect(response.body).toHaveProperty('article');
    expect(typeof response.body.article).toBe('object');
    expect(Array.isArray(response.body.article)).toBe(false);
  });

  test('200: updated article has all required properties', async () => {
    const voteUpdate = { inc_votes: 1 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    const article = response.body.article;
    
    expect(article).toHaveProperty('article_id');
    expect(article).toHaveProperty('title');
    expect(article).toHaveProperty('topic');
    expect(article).toHaveProperty('author');
    expect(article).toHaveProperty('body');
    expect(article).toHaveProperty('created_at');
    expect(article).toHaveProperty('votes');
    expect(article).toHaveProperty('article_img_url');
    
    expect(typeof article.article_id).toBe('number');
    expect(typeof article.title).toBe('string');
    expect(typeof article.topic).toBe('string');
    expect(typeof article.author).toBe('string');
    expect(typeof article.body).toBe('string');
    expect(typeof article.created_at).toBe('string');
    expect(typeof article.votes).toBe('number');
    expect(typeof article.article_img_url).toBe('string');
  });

  test('200: increments votes by positive number', async () => {
    const originalResponse = await request(app)
      .get('/api/articles/1')
      .expect(200);
    const originalVotes = originalResponse.body.article.votes;

    const voteUpdate = { inc_votes: 10 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    expect(response.body.article.votes).toBe(originalVotes + 10);
    expect(response.body.article.article_id).toBe(1);
  });

  test('200: decrements votes by negative number', async () => {
    const originalResponse = await request(app)
      .get('/api/articles/1')
      .expect(200);
    const originalVotes = originalResponse.body.article.votes;

    const voteUpdate = { inc_votes: -5 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    expect(response.body.article.votes).toBe(originalVotes - 5);
    expect(response.body.article.article_id).toBe(1);
  });

  test('200: handles zero increment', async () => {
    const originalResponse = await request(app)
      .get('/api/articles/1')
      .expect(200);
    const originalVotes = originalResponse.body.article.votes;

    const voteUpdate = { inc_votes: 0 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    expect(response.body.article.votes).toBe(originalVotes);
  });

  test('200: votes are actually updated in database', async () => {
    const voteUpdate = { inc_votes: 15 };

    await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    const dbResult = await db.query(
      'SELECT votes FROM articles WHERE article_id = 1'
    );
    
    const updatedResponse = await request(app)
      .get('/api/articles/1')
      .expect(200);

    expect(updatedResponse.body.article.votes).toBe(dbResult.rows[0].votes);
  });

  test('200: only votes property is changed, other properties remain the same', async () => {
    const originalResponse = await request(app)
      .get('/api/articles/1')
      .expect(200);
    const originalArticle = originalResponse.body.article;

    const voteUpdate = { inc_votes: 7 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    const updatedArticle = response.body.article;

    expect(updatedArticle.title).toBe(originalArticle.title);
    expect(updatedArticle.topic).toBe(originalArticle.topic);
    expect(updatedArticle.author).toBe(originalArticle.author);
    expect(updatedArticle.body).toBe(originalArticle.body);
    expect(updatedArticle.created_at).toBe(originalArticle.created_at);
    expect(updatedArticle.article_img_url).toBe(originalArticle.article_img_url);
    expect(updatedArticle.votes).toBe(originalArticle.votes + 7);
  });

  test('200: works with different article IDs', async () => {
    const voteUpdate = { inc_votes: 3 };

    const response = await request(app)
      .patch('/api/articles/2')
      .send(voteUpdate)
      .expect(200);

    expect(response.body.article.article_id).toBe(2);
  });

  test('404: responds with error when article_id does not exist', async () => {
    const voteUpdate = { inc_votes: 5 };

    const response = await request(app)
      .patch('/api/articles/999999')
      .send(voteUpdate)
      .expect(404);

    expect(response.body.msg).toBe('Article not found');
  });

  test('400: responds with error when article_id is not a number', async () => {
    const voteUpdate = { inc_votes: 5 };

    const response = await request(app)
      .patch('/api/articles/not-a-number')
      .send(voteUpdate)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when inc_votes is missing', async () => {
    const response = await request(app)
      .patch('/api/articles/1')
      .send({})
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when inc_votes is not a number', async () => {
    const voteUpdate = { inc_votes: 'not-a-number' };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when inc_votes is null', async () => {
    const voteUpdate = { inc_votes: null };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when inc_votes is a decimal', async () => {
    const voteUpdate = { inc_votes: 1.5 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when request body is empty', async () => {
    const response = await request(app)
      .patch('/api/articles/1')
      .send()
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('200: ignores extra properties in request body', async () => {
    const voteUpdate = {
      inc_votes: 8,
      title: 'This should be ignored',
      extraProperty: 'This should also be ignored'
    };

    const originalResponse = await request(app)
      .get('/api/articles/1')
      .expect(200);

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    const updatedArticle = response.body.article;

    expect(updatedArticle.votes).toBe(originalResponse.body.article.votes + 8);
    expect(updatedArticle.title).toBe(originalResponse.body.article.title);
    expect(updatedArticle).not.toHaveProperty('extraProperty');
  });

  test('200: handles large positive increment', async () => {
    const voteUpdate = { inc_votes: 1000 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    expect(response.body.article.votes).toBeGreaterThan(900);
  });

  test('200: handles large negative increment', async () => {
    const voteUpdate = { inc_votes: -1000 };

    const response = await request(app)
      .patch('/api/articles/1')
      .send(voteUpdate)
      .expect(200);

    expect(response.body.article.votes).toBeLessThan(0);
  });
});

describe('DELETE /api/comments/:comment_id', () => {
  test('204: responds with status 204 and no content', async () => {
    const response = await request(app)
      .delete('/api/comments/1')
      .expect(204);

    expect(response.body).toEqual({});
    expect(response.text).toBe('');
  });

  test('204: comment is actually deleted from database', async () => {
    const checkBefore = await db.query(
      'SELECT * FROM comments WHERE comment_id = 1'
    );
    expect(checkBefore.rows).toHaveLength(1);

    await request(app)
      .delete('/api/comments/1')
      .expect(204);

    const checkAfter = await db.query(
      'SELECT * FROM comments WHERE comment_id = 1'
    );
    expect(checkAfter.rows).toHaveLength(0);
  });

  test('204: works with different comment IDs', async () => {
    const commentsResult = await db.query('SELECT comment_id FROM comments LIMIT 3');
    const commentId = commentsResult.rows[1].comment_id;

    await request(app)
      .delete(`/api/comments/${commentId}`)
      .expect(204);

    const checkDeleted = await db.query(
      'SELECT * FROM comments WHERE comment_id = $1',
      [commentId]
    );
    expect(checkDeleted.rows).toHaveLength(0);
  });

  test('204: does not affect other comments', async () => {
    const countBefore = await db.query('SELECT COUNT(*) FROM comments');
    const initialCount = parseInt(countBefore.rows[0].count);

    await request(app)
      .delete('/api/comments/1')
      .expect(204);

    const countAfter = await db.query('SELECT COUNT(*) FROM comments');
    const finalCount = parseInt(countAfter.rows[0].count);
    
    expect(finalCount).toBe(initialCount - 1);
  });

  test('204: does not affect the associated article', async () => {
    const commentResult = await db.query(
      'SELECT article_id FROM comments WHERE comment_id = 1'
    );
    const articleId = commentResult.rows[0].article_id;

    const articleBefore = await db.query(
      'SELECT * FROM articles WHERE article_id = $1',
      [articleId]
    );

    await request(app)
      .delete('/api/comments/1')
      .expect(204);

    const articleAfter = await db.query(
      'SELECT * FROM articles WHERE article_id = $1',
      [articleId]
    );
    
    expect(articleAfter.rows).toHaveLength(1);
    expect(articleAfter.rows[0]).toEqual(articleBefore.rows[0]);
  });

  test('404: responds with error when comment_id does not exist', async () => {
    const response = await request(app)
      .delete('/api/comments/999999')
      .expect(404);

    expect(response.body.msg).toBe('Comment not found');
  });

  test('400: responds with error when comment_id is not a number', async () => {
    const response = await request(app)
      .delete('/api/comments/not-a-number')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when comment_id is a decimal', async () => {
    const response = await request(app)
      .delete('/api/comments/1.5')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('404: responds with error when comment_id is zero', async () => {
    const response = await request(app)
      .delete('/api/comments/0')
      .expect(404);

    expect(response.body.msg).toBe('Comment not found');
  });

  test('404: responds with error when comment_id is negative', async () => {
    const response = await request(app)
      .delete('/api/comments/-1')
      .expect(404);

    expect(response.body.msg).toBe('Comment not found');
  });

  test('400: responds with error when comment_id contains special characters', async () => {
    const response = await request(app)
      .delete('/api/comments/1@')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('404: responds with error when comment_id is valid but non-existent', async () => {
    const maxIdResult = await db.query('SELECT MAX(comment_id) FROM comments;');
    const nonExistentId = maxIdResult.rows[0].max + 1;

    const response = await request(app)
      .delete(`/api/comments/${nonExistentId}`)
      .expect(404);

    expect(response.body.msg).toBe('Comment not found');
  });

  test('400: responds with error when comment_id contains SQL injection attempt', async () => {
    const response = await request(app)
      .delete('/api/comments/1; DROP TABLE comments;')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('204: handles deletion of recently created comment', async () => {
    const newComment = await db.query(
      `INSERT INTO comments (article_id, body, author)
       VALUES (1, 'Test comment for deletion', 'butter_bridge')
       RETURNING comment_id`
    );
    const newCommentId = newComment.rows[0].comment_id;

    await request(app)
      .delete(`/api/comments/${newCommentId}`)
      .expect(204);

    const checkDeleted = await db.query(
      'SELECT * FROM comments WHERE comment_id = $1',
      [newCommentId]
    );
    expect(checkDeleted.rows).toHaveLength(0);
  });

  test('404: multiple attempts to delete same comment return 404', async () => {
    await request(app)
      .delete('/api/comments/1')
      .expect(204);

    const response = await request(app)
      .delete('/api/comments/1')
      .expect(404);

    expect(response.body.msg).toBe('Comment not found');
  });
});

describe('GET /api/articles (sorting queries)', () => {
  // Default behavior (should not break existing functionality)
  test('200: defaults to sorting by created_at descending when no queries provided', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(1);

    // Check default sort (created_at desc)
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  // sort_by tests
  test('200: sorts by title when sort_by=title', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=title')
      .expect(200);

    const articles = response.body.articles;
    const titles = articles.map(article => article.title);
    const sortedTitles = [...titles].sort().reverse(); // Default order is desc
    
    expect(titles).toEqual(sortedTitles);
  });

  test('200: sorts by votes when sort_by=votes', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=votes')
      .expect(200);

    const articles = response.body.articles;
    
    // Check descending order (default)
    for (let i = 0; i < articles.length - 1; i++) {
      expect(articles[i].votes).toBeGreaterThanOrEqual(articles[i + 1].votes);
    }
  });

  test('200: sorts by author when sort_by=author', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=author')
      .expect(200);

    const articles = response.body.articles;
    const authors = articles.map(article => article.author);
    const sortedAuthors = [...authors].sort().reverse(); // Default order is desc
    
    expect(authors).toEqual(sortedAuthors);
  });

  test('200: sorts by comment_count when sort_by=comment_count', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=comment_count')
      .expect(200);

    const articles = response.body.articles;
    
    // Check descending order (default)
    for (let i = 0; i < articles.length - 1; i++) {
      expect(articles[i].comment_count).toBeGreaterThanOrEqual(articles[i + 1].comment_count);
    }
  });

  // order tests
  test('200: sorts in ascending order when order=asc', async () => {
    const response = await request(app)
      .get('/api/articles?order=asc')
      .expect(200);

    const articles = response.body.articles;
    
    // Check ascending order by created_at (default sort_by)
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
    }
  });

  test('200: sorts in descending order when order=desc', async () => {
    const response = await request(app)
      .get('/api/articles?order=desc')
      .expect(200);

    const articles = response.body.articles;
    
    // Check descending order by created_at (default sort_by)
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  // Combined sort_by and order tests
  test('200: sorts by votes in ascending order', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=votes&order=asc')
      .expect(200);

    const articles = response.body.articles;
    
    // Check ascending order by votes
    for (let i = 0; i < articles.length - 1; i++) {
      expect(articles[i].votes).toBeLessThanOrEqual(articles[i + 1].votes);
    }
  });

  test('200: sorts by title in descending order', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=title&order=desc')
      .expect(200);

    const articles = response.body.articles;
    const titles = articles.map(article => article.title);
    const sortedTitles = [...titles].sort().reverse();
    
    expect(titles).toEqual(sortedTitles);
  });

  test('200: maintains all article properties when sorting', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=author&order=asc')
      .expect(200);

    const articles = response.body.articles;
    
    articles.forEach((article) => {
      expect(article).toHaveProperty('article_id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('topic');
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('created_at');
      expect(article).toHaveProperty('votes');
      expect(article).toHaveProperty('article_img_url');
      expect(article).toHaveProperty('comment_count');
      expect(article).not.toHaveProperty('body');
    });
  });

  // Error handling tests
  test('400: responds with error when sort_by column does not exist', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=invalid_column')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when order is not asc or desc', async () => {
    const response = await request(app)
      .get('/api/articles?order=invalid_order')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when sort_by is SQL injection attempt', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=title; DROP TABLE articles;')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: responds with error when order is SQL injection attempt', async () => {
    const response = await request(app)
      .get('/api/articles?order=asc; DELETE FROM articles;')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  test('400: handles multiple invalid parameters', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=invalid_column&order=invalid_order')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  // Edge cases
  test('200: case insensitive order parameter', async () => {
    const response = await request(app)
      .get('/api/articles?order=ASC')
      .expect(200);

    const articles = response.body.articles;
    
    // Should work the same as lowercase
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
    }
  });

  test('200: ignores empty query parameters', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=&order=')
      .expect(200);

    const articles = response.body.articles;
    
    // Should default to created_at desc
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  test('200: ignores extra query parameters', async () => {
    const response = await request(app)
      .get('/api/articles?sort_by=votes&order=asc&extra_param=ignored')
      .expect(200);

    const articles = response.body.articles;
    
    // Should sort by votes asc, ignoring extra parameter
    for (let i = 0; i < articles.length - 1; i++) {
      expect(articles[i].votes).toBeLessThanOrEqual(articles[i + 1].votes);
    }
  });
});

describe('GET /api/articles (topic query)', () => {
  // Default behavior (should not break existing functionality)
  test('200: returns all articles when no topic query provided', async () => {
    const response = await request(app)
      .get('/api/articles')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(1);
    
    // Should include articles from different topics (mitch and cats)
    const topics = [...new Set(articles.map(article => article.topic))];
    expect(topics.length).toBeGreaterThanOrEqual(2);
  });

  // Topic filtering tests
  test('200: filters articles by topic when topic=mitch', async () => {
    const response = await request(app)
      .get('/api/articles?topic=mitch')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(0);
    
    // All articles should have the mitch topic
    articles.forEach(article => {
      expect(article.topic).toBe('mitch');
    });
  });

  test('200: filters articles by topic when topic=cats', async () => {
    const response = await request(app)
      .get('/api/articles?topic=cats')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(0);
    
    // All articles should have the cats topic
    articles.forEach(article => {
      expect(article.topic).toBe('cats');
    });
  });

  test('200: returns empty array for topic=paper (valid topic with no articles)', async () => {
    const response = await request(app)
      .get('/api/articles?topic=paper')
      .expect(200);

    expect(response.body.articles).toEqual([]);
  });

  test('200: maintains all article properties when filtering by topic', async () => {
    const response = await request(app)
      .get('/api/articles?topic=mitch')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(0);
    
    articles.forEach((article) => {
      expect(article).toHaveProperty('article_id');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('topic');
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('created_at');
      expect(article).toHaveProperty('votes');
      expect(article).toHaveProperty('article_img_url');
      expect(article).toHaveProperty('comment_count');
      expect(article).not.toHaveProperty('body');
    });
  });

  test('200: maintains sorting when filtering by topic', async () => {
    const response = await request(app)
      .get('/api/articles?topic=mitch')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(1);
    
    // Should be sorted by created_at desc (default)
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].created_at);
      const nextDate = new Date(articles[i + 1].created_at);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  test('200: works with topic and sorting queries combined', async () => {
    const response = await request(app)
      .get('/api/articles?topic=mitch&sort_by=votes&order=desc')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(0);
    
    // All should have mitch topic
    articles.forEach(article => {
      expect(article.topic).toBe('mitch');
    });

    // Should be sorted by votes descending
    if (articles.length > 1) {
      for (let i = 0; i < articles.length - 1; i++) {
        expect(articles[i].votes).toBeGreaterThanOrEqual(articles[i + 1].votes);
      }
    }
  });

  test('200: works with topic and title sorting', async () => {
    const response = await request(app)
      .get('/api/articles?topic=mitch&sort_by=title&order=asc')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(0);
    
    // All should have mitch topic
    articles.forEach(article => {
      expect(article.topic).toBe('mitch');
    });

    // Should be sorted by title ascending
    if (articles.length > 1) {
      for (let i = 0; i < articles.length - 1; i++) {
        expect(articles[i].title.localeCompare(articles[i + 1].title)).toBeLessThanOrEqual(0);
      }
    }
  });

  // Error handling tests
  test('404: responds with error when topic does not exist', async () => {
    const response = await request(app)
      .get('/api/articles?topic=nonexistent_topic')
      .expect(404);

    expect(response.body.msg).toBe('Topic not found');
  });

  test('400: responds with error when topic is SQL injection attempt', async () => {
    const response = await request(app)
      .get('/api/articles?topic=mitch; DROP TABLE articles;')
      .expect(400);

    expect(response.body.msg).toBeDefined();
    expect(typeof response.body.msg).toBe('string');
  });

  // Edge cases
  test('200: handles empty topic parameter', async () => {
    const response = await request(app)
      .get('/api/articles?topic=')
      .expect(200);

    const articles = response.body.articles;
    
    // Should return all articles when topic is empty
    expect(articles.length).toBeGreaterThan(1);
    const topics = [...new Set(articles.map(article => article.topic))];
    expect(topics.length).toBeGreaterThanOrEqual(2);
  });

  test('200: ignores extra query parameters when filtering by topic', async () => {
    const response = await request(app)
      .get('/api/articles?topic=cats&extra_param=ignored&another=also_ignored')
      .expect(200);

    const articles = response.body.articles;
    expect(articles.length).toBeGreaterThan(0);
    
    articles.forEach(article => {
      expect(article.topic).toBe('cats');
    });
  });

  test('200: returns correct number of articles for mitch topic', async () => {
    // Get count directly from database
    const dbResult = await db.query(
      "SELECT COUNT(*) FROM articles WHERE topic = 'mitch'"
    );
    const expectedCount = parseInt(dbResult.rows[0].count);

    const response = await request(app)
      .get('/api/articles?topic=mitch')
      .expect(200);

    expect(response.body.articles.length).toBe(expectedCount);
    expect(expectedCount).toBeGreaterThan(5); // Based on test data, should have many mitch articles
  });

  test('200: returns correct number of articles for cats topic', async () => {
    // Get count directly from database  
    const dbResult = await db.query(
      "SELECT COUNT(*) FROM articles WHERE topic = 'cats'"
    );
    const expectedCount = parseInt(dbResult.rows[0].count);

    const response = await request(app)
      .get('/api/articles?topic=cats')
      .expect(200);

    expect(response.body.articles.length).toBe(expectedCount);
    expect(expectedCount).toBeGreaterThanOrEqual(1); // Should have at least 1 cats article
  });
});