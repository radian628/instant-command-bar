const { EventEmitter } = require("events");

/**
 * Class representing a command for Instant Command Bar, offering a common interface.
 */
module.exports = class ICBCommand extends EventEmitter {
    /**
     * Create a new Instant Command Bar command.
     */
    constructor () {
        super();
    }

    /**
     * Indicates to the user that your command has succeeded.
     * @param {string} message - Use this to show the output of your command, or (if output is elsewhere), a brief summary of what it did. 
     */
    success(message) {
        this.emit("success", {
            message: message
        });
    }

    /**
     * Indicates to the user that your command has failed.
     * @param {string} message - Use this to display the reason why the command failed.
     */
    failure(message) {
        this.emit("failure", {
            message: message
        });
    }

    /**
     * Displays information on the screen, indicating that either the command is in an intermediate stage of execution, or indicating a help messsage that informs the user of correct command usage.
     * @param {string} message - Use this to display your information message.
     */
    info(message) {
        this.emit("hint", {
            message: message
        });
    }

    /**
     * Translate the Instant Command Bar window.
     * @param {number} x - Pixels to translate in the X direction.
     * @param {number} y - Pixels to translate in the Y direction.
     */
    translateWindow(x, y) {
        this.emit("translate-window", {
            x: x,
            y: y
        });
    }

    /**
     * Kills the ICB process.
     */
    kill() {
        this.emit("kill");
    }

    /**
     * Opens an external resource (e.g. a URL or file).
     * @param {string} resource 
     */
    openExternal(resource) {
        this.emit("open-external", {
            resource: resource
        });
    }

    addMacro(macroName, replaceText) {
        this.emit("add-macro", {
            macroName: macroName,
            replaceText: replaceText 
        });
    }

    removeMacro(macroName) {
        this.emit("remove-macro", {
            macroName: macroName
        });
    }

    reloadCommand(commandPath) {
        this.emit("reload-command", {
            commandPath: commandPath
        });
    }

    /**
     * 
     */
    run() {
        this.failure("Command was configured improperly- Must implement run()!");
        throw new Error("Must implement run()!");
    }

    hint() {
        this.info("No hints were configured- consider implementing hint()!");
    }
}