function Note(time, content) {
    this.time = time;
    this.content = content;
}

let allNotes = Array.from(document.getElementById("note-container").children).map(child => {
    return new Note(
        Number(child.children[0].innerText.slice(4)),
        child.children[1].innerText
    );
});

function groupByInterval(intervalName) {
    return function (notes) {
        let intervals = [];
        notes.forEach(note => {
            let date = new Date(note.time);
            let interval;

            switch (intervalName) {
                case "year":
                    interval = date.getFullYear();
                    break;
                case "month":
                    interval = date.getMonth();
                    break;
                case "day":
                    interval = date.getDate();
                    break;
            }
            console.log(interval);

            if (!intervals[interval]) intervals[interval] = [];
            intervals[interval].push(note);
        });  
        return intervals;
    }
}


let groupByYear = groupByInterval("year");

let groupByMonth = groupByInterval("month");

let groupByDay = groupByInterval("day");