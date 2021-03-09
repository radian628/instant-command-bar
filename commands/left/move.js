const process = require("process");

console.log(process.argv);

process.on("message", data => {
    let args = data.split(" ");
    if (args[1] === undefined) args[1] = 100;
    process.send({
        type: "translate-window",
        data: {
            x: -Number(args[1]),
            y: 0
        }
    });

    process.send({
        type: "success",
        data: `Moved left ${args[1]} units.`
    });
});