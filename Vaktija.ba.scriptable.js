/*
 * Vaktija Widget for iPhone v1.0
 * 
 * Script that fetches prayer times from vaktija.ba API and displays them in a widget.
 * Designed for a horizontal layout with the original Vaktija.ba colors and feel.
 * 
 * Made by MuxBH28 - 04.03.2025. (Ramadan)
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
    let fetchTime = now.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
    let fetchDate = now.toISOString().split("T")[0];

    fm.writeString(file, JSON.stringify({ data, fetchDate, fetchTime }));
    return { data, fetchTime };
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

function getNextVakat(vakatTimes, vakatNames) {
    let now = new Date();
    for (let i = 0; i < vakatTimes.length; i++) {
        let [hours, minutes] = vakatTimes[i].split(":").map(Number);
        let vakatTime = new Date();
        vakatTime.setHours(hours, minutes, 0, 0);
        if (now < vakatTime) {
            let diff = Math.floor((vakatTime - now) / 1000);
            let h = Math.floor(diff / 3600);
            let m = Math.floor((diff % 3600) / 60);
            return { vakatName: vakatNames[i], countdown: `${h}h ${m}m` };
        }
    }
    return { vakatName: vakatNames[0], countdown: "0h 0m" };
}

async function createWidget() {
    let { data, fetchTime } = await getVaktija();
    let vakti = data.vakat;
    let times = ["Zora", "Izlazak", "Podne", "Ikindija", "Akšam", "Jacija"];
    let nextVakat = getNextVakat(vakti, times);

    let widget = new ListWidget();
    widget.backgroundColor = new Color("#1e2227");

    let rowStack = widget.addStack();
    rowStack.layoutHorizontally();
    rowStack.setPadding(0, 0, 0, 0);

    let leftColumn = rowStack.addStack();
    leftColumn.layoutVertically();
    leftColumn.size = new Size(130, 0);
    leftColumn.centerAlignContent();

    let rightColumn = rowStack.addStack();
    rightColumn.layoutVertically();
    rightColumn.size = new Size(100, 0);
    rightColumn.centerAlignContent();

    let header = leftColumn.addText("Vaktija.ba");
    header.textColor = new Color("#a59573");
    header.font = Font.boldSystemFont(16);
    header.centerAlignText();
    leftColumn.addSpacer(5);

    let vakatNameText = leftColumn.addText(`${nextVakat.vakatName} za:`);
    vakatNameText.textColor = Color.white();
    vakatNameText.font = Font.systemFont(14);
    vakatNameText.centerAlignText();

    let countdownText = leftColumn.addText(`${nextVakat.countdown}`);
    countdownText.textColor = new Color("#a59573");
    countdownText.font = Font.boldSystemFont(24);
    countdownText.centerAlignText();

    let cityName = leftColumn.addText(data.lokacija);
    cityName.textColor = Color.white();
    cityName.font = Font.systemFont(14);
    cityName.centerAlignText();

    leftColumn.addSpacer(8);

    let hr = leftColumn.addText("───────");
    hr.textColor = new Color("#a59573", 0.5);
    hr.font = Font.systemFont(12);
    hr.centerAlignText();

    let lastFetchedText = leftColumn.addText(`🕒 ${fetchTime}`);
    lastFetchedText.textColor = new Color("#a59573");
    lastFetchedText.font = Font.systemFont(12);
    lastFetchedText.centerAlignText();

    let headerText = rightColumn.addText(data.datum[0]);
    headerText.textColor = new Color("#a59573");
    headerText.font = Font.systemFont(12);
    headerText.centerAlignText();

    let rightColumnWrapper = rightColumn.addStack();
    rightColumnWrapper.layoutVertically();
    rightColumnWrapper.centerAlignContent();

    for (let i = 0; i < times.length; i++) {
        let vakatText = rightColumnWrapper.addText(`${times[i]}: ${vakti[i]}`);
        vakatText.textColor = Color.white();
        vakatText.font = Font.mediumSystemFont(14);
        vakatText.centerAlignText();
    }

    let copyrightText = rightColumn.addText(`Made with ❤️`);
    copyrightText.textColor = new Color("#a59573");
    copyrightText.font = Font.systemFont(12);
    copyrightText.centerAlignText();

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
