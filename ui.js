const A = "A".codePointAt(0)
const Z = "Z".codePointAt(0)
const alphabet = new Array(Z - A + 1).fill().map((_, indx) => String.fromCodePoint(indx + A))
alphabet.unshift(" ")

const body = document.getElementsByTagName("body")[0]
const canvas = document.createElement("canvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style = "border: 1px solid"
body.appendChild(canvas)
const ctx = canvas.getContext("2d");

let fontSize = 50;
ctx.font = `${fontSize}px monospace`;
const { actualBoundingBoxAscent, actualBoundingBoxDescent } = ctx.measureText("A")
let textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;

let cellWidth = canvas.width / alphabet.length;
let widthPadding = cellWidth * 0.1;
let textWidth = cellWidth * 0.8;

let heightPadding = textHeight * 0.1;

canvas.height = (textHeight + (heightPadding * 2)) * alphabet.length;
let cellHeight = canvas.height / alphabet.length;
ctx.font = `${fontSize}px monospace`;

console.table([
    ["canvas.height", canvas.height],
    ["canvas.width", canvas.width],
    ["textHeight", textHeight],
    ["padding", widthPadding],
    ["cellLength", cellWidth],
    ["textLength", textWidth],
    ["fontSize", fontSize]
])

const drawCharacterAtIndex = (x, y, character) => {
    if (!character)
        throw "Character is null";
    if (x < 0 || x > alphabet.length || y < 0 || y > alphabet.length)
        throw `Invalid args x:${x} y:${y}`
    ctx.fillText(
        character,
        cellWidth * x + widthPadding,
        cellHeight * y + cellHeight - heightPadding,
        textWidth);
}


ctx.clearRect(0, 0, canvas.width, canvas.height)

// Draw header and sidebar
for (let x = 0; x < alphabet.length; x++) {
    drawCharacterAtIndex(x, 0, alphabet[x])
}
for (let y = 0; y < alphabet.length; y++) {
    drawCharacterAtIndex(0, y, alphabet[y])
}
ctx.moveTo(0, cellHeight)
ctx.lineTo(canvas.width, cellHeight);
ctx.stroke()

ctx.moveTo(cellWidth , 0)
ctx.lineTo(cellWidth, canvas.height)
ctx.stroke()

// Draw Matrix
for (let y = 1; y < alphabet.length; y++) {
    for (let x = 1; x < alphabet.length; x++) {
        const index = (x + y) % (alphabet.length);
        if (alphabet[index] === " ") {
            drawCharacterAtIndex(x, y, alphabet[index + 1])
        } else {
            drawCharacterAtIndex(x, y, alphabet[index])
        }
    }
}

// Draw background shadows
ctx.fillStyle = "rgb(0,0,0,0.1)"
for(let i = 2; i < alphabet.length; i+=2) {
    ctx.fillRect(0, cellHeight*i, canvas.width, cellHeight)
}

const encrypt2 = (text,key) => {
    if(!text || !key) alert("text key null")
    const generator = encryptGenerator(text, key)
    requestAnimationFrame(() => animate(generator, 5))
}

const animate = (generator, iteration) => {
    if(iteration === 0) return;
    const nextChar = generator.next().value
    console.log(nextChar)
    if(!nextChar) {
        return;
    }
        
    requestAnimationFrame(() => animate(generator, iteration - 1))
}



function* encryptGenerator (text, key) {
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