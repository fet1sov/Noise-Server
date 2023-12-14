window.addEventListener("DOMContentLoaded", () => {
    const optionsButton = document.getElementById("artist-options"); 
    const optionList = document.getElementById("options-list");

    optionsButton.addEventListener("click", () => {
        if (optionList.style.display == "none")
        {
            optionList.style.display = "block";
        } else {
            optionList.style.display = "none";
        }
    })
});