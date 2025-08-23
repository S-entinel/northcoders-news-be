const { fetchCommentsById } = require("../models/comments.models")

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params
  fetchCommentsById(article_id).then((comments) => {
    res.status(200).send({ comments });
  })
  .catch(next);
};