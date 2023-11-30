window.addEventListener("DOMContentLoaded", () => {
    const createCardButton = document.getElementById("create-artist");

    createCardButton.addEventListener("click", () => {
        const createMessage = document.getElementById("create-message");
        createMessage.remove();

        const mainForm = document.getElementById("main-form");
        mainForm.style.display = "flex";
    });
});