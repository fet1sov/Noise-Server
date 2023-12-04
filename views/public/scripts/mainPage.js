window.addEventListener("DOMContentLoaded", () => {
    const lists = document.querySelectorAll(".blocks-list");

    lists.forEach((blockList) => {
        blockList.addEventListener("mousewheel", (event) => {
            blockList.style.scrollBehavior = "smooth";
            blockList.scrollLeft -= event.deltaY;
            event.preventDefault();
        });
    });
});