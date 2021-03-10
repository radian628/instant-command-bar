const { app, BrowserWindow, globalShortcut, ipcMain, screen, shell } = require("electron");
const fs = require("fs").promises;
const path = require("path");
const childProcess = require("child_process");
const commandRunFrequencies = require("fs").existsSync("./data/frequencies.json") ? require("./data/frequencies.json") : {};

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



function Command(file) {
    this.main = require(file);
}

Command.prototype.run = function (args) {
    //this.scripts.forEach(script => {
    //    let child = childProcess.fork(path.resolve(this.parentDir, script.filename), {
    //        args: args
    //    }, {
    //        stdio: [ "pipe", "pipe", "pipe", "ipc" ]
    //    });
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

        // command.on("message", msg => {
        //     let data = msg.data;
        //     switch (msg.type) {
        //         case "translate-window":
        //             let mainWinPos = mainWindow.getPosition();
        //             mainWindow.setPosition(mainWinPos[0] + data.x, mainWinPos[1] + data.y);
        //             break;
        //         case "failure":
        //             mainWindow.webContents.send("icb-cmd-failure", args, msg.data);
        //             break;
        //         case "success":
        //             mainWindow.webContents.send("icb-cmd-success", args, msg.data);
        //             if (applyDefault(msg.contributeToFrequencyHints, this.contributeToFrequencyHints)) {
        //                 addCommandFrequency(args);
        //             }
        //             break;
        //         case "open-external":
        //             shell.openExternal(data);
        //             break;
        //         case "kill":
        //             app.quit();
        //             break;
        //     }

        command.run(args);

    //    });
    //});
}

const Commands = {
    commands: {},
    exec: function (cmd) {
        if (typeof cmd == "string") {
            let cmdname = cmd.split(" ")[0];
            let command = this.commands[cmdname]
            if (command !== undefined) {
                command.run(cmd);
            } else {
                mainWindow.webContents.send("icb-cmd-failure", cmd, `Command ${cmdname} does not exist!`);
            }
        }
    },
    load: function (file) {
        fs.stat(file).then((stats) => {
            if (stats.isFile()) {
                let cmdname = path.basename(file, ".js");
                this.commands[cmdname] = new Command(path.resolve(file));
            }
        }).catch((reason) => {
            console.log(reason);
        });
    }
}

ipcMain.on("exec-icb-cmd", (evt, cmd) => {
    Commands.exec(cmd);
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