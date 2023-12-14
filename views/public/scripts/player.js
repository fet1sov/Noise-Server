let audioSource = null;

function setPlayerState(visible)
{
    const player = document.getElementById("player");

    if (visible)
    {
        player.style.display = "flex";
    } else {
        player.style.display = "none";
    }
}

function setPageTitle(title)
{
    document.title = title;
}

function playSoundTrack(playerInfo)
{
    const mainWindow = document.getElementById("main-window");
    document.querySelectorAll('audio').forEach(audioElement => audioElement.remove());

    audioSource = new Audio(`../songs/${playerInfo.songId}`);
    document.body.append(audioSource);

    audioSource.addEventListener("canplay", () => {
        const playerInfoName = document.getElementById("player-info-name");
        const playerArtistName = document.getElementById("player-info-artist");

        const songThumbnail = document.getElementById("song-thumbnail");

        setPageTitle(`${playerInfo.songArtistName} — ${playerInfo.songName}`)

        songThumbnail.setAttribute("src", `../thumbnails/${playerInfo.songId}.png`);
        playerInfoName.textContent = playerInfo.songName;
        playerArtistName.textContent = playerInfo.songArtistName;

        let playerVolume = document.getElementById("player-volume");
        audioSource.volume = playerVolume.value;

        playerVolume.addEventListener("input", (event) => {
            audioSource.volume = playerVolume.value;
        });

        let playerProgress = document.getElementById("player-progress");
        playerProgress.addEventListener("input", (event) => {
            audioSource.pause();
            audioSource.currentTime = playerProgress.value;
        });

        const playerPlayButton = document.getElementById("player-play");
        const playerPauseButton = document.getElementById("player-pause");

        playerPlayButton.style.display = "none";
        playerPauseButton.style.display = "block";

        playerPlayButton.addEventListener("click", () => {
            audioSource.play();

            playerPlayButton.style.display = "none";
            playerPauseButton.style.display = "block";
        });

        playerPauseButton.addEventListener("click", () => {
            audioSource.pause();

            playerPlayButton.style.display = "block";
            playerPauseButton.style.display = "none";
        });


        playerInfoName.addEventListener("click", () => {
            mainWindow.setAttribute("src", `../song/${playerInfo.songId}`);
        });       
        
        playerArtistName.addEventListener("click", () => {
            mainWindow.setAttribute("src", `../artist/${playerInfo.songArtist}`);
        });

        document.getElementById("max-length").textContent = new Date(audioSource.duration * 1000)
        .toISOString()
        .substring(14).slice(0, -5);

        audioSource.addEventListener("timeupdate", () => {
            document.getElementById("prog-play").textContent = new Date(audioSource.currentTime * 1000)
            .toISOString()
            .substring(14).slice(0, -5);
            
            document.getElementById("player-progress").value = audioSource.currentTime;
        });

        document.getElementById("player-progress").setAttribute("max", audioSource.duration);

        audioSource.volume = playerVolume.value;
        audioSource.play();

        setPlayerState(true);
    });
}

function disposePlayer() {
    document.querySelectorAll('audio').forEach(audioElement => audioElement.remove());
    setPlayerState(false);
}

window.addEventListener("storage", (event) => {
    playSoundTrack(JSON.parse(localStorage.getItem("player_info")));
});

window.addEventListener("DOMContentLoaded", () => {
    localStorage.clear();
    setPlayerState(false);

    const playerClose = document.getElementById("player-close");
    playerClose.addEventListener("click", () => {
        disposePlayer();
    });
});