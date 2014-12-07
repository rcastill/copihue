function posToByte(x, y) {
    x -= 1;
    y -= 1;

    x = x << 4;
    return x | y;
}

function byteToPos(b) {
    return {
        x: parseInt(b >> 4) + 1,
        y: parseInt(b & 15) + 1
    }
}