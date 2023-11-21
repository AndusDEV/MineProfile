const urlParams = new URLSearchParams(window.location.search);
let uuid = urlParams.get('uuid');
let username = urlParams.get('username');

document.addEventListener('DOMContentLoaded', async () => {
    if (uuid) {
        setup();
    } else if (username) {
        uuid = await getPlayerInfo(username, "uuid");
        setup();
    } else {
        const errorElement = document.createElement('div');
        errorElement.innerHTML = `<p>Please provide a valid UUID or username.</p>`;
        document.body.appendChild(errorElement);
    }
});

async function getSkinImage(uuid, type, scale = 1) {
    const baseUrl = 'https://api.mineatar.io/';
    const queryParams = new URLSearchParams({
        scale: scale || 4
    });

    const url = `${baseUrl}${type}/${uuid}?${queryParams}`;
    console.info(`Getting skin from URL: ${url}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error (Skin)! Status: ${response.status}`);
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        return imageUrl;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}

async function getPlayerInfo(uuid, data) {
    const proxyUrl = `https://api.ashcon.app/mojang/v2/user/${uuid}`;
    console.info(`Getting player info from URL: ${proxyUrl}`);

    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch player info. Status: ${response.status}`);
        }
        const json = await response.json();

        if (data in json) {
            return json[data];
        } else {
            throw new Error(`Invalid data parameter. '${data}' is not a valid property in the Mojang API response.`);
        }
    } catch (error) {
        console.error(`Error fetching player info: ${error.message}`);
        throw error;
    }
}

async function setup() {
    const normalUUID = await getPlayerInfo(uuid, "uuid");
    const trimmedUUID = normalUUID.replace(/-/g, "");
    const texturesJSON = await getPlayerInfo(uuid, "textures");

    // Header
    document.getElementById("player-head").src = await getSkinImage(uuid, "face", 10);
    document.getElementById("username-h").textContent = await getPlayerInfo(uuid, "username");
    // Left column
    document.getElementById("player-full-skin").src = await getSkinImage(uuid, "body/full", 6);
    document.getElementById("player-front-skin").src = await getSkinImage(uuid, "body/front", 4);
    document.getElementById("player-left-skin").src = await getSkinImage(uuid, "body/left", 4);
    document.getElementById("player-back-skin").src = await getSkinImage(uuid, "body/back", 4);
    document.getElementById("player-right-skin").src = await getSkinImage(uuid, "body/right", 4);
    document.getElementById("player-raw-skin").src = await getSkinImage(uuid, "skin");
    if (texturesJSON.cape != null) {
        document.getElementById("player-cape").src = texturesJSON.cape.url;
    }
    // Right column
    document.getElementById("player-username").textContent = (`Username: ${await getPlayerInfo(uuid, "username")}`);
    document.getElementById("player-uuid").textContent = (`UUID: ${normalUUID}`);
    document.getElementById("player-tuuid").textContent = (`Trimmed UUID: ${trimmedUUID}`);
}