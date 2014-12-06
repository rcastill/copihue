var TILE_SIZE = 75;

var levelHeight = 9;
var levelWidth = 14;
var stop = true;
var images = {};

var viewOffsetLeft;
var viewOffsetTop;
var hierarchy;
var context;
var initial;
var canvas;
var height;
var matrix;
var trucks;
var width;

var colorNamesTable = {
    '#779ECB': 'blue',
    '#C23B22': 'red',
    '#77DD77': 'green',
    '#836953': 'brown',
    '#FFB347': 'orange'
};

function initGame(_initial) {
    initial = _initial;

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

    matrix[7][6].setUpperColor('blue');
    matrix[7][2].setUpperColor('red');

    matrix[5][4].texture = images['road-horizontal'];
    matrix[6][4].texture = images['road-horizontal'];
    matrix[7][4].texture = images['road-horizontal'];
    matrix[8][4].texture = images['road-horizontal'];
    matrix[9][4].texture = images['road-lefty'];
    matrix[9][3].texture = images['road-vertical'];
    matrix[9][5].texture = images['road-vertical'];
    matrix[4][4].texture = images['road-righty'];
    matrix[4][3].texture = images['road-vertical'];
    matrix[4][5].texture = images['road-vertical'];
    matrix[9][2].texture = images['road-corner-upleft'];
    matrix[9][6].texture = images['road-corner-downleft'];
    matrix[8][2].texture = images['road-horizontal'];
    matrix[8][6].texture = images['road-horizontal'];
    matrix[7][2].texture = images['road-stop-left'];
    matrix[7][6].texture = images['road-stop-left'];

    matrix[4][2].texture = images['road-stop-up'];
    matrix[4][6].texture = images['road-stop-down'];

    $('#container').append(canvas);

    finish();
    mainLoop();
}

function loadImages() {
    var imagesUrls = [
        'corner-1', 'corner-2', 'corner-3', 'corner-4', 'tile',
        'truck-blue', 'truck-red', 'truck-green', 'truck-brown', 'truck-orange',
        'spot-blue', 'spot-red',
        'road-vertical', 'road-horizontal', 'road-inter', 'road-lefty', 'road-righty', 'road-downy', 'road-upty',
        'road-corner-downleft', 'road-corner-downright', 'road-corner-upright', 'road-corner-upleft', 'road-stop-up',
        'road-stop-down', 'road-stop-right', 'road-stop-left'
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
    context.fillStyle = '#836953';
    context.fillRect(0, 0, width, height);
}

function render() {
    clearScreen();

    for(var x = 0; x < levelWidth; x++)
        for(var y = 0; y < levelHeight; y++) {
            var tile = matrix[x][y];

            context.drawImage(tile.texture, viewOffsetLeft + x * TILE_SIZE,
                viewOffsetTop + y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            if(tile.hasUpperColor()) {
                context.drawImage(images['spot-' + tile.upperColor], viewOffsetLeft + x * TILE_SIZE,
                    viewOffsetTop + y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

    for(var i = 0; i < trucks.length; i++) {
        var truck = trucks[i];

        var angle = - truck.dir * Math.PI / 2;
        x = viewOffsetLeft + truck.x * TILE_SIZE;
        y = viewOffsetTop  + truck.y * TILE_SIZE;

        context.save();

        context.translate(x, y);
        if(truck.dir == 2)      context.translate(TILE_SIZE, TILE_SIZE);
        else if(truck.dir == 1) context.translate(0, TILE_SIZE);
        else if(truck.dir == 3) context.translate(TILE_SIZE, 0);

        context.rotate(angle);

        context.drawImage(
            images['truck-' + colorNamesTable[truck.color]],
            0,
            0,
            TILE_SIZE,
            TILE_SIZE
        );

        context.restore();
    }
}

function update() {
    for(var i = 0; i < trucks.length; i++) {
        var truck = trucks[i];
        truck.update();

        if(truck.isSpawning() !== false) {
            var index = truck.isSpawning();
            trucks.push(new Truck(truck._x, truck._y, hierarchy[index]));
            truck.finish();
        }
    }
}

function events() {

}

function mainLoop() {
    requestAnimationFrame(mainLoop);
    events();

    if(!stop) update();

    render();
}

function finish() {
    hierarchy = undefined;
    trucks = [];
    for(var i = 0; i < initial.length; i += 3)
        trucks.push(new Truck(initial[i], initial[i + 1], {
            color: initial[i + 2],
            commands: []
        }));

    stop = true;
}

function start(_hierarchy) {
    hierarchy = _hierarchy;

    for(var i = 0; i < trucks.length; i++) {
        for(var j = 0; j < hierarchy.length; j++) {
            if(hierarchy[j].color == trucks[i].color)
                trucks[i].commands = hierarchy[j].commands;
        }
    }

    stop = false;
}

/*
 * Tile Object.
 */
function Tile(texture) {
    this.texture = texture;
}

Tile.prototype.setUpperColor = function(color) {
    this.upperColor = color;
};

Tile.prototype.hasUpperColor = function() {
    if(this.upperColor != undefined)
        return true;
}

/*
 * Truck Object.
 */
function Truck(x, y, base) {
    this.commands   = base.commands;
    this.color      = base.color;
    this.x          = x;
    this.y          = y;

    this._x = x;
    this._y = y;
    this.dir = 0;
    this.head = -1;
    this.performing = undefined;
}

Truck.prototype.update = function() {
    if(this.performing == undefined)
        this.decide();

    if(this.performing == "go") {
        if (parseInt(this.x * 10) == this._x * 10 && parseInt(this.y * 10) == this._y * 10) {
            this.x = this._x;
            this.y = this._y;
            this.finish();

        } else {
            var dx = this._x - this.x;
            var dy = this._y - this.y;

            var vx = 0;
            if (dx != 0) vx = dx / Math.abs(dx);

            var vy = 0;
            if (dy != 0) vy = dy / Math.abs(dy);

            this.x += vx * 0.05;
            this.y += vy * 0.05;
        }

    } else if(this.performing == 'left' || this.performing == 'right') {
        this.finish();
    }
};

Truck.prototype.decide = function() {
    var command = this.next();

    if(command == undefined)
        return;

    if(command.split('-')[0] == 'command') {
        this.performing = command.split('-')[1];

        if(this.performing == "go") {
            switch(this.dir) {
                case 0:
                    this._x += 1;
                    break;

                case 1:
                    this._y -= 1;
                    break;

                case 2:
                    this._x -= 1;
                    break;

                case 3:
                    this._y += 1;
                    break;
            }
        } else if(this.performing == 'left') {
            this.dir = (this.dir + 1) % 4;
        } else if(this.performing == 'right') {
            this.dir = (this.dir - 1 + 4) % 4;
        }

    } else {
        var index = 0;
        for(var i = 0; i < hierarchy.length; i++)
            if(hierarchy[i].color == command.split('-')[1])
                index = i;

        this.performing = index;
    }
};

Truck.prototype.next = function() {
    if(this.head < this.commands.length)
        return this.commands[this.head++];
    else return undefined;
};

Truck.prototype.finish = function() {
    this.performing = undefined;
};

Truck.prototype.isSpawning = function() {
    if(!isNaN(parseInt(this.performing)))
        return this.performing;
    return false;
};