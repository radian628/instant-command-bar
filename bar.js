const { ipcRenderer } = require("electron");

let instantCommandBar = document.getElementById("instant-command-bar");
let instantCommandFeedback = document.getElementById("instant-command-feedback");
let container = document.getElementById("gui-container");

let cmdStack = [];
let cmdPointer = 0;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setWindowHeight() {
    ipcRenderer.send("set-window-height", container.scrollHeight);
}

ipcRenderer.on("window-blurred", (evt) => {
    instantCommandBar.style.background = "black";
    instantCommandBar.style.borderColor = "#BBBBBB";
});

ipcRenderer.on("window-focused", (evt) => {
    instantCommandBar.style.background = "#333344";
    instantCommandBar.style.borderColor = "#DDDDFF";
});


ipcRenderer.on("icb-cmd-failure", (evt, cmd, reason) => {
    instantCommandBar.style.borderColor = "#FF0000";
    instantCommandFeedback.className = "out-failure";
    instantCommandFeedback.innerHTML = `<span class="out-cmdname-failure">"${cmd}"</span> Failed: <span class="out-context-failure">${reason}</span>`;
    setTimeout(() => {
        //instantCommandBar.style.transition = "";
        instantCommandBar.style.borderColor = "#DDDDFF";
    }, 150);
    setWindowHeight();
});

ipcRenderer.on("icb-cmd-success", (evt, cmd, result) => {
    instantCommandBar.style.borderColor = "#00FF00";
    instantCommandFeedback.className = "out-success";
    instantCommandFeedback.innerHTML = `<span class="out-cmdname-success">"${cmd}"</span> Succeeded: <span class="out-context-success">${result}</span>`;
    setTimeout(() => {
        //instantCommandBar.style.transition = "";
        instantCommandBar.style.borderColor = "#DDDDFF";
    }, 150);
    setWindowHeight();
});

document.addEventListener("keydown", (evt) => {
    if (evt.key == "Enter") {
        ipcRenderer.send("exec-icb-cmd", instantCommandBar.value);
        cmdStack.push(instantCommandBar.value);

        
        instantCommandFeedback.className = "out-info";
        instantCommandFeedback.innerHTML = `<span class="out-cmdname-info">"${instantCommandBar.value}"</span> Info: <span class="out-context-info">Waiting for command...</span>`;

        cmdPointer = cmdStack.length;
        instantCommandBar.value = "";
    } else if (evt.key == "ArrowUp") {
        cmdPointer = clamp(cmdPointer - 1, 0, cmdStack.length - 1);
        instantCommandBar.value = cmdStack[cmdPointer];
    } else if (evt.key == "ArrowDown") {
        cmdPointer = clamp(cmdPointer + 1, 0, cmdStack.length);
        if (cmdPointer == cmdStack.length) {
            instantCommandBar.value = "";
        } else {
            instantCommandBar.value = cmdStack[cmdPointer];
        }
    }
});