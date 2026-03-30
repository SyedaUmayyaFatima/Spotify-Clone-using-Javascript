console.log("Lets write JavaScript")
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}




async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
           let url = new URL(element.href);
songs.push(decodeURIComponent(url.pathname.split("/").pop()));
        }


    }


    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Umayya</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/img/play.svg" alt="">
                            </div> </li>`;

    }





    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });


    }) 



}


const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track;
    if (!pause) {

        currentSong.play();
        play.src = "img/img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


// Display all albums dynamically from songs_ folder
// Display all albums dynamically from songs_ folder
async function displayAlbums() {
    try {
        // fetch the songs_ folder listing
        let res = await fetch("songs_/");
        if (!res.ok) {
            console.error("Cannot load songs_ folder");
            return;
        }

        let html = await res.text();
        let div = document.createElement("div");
        div.innerHTML = html;

        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        // Optional: keep old static cards or clear them
        // cardContainer.innerHTML = ""; // uncomment to clear all old cards

        // Loop over folders
        for (let e of anchors) {
            let url = new URL(e.href);
            let parts = url.pathname.split("/").filter(p => p);

            // Only consider folders directly inside songs_
            if (parts.length < 2) continue;

            let folder = parts[1];

            try {
                // fetch folder metadata
                let meta = await fetch(`songs_/${folder}/info.json`);
                if (!meta.ok) {
                    console.warn(`info.json missing for ${folder}, skipping`);
                    continue;
                } 

                let data = await meta.json();

                // Add album card dynamically
                cardContainer.innerHTML += `
                    <div class="card" data-folder="${folder}">
                        <div class="play">
                            <img src="img/img/play.svg" alt="play">
                        </div>
                        <img src="songs_/${folder}/cover.jpg" alt="${data.title}">
                        <h2>${data.title}</h2> 
                        <p>${data.description}</p>
                    </div>
                `;

            } catch (err) {
                console.log("Skipping folder:", folder, err);
            }
        }

        // Add click event to dynamically created cards
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                await getsongs(`songs_/${card.dataset.folder}`);
            });
       
        });
        
    } catch (error) {
        console.error("displayAlbums error:", error);

    }
}



async function main() {

    await getsongs("songs_/ncs");

    playMusic(songs[0], true);
    // show all songs in the play list

  await  displayAlbums();

    // for bottom plat pausee
    play.addEventListener("click", () => { 
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/img/play.svg";
        }

    })


    // listen time song update
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    // seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // for bar open and close hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // volume adjust
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100;
    })

       // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })






}



main();