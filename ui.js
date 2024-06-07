const A = "A".codePointAt(0)
const Z = "Z".codePointAt(0)
const alphabet = Array.from({ length: Z - A + 1 }, (_, i) => String.fromCodePoint(i + A));
alphabet.unshift(" ")


const body = document.getElementsByTagName("body")[0]
const encryptedText = document.getElementById("encryptedText")
const canvas = document.createElement("canvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style = "border: 1px solid"
body.appendChild(canvas)
const ctx = canvas.getContext("2d");

const fontSize = 50;
ctx.font = `${fontSize}px monospace`;
const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText("A")
const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
const cellWidth = canvas.width / alphabet.length;
const widthPadding = cellWidth * 0.1;
const textWidth = cellWidth * 0.8;
const heightPadding = textHeight * 0.1;

canvas.height = (textHeight + (heightPadding * 2)) * alphabet.length;
const cellHeight = canvas.height / alphabet.length;

ctx.font = `${fontSize}px monospace`;

console.table({
    "canvas.height": canvas.height,
    "canvas.width": canvas.width,
    "textHeight": textHeight,
    "padding": widthPadding,
    "cellLength": cellWidth,
    "textLength": textWidth,
    "fontSize": fontSize
});

const drawCharacterAtIndex = (x, y, character) => {
    if (!character) {
        throw "Character is null";
    }
    if (x < 0 || x > alphabet.length || y < 0 || y > alphabet.length) {
        throw `Invalid args x:${x} y:${y}`
    }
    ctx.fillText(
        character,
        cellWidth * x + widthPadding,
        cellHeight * y + cellHeight - heightPadding,
        textWidth
    );
}

const highlightCharacterAtIndex = (x, y) => {
    ctx.save();
    ctx.fillStyle = "rgb(255,0,0,0.1)";
    if (x < 0 || x > alphabet.length || y < 0 || y > alphabet.length) {
        throw `Invalid args x:${x} y:${y}`
    }
    ctx.fillRect(
        cellWidth * x,
        cellHeight * y,
        cellWidth,
        cellHeight
    );
    ctx.restore();
}

const drawBoard = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Draw header and sidebar
    for (let x = 0; x < alphabet.length; x++) {
        drawCharacterAtIndex(x, 0, alphabet[x])
    }
    for (let y = 0; y < alphabet.length; y++) {
        drawCharacterAtIndex(0, y, alphabet[y])
    }
    ctx.beginPath();
    ctx.moveTo(0, cellHeight);
    ctx.lineTo(canvas.width, cellHeight);
    ctx.moveTo(cellWidth, 0);
    ctx.lineTo(cellWidth, canvas.height);
    ctx.stroke();
    ctx.closePath();
    // Draw Board
    for (let y = 0; y < alphabet.length; y++) {
        for (let x = 1; x < alphabet.length; x++) {
            const index = (x + y) % (alphabet.length);
            drawCharacterAtIndex(x, y + 1, alphabet[index] === " " ? alphabet[index + 1] : alphabet[index]);
        }
    }
    // Draw background highlight shadows
    ctx.save();
    ctx.fillStyle = "rgb(0,0,0,0.1)"
    for (let i = 2; i < alphabet.length; i += 2) {
        ctx.fillRect(0, cellHeight * i, canvas.width, cellHeight)
    }
    ctx.restore();
}

const encryptAnimated = (text, key) => {
    if (!text || !key) {
        alert("text key null")
        return
    }
    const cryptGenerator = encryptGenerator(text, key)
    requestAnimationFrame(() => animate(cryptGenerator, null, null))
}

const animate = (currCryptGenerator, currentPathDrawGenerator, highlightGenerator) => {
    const isHighlighting = highlightGenerator != null && highlightGenerator.next().value
    if (isHighlighting) {
        requestAnimationFrame(() => animate(currCryptGenerator, currentPathDrawGenerator, highlightGenerator))
        return;
    }

    const drawingState = currentPathDrawGenerator !== null && currentPathDrawGenerator.next().value
    if (drawingState) {
        if (drawingState[0] === DRAWING) {
            // Draw and continue
            requestAnimationFrame(() => animate(currCryptGenerator, currentPathDrawGenerator, highlightGenerator))
            return;
        } else if (drawingState[0] === DONE_DRAWING) {
            const [x, y] = drawingState[1];
            const highlightGenerator = resultHighlightGenerator(x, y)
            requestAnimationFrame(() => animate(currCryptGenerator, currentPathDrawGenerator, highlightGenerator))
            return;
        }
    }

    drawBoard()
    // Get next location to draw
    const nextChar = currCryptGenerator.next().value
    if (!nextChar) {
        return;
    }
    const { key, text, char } = nextChar;
    const textIndex = text.charCodeAt(0) - 65 + 1
    const keyIndex = key.charCodeAt(0) - 65 + 1

    encryptedText.textContent += char;

    const animationGenerator = drawGenerator(keyIndex, textIndex)
    requestAnimationFrame(() => animate(currCryptGenerator, animationGenerator))
}

const DRAWING = 1;
const DONE_DRAWING = 2;

function* resultHighlightGenerator(x, y) {
    for (let i = 0; i < 10; i++) {
        highlightCharacterAtIndex(x, y)
        yield true;
    }
    for (let i = 0; i < 30 /* ~half a second */; i++) {
        yield true;
    }
    yield false;
}

function* encryptGenerator(text, key) {
    for (let i = 0; i < text.length; i++) {
        const keyNum = key[i % key.length].charCodeAt(0) - 65
        const textNum = text[i].charCodeAt(0) - 65
        const val = (keyNum + textNum) % 26
        yield {
            key: key[i % key.length],
            text: text[i],
            char: String.fromCharCode(val + 65)
        }
    }
    yield undefined;
}

function* drawGenerator(x, y) {
    for (let toY = 0; toY <= y; toY++) {
        highlightCharacterAtIndex(x, toY)
        yield [DRAWING, [x, y]];
    }
    for (let toX = 0; toX <= x; toX++) {
        highlightCharacterAtIndex(toX, y)
        yield [DRAWING, [x, y]];
    }
    yield [DONE_DRAWING, [x, y]];
}

drawBoard()
