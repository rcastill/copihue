var loadedImages = 0;
var images       = {};

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

function loadImages(callback) {
    var imagesUrls = [
        'corner-1', 'corner-2', 'corner-3', 'corner-4', 'tile',
        'truck-blue', 'truck-red', 'truck-green', 'truck-brown', 'truck-orange',
        'tree-top', 'tree-vertical-middle', 'tree-bottom', 'tree-solo-1', 'tree-solo-2', 'tree-right', 'tree-left',
        'tree-horizontal-middle',
        'pit', 'lake-top', 'lake-bottom',
        'building-one-1', 'building-one-2', 'building-one-3', 'building-one-4',
        'mark-blue', 'mark-red', 'mark-orange', 'mark-brown', 'mark-green',
        'mark-blue-marked', 'mark-red-marked', 'mark-green-marked', 'mark-brown-marked', 'mark-orange-marked',
        'road-vertical', 'road-horizontal', 'road-inter', 'road-lefty', 'road-righty', 'road-downy', 'road-upty',
        'road-corner-downleft', 'road-corner-downright', 'road-corner-upright', 'road-corner-upleft', 'road-stop-up',
        'road-stop-down', 'road-stop-right', 'road-stop-left',
        'signal-truck', 'shadow-0', 'shadow-1', 'shadow-2', 'shadow-3', 'smoke',
        'button-gray', 'deathend-gray', 'deathend-gray-pass',
        'button-purple', 'deathend-purple', 'deathend-purple-pass',
    ];

    for(var i = 0;i<imagesUrls.length;i++) {
        images[imagesUrls[i]] = new Image();
        images[imagesUrls[i]].src = "img/" + imagesUrls[i] + ".png";

        images[imagesUrls[i]].onload = function() {
            loadedImages++;
            if (loadedImages >= imagesUrls.length) {
                if(callback != undefined)
                    callback();
            }
        };
    }
}

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