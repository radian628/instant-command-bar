const { app, BrowserWindow, globalShortcut, ipcMain, screen, shell } = require("electron");
const fs = require("fs").promises;
const path = require("path");
const childProcess = require("child_process");

let mainWindow;

function Command(parentDir, cmdObject) {
    let scripts = cmdObject.scripts;

    console.log(cmdObject);

    this.parentDir = parentDir;

    this.scripts = scripts;

    this.autocomplete = cmdObject.autocomplete;
    this.suggestions = cmdObject.suggestions;
}

Command.prototype.run = function (args) {
    console.log(this.scripts);
    this.scripts.forEach(script => {
        let child = childProcess.fork(path.resolve(this.parentDir, script.filename), {
            args: args
        }, {
            stdio: [ "pipe", "pipe", "pipe", "ipc" ]
        });

        child.send(args);

        child.on("message", msg => {
            let data = msg.data;
            switch (msg.type) {
                case "translate-window":
                    let mainWinPos = mainWindow.getPosition();
                    mainWindow.setPosition(mainWinPos[0] + data.x, mainWinPos[1] + data.y);
                    break;
                case "failure":
                    mainWindow.webContents.send("icb-cmd-failure", args, msg.data);
                    break;
                case "success":
                    mainWindow.webContents.send("icb-cmd-success", args, msg.data);
                    break;
                case "open-external":
                    shell.openExternal(data);
                    break;
            }
        });
    });
}

const Commands = {
    commands: {},
    exec: function (cmd) {
        if (typeof cmd == "string") {
            let cmdname = cmd.split(" ")[0];
            let command = this.commands[cmdname]
            if (command !== undefined) {
                command.run(cmd);
                //mainWindow.webContents.send("icb-cmd-success", cmd, `Command ${cmdname} ran successfully!`);
            } else {
                mainWindow.webContents.send("icb-cmd-failure", cmd, `Command ${cmdname} does not exist!`);
            }
        }
    },
    load: function (directory) {
        fs.stat(directory).then((stats) => {
            if (stats.isDirectory()) {
                let splitDir = path.normalize(directory).split(path.sep);
                let cmdname = splitDir[splitDir.length - 1];
                this.commands[cmdname] = new Command(directory, require(path.resolve(directory, "./icb.json")));
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