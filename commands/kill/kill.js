const process = require("process");

process.send({
    type: "kill"
});