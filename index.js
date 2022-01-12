"use strict";
const global = require("./global")[require("./global.json").length - 1];
const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const unzipper = require("unzipper");
const recursive = require("recursive-readdir");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
var newBuildFileSignature;
const buildToken = require("./global.json")[require("./global.json").length - 1]["build/token"];

require("./log.js")();

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, __dirname + "/resources/"); // set upload directory on local system.
  },
  filename: function (req, file, callback) {
    newBuildFileSignature = uuidv4();
    callback(null, "build" + "-" + newBuildFileSignature + ".zip"); // appending current date to the file name.
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/zip") {
      req.fileTypeValidationError = true;
      return cb(
        null,
        false,
        new Error(
          "Only .zip or .rar files are allowed, and make sure its the zipped version of your build"
        )
      );
    }
    req.fileTypeValidationError = false;
    cb(null, true);
  },
}).single("file");

app.use(express.static(path.join(__dirname, "build")));

// Set heade for the website
app.use(async (req, res, next) => {
  await global.headers.map((item) => {
    res.set(item.name, item.value);
  });
  next();
});

if (global.ota === true) {
  // Push new build to server
  app.post("/--build/push", function (req, res) {
    if (req.headers["x-build-token"] !== undefined && req.headers["x-build-token"] == buildToken) {
      require("./log.js")();
      console.log("-- build in progress...".yellow);
      upload(req, res, function (err) {
        if (err) {
          if (err instanceof multer.MulterError) {
            res.json({
              status: false,
              status_code: 409,
              status_message: "Failed updating build",
              status_description: err,
            });
          } else {
            res.json({
              status: false,
              status_code: 409,
              status_message: "Failed updating build",
              status_description: err,
            });
          }
        } else {
          if (req.fileTypeValidationError == true) {
            require("./log.js")();
            console.log("-- Failed Building Update, Invalid file type".red);
            res.json({
              status: false,
              status_code: 409,
              status_message: "Failed updating build",
              status_description:
                "Only .zip or .rar files are allowed, and make sure its the zipped version of your build",
            });
          } else {
            // Everything went fine.
            fs.createReadStream("resources/" + "build" + "-" + newBuildFileSignature + ".zip")
              .pipe(unzipper.Extract({ path: "" }))
              .on("entry", (entry) => entry.autodrain())
              .promise()
              .then((files) => {
                console.log(
                  "-- Build Updated :",
                  "resources/build-".green + newBuildFileSignature.green + ".zip".green
                );
                require("./log.js")();
                recursive("build", function (err, files) {
                  if (!err) {
                    res.json({
                      status: true,
                      status_code: 200,
                      status_message: "New build successfully updated",
                      status_description: "None",
                      data: {
                        file_signature: newBuildFileSignature,
                        file_count: files.length,
                        file_changes: files,
                      },
                    });
                  } else {
                    res.json({
                      status: false,
                      status_code: 409,
                      status_message: "Failed updating build",
                      status_description: JSON.stringify(err),
                    });
                  }
                });
              })
              .catch((e) => {
                console.icon("-- Failed Building Update".red);
                require("./log.js")();
                res.json({
                  status: false,
                  status_code: 409,
                  status_message: "Failed updating build",
                  status_description: JSON.stringify(e),
                });
              });
          }
        }
      });
    } else {
      res.json({
        status: false,
        status_code: 401,
        status_message: "Unauthorized access",
        status_description: "Build token is required, make sure to set build token header",
      });
    }
  });

  // View build history
  app.post("/--build/history", function (req, res) {
    if (req.headers["x-build-token"] !== undefined && req.headers["x-build-token"] == buildToken) {
      recursive("resources", [".DS_Store"], function (err, builds) {
        if (!err) {
          res.json({
            status: true,
            status_code: 200,
            status_message: "Build history displayed",
            status_description: "None",
            data: {
              builds_count: builds.length,
              builds: builds,
            },
          });
        } else {
          res.json({
            status: false,
            status_code: 404,
            status_message: "Failed displaying builds",
            status_description: "None",
          });
        }
      });
    } else {
      res.json({
        status: false,
        status_code: 401,
        status_message: "Unauthorized access",
        status_description: "Build token is required, make sure to set build token header",
      });
    }
  });
}

app.get("/*", function (req, res) {
  try {
    if (fs.existsSync(__dirname + "/build")) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      res.send(`
        <center style="margin-top : 25%">
            <h3>Sorry for that..</h3>
            <h1 style="margin : 0"}>looks like this site is under maintenance</h1>
        </center>
    `);
    }
  } catch (err) {
    res.send(`
        <center style="margin-top : 25%">
            <h3>Sorry for that..</h3>
            <h1 style="margin : 0"}>looks like this site is under maintenance</h1>
        </center>
    `);
  }
});

app.listen(global.port);
