var GRID_DIMENSION = 75;


var images = {};
var mainloopID;
var editor;
var mpos = {x: 0, y: 0};
var bpos = {x: 0, y: 0};
var selected = null;
var shouldGrid = true;
var shouldSupport = true;
var data = {
    dim: {},
    map: {},
    initial: []
};

var settingButton;

var colorCodesTable = {
    'blue': '#779ECB',
    'red': '#C23B22',
    'green': '#77DD77',
    'brown': '#836953',
    'orange': '#FFB347'
};

var colorNamesTable = {
    '#779ECB': 'blue',
    '#C23B22': 'red',
    '#77DD77': 'green',
    '#836953': 'brown',
    '#FFB347': 'orange'
};

function debugMatrix(matrix) {
    for(var y = 0; y < matrix[0].length; y++) {
        var list = [];
        for(var x = 0; x < matrix.length; x++)
            list.push(matrix[x][y]);

        console.log(list);
    }
}

function scaleImages(factor) {
    factor = (factor == undefined) ? 1 : factor;

    var key;
    for (key in images) {
        images[key].width = images[key].naturalWidth * factor;
        images[key].height = images[key].naturalHeight * factor;
    }
}

function drawSelected() {
    if (selected == null) return;

    editor.context.drawImage(images[selected], bpos.x, bpos.y, GRID_DIMENSION, GRID_DIMENSION);
}

function renderMap() {
    var deathEnds = {};

    // pos, color
    var x, y, c;

    for (var key in data.map) {
        var pos = byteToPos(key);
        pos.x *= GRID_DIMENSION;
        pos.y *= GRID_DIMENSION;
        var blit = [];

        if (data.map[key].t != undefined)
            blit.push(images[data.map[key].t]);

        //if (data.map[key].b != undefined)
        //blit.push(images["button-" +  data.map[i][j].button]);

        if (data.map[key].m != undefined)
            blit.push(images["mark-" +  data.map[key].m]);

        else if (data.map[key].b != undefined) {
            blit.push(images["button-" + data.map[key].b.c]);
            deathEnds[data.map[key].b.c] = data.map[key].b.d;
        }

        for (var i = 0; i < blit.length; i++)
            editor.context.drawImage(blit[i], pos.x, pos.y, GRID_DIMENSION, GRID_DIMENSION);
    }

    for (var color in deathEnds) {
        for (var j = 0; j < deathEnds[color].length; j += 2) {
            x = deathEnds[color][j] * GRID_DIMENSION;
            y = deathEnds[color][j + 1] * GRID_DIMENSION;
            var image = images["deathend-" + color];
            editor.context.drawImage(image, x, y, GRID_DIMENSION, GRID_DIMENSION);
        }
    }

    for (var k = 0; k < data.initial.length; k += 3) {
        x = data.initial[k] * GRID_DIMENSION;
        y = data.initial[k+1] * GRID_DIMENSION;
        c = colorNamesTable[data.initial[k+2]];

        editor.context.drawImage(images["truck-" + c], x, y, GRID_DIMENSION, GRID_DIMENSION);
    }
}

function drawPositionSupport() {
    if (!shouldSupport) return;

    editor.context.globalAlpha = 0.1;
    editor.context.fillStyle = "#000000";

    var width = editor.canvas.width;
    var height = editor.canvas.height;

    var vx, vy;

    for (vx = 0; vx < width; vx += GRID_DIMENSION) if (vx != x) {
        editor.context.fillRect(vx, bpos.y, GRID_DIMENSION, GRID_DIMENSION);
    }

    for (vy = 0; vy < height; vy += GRID_DIMENSION)
        editor.context.fillRect(bpos.x, vy, GRID_DIMENSION, GRID_DIMENSION);

    editor.context.globalAlpha = 1;
}

function grid(color) {
    if (!shouldGrid) return;

    var w = editor.canvas.width;
    var h = editor.canvas.height;

    editor.context.strokeStyle = (color == undefined) ? 0 : color;
    editor.context.lineWidth = 1;

    for (x = 0; x < w; x += GRID_DIMENSION) {
        editor.context.beginPath();
        editor.context.moveTo(x, 0);
        editor.context.lineTo(x, h);
        editor.context.stroke();
    }

    for (y = 0; y < w; y += GRID_DIMENSION) {
        editor.context.beginPath();
        editor.context.moveTo(0, y);
        editor.context.lineTo(w, y);
        editor.context.stroke();
    }
}

function inspectorPos(pos) {
    var div = $("#pos");

    // Returns current pos
    if (pos == undefined) return div.html();

    // Set new pos
    div.html(pos);
}

function updateBlockPosition() {
    bpos.x = Math.floor(mpos.x / GRID_DIMENSION) * GRID_DIMENSION;
    bpos.y = Math.floor(mpos.y / GRID_DIMENSION) * GRID_DIMENSION;
}


function clear() {
    editor.context.fillStyle = "#91DE01";
    var width = editor.canvas.width;
    var height = editor.canvas.height;
    editor.context.clearRect(0, 0, width, height);
    editor.context.fillRect(0, 0, width, height);
}

function mainloop() {
    clear();
    updateBlockPosition();
    inspectorPos("(" + bpos.x / GRID_DIMENSION + ", " + bpos.y / GRID_DIMENSION + ")");
    grid("#333");
    renderMap();
    drawPositionSupport();
    drawSelected();
    mainloopID = requestAnimationFrame(mainloop);
}

function handleKeyDown(event) {
    console.log(event.keyCode);

    if (event.keyCode == 71) // g
        shouldGrid = !shouldGrid;

    else if (event.keyCode == 83) // s
        shouldSupport = !shouldSupport;
}


function handleMouseDown(event) {
    var button = event.which || event.button;
    var i = bpos.y / GRID_DIMENSION;
    var j = bpos.x / GRID_DIMENSION;
    var mapKey = posToByte(j, i);
    var key, value;

    // left
    if (button == 1 && selected != null) {
        if (selected.match("^deathend-*") != null) {
            var pos = byteToPos(settingButton);

            if (pos.x == j && pos.y == i) return;

            data.map[settingButton].b.d.push(j);
            data.map[settingButton].b.d.push(i);
            return;
        }

        if (selected.match("^truck-*") != null) {
            if (data.map[mapKey] == undefined ||
                data.map[mapKey].t == undefined ||
                data.map[mapKey].t.match("^road-*") == null) return;

            // Gathers color
            value = colorCodesTable[selected.split('-')[1]];

            var x, y;
            for (var k = 0; k < data.initial.length; k += 3) {
                x = data.initial[k];
                y = data.initial[k + 1];

                if (j == x && i == y) {
                    data.initial[k + 2] = value;
                    return;
                }
            }

            data.initial.push(j);
            data.initial.push(i);
            data.initial.push(value);
            return;
        }

        else if (selected.match("^mark-*") != null) {
            key = 'm';
            value = selected.split('-')[1];
        }

        else if (selected.match("^button-*") != null) {
            key = 'b';
            value = {
                c: selected.split('-')[1],
                d: []
            };

            settingButton = mapKey;
            selected = "deathend-" + value.c;
        }

        else {
            key = 't';
            value = selected;
        }

        if (data.map[mapKey] != undefined) {
            // If exists a mark, a button cannot exist
            if (key == 'm' && data.map[mapKey]['b'] != undefined)
                delete data.map[mapKey]['b'];

            // If exists a button, a mark cannot exist
            else if (key == 'b' && data.map[mapKey]['m'] != undefined)
                delete data.map[mapKey]['m'];

            // Marks and Buttons (and Trucks) can only be placed on road
            if (key == 'm' || key == 'b' && data.map[mapKey]['t'] != undefined)
                if (data.map[mapKey]['t'].match('^road-*') == null) return;

            // Assignment
            data.map[mapKey][key] = value;
        }

        else {
            if (key == 'm') return;

            // If button failed reset
            if (key == 'b') {
                selected = "button-" + value.c;
                return;
            }

            data.map[mapKey] = {};
            data.map[mapKey][key] = value;
        }
    }

    // right
    else if (button == 3) {
        if (selected.match("^deathend-*") != null) {
            selected = "button-" + data.map[settingButton].b.c;

            if (data.map[settingButton].b.d.length <= 0)
                delete data.map[settingButton];

            return;
        }

        for (var l = 0; l < data.initial.length; l += 3) {
            if (data.initial[l] == j && data.initial[l + 1] == i) {
                data.initial.splice(l, 3);
                return;
            }
        }

        if (data.map[mapKey] != undefined) {
            if (data.map[mapKey].m != undefined) {
                delete data.map[mapKey].m;
                return;
            }

            if (data.map[mapKey].b != undefined) {
                delete data.map[mapKey].b;
                return;
            }

            for (key in data.map) {
                if (key != mapKey && data.map[key].b != undefined) {
                    for (k = 0; k < data.map[key].b.d.length; k += 2) {
                        x = data.map[key].b.d[k];
                        y = data.map[key].b.d[k+1];

                        if (x == j && y == i) {
                            data.map[key].b.d.splice(k, 2);

                            if (data.map[key].b.d.length == 0)
                                delete data.map[key].b;

                            return;
                        }
                    }
                }

            }

            delete data.map[mapKey];
        }
    }
}

function updateMousePosition(event) {
    var rect = editor.canvas.getBoundingClientRect();
    mpos.x = event.clientX - rect.left;
    mpos.y = event.clientY - rect.top;
}

function initData() {

}

function setSelected(key) {
    if (selected != null)
        $("#" + selected).removeClass("selected");

    $("#" + key).addClass("selected");
    selected = key;
}

function loadImages() {
    var imagesUrls = [
        // trucks.
        'truck-blue', 'truck-red', 'truck-green', 'truck-brown', 'truck-orange',

        // trees.
        'tree-top', 'tree-vertical-middle', 'tree-bottom', 'tree-solo-1', 'tree-solo-2', 'tree-right', 'tree-left',
        'tree-horizontal-middle',

        // decoration.
        'pit', 'lake-top', 'lake-bottom',

        // marks.
        'mark-blue', 'mark-red', 'mark-orange', 'mark-brown', 'mark-green',

        // roads.
        'road-vertical', 'road-horizontal', 'road-inter', 'road-lefty', 'road-righty', 'road-downy', 'road-upty',
        'road-corner-downleft', 'road-corner-downright', 'road-corner-upright', 'road-corner-upleft', 'road-stop-up',
        'road-stop-down', 'road-stop-right', 'road-stop-left',

        //buttons
        "button-gray", "button-purple",

        // deathends
        "deathend-gray", "deathend-purple",

        // buildings
        "building-one-1", "building-one-2", "building-one-3", "building-one-4"
    ];

    for(var i = 0;i<imagesUrls.length;i++) {
        images[imagesUrls[i]] = new Image();
        images[imagesUrls[i]].src = "img/" + imagesUrls[i] + ".png";
    }
}

function init() {
    var canvas = document.getElementById("canvas");

    var context = canvas.getContext("2d");

    //canvas.width = window.innerWidth - 300;
    //canvas.height = window.innerHeight;

    canvas.width = data.dim.x * GRID_DIMENSION;
    canvas.height = data.dim.y * GRID_DIMENSION;

    // Center canvas
    $("#canvas").css("left", ((window.innerWidth - 300) / 2) - (canvas.width / 2))
        .css("top", ((window.innerHeight / 2) - (canvas.height / 2)));

    editor = {
        canvas: canvas,
        context: context
    };

    loadImages();

    // Disable context menu on canvas
    $('body').on('contextmenu', '#canvas', function(e) { return false; });

    /*
     Load images to inpector
     */
    $(window).load(function () {
        var key;
        for (key in images) {
            if (key.match("^deathend-*") != null) continue;

            var image = $(images[key]);
            image.addClass("asset-button");
            image.attr('id', key);
            $("#list").append(image);
            image.data('key', key);

            image.click(function() {
                setSelected($(this).data('key'));
            });
        }

        $("#editor").fadeIn(1000);
        $("#title").slideDown(600);
        $("#inspector-bar").addClass("inspector-animate");

        var inspHeight = window.innerHeight;
        inspHeight -= $('#title').outerHeight();
        $('#inspector').height(inspHeight - 60);

        /*
         Events
         */
        editor.canvas.addEventListener('mousemove', updateMousePosition, false);
        editor.canvas.addEventListener('mousedown', handleMouseDown, false);
        window.addEventListener('keydown', handleKeyDown);

        mainloop();
    });
}

$(document).ready(function () {
    while (true) {
        var dim = prompt("Insert map dimension. \ne.g. 16x9");
        if (dim != null) dim = dim.split("x");
        else continue;

        if (dim.length != 2 || (isNaN(dim[0]) || isNaN([1]))) {
            alert("Wrong input");
            continue;
        }

        if (4 <= dim[0] && 4 <= dim[1] && dim[0] <= 20 && dim[1] <= 20) {
            data.dim.x = dim[0];
            data.dim.y = dim[1];
            break;
        }

        else
            alert("Dimension parameters must be greater or equal than 4 and less or equal to 20");
    }
    init();

    $("#upload").click(function () {
        var mapData = {
            'data': JSON.stringify(data),
            'difficulty': $("#upload-difficulty").val(),
            'title': $("#upload-title").val()
        };

        $.ajax({
            url: 'upload.php',
            type: 'POST',
            dataType: 'text',
            data: mapData,

            success: function (data) {
                if (isNaN(data)) alert(data);

                // register
                else if (data == 1)
                    alert("Uploaded!");
            },

            error: function (data) {
                alert("Error!");
            }
        });
    });
});