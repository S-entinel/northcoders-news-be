const db = require("../connection")
const format = require("pg-format");


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
    }); 
};

module.exports = seed;
