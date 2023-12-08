let audio = {

};

let playerOptions = {
    volume: 0,
}

if (localStorage.getItem("currentlyPlaying_id")) {
    audio[`${localStorage.getItem("currentlyPlaying_id")}`] = new Audio(`../songs/${localStorage.getItem("currentlyPlaying_id")}.mp3`);
    audio[`${localStorage.getItem("currentlyPlaying_id")}`].currentTime = localStorage.getItem("currentlyPlaying_progress");
    audio[`${localStorage.getItem("currentlyPlaying_id")}`].play();
}

function setPlayerInfo(id, name, artist_name, artist_id)
{
    const playerInfoName = document.getElementById("player-info-name");
    const playerArtistName = document.getElementById("player-info-artist");

    const songThumbnail = document.getElementById("song-thumbnail");

    playerInfoName.setAttribute("href", `../song/${id}`);
    playerArtistName.setAttribute("href", `../artist/${artist_id}`);

    songThumbnail.setAttribute("src", `../thumbnails/${id}.png`);
    playerInfoName.textContent = name;
    playerArtistName.textContent = artist_name;

    localStorage.setItem('currentlyPlaying_id', id);
    localStorage.setItem("currentlyPlaying_name", name);
    localStorage.setItem("currentlyPlaying_arName", artist_name);
    localStorage.setItem("currentlyPlaying_arId", artist_id);

    setTrackDuration(localStorage.getItem("currentlyPlaying_maxLength"));
}

function setTrackDuration(length)
{
    document.getElementById("max-length").textContent = new Date(localStorage.getItem("currentlyPlaying_maxLength") * 1000)
    .toISOString()
    .substring(14).slice(0, -5);
}

window.addEventListener("beforeunload", () => {
    if (audio[`${localStorage.getItem("currentlyPlaying_id")}`])
    {
        localStorage.setItem("currentlyPlaying_progress", audio[`${localStorage.getItem("currentlyPlaying_id")}`].currentTime);
    }
});

window.addEventListener("DOMContentLoaded", () => {
    let songPlayButton = document.querySelectorAll(".song-play");


    let playerVolume = document.getElementById("player-volume");
    playerVolume.addEventListener("input", (event) => {
        audio[`${localStorage.getItem("currentlyPlaying_id")}`].volume = playerVolume.value;
    });

    let playerProgress = document.getElementById("player-progress");
    playerProgress.addEventListener("input", (event) => {
        audio[`${localStorage.getItem("currentlyPlaying_id")}`].currentTime = playerProgress.value;
    });

    if (songPlayButton)
    {
        if (localStorage.getItem("currentlyPlaying_id")) 
        {
            setPlayerInfo(localStorage.getItem("currentlyPlaying_id"), localStorage.getItem("currentlyPlaying_name"), localStorage.getItem("currentlyPlaying_arName"), localStorage.getItem("currentlyPlaying_arId"));
            document.getElementById("player-progress").max = localStorage.getItem("currentlyPlaying_maxLength");
            audio[`${localStorage.getItem("currentlyPlaying_id")}`].addEventListener("timeupdate", () => {
                document.getElementById("prog-play").textContent = new Date(audio[`${localStorage.getItem("currentlyPlaying_id")}`].currentTime * 1000)
                .toISOString()
                .substring(14).slice(0, -5);
                
                document.getElementById("player-progress").value = audio[`${localStorage.getItem("currentlyPlaying_id")}`].currentTime;
            });
        }

        songPlayButton.forEach((song) => {
            audio[`${song.dataset.id}`] = new Audio(`../songs/${song.dataset.id}.mp3`);
            song.addEventListener("click", (event) => {
                for (let audioSource in audio)
                {
                    audio[`${audioSource}`].currentTime = 0;
                    audio[`${audioSource}`].removeEventListener("timeupdate", () => {});
                    audio[`${audioSource}`].pause();
                }

                setPlayerInfo(song.dataset.id, song.dataset.name, song.dataset.arname, song.dataset.artist);

                localStorage.setItem("currentlyPlaying_maxLength", audio[`${song.dataset.id}`].duration);

                audio[`${localStorage.getItem("currentlyPlaying_id")}`].play();
                audio[`${localStorage.getItem("currentlyPlaying_id")}`].addEventListener("timeupdate", () => {
                    document.getElementById("prog-play").textContent = new Date(audio[`${localStorage.getItem("currentlyPlaying_id")}`].currentTime * 1000)
                    .toISOString()
                    .substring(14).slice(0, -5);
                });
            });
        });
    }
});