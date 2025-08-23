const express = require("express");
const app = express();
const endpointsJson = require("./endpoints.json");
const { getTopics } = require("./controllers/topics.controllers")
const { getArticles, getArticleById, patchVotesById } = require("./controllers/articles.controllers")
const { getUsers } = require("./controllers/users.controllers")
const { getCommentsById, postCommentsById } = require("./controllers/comments.controllers")
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");



app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send({ msg: "Welcome to the API! Visit /api for documentation" });
  });
  
app.get("/api", (req, res) => {
res.status(200).send({ endpoints: endpointsJson });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsById);

app.post("/api/articles/:article_id/comments", postCommentsById);

app.patch("/api/articles/:article_id", patchVotesById);





app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)



module.exports = app;