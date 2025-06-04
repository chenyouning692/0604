let video;
let facemesh;
let predictions = [];

let wordBoxes = [];
let correctAdjectives = ["happy", "sad", "fast", "slow", "hot"];
let allWords = [
  "happy", "sad", "fast", "slow", "hot",
  "dog", "run", "big", "cat", "cold",
  "fish", "green", "apple", "car", "play", "blue"
];

const upperLipIndices = [13, 312, 82, 81, 80, 191];
const lowerLipIndices = [14, 87, 178, 88, 95, 61];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on("predict", results => predictions = results);

  generateWordBoxes();
  textAlign(CENTER, CENTER);
  rectMode(CORNER);
  textSize(18);
}

function modelReady() {
  console.log("Facemesh model loaded.");
}

function draw() {
  image(video, 0, 0, width, height);

  drawWords();
  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    let upperLip = upperLipIndices.map(i => keypoints[i]);
    let lowerLip = lowerLipIndices.map(i => keypoints[i]);

    for (let box of wordBoxes) {
      let topY = box.y;
      let bottomY = box.y + box.h;

      let hasUpperLipInTop = upperLip.some(pt => pt[0] > box.x && pt[0] < box.x + box.w && Math.abs(pt[1] - topY) < 10);
      let hasLowerLipInBottom = lowerLip.some(pt => pt[0] > box.x && pt[0] < box.x + box.w && Math.abs(pt[1] - bottomY) < 10);

      if (hasUpperLipInTop && hasLowerLipInBottom) {
        box.isBitten = true;
      }
    }
  }
}

function generateWordBoxes() {
  shuffle(allWords, true);
  let cols = 4;
  let rows = 4;
  let boxW = 140;
  let boxH = 40;
  let marginX = 20;
  let marginY = 20;

  for (let i = 0; i < 16; i++) {
    let col = i % cols;
    let row = floor(i / cols);
    let x = marginX + col * (boxW + 10);
    let y = marginY + row * (boxH + 10);
    wordBoxes.push({ word: allWords[i], x, y, w: boxW, h: boxH, isBitten: false });
  }
}

function drawWords() {
  for (let box of wordBoxes) {
    stroke(0);
    strokeWeight(2);
    fill(box.isBitten ? (correctAdjectives.includes(box.word) ? "lightgreen" : "red") : 255);
    rect(box.x, box.y, box.w, box.h, 5);
    fill(0);
    noStroke();
    text(box.word, box.x + box.w / 2, box.y + box.h / 2);
  }
}
