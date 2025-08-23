const { fetchCommentsById, addCommentsbyId, removeCommentsbyId } = require("../models/comments.models")

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params
  fetchCommentsById(article_id).then((comments) => {
    res.status(200).send({ comments });
  })
  .catch(next);
};

exports.postCommentsById = (req, res, next) => {
    const { article_id } = req.params
    const { username, body } = req.body
    addCommentsbyId(article_id, body, username).then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteCommentsById = (req, res, next) => {
    const { comment_id } = req.params;
    removeCommentsbyId(comment_id).then(() => {
        res.status(204).send()
      }
    ).catch(next);
};