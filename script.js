const unsplashURL = "https://api.unsplash.com/";
const accessKey = "PiPqYB9jOZfMKW68_VazYRyz6LcNbJMa_sHhjgtqp7k";

const timeElement = document.getElementById("date");
const months = [
    "januari",
    "februari",
    "mars",
    "april",
    "maj",
    "juni",
    "juli",
    "augusti",
    "september",
    "oktober",
    "november",
    "december",
];

const notesElement = document.querySelector("textarea");
let note = "";

const backgroundButton = document.getElementById("bg-btn");
const backgroundElement = document.querySelector(".background");

function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    h = checkTime(h);
    m = checkTime(m);
    timeElement.innerHTML = `<p><strong>${h}:${m}</strong></p>
    <p>${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}</p>`;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {
        // add zero in front of numbers < 10)
        i = "0" + i;
    }
    return i;
}

async function getRandomBackground() {
    const response = await fetch(
        `${unsplashURL}photos/random/?client_id=${accessKey}`,
    );

    try {
        if (!response.ok) {
            throw new Error("Could not fetch image: " + response.statusText);
        }
        const data = await response.json();
        console.log(data.urls.raw);

        backgroundElement.innerHTML = `<img src="${data.urls.raw}" alt="Background image" />`;
    } catch (error) {
        console.log(error);
    }
}

notesElement.addEventListener("change", () => {
    note = notesElement.value;
    console.log(note);
});
backgroundButton.addEventListener("click", getRandomBackground);
