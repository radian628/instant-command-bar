const ICBCommand = require("../icb-command");

module.exports = class extends ICBCommand {
    run(data) {
        this.kill();
    }
}
