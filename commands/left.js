const ICBCommand = require("../icb-command");

module.exports = class Up extends ICBCommand {
    run(data) {
        let args = data.split(" ");
        if (args[1] === undefined) args[1] = 100;
        this.translateWindow(-Number(args[1]), 0);
        this.success(`Moved left ${args[1]} units.`);
    }

    hint (args) {
        this.info("\nUsage: left [number:pixels]\nMoves ICB window left.");
    }
}