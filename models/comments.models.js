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

