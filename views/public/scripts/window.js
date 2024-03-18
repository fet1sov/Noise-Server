window.addEventListener("DOMContentLoaded", () => {
    const pageAccessedByReload = (
        (window.performance.navigation && window.performance.navigation.type === 1) ||
        window.performance
            .getEntriesByType('navigation')
            .map((nav) => nav.type)
            .includes('reload')
    );

    if (pageAccessedByReload) {
        window.location.href = "/";
    }

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