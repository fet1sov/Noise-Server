window.addEventListener("scroll", () => {

    const mainNavigation = document.getElementById("main-nav");
    const artistInfoBlock = document.getElementById("artist-info");

    if (window.pageYOffset > artistInfoBlock.offsetHeight - 10)
    {
        mainNavigation.classList.add("main-nav-scrolled");
    } else {
        if (mainNavigation.classList.contains("main-nav-scrolled"))
        {
            mainNavigation.classList.remove("main-nav-scrolled");
        }
    }
});