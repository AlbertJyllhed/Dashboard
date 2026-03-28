// urls
const openMeteoURL = "https://api.open-meteo.com/v1/forecast?";
const jokeURL =
    "https://v2.jokeapi.dev/joke/Programming,Miscellaneous,Pun?blacklistFlags=nsfw,religious,political,racist,sexist,explicit";
const unsplashURL = "https://api.unsplash.com/";
// const accessKey = process.env.UNSPLASH_ACCESS_KEY;
const unsplashKey = "PiPqYB9jOZfMKW68_VazYRyz6LcNbJMa_sHhjgtqp7k";

// clock
const timeElement = document.getElementById("date");

//header
const titleElement = document.querySelector("h1");

// quick links
const linkButton = document.getElementById("link-btn");
const quickLinksElement = document.getElementById("quick-links");
const loaderElement = document.querySelector(".loader");

// quick links dialog
const linkDialog = document.getElementById("link-dialog");
const dialogForm = document.getElementById("dialog-form");
const closeDialogButton = document.getElementById("close-dialog-btn");
const dialogURLInput = document.getElementById("dialog-url");
const dialogTitleInput = document.getElementById("dialog-link-title");

// weather
const weatherElement = document.getElementById("weather");
const weatherMap = new Map([
    [[0], { icon: "fa-sun", description: "Soligt" }],
    [[1], { icon: "fa-cloud-sun", description: "Sol och moln" }],
    [[2, 3], { icon: "fa-cloud", description: "Molnigt" }],
    [[45, 48], { icon: "fa-smog", description: "Disigt" }],
    [[51, 53, 55], { icon: "fa-cloud-rain", description: "Duggregn" }],
    [
        [56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
        { icon: "fa-cloud-showers-heavy", description: "Regn" },
    ],
    [[71, 73, 75, 77, 85, 86], { icon: "fa-snowflake", description: "Snö" }],
    [[95, 96, 99], { icon: "fa-cloud-bolt", description: "Åska" }],
]);

// joke
const jokeButton = document.getElementById("joke-btn");
const jokeElement = document.getElementById("joke");

// notes
const notesElement = document.querySelector("textarea");

// background
const backgroundButton = document.getElementById("bg-btn");
const backgroundElement = document.querySelector(".background");

// initialize dashboard with saved settings and start clock
function init() {
    startTime();

    titleElement.textContent =
        localStorage.getItem("title") || "John Doe Dashboard";

    const savedLinks = JSON.parse(localStorage.getItem("quickLinks")) || [];
    savedLinks.forEach((link) => {
        createQuickLinkElement(link.url, link.title);
    });

    navigator.geolocation.getCurrentPosition(
        createWeatherElements,
        (error) => console.error("Geolocation error", error),
        {
            enableHighAccuracy: false,
        },
    );

    notesElement.value = localStorage.getItem("note");

    const storedBackground =
        localStorage.getItem("background") ||
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600";
    setBackground(storedBackground);
}

// clock function to update time every second and format date
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

// add zero in front of numbers < 10 for clock formatting
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
function createQuickLinkElement(inputURL, inputTitle) {
    const url = new URL(inputURL);
    const innerContentElement = document.createElement("div");
    innerContentElement.classList.add("inner-container");

    const closeButton = document.createElement("i");
    closeButton.classList.add("fa-solid", "fa-circle-minus");
    closeButton.addEventListener("click", () => {
        quickLinksElement.removeChild(innerContentElement);
        removeQuickLink(url.href, inputTitle);
    });

    // add content to inner container except remove button
    innerContentElement.innerHTML = `<img src="${getFavicon(url, 180)}" alt="Website logo" />
    <a href="${url}" target="_blank">${inputTitle}</a>`;

    innerContentElement.appendChild(closeButton);
    quickLinksElement.appendChild(innerContentElement);
}

// Save quick link to localStorage
function saveQuickLink(url, title) {
    const links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links.push({ url, title });
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

// Remove quick link from localStorage
function removeQuickLink(url, title) {
    let links = JSON.parse(localStorage.getItem("quickLinks")) || [];
    links = links.filter((link) => !(link.url === url && link.title === title));
    localStorage.setItem("quickLinks", JSON.stringify(links));
}

// get weather data based on code from api and return correct icon and description
function getWeatherData(code) {
    for (const [codes, data] of weatherMap) {
        if (codes.includes(code)) return data;
    }
    return { icon: "fa-question", desc: "Unknown" };
}

// format weather date to show weekday
function formatWeatherDate(dateString) {
    const date = new Date(dateString);
    if (date.getDate() === new Date().getDate()) {
        return "Idag";
    } else if (date.getDate() === new Date(Date.now() + 86400000).getDate()) {
        return "Imorgon";
    }
    const formattedDate = new Intl.DateTimeFormat("sv-SE", {
        weekday: "long",
    }).format(date);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

// create weather elements based on user location
function createWeatherElements(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const url = `${openMeteoURL}latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto`;
    getData(url).then((result) => {
        for (let i = 0; i < 3; i++) {
            const innerContentElement = document.createElement("div");
            innerContentElement.classList.add("inner-container");

            const temp = Math.round(result.daily.temperature_2m_max[i]);

            const icon = document.createElement("i");
            const weatherData = getWeatherData(result.daily.weathercode[i]);
            const iconClass = weatherData.icon || "fa-question";
            icon.classList.add("weather-icon", "fa-solid", iconClass);

            innerContentElement.innerHTML = `<div class="flex-column">
                <p><strong>${formatWeatherDate(result.daily.time[i])}</strong></p>
                <div class="flex-row">
                    <p class="inner-text">${temp}°C</p>
                    <p class="inner-text">${weatherData.description}</p>
                </div>
            </div>`;

            innerContentElement.prepend(icon);
            weatherElement.appendChild(innerContentElement);
        }
    });
    loaderElement.style.display = "none";
}

// get joke from api and display it
function setJoke() {
    getData(jokeURL).then((result) => {
        if (result.type === "single") {
            jokeElement.innerHTML = `<div class="inner-container flex-column joke-container">
                <h3>${result.joke}</h3>
            </div>`;
        } else if (result.type === "twopart") {
            jokeElement.innerHTML = `<div class="inner-container flex-column joke-container">
                <p>${result.setup}</p><h3>${result.delivery}</h3>
            </div>`;
        }
    });
}

// get image brightness to determine if text should be light or dark
function getImageBrightness(url, callback) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r, g, b, avg;
        let colorSum = 0;

        for (let x = 0, len = data.length; x < len; x += 4) {
            r = data[x];
            g = data[x + 1];
            b = data[x + 2];
            avg = Math.floor((r + g + b) / 3);
            colorSum += avg;
        }

        const brightness = Math.floor(colorSum / (img.width * img.height));
        callback(brightness);
    };
}

// set background image either from unsplash api or localstorage
function setBackground(backgroundImage) {
    backgroundElement.style.backgroundImage = `url(${backgroundImage})`;
    getImageBrightness(backgroundImage, (brightness) => {
        console.log("Brightness:", brightness);
        brightness < 128
            ? (titleElement.style.color = "white")
            : (titleElement.style.color = "black");
    });
    localStorage.setItem("background", backgroundImage);
}

// set random background image from unsplash api
function setRandomBackground() {
    const url = `${unsplashURL}photos/random/?client_id=${unsplashKey}`;
    getData(url).then((result) => {
        setBackground(result.urls.full);
    });
}

// helper function to fetch data from api and handle errors
async function getData(url) {
    const response = await fetch(url);

    try {
        if (!response.ok) {
            throw new Error("Could not fetch image: " + response.statusText);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        throw error;
    }
}

// event listeners
titleElement.addEventListener("input", () => {
    localStorage.setItem("title", titleElement.textContent);
});
linkButton.addEventListener("click", () => {
    linkDialog.showModal();
});
dialogForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (isLinkValid(dialogURLInput.value)) {
        createQuickLinkElement(dialogURLInput.value, dialogTitleInput.value);
        saveQuickLink(dialogURLInput.value, dialogTitleInput.value);
        dialogTitleInput.value = "";
        dialogURLInput.value = "";
    }
    linkDialog.close();
});
closeDialogButton.addEventListener("click", () => {
    linkDialog.close();
});
jokeButton.addEventListener("click", () => {
    setJoke();
});
notesElement.addEventListener("change", () => {
    localStorage.setItem("note", notesElement.value);
});
backgroundButton.addEventListener("click", setRandomBackground);

// auto functions
init();
