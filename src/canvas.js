var TILE_SIZE = 75;

var levelHeight = 9;
var levelWidth  = 14;
var images      = {};
var signal      = false;
var stop        = true;

var viewOffsetLeft;
var viewOffsetTop;
var totalMarks;
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

var colorCodesTable = {
    'blue': '#779ECB',
    'red': '#C23B22',
    'green': '#77DD77',
    'brown': '#836953',
    'orange': '#FFB347'
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
    matrix[4][6].texture = images['road-vertical'];
    matrix[4][7].texture = images['road-corner-downleft'];
    matrix[3][7].texture = images['road-horizontal'];
    matrix[9][2].texture = images['road-corner-upleft'];
    matrix[9][6].texture = images['road-corner-downleft'];
    matrix[8][2].texture = images['road-horizontal'];
    matrix[8][6].texture = images['road-horizontal'];
    matrix[7][2].texture = images['road-stop-left'];
    matrix[7][6].texture = images['road-stop-left'];

    matrix[4][2].texture = images['road-stop-up'];
    matrix[2][7].texture = images['road-stop-left'];

    matrix[1][3].texture = images['tree-top'];
    matrix[1][4].texture = images['tree-vertical-middle'];
    matrix[1][5].texture = images['tree-bottom'];

    matrix[12][3].texture = images['tree-top'];
    matrix[12][4].texture = images['tree-vertical-middle'];
    matrix[12][5].texture = images['tree-bottom'];

    matrix[8][3].texture = images['tree-solo-1'];
    matrix[8][5].texture = images['tree-solo-2'];
    matrix[3][6].texture = images['tree-solo-1'];

    matrix[3][1].texture = images['tree-left'];
    matrix[4][1].texture = images['tree-horizontal-middle'];
    matrix[5][1].texture = images['tree-right'];

    matrix[5][5].texture = images['lake-top'];
    matrix[5][6].texture = images['lake-bottom'];

    matrix[7][6].setUpperColor('blue');
    matrix[7][2].setUpperColor('red');
    matrix[2][7].setUpperColor('brown');

    totalMarks = 0;
    for(var x = 0; x < levelWidth; x++) {
        for(var y = 0; y < levelHeight; y++) {
            var sections = matrix[x][y].texture.src.split('/');
            var filename = sections[sections.length - 1];
            var firstSection = filename.split('-')[0];

            if(firstSection == 'road') {
                matrix[x][y].street = true;
            }

            if(matrix[x][y].hasUpperColor())
                totalMarks++;
        }
    }

    $('#container').append(canvas);

    finish();
    mainLoop();
}

function loadImages() {
    var imagesUrls = [
        // ground tiles.
        'corner-1', 'corner-2', 'corner-3', 'corner-4', 'tile',

        // trucks.
        'truck-blue', 'truck-red', 'truck-green', 'truck-brown', 'truck-orange',

        // trees.
        'tree-top', 'tree-vertical-middle', 'tree-bottom', 'tree-solo-1', 'tree-solo-2', 'tree-right', 'tree-left',
        'tree-horizontal-middle',

        // decoration.
        'pit', 'lake-top', 'lake-bottom',

        // spots.
        'spot-blue', 'spot-red', 'spot-orange', 'spot-brown', 'spot-green',
        'spot-blue-marked', 'spot-red-marked', 'spot-green-marked', 'spot-brown-marked', 'spot-orange-marked',

        // roads.
        'road-vertical', 'road-horizontal', 'road-inter', 'road-lefty', 'road-righty', 'road-downy', 'road-upty',
        'road-corner-downleft', 'road-corner-downright', 'road-corner-upright', 'road-corner-upleft', 'road-stop-up',
        'road-stop-down', 'road-stop-right', 'road-stop-left',

        // truck addons.
        'signal-truck', 'shadow-0', 'shadow-1', 'shadow-2',
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
    context.fillStyle = '#604B3E';
    context.fillRect(0, 0, width, height);
}

function render() {
    clearScreen();

    for(var x = 0; x < levelWidth; x++)
        for(var y = 0; y < levelHeight; y++) {
            var tile = matrix[x][y];
            var _x    = viewOffsetLeft + x * TILE_SIZE;
            var _y    = viewOffsetTop + y * TILE_SIZE;

            context.drawImage(tile.texture, _x, _y, TILE_SIZE, TILE_SIZE);

            if(tile.marked !== false)
                context.drawImage(images['spot-' + tile.marked + '-marked'], _x, _y, TILE_SIZE, TILE_SIZE);
            else if(tile.hasUpperColor())
                context.drawImage(images['spot-' + tile.upperColor], _x, _y, TILE_SIZE, TILE_SIZE);
        }

    for(var i = 0; i < trucks.length; i++) {
        var truck = trucks[i];
        var angle = - truck.dir * Math.PI / 2;
        var x     = viewOffsetLeft + truck.x * TILE_SIZE;
        var y     = viewOffsetTop  + truck.y * TILE_SIZE;

        context.save();
        context.translate(x, y);

        // fix position when truck is rotated.
        if(truck.dir == 2)      context.translate(TILE_SIZE, TILE_SIZE);
        else if(truck.dir == 1) context.translate(0, TILE_SIZE);
        else if(truck.dir == 3) context.translate(TILE_SIZE, 0);

        // draws shadow.
        if(truck.dir == 0)
            context.drawImage(images['shadow-0'], -10, 2, 78, 35);
        else if(truck.dir == 1)
            context.drawImage(images['shadow-1'], 0, -90, 60, 83);
        else if(truck.dir == 2)
            context.drawImage(images['shadow-2'], -75, -75, 68, 44);

        // rotate the context in order to draw the image.
        context.rotate(angle);
        context.drawImage(images['truck-' + colorNamesTable[truck.color]], 0, 0, TILE_SIZE, TILE_SIZE);

        // draw signal if this truck has one.
        if(signal === i)
            context.drawImage(images['signal-truck'], 30, 22);
        context.restore();
    }
}

function update() {
    var newTrucks = [];

    for(var i = 0; i < trucks.length; i++) {
        var truck = trucks[i];

        if(signal === false || i == signal) {
            truck.update();

            if(truck.isSpawning() !== false) {
                var index = truck.isSpawning();
                newTrucks.push(new Truck(truck._x, truck._y, hierarchy[index]));
                truck.finish();
            }

            if(truck.hasSignal()) {
                signal = signal === i? false : i;
                truck.finish();
            }
        }
    }

    for(var j = 0; j < newTrucks.length; j++)
        trucks.push(newTrucks[j]);

    var markCount = 0;
    for(var x = 0; x < levelWidth; x++) {
        for(var y = 0; y < levelHeight; y++) {
            var tile = matrix[x][y];
            if(tile.marked !== false && tile.hasUpperColor() && tile.marked == tile.upperColor)
                markCount++;
        }
    }

    if(totalMarks == markCount)
        win();
}

function mainLoop() {
    requestAnimationFrame(mainLoop);
    if(!stop) update();
    render();
}

/*
 * Resets and finish all states in the game,
 */
function finish() {
    hierarchy = undefined;
    trucks    = [];
    signal    = false;
    stop      = true;

    // add the initial trucks.
    for(var i = 0; i < initial.length; i += 3)
        trucks.push(new Truck(initial[i], initial[i + 1], {
            color: initial[i + 2],
            commands: []
        }));

    // unmarks every tile.
    for(var x = 0; x < levelWidth; x++)
        for(var y = 0; y < levelHeight; y++)
            matrix[x][y].unMark();
}

function start(_hierarchy) {
    hierarchy = _hierarchy;

    for(var i = 0; i < trucks.length; i++)
        for(var j = 0; j < hierarchy.length; j++)
            if(hierarchy[j].color == trucks[i].color)
                trucks[i].commands = hierarchy[j].commands;

    stop = false;
}

function lose() {

}

function win() {
    alert("You won!");
    $('#play-button').trigger('click');
}

/*
 * Tile Object.
 */
function Tile(texture) {
    this.texture = texture;
    this.marked  = false;
}

Tile.prototype.setUpperColor = function(color) {
    this.upperColor = color;
};

Tile.prototype.hasUpperColor = function() {
    if(this.upperColor != undefined)
        return true;
};

Tile.prototype.isStreet = function() {
    if(this.street != undefined)
        return this.street;
    return false;
};

Tile.prototype.mark = function(color) {
    this.marked = color;
};

Tile.prototype.unMark = function() {
    this.marked = false;
};

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
        var dx = this._x - this.x;
        var dy = this._y - this.y;

        var vx = 0;
        if (dx != 0) vx = dx / Math.abs(dx);

        var vy = 0;
        if (dy != 0) vy = dy / Math.abs(dy);

        this.x += vx * 0.05;
        this.y += vy * 0.05;

        if (parseInt(this.x * 10) == this._x * 10 && parseInt(this.y * 10) == this._y * 10) {
            this.x = this._x;
            this.y = this._y;
            this.finish();
        }

    } else if(this.performing == 'left') {
        this.dir = (this.dir + 1) % 4;
        this.finish();

    } else if(this.performing == 'right') {
        this.dir = (this.dir - 1 + 4) % 4;
        this.finish();

    } else if(this.performing == 'mark') {
        matrix[this._x][this._y].mark(colorNamesTable[this.color]);
        this.finish();
    }
};

Truck.prototype.decide = function() {
    var command = this.next();

    if(command == undefined)
        return;

    if(command.split('-')[0] == 'command') {
        this.performing = command.split('-')[1];
        var previousX = this._x;
        var previousY = this._y;

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

            if(this._x < 0 || this._x > levelWidth - 1) {
                this._x = previousX;
                this.finish();
                lose();
            }

            if(this._y < 0 || this._y > levelHeight - 1) {
                this._y = previousY;
                this.finish();
                lose();
            }

            if(!matrix[this._x][this._y].isStreet()) {
                this._x = previousX;
                this._y = previousY;
                this.finish();
                lose();
            }
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

Truck.prototype.hasSignal = function() {
    return this.performing == 'signal';
};