const BPM = 130;
const lvm = new LVM(BPM);
const sceneManager = new SceneManager();

const TAPTEMPO_KEY = 13;
const FULLSCREEN_KEY = 32;

let IMAGES = {};
const IMAGE_PATHS = [
    "river",
    "game",
    "live",
    "pingpong",
    "purple",
    "rain",
    "sea",
    "tr8s",
    "walk",
];

function preload() {
    sceneManager.midiManager_.initializeMIDIDevices();
    sceneManager.loadPostShader("../shader/main.vert", "../shader/main.frag");

    for(let path of IMAGE_PATHS){
        IMAGES[path] = [];
        for(let i = 0; i < 15; i++){
            IMAGES[path].push(loadImageSafely(`../asset/gif/${path}/${nf(i, 2)}.png`));
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
    pixelDensity(2);
    noCursor();

    sceneManager.setup();
}

function draw() {
    sceneManager.update();
    sceneManager.draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    sceneManager.resize();
}

function keyPressed() {
    if (keyCode === FULLSCREEN_KEY) {
        let fs = fullscreen();
        fullscreen(!fs);
    }
    if (keyCode === TAPTEMPO_KEY) {
        lvm.recordKeyPressTime();
    }
}

function loadImageSafely(path) {
    return loadImage(path,
        // 成功時のコールバック
        (img) => img,
        // 失敗時のコールバック
        () => {
            console.log(`Image not found: ${path}`);
            return null;
        }
    );
}