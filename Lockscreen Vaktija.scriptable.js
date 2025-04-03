/*
 * Vaktija Widget for iPhone v1.0
 * 
 * Script that fetches prayer times from vaktija.ba API and displays them in lockscreen widget.
 * Designed for a horizontal layout with the original Vaktija.ba colors and feel.
 * 
 * Made by MuxBH28 - 03.04.2025.
 * 
 */

const API_URL = "https://api.vaktija.ba/vaktija/v1/";
const CITY = "77";
const FILE_PATH = "vaktija.json";
const fm = FileManager.iCloud();
const file = fm.joinPath(fm.documentsDirectory(), FILE_PATH);

async function fetchData() {
    let req = new Request(API_URL + CITY);
    let data = await req.loadJSON();
    let now = new Date();
    let fetchDate = now.toISOString().split("T")[0];

    fm.writeString(file, JSON.stringify({ data, fetchDate }));
    return { data };
}

function loadStoredData() {
    if (fm.fileExists(file)) {
        let stored = JSON.parse(fm.readString(file));
        let today = new Date().toISOString().split("T")[0];
        if (stored.fetchDate === today) return stored;
    }
    return null;
}

async function getVaktija() {
    let storedData = loadStoredData();
    return storedData ? storedData : await fetchData();
}

function getNextVakat(vakatTimes) {
    let now = new Date();
    let times = ["Zora", "Izlazak", "Podne", "Ikindija", "Akšam", "Jacija"];
    let icons = ["🕌", "🌅", "☀️", "🌤", "🌇", "🌙"];

    for (let i = 0; i < vakatTimes.length; i++) {
        let [hours, minutes] = vakatTimes[i].split(":").map(Number);
        let vakatTime = new Date();
        vakatTime.setHours(hours, minutes, 0, 0);
        if (now < vakatTime) {
            return { name: times[i], time: vakatTimes[i], icon: icons[i], vakatTime };
        }
    }
    return { name: times[0], time: vakatTimes[0], icon: icons[0], vakatTime: new Date() };
}

async function createWidget() {
    let { data } = await getVaktija();
    let nextVakat = getNextVakat(data.vakat);

    let widget = new ListWidget();
    widget.backgroundColor = new Color("#1e2227");

    let title = widget.addText(`${nextVakat.icon} ${nextVakat.name}`);
    title.textColor = Color.white();
    title.font = Font.boldSystemFont(16);
    title.centerAlignText();

    widget.addSpacer(4);

    let vakatText = widget.addText(`${nextVakat.time}`);
    vakatText.textColor = new Color("#a59573");
    vakatText.font = Font.mediumSystemFont(18);
    vakatText.centerAlignText();

    widget.refreshAfterDate = new Date(Date.now() + 1 * 1000);

    return widget;
}

let widget = await createWidget();
if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    widget.presentSmall();
}

Script.complete();

/*
 * Made by MuxBH28
 * Email: sehicmuhammed7@proton.me
 * GitHub: github.com/MuxBH28
 * 
 * Data displayed is from Vaktija.ba API – huge thanks to them.
 * 
 * For any issues, feel free to contact me.
 */
