const ICBCommand = require("../icb-command.js");

module.exports = class extends ICBCommand {
    run (data) {
        let args = data.split(" ");
        if (args[1] == "add" || args[1] == "remove") {
            if (args[1] == "add") {
                if (args[2] !== undefined) {
                    let replaceText = args.slice(3).join(" ");
                    if (replaceText !== undefined) {
                        this.addMacro(args[2], replaceText);
                        this.success(`Macro created! Typing '$${args[2]}' will now produce '${replaceText}' instead (both without quotes).`);
                    } else {
                        this.failure("You must supply replacement text (third argument) for your macro (this may include spaces).");
                    }
                } else {
                    this.failure("No macro name (second argument) given. Macro names must be a string with no spaces.");
                }
            } else {
                if (args[2] !== undefined) {
                    this.removeMacro(args[2]);
                    this.success(`Macro '${args[2]}' deleted (if it exists).`);
                } else {
                    this.failure("No macro name (second argument) given.");
                }
            }
        } else {
            if (args[1] === undefined) {
                this.failure("No first argument given. First argument must be 'add' or 'remove'.")
            } else {
                this.failure(`First argument must be 'add' or 'remove'. Value provided was'${args[1]}'`);
            }
        }
    }

    hint (data) {
        let args = data.split(" ");
        if (args[1] == "add" || args[1] == "remove") {
            if (args[1] == "add") {
                this.info("\nUsage: macro add string:macroName string:replaceText \n Adds a macro such that all instances of $macroName become replaceText.");
            } else {
                this.info("\nUsage: macro remove string:macroName \n Removes the macro with name macroName (do not include the $ character).");
            }
        } else {
            // if (args[1] === undefined) {
            //     this.failure("No first argument given. First argument must be 'add' or 'remove'.")
            // } else {
            //     this.failure(`First argument must be 'add' or 'remove'. Value provided was'${args[1]}'`);
            // }
            this.info("\nUsage: macro add|remove ...\nAdd or remove a macro.");
        }
    }
}