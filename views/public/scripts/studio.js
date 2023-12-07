let selectedSongs = [];

window.addEventListener("DOMContentLoaded", (event) => {
    const allSelectors = document.querySelectorAll(".song-selector");

    if (allSelectors)
    {
        allSelectors.forEach((selector) => {
            selector.addEventListener("change", function() {
                if (this.checked)
                {
                    selectedSongs.push(selector.dataset.id);

                    if (selectedSongs.length < 2)
                    {
                        document.getElementById("add-button").style.display = "none";
                        let editButton = document.getElementById("edit-button");
                        document.getElementById("edit-button").style.display = "flex";
                        editButton.setAttribute("href", `../studio/content/edit/${selector.dataset.id}`)
                        document.getElementById("delete-button").style.display = "flex";
                    } else {
                        document.getElementById("add-button").style.display = "none";
                        document.getElementById("edit-button").style.display = "none";
                        document.getElementById("delete-button").style.display = "flex";
                    }
                } else {
                    selectedSongs = selectedSongs.filter(song => {
                        return song != selector.dataset.id;
                    });

                    if (selectedSongs.length < 2 && selectedSongs.length > 0)
                    {
                        document.getElementById("add-button").style.display = "none";
                        document.getElementById("edit-button").style.display = "flex";
                        document.getElementById("delete-button").style.display = "flex";
                    }

                    if (selectedSongs.length === 0) {
                        document.getElementById("add-button").style.display = "flex";
                        document.getElementById("edit-button").style.display = "none";
                        document.getElementById("delete-button").style.display = "none";
                    }
                }
            });
        });

        
    }
});