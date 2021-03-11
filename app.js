const { app, BrowserWindow, globalShortcut, ipcMain, screen, shell } = require("electron");
const fs = require("fs").promises;
const path = require("path");
const childProcess = require("child_process");
const commandRunFrequencies = require("fs").existsSync("./data/frequencies.json") ? require("./data/frequencies.json") : {};
const macros = require("fs").existsSync("./data/macros.json") ? require("./data/macros.json") : {};


const Commands = {
    dir: "./commands",
    commands: {},
    run: function (cmd) {
        if (typeof cmd == "string") {
            cmd = this.applyMacros(cmd);
            let cmdname = cmd.split(" ")[0];
            let command = this.commands[cmdname]
            if (command !== undefined) {
                command.run(cmd);
            } else {
                mainWindow.webContents.send("icb-cmd-failure", cmd, `Command ${cmdname} does not exist!`);
            }
        }
    },
    hint: function (cmd) {
        if (typeof cmd == "string") {
            let cmdname = cmd.split(" ")[0];
            let command = this.commands[cmdname]
            if (command !== undefined) {
                command.hint(cmd);
            }
        }
    },
    load: function (file) {
        fs.stat(file).then((stats) => {
            if (stats.isFile()) {
                let cmdname = path.parse(file).name;
                let ext = path.parse(file).ext;
                if (ext == ".js") {
                    this.commands[cmdname] = new Command(path.resolve(file));
                } else if (ext == ".json") {
                    this.commands[cmdname] = new Multicommand(path.resolve(file));
                }
            }
        }).catch((reason) => {
            console.log(reason);
        });
    },
    applyMacros: function (str) {
        let macroList = Object.keys(macros).map(macroName => {
            return {
                macroString: "$" + macroName,
                replaceText: macros[macroName]
            }
        });
        let modified = false;
        macroList.forEach(macro => {
            str = str.replaceAll(macro.macroString, () => {
                modified = true;
                return macro.replaceText;
            });
        });
        if (modified) {
            return this.applyMacros(str);
        } else {
            return str;
        }
    }
}

let mainWindow;

function applyDefault(value, defaultValue) {
    if (value !== undefined) {
        return value;
    }
    return defaultValue;
}
function addCommandFrequency(cmd) {
    if (commandRunFrequencies[cmd]) {
        commandRunFrequencies[cmd]++
    } else {
        commandRunFrequencies[cmd] = 1;
    }
    fs.writeFile("./data/frequencies.json", JSON.stringify(commandRunFrequencies));
}

function addMacro(macroName, replaceText) {
    macros[macroName] = replaceText;
    fs.writeFile("./data/macros.json", JSON.stringify(macros));
}
function removeMacro(macroName) {
    delete macros[macroName];
    fs.writeFile("./data/macros.json", JSON.stringify(macros));
}




function Command(file) {
    console.log(file);
    this.main = require(file);
}

Command.prototype.run = function (args) {
    let command = new this.main();

    command.on("translate-window", coords => {
        let mainWinPos = mainWindow.getPosition();
        mainWindow.setPosition(mainWinPos[0] + coords.x, mainWinPos[1] + coords.y);
    });

    command.on("success", event => {
        mainWindow.webContents.send("icb-cmd-success", args, event.message);
        if (applyDefault(event.contributeToFrequencyHints, true)) {
            addCommandFrequency(args);
        }
    });
    
    command.on("failure", event => {
        mainWindow.webContents.send("icb-cmd-failure", args, event.message);
    });

    command.on("open-external", event => {
        shell.openExternal(event.resource);
    });

    command.on("kill", event => {
        app.quit();
    });

    command.on("add-macro", event => {
        addMacro(event.macroName, event.replaceText);
    });

    command.on("remove-macro", event => {
        removeMacro(event.macroName);
    });

    command.on("reload-command", event => {
        Commands.load(event.commandPath);
    });

    command.run(args);
}

Command.prototype.hint = function (args) {
    let command = new this.main();

    command.on("hint", event => {
        mainWindow.webContents.send("icb-cmd-hint", args, event.message);
    });

    command.hint(args);
}

function Multicommand(file) {
    this.commands = require(file).commands.map(cmd => {
        let args = cmd.split(" ");
        return {
            cmd: new Command(path.resolve(Commands.dir, args[0] + ".js")),
            args: cmd
        };
    });
}

Multicommand.prototype.run = function () {
    this.commands.forEach(cmd => {
        cmd.cmd.run(cmd.args);
    });
}

Multicommand.prototype.hint = function () {
    mainWindow.webContents.send("icb-cmd-hint", "Info: ", "Hints are currently not supported for multicommands.");
}




ipcMain.on("exec-icb-cmd", (evt, cmd) => {
    Commands.run(cmd);
});

ipcMain.on("hint-icb-cmd", (evt, cmd) => {
    Commands.hint(cmd);
});

ipcMain.on("set-window-height", (evt, height) => {
    let win = BrowserWindow.fromWebContents(evt.sender);
    win.setSize(win.getSize()[0], height);
})

//Commands.load("./commands/explorer");
//Commands.load("./commands/up");

fs.readdir("./commands").then(files => {
    files.forEach(file => {
        Commands.load(path.join("./commands", file));
    });
});

function createBarWindow() {

    let mousePos = screen.getCursorScreenPoint();

    const win = new BrowserWindow({
        x: mousePos.x - 50,
        y: mousePos.y - 36,
        width: 700,
        height: 80,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile("bar.html");

    win.on("blur", evt => {
        win.webContents.send("window-blurred");
    });
    
    win.on("focus", evt => {
        win.webContents.send("window-focused");
    });
    
    mainWindow = win;

}

app.whenReady().then(() => {
    createBarWindow();

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows.length === 0) createBarWindow();
    });

    globalShortcut.register("CommandOrControl+Shift+Q", () => {
        BrowserWindow.getAllWindows().forEach(win => {
            win.focus();
            let mousePos = screen.getCursorScreenPoint();
            win.setPosition(mousePos.x - 50, mousePos.y - 36);
        });
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});