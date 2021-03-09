const childProcess = require("child_process");
const process = require("process");

childProcess.spawn("explorer");

process.send({
    type: "success",
    data: `Opened explorer.`
});