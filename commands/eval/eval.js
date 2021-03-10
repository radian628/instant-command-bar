const process = require("process");

let sqrt = Math.sqrt;
let sin = Math.sin;
let cos = Math.cos;
let tan = Math.tan;
let asin = Math.asin;
let acos = Math.acos;
let atan = Math.atan;
let atan2 = Math.atan2;
let abs = Math.abs;
let floor = Math.floor;
let round = Math.round;
let ceil = Math.ceil;
let hypot = Math.hypot;
const PI = Math.PI;
const TAU = Math.PI * 2;
let getNums = function (start, end, step) {
    if (!step) step = 1;
    if (end === undefined) end = start;
    if (start === undefined) throw new Error("Must provide end of range!");
    let arr = [];
    for (let i = start; end > i; i += step) {
        arr.push(i);
    }
    return arr;
}
let toDegrees = function (radians) {
    return radians * 180 / PI;
}
let toRadians = function (degrees) {
    return degrees * PI / 180;
}

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