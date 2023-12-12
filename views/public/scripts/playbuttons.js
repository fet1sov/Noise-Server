window.addEventListener("click", () => {
    const songPlayButtons = document.querySelectorAll(".song-play");

    if(songPlayButtons)
    {
        songPlayButtons.forEach(songButton => {
            songButton.addEventListener("click", () => {
                localStorage.clear();

                let playerInfo = {
                    songId: songButton.dataset.id,
                    songName: songButton.dataset.name,
                    songArtist: songButton.dataset.artist,
                    songArtistName: songButton.dataset.arname
                };

                localStorage.setItem("player_info", JSON.stringify(playerInfo));
            });
        });
    }
});