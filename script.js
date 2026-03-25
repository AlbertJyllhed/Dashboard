// urls
const unsplashURL = "https://api.unsplash.com/";
// const accessKey = process.env.UNSPLASH_ACCESS_KEY;
const unsplashKey = "PiPqYB9jOZfMKW68_VazYRyz6LcNbJMa_sHhjgtqp7k";

// clock
const timeElement = document.getElementById("date");

// quick links
const linkButton = document.getElementById("link-btn");
const quickLinksElement = document.getElementById("quick-links");

// notes
const notesElement = document.querySelector("textarea");
let note = "";

// background
const backgroundButton = document.getElementById("bg-btn");
const backgroundElement = document.querySelector(".background");

function startTime() {
    const today = new Date();
    let h = today.getHours();
    let m = today.getMinutes();
    h = checkTime(h);
    m = checkTime(m);
    const formattedDate = new Intl.DateTimeFormat("sv-SE", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(today);
    timeElement.innerHTML = `<p><strong>${h}:${m}</strong></p>
    <p>${formattedDate}</p>`;
    setTimeout(startTime, 1000);
}

function checkTime(i) {
    if (i < 10) {
        // add zero in front of numbers < 10)
        i = "0" + i;
    }
    return i;
}

// checks if url is valid using regex pattern
function isLinkValid(url) {
    const pattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*$/;
    return pattern.test(url);
}

// get favicon from google's public API
function getFavicon(url, size) {
    return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=${size || 20}`;
}

// create quick link based on user input
function createQuickLinkElement(input) {
    const url = new URL(input);
    const innerContentElement = document.createElement("div");
    innerContentElement.classList.add("inner-container");

    const websiteName = url.hostname.replace("www.", "");
    innerContentElement.innerHTML = `<img src="${getFavicon(url)}" alt="Website logo" />
        <a href="${url}" target="_blank">${websiteName}</a><i class="fa-solid fa-circle-minus"></i>`;

    quickLinksElement.appendChild(innerContentElement);
}

async function getRandomBackground() {
    const response = await fetch(
        `${unsplashURL}photos/random/?client_id=${unsplashKey}`,
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

linkButton.addEventListener("click", () => {
    const input = prompt("Please enter a valid url");
    if (input && isLinkValid(input)) {
        createQuickLinkElement(input);
    }
});
notesElement.addEventListener("change", () => {
    note = notesElement.value;
    console.log(note);
});
backgroundButton.addEventListener("click", getRandomBackground);
