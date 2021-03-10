const { fstat } = require("fs");
const process = require("process");
const fs = require("fs").promises;
const path = require("path");

console.log(process.argv);

const noteDir = path.join(__dirname, "notes");

function openNotePage() {
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
                process.send({
                    type: "open-external",
                    data: path.join(noteDir, "allNotes.html")
                });
                process.send({
                    type: "success",
                    data: `Opened notes.`,
                    contributeToFrequencyHints: true
                });
            });
        });
    });

}

process.on("message", data => {

    let args = data.split(" ");

    if (args.length < 2) {
        process.send({
            type: "failure",
            data: `Not enough arguments!`
        });
        return;
    } else if (["read", "write"].indexOf(args[1]) == -1) {
        process.send({
            type: "failure",
            data: `Mode (first argument) was specified as "${args[1]}". Mode must be "read" or "write"!`
        });
        return;
    }
    

    switch (args[1]) {
        case "write":
            let content = args.slice(2).join(" ");
            
            fs.writeFile(path.join(noteDir, "note" + Date.now()), content).then(() => {
                process.send({
                    type: "success",
                    data: `Saved note.`
                });
            }).catch((err) => {
                process.send({
                    type: "failure",
                    data: `Could not save note: ${err}`
                });
            });
            break;
        case "read":
            openNotePage();
            break;
    }

});