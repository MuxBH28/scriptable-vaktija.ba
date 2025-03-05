/*
 * Vaktija Mini Widget for iPhone v1.1
 * 
 * Script that fetches prayer times from vaktija.ba API and displays them in a widget.
 * Designed for a small layout with the original Vaktija.ba colors and feel.
 * 
 * Made by MuxBH28 - 05.03.2025. (Ramadan)
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

function getNextVakatIndex(vakatTimes) {
    let now = new Date();
    for (let i = 0; i < vakatTimes.length; i++) {
        let [hours, minutes] = vakatTimes[i].split(":").map(Number);
        let vakatTime = new Date();
        vakatTime.setHours(hours, minutes, 0, 0);
        if (now < vakatTime) {
            return i;
        }
    }
    return 0;
}

async function createWidget() {
    let { data } = await getVaktija();
    let vakti = data.vakat;
    let times = ["Zora", "Izlazak", "Podne", "Ikindija", "Akšam", "Jacija"];
    let nextVakatIndex = getNextVakatIndex(vakti);

    let widget = new ListWidget();
    widget.backgroundColor = new Color("#1e2227");

    for (let i = 0; i < times.length; i++) {
        let row = widget.addStack();
        row.layoutHorizontally();

        let bullet = i === nextVakatIndex ? "●" : "○";
        let vakatText = row.addText(` ${bullet} ${times[i]}`);
        vakatText.textColor = new Color("#a59573");
        vakatText.font = Font.mediumSystemFont(14);

        row.addSpacer();

        let timeText = row.addText(vakti[i]);
        timeText.textColor = Color.white();
        timeText.font = Font.boldSystemFont(16);
        timeText.rightAlignText();
    }

    widget.refreshAfterDate = new Date(Date.now() + 60 * 1000);

    return widget;
}

let widget = await createWidget();
if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    widget.presentMedium();
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