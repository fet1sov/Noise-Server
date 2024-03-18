let audioSource = null;

let context,
    analyser,
    source,
    fbc_array,
    bar_count,
    bar_pos,
    bar_width,
    bar_height;

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

    audioSource = new Audio(`../../../../songs/${playerInfo.songId}`);
    document.body.append(audioSource);
    audioSource.load();

    if (source != undefined) {
        source.disconnect();
    }

    audioSource.addEventListener("loadeddata", () => {
        const playerInfoName = document.getElementById("player-info-name");
        const playerArtistName = document.getElementById("player-info-artist");

        const songThumbnail = document.getElementById("song-thumbnail");

        setPageTitle(`${playerInfo.songArtistName} — ${playerInfo.songName}`)

        songThumbnail.setAttribute("src", `../../../../thumbnails/${playerInfo.songId}`);
        playerInfoName.textContent = playerInfo.songName;
        playerArtistName.textContent = playerInfo.songArtistName;

        let playerVolume = document.getElementById("player-volume");

        let playerProgress = document.getElementById("player-progress");
        playerProgress.addEventListener("input", (event) => {
            audioSource.pause();
            audioSource.currentTime = playerProgress.value;
            audioSource.play();

            playerPlayButton.style.display = "none";
            playerPauseButton.style.display = "block";
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
            mainWindow.setAttribute("src", `../../../../../song/${playerInfo.songId}`);
        });       
        
        playerArtistName.addEventListener("click", () => {
            mainWindow.setAttribute("src", `../../../../artist/${playerInfo.songArtist}`);
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

        equalizeSong(audioSource);

        setPlayerState(true);
    });
}

function initPlayer()
{
    audioSource = document.getElementById("audioSource");

    let playerVolume = document.getElementById("player-volume");
    audioSource.volume = playerVolume.value;

    playerVolume.addEventListener("input", (event) => {
        audioSource.volume = playerVolume.value;
    });
}

let MEDIA_ELEMENT_NODES = new WeakMap();

function equalizeSong(audioSource)
{
    document.querySelectorAll('canvas').forEach(canvasElement => canvasElement.remove());
    const playerEqualizer = document.getElementById("player-equalizer");

    if (context == undefined)
    {
        context = new AudioContext();
    }
    analyser = context.createAnalyser();
    let canvas = document.createElement("canvas");
    canvas.style.borderRadius = "10px";
    canvas.width = 48;
    canvas.height = 48;

    playerEqualizer.append(canvas);

    let ctx = canvas.getContext("2d");
    source = source || context.createMediaElementSource(audioSource);

    canvas.width = 48;
    canvas.height = 48;

    source.connect(analyser);
    analyser.connect(context.destination);

    function renderEqualizer() {
        window.RequestAnimationFrame =
            window.requestAnimationFrame(renderEqualizer) ||
            window.msRequestAnimationFrame(renderEqualizer) ||
            window.mozRequestAnimationFrame(renderEqualizer) ||
            window.webkitRequestAnimationFrame(renderEqualizer);
    
        fbc_array = new Uint8Array(analyser.frequencyBinCount);
        bar_count = 30;
    
        analyser.getByteFrequencyData(fbc_array);
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
    
        for (var i = 0; i < bar_count; i++) {
            bar_pos = i * 2;
            bar_width = 2;
            bar_height = -(fbc_array[i] / 12);
    
            ctx.fillRect(bar_pos, canvas.height, bar_width, bar_height);
        }
    }

    renderEqualizer();
}

function disposePlayer() {
    document.querySelectorAll('audio').forEach(audioElement => audioElement.remove());
    setPlayerState(false);
}

function openInWindow(URL) {
    const mainWindow = document.getElementById("main-window");
    mainWindow.setAttribute("src", URL);
}

window.addEventListener("storage", (event) => {
    playSoundTrack(JSON.parse(localStorage.getItem("player_info")));
});

window.addEventListener("DOMContentLoaded", () => {
    localStorage.clear();
    initPlayer();
    setPlayerState(false);

    const playerClose = document.getElementById("player-close");
    playerClose.addEventListener("click", () => {
        disposePlayer();
    });

    const playerPlaylistAdd = document.getElementById("playlist-add");
    playerPlaylistAdd.addEventListener("click", () => {
        openInWindow("../../../../../playlist/addtrack");
    });
});