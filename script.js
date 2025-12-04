const MAX_ARCS = 30;
const SPAWN_RATE = 0.05;

let arcsData = [];
let ringsData = [];
let totalEvents = 0;

const LOCATIONS = [
    { name: "USA", lat: 37.0902, lng: -95.7129 },
    { name: "China", lat: 35.8617, lng: 104.1954 },
    { name: "Russia", lat: 61.5240, lng: 105.3188 },
    { name: "Brazil", lat: -14.2350, lng: -51.9253 },
    { name: "Germany", lat: 51.1657, lng: 10.4515 },
    { name: "UK", lat: 55.3781, lng: -3.4360 },
    { name: "Australia", lat: -25.2744, lng: 133.7751 },
    { name: "India", lat: 20.5937, lng: 78.9629 },
    { name: "Japan", lat: 36.2048, lng: 138.2529 },
    { name: "South Africa", lat: -30.5595, lng: 22.9375 },
    { name: "France", lat: 46.2276, lng: 2.2137 },
    { name: "Canada", lat: 56.1304, lng: -106.3468 }
];

const ATTACK_TYPES = ["UDP Flood", "SYN Flood", "SQL Injection", "Brute Force", "Malware", "Phishing"];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const globeContainer = document.getElementById('globeViz');

const N_PATHS = 10;
const MAX_POINTS_PER_LINE = 50;
const MAX_STEP_DEG = 1;
const MAX_STEP_ALT = 0.015;
const pathData = [...Array(N_PATHS).keys()].map(() => {
    let lat = (Math.random() - 0.5) * 180;
    let lng = (Math.random() - 0.5) * 360;
    let alt = 0;
    return [[lat, lng, alt], ...[...Array(Math.round(Math.random() * MAX_POINTS_PER_LINE)).keys()].map(() => {
        lat += (Math.random() * 2 - 1) * MAX_STEP_DEG;
        lng += (Math.random() * 2 - 1) * MAX_STEP_DEG;
        alt += (Math.random() * 2 - 1) * MAX_STEP_ALT * 0.5;
        alt = Math.max(0, alt);
        return [lat, lng, alt];
    })];
});

const world = Globe()
    (globeContainer)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
    .backgroundColor('#000000')
    .atmosphereColor('#00f3ff')
    .atmosphereAltitude(0.15)
    .arcColor('color')
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(1500)
    .arcStroke(0.5)
    .ringsData(ringsData)
    .ringColor(() => t => `rgba(255,100,50,${1 - t})`)
    .ringMaxRadius('maxR')
    .ringPropagationSpeed('speed')
    .ringRepeatPeriod('repeat')
    .labelsData(LOCATIONS)
    .labelLat(d => d.lat)
    .labelLng(d => d.lng)
    .labelText(d => d.name)
    .labelSize(0.5)
    .labelDotRadius(0.5)
    .labelColor(() => 'rgba(255, 255, 255, 0.75)')
    .labelResolution(2)
    .pathsData(pathData)
    .pathColor(() => ['rgba(0,0,255,0.6)', 'rgba(255,0,0,0.6)'])
    .pathDashLength(0.01)
    .pathDashGap(0.004)
    .pathDashAnimateTime(100000);

world.controls().autoRotate = true;
world.controls().autoRotateSpeed = 0.6;

function spawnAttack() {
    const source = randomItem(LOCATIONS);
    let target = randomItem(LOCATIONS);
    while (target === source) {
        target = randomItem(LOCATIONS);
    }

    const type = randomItem(ATTACK_TYPES);
    const color = Math.random() > 0.5 ? '#00f3ff' : '#ff003c';

    const arc = {
        startLat: source.lat,
        startLng: source.lng,
        endLat: target.lat,
        endLng: target.lng,
        color: [color, color],
        type: type,
        sourceName: source.name,
        targetName: target.name
    };

    arcsData.push(arc);
    if (arcsData.length > MAX_ARCS) arcsData.shift();
    world.arcsData(arcsData);

    logAttack(arc);
    updateStats();
}

function updateRings() {
    const rings = LOCATIONS.map(loc => ({
        lat: loc.lat,
        lng: loc.lng,
        maxR: Math.random() * 10 + 2,
        speed: Math.random() * 2 + 0.5,
        repeat: Math.random() * 2000 + 1000
    }));
    world.ringsData(rings);
}
updateRings();
setInterval(updateRings, 5000);

function logAttack(attack) {
    const logPanel = document.getElementById('log-entries');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="type" style="color: ${attack.color[0]}">${attack.type}</span>
        <span class="target">${attack.sourceName} &rarr; ${attack.targetName}</span>
    `;
    logPanel.prepend(entry);

    if (logPanel.children.length > 20) {
        logPanel.removeChild(logPanel.lastChild);
    }
}

function updateStats() {
    totalEvents++;
    document.getElementById('total-events').innerText = totalEvents.toLocaleString();

    if (Math.random() > 0.9) {
        document.getElementById('attacks-sec').innerText = randomInt(1200, 5000);
    }

    if (Math.random() > 0.95) {
        document.getElementById('top-target').innerText = randomItem(LOCATIONS).name.toUpperCase();
    }
}

setInterval(() => {
    if (Math.random() < SPAWN_RATE) {
        spawnAttack();
    }
}, 100);

window.addEventListener('resize', () => {
    world.width(globeContainer.offsetWidth);
    world.height(globeContainer.offsetHeight);
});
