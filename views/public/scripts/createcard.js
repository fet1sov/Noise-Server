window.addEventListener("DOMContentLoaded", () => {
    const createCardButton = document.getElementById("create-artist");
    const bannerDragArea = document.getElementById("banner-drag");

    createCardButton.addEventListener("click", () => {
        const createMessage = document.getElementById("create-message");
        createMessage.remove();

        const mainForm = document.getElementById("main-form");
        mainForm.style.display = "flex";
    });
});