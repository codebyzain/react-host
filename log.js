require("colors");
const fs = require("fs");
const path = require("path");
const global = require("./global.json")[require("./global.json").length - 1];

module.exports = () => {
  const buildToken = require("./global.json")[require("./global.json").length - 1]["build/token"];
  console.log("");
  console.log(
    "=========================================================================================="
      .yellow
  );
  console.log("Port            : ".yellow + global.port.toString().green);
  if (buildToken === "") {
    console.log(
      "Build Token     : ".yellow + "Not Set (Make sure to set build token in global.json)".gray
    );
  } else {
    console.log("Build Token     : ".yellow + buildToken.green);
  }
  try {
    if (fs.existsSync(__dirname + "/build")) {
      console.log("Build Directory : ".yellow + __dirname.gray + "/build".gray);
      console.log("Site Status     : ".yellow + "Active".green);
    } else {
      console.log("Build Directory : ".yellow + "Not Found".red);
      console.log("Site Status     : ".yellow + "Inactive".red);
    }
  } catch (err) {
    console.log("Build Directory : ".yellow + "Not Found".red);
    console.log("Site Status     : ".yellow + "Inactive".red);
  }

  console.log(
    "=========================================================================================="
      .yellow
  );
  console.log("");
};
