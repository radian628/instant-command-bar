const ICBCommand = require("../icb-command");

module.exports = class extends ICBCommand {
    run(data) {
        this.kill();
    }

    hint (args) {
        this.info("\nUsage: kill\nKills the ICB process.");
    }
}
