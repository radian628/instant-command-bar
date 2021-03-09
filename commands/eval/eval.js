const process = require("process");

process.on("message", data => {
    let content = data.split(" ").slice(1).join(" ");
    

    try {
        let result = eval(content);
        process.send({
            type: "success",
            data: `Result: ${result}`
        });
    } catch (err) {
        process.send({
            type: "failure",
            data: `JS Error: ${err}`
        });
    }

});