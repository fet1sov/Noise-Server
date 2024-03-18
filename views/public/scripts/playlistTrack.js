function post(path, params, method='post') {
    const form = document.createElement('form');
    form.method = method;
    form.action = path;
  
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = params[key];
  
        form.appendChild(hiddenField);
      }
    }
  
    document.body.appendChild(form);
    form.submit();
}

window.addEventListener("DOMContentLoaded", () => {
    const playlists = document.querySelectorAll(".playlist-list-item");

    if (playlists)
    {
        playlists.forEach((playlistItem) => {
            playlistItem.addEventListener("click", () => {
                const playerInfo = JSON.parse(localStorage.getItem("player_info"));
                post('/playlist/addtrack', { playlistId: playlistItem.dataset.id, songAddId: playerInfo.songId });
            });
        });
    }
});