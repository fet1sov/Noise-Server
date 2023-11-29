window.addEventListener("DOMContentLoaded", () => {
    const songPlayButton = document.getElementById("song-play-button");
    if (songPlayButton)
    {
        songPlayButton.addEventListener("click", (event) => {
            console.log(songPlayButton.dataset.id);
        });
    }
});