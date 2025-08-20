const db = require("../connection")
const format = require("pg-format");
const { convertTimestampToDate, titleToID } = require("./utils.js")


const seed = ({ topicData, userData, articleData, commentData }) => {
  return db.query(
    `DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS articles;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS topics;
    `)
    .then(() => {
      return db.query(
        `CREATE TABLE topics (
        slug VARCHAR PRIMARY KEY,
        description VARCHAR,
        img_url VARCHAR(1000)
        );`)
    })
    .then(() => {
      return db.query(
        `CREATE TABLE users (
        username VARCHAR(64) PRIMARY KEY,
        name VARCHAR(64),
        avatar_url VARCHAR(1000)
        );`)
    })
    .then(() => {
      return db.query(
        `CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR,
        topic VARCHAR REFERENCES topics(slug) ON DELETE SET NULL,
        author VARCHAR(64) REFERENCES users(username) ON DELETE SET NULL,
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        votes INT DEFAULT 0,
        article_img_url VARCHAR(1000)
        );`)
    })
    .then(() => {
      return db.query(
        `CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        article_id INT REFERENCES articles(article_id) ON DELETE SET NULL,
        body TEXT,
        votes INT DEFAULT 0,
        author VARCHAR(64) REFERENCES users(username) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`)
    })
    .then(() => {
      const cleanedTopicData = topicData.map(
        ({slug, description, img_url}) => {
          return [slug, description, img_url]
        })

      const insertTopicsStr = format(
        `INSERT into topics
        (slug, description, img_url)
        VALUES %L
        RETURNING *;`
      , cleanedTopicData);
      return db.query(insertTopicsStr)
    })
    .then(() => {
      const cleanedUserData = userData.map(
        ({username, name, avatar_url}) => {
          return [username, name, avatar_url]
        })

      const insertUsersStr = format(
        `INSERT into users
        (username, name, avatar_url)
        VALUES %L
        RETURNING *;`
      , cleanedUserData);
      return db.query(insertUsersStr)
    })
    .then(() => {
      const formattedData = articleData.map(convertTimestampToDate)

      const cleanedArticleData = formattedData.map(
        ({title, topic, author, body, created_at, votes, article_img_url}) => {
          
          return [title, topic, author, body, created_at, votes, article_img_url]
        })

      const insertArticleStr = format(
        `INSERT into articles
        (title, topic, author, body, created_at, votes, article_img_url)
        VALUES %L
        RETURNING *;`
      , cleanedArticleData);
      return db.query(insertArticleStr)
    })
    .then((newArticleData) => {
      const formattedData = commentData.map(convertTimestampToDate)

      const titleToArticleID = {}
      newArticleData.rows.forEach((article) => {
        titleToArticleID[article.title] = article.article_id;
      })

      const cleanedCommentData = formattedData.map(
        ({article_title, body, votes, author, created_at}) => {
          return [titleToArticleID[article_title], body, votes, author, created_at]
        })

      const insertCommentStr = format(
        `INSERT into comments
        (article_id, body, votes, author, created_at)
        VALUES %L
        RETURNING *;`
      , cleanedCommentData);
      return db.query(insertCommentStr)

    })
    
    ; 
};

module.exports = seed;
