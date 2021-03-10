const ICBCommand = require("../icb-command");

module.exports = class Up extends ICBCommand {
    run(data) {
        let args = data.split(" ");
        if (args[1] === undefined) args[1] = 100;
        this.translateWindow(0, -Number(args[1]));
        this.success(`Moved up ${args[1]} units.`);
    }

    hint (args) {
        this.info("\nUsage: up [number:pixels]\nMoves ICB window up.");
    }
}