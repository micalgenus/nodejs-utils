const createError = require("http-errors");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const yaml = require("yaml");
const fs = require("fs");
const { token, docker } = yaml.parse(fs.readFileSync("./config.yml", "utf8"));
const exec = require("child_process").exec;

if (!(token && docker)) {
  console.error("Please create 'token' and 'docker' in config.yml");
  process.exit();
}

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* Permission Token */
const checkPermission = async (req, res, next) => {
  if (req.params.token !== token) return res.status(403).end();
  return next();
};

const executeDockerCommend = async (req, res) => {
  if (!(req.body.repository && req.body.push_data)) return res.status(409).end();

  let [organization, repository] = req.body.repository.repo_name.split("/");
  let tag = req.body.push_data.tag;

  if (!(organization && repository && tag)) return res.status(409).end();

  if (!(organization in docker)) return res.status(404).end();

  const repo_config = docker[organization].filter(v => repository in v)[0];
  if (!repo_config) return res.status(404).end();

  const tag_config = repo_config[repository].filter(v => tag in v)[0];
  if (!tag_config) return res.status(404).end();

  const tag_command = tag_config[tag];

  await new Promise((resolve, reject) =>
    exec(tag_command, (error, stdout, stderr) => {
      if (error) return reject();
      if (stderr) return reject();
      resolve();
    })
  )
    .then(() => res.status(200).send("success"))
    .catch(() => res.status(500).end());
};

/* Post Webhook Event */
app.post("/:token", checkPermission, executeDockerCommend);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("error");
});

module.exports = app;
