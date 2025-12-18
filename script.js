async function deleteElement(element) {
    element.remove();
}

songsDict = {};
async function fetchData(url) {
    //Fetch XLSX and read
    const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vRUYocC2pzniHcN7HiWyqsVAKGcCxIHAtvfdEGcTwC5nB89Q3x3_pmSWJNn8LyxdoSTVpXQvlcpHRVA/pub?output=xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const spreadsheet = XLSX.read(arrayBuffer, {type: "array"});

    //Take the non empty rows and add to the data array
    spreadsheet.SheetNames.forEach(sheetName => {
        if (sheetName != "SongLibrary") {
            return;
        }
        const sheet = spreadsheet.Sheets[sheetName];
        var rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
        rows = rows.filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""));
        rows = rows.slice(1);
        var dateColumn = rows.map((row) => row[2]); 
        dateColumn = Array.from(new Set(dateColumn)).map((date) => new Date(date)); 
        dateColumn.sort((a, b) => b - a);
        rows.sort((a, b) => {
            const dateA = new Date(a[2]);
            const dateB = new Date(b[2]);
            return dateB - dateA;
        })
        console.log(dateColumn.map(date => "'" + date.toLocaleDateString()));

        const songCardTemplate = document.querySelector("[song-info-template]");
        const pageBody = document.querySelector("[page-body]");

        try {
            rows.forEach(row => {
                const songCard = songCardTemplate.content.cloneNode(true).children[0];
                const songImage = songCard.querySelector("[game-image]")
                const songName = songCard.querySelector("[song-name]")
                const songPack = songCard.querySelector("[song-pack]")
                const songStamp = songCard.querySelector("[song-stamp]")

                songName.textContent = row[1];
                songPack.textContent = row[0];
                if (row[2] == dateColumn[0].toLocaleDateString()) {
                    songStamp.classList.toggle("hidden");
                }

                const loadingImage = new Image();
                songImage.alt = `${row[0]} -_- ${row[1]}`.replaceAll('"', "'");
                loadingImage.src = `media/${row[0]} -_- ${row[1]}.png`;
                loadingImage.alt = `${row[0]} -_- ${row[1]}`.replaceAll('"', "'");

                loadingImage.onload = () => {
                    waitingImage = document.querySelector(`img[alt="${loadingImage.alt.replaceAll('"', "'")}"]`);
                    if (loadingImage.src == null) {
                        console.log(loadingImage.alt);
                    }
                    waitingImage.src = loadingImage.src;

                    //Garbage Collection
                    loadingImage.onload = null;
                }

                pageBody.append(songCard);
                if (songsDict[row[0]] instanceof Object) {
                    //console.log("DICTIONARY exists");
                    songsDict[row[0]][row[1]] = songCard;
                }
                else {
                    songsDict[row[0]] = {};
                    songsDict[row[0]][row[1]] = songCard;
                }
            });
        }
        catch (error) {
            console.error(error);
        }

    });
}

async function spawnArrows(params) {
    try {
        const arrowTemplate = document.querySelector("[arrow-template]");
        const pageBody = document.querySelector("[page-body]");

        const arrow = arrowTemplate.content.cloneNode(true).children[0];
        arrow.style.filter = `hue-rotate(${Math.random() * 90}deg) brightness(${(Math.random() * 450) + 50}%) blur(5px)`;
        const randomizer = Math.random();
        if (randomizer > 0.75) {
            arrow.style.animationName = "downArrow";
            arrow.src = "media/downArrow.png";
            arrow.style.left = `${Math.random() * 90}vw`;
            arrow.style.bottom = "100vh";
        } else if (randomizer > 0.5) {
            arrow.style.animationName = "upArrow";
            arrow.src = "media/upArrow.png";
            arrow.style.left = `${Math.random() * 90}vw`;
            arrow.style.bottom = "90vh";
        } else if (randomizer > 0.25) {
            arrow.style.animationName = "rightArrow";
            arrow.src = "media/rightArrow.png"; 
            arrow.style.bottom = `${Math.random() * 90}vh`;
            arrow.style.left = "0vh";
        } else {
            arrow.style.animationName = "leftArrow";
            arrow.src = "media/leftArrow.png";
            arrow.style.bottom = `${Math.random() * 90}vh`;
            arrow.style.left = "0vh";
        }
        pageBody.append(arrow);
        setTimeout(spawnArrows, 75);
        setTimeout(() => { deleteElement(arrow); }, 4750);
    }
    catch (error) {
        console.error(error);
    }
}

spawnArrows();
fetchData();

const searchInput = document.querySelector("[song-search]");
if (searchInput != null) {
    searchInput.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        Object.entries(songsDict).forEach(([pack, songs]) => {
            Object.entries(songs).forEach(([song, songCard]) => {
                const isVisibleSong = song.toLowerCase().includes(value);
                const isVisiblePack = pack.toLowerCase().includes(value);
                songCard.classList.toggle("hidden", !isVisibleSong && !isVisiblePack);
            })
        })
    })
}