const db = require(`../db/connection`);

exports.fetchArticles = (sortBy, order) => {

    const validColumns = ['article_id', 'title', 'topic', 'author', 'created_at', 'votes', 'comment_count'];
    if (!validColumns.includes(sortBy)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort column' });
    }

    const validOrders = ['asc', 'desc'];
    if (!validOrders.includes(order.toLowerCase())) {
        return Promise.reject({ status: 400, msg: 'Invalid order query' });
    }

    return db.query(
        `SELECT 
        articles.article_id, articles.title, articles.topic, articles.author, 
        articles.created_at, articles.votes, articles.article_img_url,
        COUNT(comments.article_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY ${sortBy} ${order.toUpperCase()};`
    ).then(({ rows }) => {
        return rows;
    });
};

exports.fetchArticleById = ( articleId ) => {
    return db.query(
        `SELECT * FROM articles
         WHERE article_id = $1;`,
         [articleId]
    ).then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Article not found" });
        }
        else {
            return rows[0]
        }
    })
}

exports.changeVotesById = (articleId, votes) => {
    if (votes === undefined || typeof votes !== 'number' || !Number.isInteger(votes)) {
        return Promise.reject({ status: 400, msg: "Votes entry is invalid" });
    }

    return db.query(
      `SELECT * FROM articles WHERE article_id = $1;`,
      [articleId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return db.query(
        `UPDATE articles
         SET votes = votes + $1
         WHERE article_id = $2
         RETURNING *;`
        , [votes, articleId]);
    })
    .then(({ rows }) => {
      return rows[0];
    });
  };