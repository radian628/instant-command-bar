const process = require("process");

console.log(process.argv);

process.on("message", data => {
    let args = data.split(" ");
    if (args[1] === undefined) args[1] = 100;
    process.send({
        type: "translate-window",
        data: {
            x: 0,
            y: -Number(args[1])
        }
    });

    process.send({
        type: "success",
        data: `Moved up ${args[1]} units.`
    });
});