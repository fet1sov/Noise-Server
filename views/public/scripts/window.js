window.addEventListener("DOMContentLoaded", () => {
    const mainWindow = document.getElementById("main-window");

    if (mainWindow)
    {
        mainWindow.onload = function() {
            if (mainWindow.contentWindow.location.pathname != "/index")
            {
                window.history.pushState("newState", document.title, mainWindow.contentWindow.location.pathname);
            } else {
                window.history.pushState("newState", document.title, "/");
            }
        }
    }
});