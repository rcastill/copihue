var TILE_SIZE = 75;

var canvas;
var context;
var width;
var height;
var images = {};
var matrix;
var levelHeight = 8;
var levelWidth = 14;
var viewOffsetTop;
var viewOffsetLeft;

function initCanvas() {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');

    width = window.innerWidth - 300;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    viewOffsetLeft = (width - levelWidth * TILE_SIZE) / 2;
    viewOffsetTop  = (height - levelHeight * TILE_SIZE) / 2;

    loadImages();
    createMatrix();

    $('body').append(canvas);
}

function loadImages() {
    var imagesUrls = [
        'truck-blue',
        'corner-1',
        'corner-2',
        'corner-3',
        'corner-4',
        'tile'
    ];

    for(var i = 0;i<imagesUrls.length;i++) {
        images[imagesUrls[i]] = new Image();
        images[imagesUrls[i]].src = "img/" + imagesUrls[i] + ".png";
    }
}

function createMatrix() {
    matrix = [];

    for(var x = 0; x < levelWidth; x++) {
        var subm = [];

        for(var y = 0; y < levelHeight; y++) {
            if(y == 0 && x == 0)                                    subm.push(new Tile(images['corner-1']));
            else if(y == 0 && x == levelWidth - 1)                  subm.push(new Tile(images['corner-2']));
            else if(y == levelHeight - 1 && x == levelWidth - 1)    subm.push(new Tile(images['corner-3']));
            else if(y == levelHeight - 1 && x == 0)                 subm.push(new Tile(images['corner-4']));
            else                                                    subm.push(new Tile(images['tile']));
        }

        matrix.push(subm);
    }
}

function clearScreen() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'rgb(255, 255, 255)';
    context.fillRect(0, 0, width, height);
}

function render() {
    clearScreen();

    for(var x = 0; x < levelWidth; x++)
        for(var y = 0; y < levelHeight; y++)
            context.drawImage(matrix[x][y].texture, viewOffsetLeft + x * TILE_SIZE,
                viewOffsetTop + y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function update() {

}

function events() {

}

function start() {
    requestAnimationFrame(start);
    events();
    update();
    render();
}

function Tile(texture) {
    this.texture = texture;
}