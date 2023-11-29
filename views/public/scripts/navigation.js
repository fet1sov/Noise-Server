window.addEventListener("DOMContentLoaded", () => {
    const mainUserNav = document.getElementById("main-user");
    const profileMenu = document.getElementById("profile-menu");

    if (mainUserNav)
    {
        mainUserNav.addEventListener("click", () => {
            if (profileMenu.style.display === "none")
            {
                profileMenu.style.display = "flex";
            } else {
                profileMenu.style.display = "none";
            }
        });
    }
});

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