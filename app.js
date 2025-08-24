const express = require("express");
const app = express();
const endpointsJson = require("./endpoints.json");
const { getTopics } = require("./controllers/topics.controllers")
const { getArticles, getArticleById, patchArticleVotesById } = require("./controllers/articles.controllers")
const { getUsers } = require("./controllers/users.controllers")
const { getCommentsById, postCommentsById, deleteCommentsById } = require("./controllers/comments.controllers")
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");



app.use(express.json());

app.use('/api', express.static('public'));


app.get("/", (req, res) => {
    res.status(200).send({ msg: "Welcome to the API! Visit /api for documentation" });
  });
  
app.get("/api/endpoints", (req, res) => {
    res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsById);

app.post("/api/articles/:article_id/comments", postCommentsById);

app.patch("/api/articles/:article_id", patchArticleVotesById);

app.delete("/api/comments/:comment_id", deleteCommentsById);




app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)



module.exports = app;