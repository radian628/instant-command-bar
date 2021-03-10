const fs = require("fs").promises;
const path = require("path");
const ICBCommand = require("../icb-command");

const noteDir = path.join(__dirname, "./note/notes");

fs.mkdir(noteDir, { recursive: true });

function openNotePage(commandObject) {
    fs.readdir(noteDir).then(files => {
        let notePromises = [];

        files.forEach(file => {
            if (path.extname(file) != ".html") {
                notePromises.push(fs.readFile(path.join(noteDir, file)).then(fileContents => {
                    return {
                        filename: file,
                        fileContents: fileContents
                    };
                }));
            }
        });

        Promise.all(notePromises).then(fileInfo => {
            let noteHTMLs = fileInfo.map( (fileDatum) => { 
                return `
                <div>
                    <h2>${fileDatum.filename}</h2>
                    <p>${fileDatum.fileContents.toString()}</p>
                </div>
            ` } );
    
            let htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <link type="text/css" rel="stylesheet" href="../notestyle.css">
                </head>
                <body>
                    <h1>Notes</h1>
                    <div id="note-container">
                        ${noteHTMLs.join("")}
                    </div>
                    <script src="../notedisplay.js"></script>
                </body>
            </html>
            `;
        
            fs.writeFile(path.join(noteDir, "allNotes.html"), htmlContent).then(() => {
                commandObject.openExternal(path.join(noteDir, "allNotes.html"));
                commandObject.success("Opened notes.");
            });
        });
    });

}

module.exports = class extends ICBCommand {
    run(data) {
        let args = data.split(" ");

        if (args.length < 2) {
            this.failure("Not enough arguments!");
            return;
        } else if (["read", "write"].indexOf(args[1]) == -1) {
            this.failure(`Mode (first argument) was specified as "${args[1]}". Mode must be "read" or "write"!`);
            return;
        }
        
        switch (args[1]) {
            case "write":
                let content = args.slice(2).join(" ");
                
                fs.writeFile(path.join(noteDir, "note" + Date.now()), content).then(() => {
                    this.success("Saved note.");
                }).catch((err) => {
                    this.failure(`Could not save note: ${err}`);
                });
                break;
            case "read":
                openNotePage(this);
                break;
        }
    }
}