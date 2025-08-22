const { fetchArticles, fetchArticleById } = require("../models/articles.models")

exports.getArticles = (req, res, next) => {
    fetchArticles().then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params
  fetchArticleById(article_id).then((article) => {
    res.status(200).send({ article });
  })
  .catch(next);
};