var SMOKE_FREQUENCY = 10;
var PARTICLE_LIFE   = 30;
var TILE_SIZE       = 75;
var SMOKE_SIZE      = 20;

var particles   = [];
var buttons     = {};
var signal      = false;
var timer       = 0;
var stop        = true;
var lost        = false;
var won         = false;

var viewOffsetLeft;
var viewOffsetTop;
var levelHeight;
var levelWidth;
var totalMarks;
var hierarchy;
var context;
var initial;
var canvas;
var height;
var matrix;
var trucks;
var daemon;
var width;

function initGame(levelData) {
    // save level data.
    levelHeight = parseInt(levelData.dim.y) + 2;
    levelWidth  = parseInt(levelData.dim.x) + 2;
    initial     = levelData['initial'];

    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');

    canvas.id = "game-canvas";

    width = window.innerWidth - 300;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    viewOffsetLeft = (width - levelWidth * TILE_SIZE) / 2;
    viewOffsetTop  = (height - levelHeight * TILE_SIZE) / 2;

    totalMarks  = 0;
    particles   = [];
    buttons     = {};
    daemon      = true;
    signal      = false;
    timer       = 0;
    stop        = true;
    lost        = false;
    won         = false;

    genMatrix();
    loadMap(levelData['map']);

    // obtains every mark and counts then.
    // sets every connections needed.
    for(var x = 0; x < levelWidth; x++) {
        for(var y = 0; y < levelHeight; y++) {
            // DEBUG: detect roads.
            var sections     = matrix[x][y].texture.src.split('/');
            var filename     = sections[sections.length - 1];
            var firstSection = filename.split('-')[0];

            if(firstSection == 'road') {
                matrix[x][y].street = true;
            }

            // counts the mark.
            if(matrix[x][y].hasUpperColor())
                totalMarks++;

            // set connections
            if(matrix[x][y].hasButton()) {
                for(var i = 0; i < matrix[x][y].connections.length; i++) {
                    matrix[x][y].connections[i].connected = matrix[x][y].button;
                }
            }
        }
    }

    $('#container').append(canvas);

    finish();
    mainLoop();
}

function loadMap(map) {
    for(var key in map) {
        var button  = map[key].b;
        var mark    = map[key].m;
        var pos     = byteToPos(key);
        var tex     = map[key].t;

        pos.x += 1;
        pos.y += 1;

        matrix[pos.x][pos.y].texture = images[tex];

        if(button != undefined) {
            var connections = [];
            for(var i = 0; i < button.d.length; i+=2)
                connections.push(matrix[button.d[i] + 1][button.d[i+1] + 1]);
            matrix[pos.x][pos.y].setButton(button.c, connections);
        }

        if(mark != undefined) {
            matrix[pos.x ][pos.y].setUpperColor(mark);
        }
    }
}

function getConnectionArray(connections) {
    var positions = [];
    for(var i = 0; i < connections.length; i++) {
        var pos = findTilePos(connections[i]);
        positions.push(pos.x);
        positions.push(pos.y);
    }
    return positions;
}

function findTilePos(tile) {
    for(var x = 0; x < levelWidth; x++) {
        for(var y = 0; y < levelHeight; y++) {
            if(matrix[x][y] == tile)
                return {x: x, y: y};
        }
    }
}

function genMatrix() {
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

            _x += Math.sin(timer / 10) * 1.25;

            context.drawImage(tile.texture, _x, _y, TILE_SIZE, TILE_SIZE);

            // draw mark if needed.
            if(tile.marked !== false)
                context.drawImage(images['mark-' + tile.marked + '-marked'], _x, _y, TILE_SIZE, TILE_SIZE);
            else if(tile.hasUpperColor())
                context.drawImage(images['mark-' + tile.upperColor], _x, _y, TILE_SIZE, TILE_SIZE);

            // draw button if it has one.
            if(tile.hasButton())
                context.drawImage(images['button-' + tile.button], _x, _y, TILE_SIZE, TILE_SIZE);

            if(tile.hasConnection()) {
                if(!buttons[tile.connected].isButtonPressed())
                    context.drawImage(images['deathend-' + tile.connected], _x, _y, TILE_SIZE, TILE_SIZE);
                else
                    context.drawImage(images['deathend-' + tile.connected + "-pass"], _x, _y, TILE_SIZE, TILE_SIZE);
            }
        }

    // draw particles.
    for(var k = particles.length - 1; k > -1; k--) {
        var particle = particles[k];
        var factor   = (2 - particle.l / PARTICLE_LIFE);
        var px       = viewOffsetLeft + particle.x * TILE_SIZE;
        var py       = viewOffsetTop + particle.y * TILE_SIZE;

        context.globalAlpha = particle.l / PARTICLE_LIFE;
        context.drawImage(particle.t, px - particle.w * factor / 2, py - particle.h * factor / 2, particle.w * factor, particle.h * factor);
    }
    context.globalAlpha = 1;

    // draw trucks.
    for(var i = trucks.length - 1; i > -1; i--) {
        var truck = trucks[i];
        var angle = - truck.dir * Math.PI / 2;
        var x     = viewOffsetLeft + truck.x * TILE_SIZE;
        var y     = viewOffsetTop  + truck.y * TILE_SIZE;

        x += Math.sin(timer / 10) * 1.25;

        context.save();
        context.translate(x, y);

        // fix position when truck is rotated.
        if(truck.dir == 2)      context.translate(TILE_SIZE, TILE_SIZE);
        else if(truck.dir == 1) context.translate(0, TILE_SIZE);
        else if(truck.dir == 3) context.translate(TILE_SIZE, 0);

        // draws shadow.
        if(truck.dir == 0)
            context.drawImage(images['shadow-0'], -9, 4, 78, 35);
        else if(truck.dir == 1)
            context.drawImage(images['shadow-1'], 7, -76, 50, 68);
        else if(truck.dir == 2)
            context.drawImage(images['shadow-2'], -75, -75, 68, 44);
        else if(truck.dir == 3)
            context.drawImage(images['shadow-3'], -75, -10, 46, 72);

        // rotate the context in order to draw the image.
        context.rotate(angle);
        context.drawImage(images['truck-' + colorNamesTable[truck.color]], 0, 0, TILE_SIZE, TILE_SIZE);

        // draw signal if this truck has one.
        if(signal === i) {
            context.globalAlpha = Math.abs(Math.sin(truck.signalTime++ / 10) * 0.5) + 0.5;
            context.drawImage(images['signal-truck'], 30, 22);
            context.globalAlpha = 1;
        }
        context.restore();
    }
}

function update() {
    var i = 0;
    var length = trucks.length;
    while(i < length) {
        var truck = trucks[i];

        // update only if signal is off or the signal is his.
        if(signal === false || i == signal) {
            truck.update();

            // check truck position.
            var onTile = matrix[parseInt(truck.x)][parseInt(truck.y)];
            if(truck.lastTile != onTile && onTile.hasButton())
                matrix[parseInt(truck.x)][parseInt(truck.y)].toggleButton();
            truck.lastTile = onTile;

            // check if the truck spawned.
            if(truck.isSpawning() !== false) {
                var newTruck = new Truck(truck._x, truck._y, hierarchy[truck.isSpawning()]);
                newTruck.dir = truck.dir;
                trucks.push(newTruck);
                length++;
                truck.finish();
            }

            // check if the truck has a signal.
            if(truck.hasSignal()) {
                signal = signal === i? false : i;
                truck.finish();
            }
        }

        i++;
    }

    // update particles.
    for(var k = particles.length - 1; k > -1; k--) {
        var particle = particles[k];
        particle.update();

        if(particle.l <= 0)
            particles.splice(k, 1);
    }
}

function mainLoop() {
    if(daemon)
        requestAnimationFrame(mainLoop);

    if(!stop) update();
    else {
        TILE_SIZE += Math.sin(timer / 20) * 0.025;
        viewOffsetLeft = (width - levelWidth * TILE_SIZE) / 2;
        viewOffsetTop  = (height - levelHeight * TILE_SIZE) / 2;
    }

    render();
    timer++;
}

/*
 * Resets and finish all states in the game,
 */
function finish() {
    hierarchy = undefined;
    trucks    = [];
    signal    = false;
    stop      = true;
    lost      = false;
    won       = false;

    // add the initial trucks.
    for(var i = 0; i < initial.length; i += 3)
        trucks.push(new Truck(initial[i] + 1, initial[i + 1] + 1, {
            color: initial[i + 2],
            commands: []
        }));

    // unmarks every tile and de-press the button.
    for(var x = 0; x < levelWidth; x++)
        for(var y = 0; y < levelHeight; y++) {
            matrix[x][y].unMark();
            matrix[x][y].pressed = false;
        }

    particles = [];
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
    if(won || lost) return;

    displayText([
        "Try again!", 80
    ], 2000, function() {
        $('#play-button').trigger('click');
    });

    lost = true;
}

function win() {
    if(won) return;

    displayText([
        "You won!", 80,
        "Congratulations. Please go back and try another level :)", 40
    ], 3000, function() {
        $('#play-button').trigger('click');
    });

    won = true;
}

function closeCanvas() {
    finish();
    daemon = false;
}

function debugMap() {
    var map = {};
    for(var x = 0; x < levelWidth; x++) {
        for(var y = 0; y < levelHeight; y++) {
            if(matrix[x][y]) {
                var sections = matrix[x][y].texture.src.split('/');
                var filename = sections[sections.length - 1];
                var firstSection = filename.split('-')[0];

                if(firstSection != 'corner' && filename != "tile.png") {
                    var index = posToByte(x, y);
                    console.log(x, y, index);

                    map[index] = {
                        t: filename.replace(".png", "")
                    };

                    if(matrix[x][y].hasButton())
                        map[index].b = {
                            "c": matrix[x][y].button,
                            "d": getConnectionArray(matrix[x][y].connections)
                        };

                    if(matrix[x][y].hasUpperColor())
                        map[index].m = matrix[x][y].upperColor;
                }
            }
        }
    }

    console.log(JSON.stringify(map));
}

/*
 * Tile Object.
 */
function Tile(texture) {
    this.texture     = texture;
    this.connections = undefined;
    this.connected   = undefined;
    this.pressed     = false;
    this.marked      = false;
    this.button      = false;
}

Tile.prototype.setUpperColor = function(color) {
    this.upperColor = color;
};

Tile.prototype.hasConnection = function() {
    return this.connected != undefined;
}

Tile.prototype.hasUpperColor = function() {
    return this.upperColor != undefined;
};

Tile.prototype.hasButton = function() {
    return this.button;
};

Tile.prototype.toggleButton = function() {
    this.pressed = !this.pressed;
};

Tile.prototype.isButtonPressed = function() {
    return this.pressed;
};

Tile.prototype.setButton = function(color, connection) {
    if(connection.constructor !== Array)
        console.error("Tile.setButton: connection is not array.");

    this.connections = connection;
    this.button     = color;

    buttons[color] = this;
};

Tile.prototype.isStreet = function() {
    if(this.street != undefined)
        return this.street;
    return false;
};

Tile.prototype.mark = function(color) {
    this.marked = color;

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

    console.log(1);
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

    this.performing = undefined;
    this.signalTime = 0;
    this.smokeTimer = 0;
    this.lastTile   = undefined;
    this.head       = 0;
    this.dir        = 0;
    this._x         = x;
    this._y         = y;
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

        if(parseInt(this.x * 10) == this._x * 10 && parseInt(this.y * 10) == this._y * 10) {
            this.x = this._x;
            this.y = this._y;
            this.finish();
        }

        this.smokeTimer--;
        if(this.smokeTimer <= 0) {
            this.smokeTimer = SMOKE_FREQUENCY;
            particles.push(new Particle(images['smoke'], this.x + 0.5 * Math.abs(vy) + (this.dir == 2 ? 1 : 0),
                this.y + 0.5 * Math.abs(vx) + (this.dir == 1 ? 1 : 0), SMOKE_SIZE, SMOKE_SIZE, vx * 0.01, vy * 0.01));
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

    if(this._x < 0 || this._x > levelWidth - 1) {
        this.finish();
        lose();
    }

    if(this._y < 0 || this._y > levelHeight - 1) {
        this.finish();
        lose();
    }

    if(!matrix[this._x][this._y].isStreet()) {
        lose();
    }

    // check truck position.
    var onTile = matrix[parseInt(this.x)][parseInt(this.y)];
    if(this.performing === undefined && this.lastTile != onTile && onTile.hasButton())
        matrix[parseInt(this.x)][parseInt(this.y)].toggleButton();
    this.lastTile = onTile;

    // checks if the position the truck is standing on is a death end.
    if(this.performing === undefined && onTile.hasConnection())
        if(!buttons[onTile.connected].isButtonPressed())
            lose();
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

Truck.prototype.hasMarked = function() {
    return this.performing == 'mark';
};

/*
 Particles.
 */
function Particle(texture, x, y, w, h, vx, vy) {
    this.vx = vx;
    this.vy = vy;
    this.t  = texture;
    this.x  = x;
    this.y  = y;
    this.w  = w;
    this.h  = h;
    this.l  = PARTICLE_LIFE;
}

// update particle position.
Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.l--;
};
