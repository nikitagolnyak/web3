function fetchQuote() {
    const quotesUrl = 'https://thesimpsonsquoteapi.glitch.me/quotes';
    return axios.get(quotesUrl)
}

function imageUrls() {
    const imageUrl = (w, h) => `https://source.unsplash.com/collection/1127163/${w}x${h}`;
    return [
        [300, 200],
        [300, 300],
        [200, 500],
        [500, 500]
    ]
        .map(([width, height]) => imageUrl(width, height))
}

function drawImage(ctx, x, y, image) {
    return new Promise((resolve, reject) => {
        const pic = new Image();
        pic.crossOrigin = 'anonymous';
        pic.onerror = () => reject();
        pic.onload = () => {
            ctx.drawImage(pic, x, y);
            resolve()
        };
        pic.src = image
    }).catch(err => drawImage(ctx, x, y, image));
}

function drawDarkenOverlay(ctx, width, height) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, width, height);
}

function drawText(ctx, width, height, text) {
    const fontSize = 30;
    const textMargin = 5;

    ctx.font = `${fontSize}px arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';

    const textLines = wrappedLines(ctx, text, width * 0.9);
    const linesCount = textLines.length;
    const textHeight = (linesCount * fontSize) + ((linesCount - 1) * textMargin);
    const startY = (height - textHeight) / 2;
    textLines.forEach((line, i) => {
        const lineY = startY + i * (fontSize + textMargin);
        ctx.fillText(line, width / 2, lineY);
    });
}

function wrappedLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

function prepareCanvasContext() {
    const canvas = document.createElement("canvas");
    canvas.height = 1000;
    canvas.width = 1000;
    document.body.appendChild(canvas);
    return canvas.getContext('2d');
}

window.onload = () => {
    const ctx = prepareCanvasContext();
    const images = imageUrls();
    Promise.all(
        [
            fetchQuote(),
            drawImage(ctx, 0, 0, images[0]),
            drawImage(ctx, 0, 200, images[1]),
            drawImage(ctx, 300, 0, images[2]),
            /*drawImage(ctx, 300, 500, images[3])*/
        ]
    ).then(([quotesData]) => {
        drawDarkenOverlay(ctx, 500, 500);
        return quotesData.data[0].quote;
    }).then(quote => drawText(ctx, 500, 500, quote));
}