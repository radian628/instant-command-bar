const ICBCommand = require("../icb-command");

module.exports = class extends ICBCommand {
    run(data) {
        let args = data.split(" ");
        let query = args.slice(1).join(" ");
        if (!query) {
            this.failure("Cannot open nothing!");
            return;
        } else {
            this.openExternal(query);
        }
    }

    hint(data) {
        this.info("\nUsage: open string:query\nOpens a file path or URL.");
    }
}