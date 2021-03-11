const ICBCommand = require("../icb-command.js");
const fs = require("fs").promises;
const existsSync = require("fs").existsSync;
const path = require("path");

module.exports = class extends ICBCommand {
    run (data) {
        let args = data.split(" ");
        if (args[1] == "add" || args[1] == "remove") {
            if (args[1] == "add") {
                if (args[2] !== undefined) {
                    let newCommand = args.slice(3).join(" ");
                    if (newCommand !== undefined) {
                        let aliasLocation = path.join(__dirname, args[2] + ".json");
                        let aliasData = { commands: [] };
                        if (existsSync(aliasLocation)) aliasData = require(aliasLocation);
                        aliasData.commands.push(newCommand);
                        fs.writeFile(aliasLocation, JSON.stringify(aliasData)).then(() => {
                            this.reloadCommand(aliasLocation);
                            this.success(`Alias created! Typing '${args[2]}' will run '${newCommand}' (along with commands previously added).`);
                        }).catch(err => {
                            this.failure(`Error loading alias file: ${err}`);
                        });
                    } else {
                        this.failure("You must supply replacement text (third argument) for your alias (this may include spaces).");
                    }
                } else {
                    this.failure("No alias name (second argument) given. Alias names must be a string with no spaces.");
                }
            } else {
                if (args[2] !== undefined) {
                    this.success(`Alias '${args[2]}' deleted (if it exists).`);
                } else {
                    this.failure("No alias name (second argument) given.");
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
                this.info("\nUsage: alias add string:aliasName string:command \n Adds a command that will run when you type aliasName into ICB. You may run this multiple times with different options for the 'command' argument if you want to execute multiple commands using a single alias.");
            } else {
                this.info("\nUsage: alias remove string:aliasName \n Removes all commands associated with the alias aliasName.");
            }
        } else {
            // if (args[1] === undefined) {
            //     this.failure("No first argument given. First argument must be 'add' or 'remove'.")
            // } else {
            //     this.failure(`First argument must be 'add' or 'remove'. Value provided was'${args[1]}'`);
            // }
            this.info("\nUsage: alias add|remove ...\nAdd or remove an alias.");
        }
    }
}