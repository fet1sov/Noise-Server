window.addEventListener("DOMContentLoaded", () => {
    const modalNo = document.getElementById("modal-no");

    const modalDelete = document.getElementById("delete-button");

    const windowInnerWidth = document.documentElement.clientWidth;
    const scrollbarWidth = parseInt(window.innerWidth) - parseInt(windowInnerWidth);

    const bodyElementHTML = document.getElementsByTagName("body")[0];
    const modalBackground = document.getElementById("modal-background");
    const modalClose = document.getElementById("modal-close");

    const modalActive = document.getElementById("modal-active");

    const modalYes = document.getElementById("modal-yes");

    bodyElementHTML.style.marginRight = "-" + scrollbarWidth + "px";

    modalYes.addEventListener("click", function () {
        if (selectedSongs.length > 0) {
            post('/playlist/delete', { playlists: selectedSongs });
        }
    });

    modalDelete.addEventListener("click", function () {
        modalBackground.style.display = "block";

        if (windowInnerWidth >= 1366) {
            bodyElementHTML.style.marginRight = "-" + scrollbarWidth + "px";
        }

        modalActive.style.left = "calc(50% - " + (175 - scrollbarWidth / 2) + "px)";
    });

    modalNo.addEventListener("click", function() {
        modalBackground.style.display = "none";
        if (windowInnerWidth >= 1366) {
            bodyElementHTML.style.marginRight = "-" + scrollbarWidth + "px";
        }
    });

    // нажатие на крестик закрытия модального окна
    modalClose.addEventListener("click", function () {
        modalBackground.style.display = "none";
        if (windowInnerWidth >= 1366) {
            bodyElementHTML.style.marginRight = "-" + scrollbarWidth + "px";
        }
    });

    // закрытие модального окна на зону вне окна, т.е. на фон
    modalBackground.addEventListener("click", function (event) {
        if (event.target === modalBackground) {
            modalBackground.style.display = "none";
            if (windowInnerWidth >= 1366) {
                bodyElementHTML.style.marginRight = "-" + scrollbarWidth + "px";
            }
        }
    });
});