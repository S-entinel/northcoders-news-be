const db = require(`../db/connection`);

exports.fetchCommentsById = ( articleId ) => {
    return db.query(
      `SELECT * FROM articles
       WHERE article_id = $1;`,
      [articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      else {
        return db.query(
          `SELECT * FROM comments
           WHERE article_id = $1
           ORDER BY created_at DESC`,
          [articleId]
        );
      }
    })
    .then(({ rows }) => {
      return rows;
    });
  }

  exports.addCommentsbyId = (articleId, body, author) => {
    if (body === undefined || typeof body !== 'string' || body.length == 0) {
        return Promise.reject({ status: 400, msg: "Body entry is invalid" });
    }

    if (author === undefined || typeof author !== 'string' || author.length == 0) {
        return Promise.reject({ status: 400, msg: "Author entry is invalid" });
    }

    return db.query(
      `SELECT * FROM articles WHERE article_id = $1;`,
      [articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return db.query(`SELECT * FROM users WHERE username = $1;`, [author]);
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return db.query(
        `INSERT INTO comments (article_id, body, author)
         VALUES ($1, $2, $3)
         RETURNING *;`,
        [articleId, body, author]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
  };