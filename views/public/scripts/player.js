let audio = {

};

window.addEventListener("DOMContentLoaded", () => {
    let songPlayButton = document.querySelectorAll(".song-play");

    if (songPlayButton)
    {
        songPlayButton.forEach((song) => {
            audio[`${song.dataset.id}`] = new Audio(`../songs/${song.dataset.id}.mp3`);
            song.addEventListener("click", (event) => {
                audio[`${song.dataset.id}`].play();
            });
        });
    }
});