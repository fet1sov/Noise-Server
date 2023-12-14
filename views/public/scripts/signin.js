window.addEventListener("DOMContentLoaded", onDomContentLoaded);

function onDomContentLoaded()
{
    const cards = document.querySelector(".login-form");
    const range = 40;

    // const calcValue = (a, b) => (((a * 100) / b) * (range / 100) -(range / 2)).toFixed(1);
    const calcValue = (a, b) => (a/b*range-range/2).toFixed(1) // thanks @alice-mx

    let timeout;
    document.addEventListener('mousemove', ({x, y}) => {
    if (timeout) {
        window.cancelAnimationFrame(timeout);
    }
        
    timeout = window.requestAnimationFrame(() => {
        const yValue = calcValue(y, window.innerHeight);
        const xValue = calcValue(x, window.innerWidth);

        cards.style.transform = `rotateX(${yValue}deg) rotateY(${xValue}deg)`;
    })
    }, false);
}