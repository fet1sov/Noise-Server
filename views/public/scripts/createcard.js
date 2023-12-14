function fileUpload(event)
{
    const bannerLabel = document.getElementById("bannerLabel");
    if (event.target.files[0] &&
        (event.target.files[0].type === "image/png"
        || event.target.files[0].type === "image/jpeg"
        || event.target.files[0].type === "image/gif"
        || event.target.files[0].type === "image/jpg")) {
        while (bannerLabel.lastChild) {
            bannerLabel.removeChild(bannerLabel.lastChild);
        }

        let bannerImage = new Image(256, 256);
        bannerImage.src = URL.createObjectURL(event.target.files[0]);

        bannerLabel.appendChild(bannerImage);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const createCardButton = document.getElementById("create-artist");

    createCardButton.addEventListener("click", () => {
        const createMessage = document.getElementById("create-message");
        createMessage.remove();

        const mainForm = document.getElementById("main-form");
        mainForm.style.display = "flex";
    });

    const bannerLabel = document.getElementById("bannerLabel");
    const bannerImg = document.getElementById("bannerImg");

    const bannerDropArea = document.getElementById("bannerDropArea");

    bannerImg.addEventListener('change', this.fileUpload);

    bannerDropArea.addEventListener("dragover", (event) => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });

    bannerDropArea.addEventListener("drag", (event) => {
        event.stopPropagation();
        event.preventDefault();

        const fileList = event.dataTransfer.files;

        let bannerImage = new Image(256, 256);
            bannerImage.src = URL.createObjectURL(fileList[0]);

        bannerLabel.appendChild(bannerImage);
    });
});