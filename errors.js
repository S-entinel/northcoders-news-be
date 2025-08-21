exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status && err.msg) {
      res.status(err.status).send({ msg: err.msg });
    } else {
      next(err);
    }
  };
  
  exports.handlePsqlErrors = (err, req, res, next) => {
    if (err.code === "22P02") {
      res.status(400).send({ msg: err.message });
    }
    else if (err.code === "23503") {
      res.status(404).send({ msg: err.detail || err.message });
    }
    else if (err.code === "23505") {
      res.status(409).send({ msg: err.detail || err.message });
    }
    else if (err.code === "23502") {
      res.status(400).send({ msg: err.message });
    }
    else if (err.code === "23514") {
      res.status(400).send({ msg: err.detail || err.message });
    }
    else if (err.code === "42703") {
      res.status(400).send({ msg: err.message });
    }
    else {
      next(err);
    }
  };
  
  exports.handleServerErrors = (err, req, res, next) => {
    console.log(err);
    res.status(500).send({ msg: "Internal server error" });
  };