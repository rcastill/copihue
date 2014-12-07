var images = {};

function loadImages() {
    var imagesUrls = [
        'corner-1', 'corner-2', 'corner-3', 'corner-4', 'tile',
        'truck-blue', 'truck-red', 'truck-green', 'truck-brown', 'truck-orange',
        'tree-top', 'tree-vertical-middle', 'tree-bottom', 'tree-solo-1', 'tree-solo-2', 'tree-right', 'tree-left',
        'tree-horizontal-middle',
        'pit', 'lake-top', 'lake-bottom',
        'building-one-1', 'building-one-2', 'building-one-3', 'building-one-4',
        'spot-blue', 'spot-red', 'spot-orange', 'spot-brown', 'spot-green',
        'spot-blue-marked', 'spot-red-marked', 'spot-green-marked', 'spot-brown-marked', 'spot-orange-marked',
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
    }
}

var level = {"dim": {"x": 14, "y": 8}, "map": {"17":{"t":"road-stop-left","m":"green"},"19":{"t":"road-stop-left"},"21":{"t":"road-stop-left","m":"red"},"33":{"t":"road-horizontal"},"34":{"t":"tree-solo-1"},"35":{"t":"road-horizontal"},"36":{"t":"tree-solo-2"},"37":{"t":"road-horizontal"},"48":{"t":"road-stop-up","m":"orange"},"49":{"t":"road-inter"},"50":{"t":"road-vertical"},"51":{"t":"road-inter"},"52":{"t":"road-vertical"},"53":{"t":"road-corner-downleft"},"65":{"t":"road-horizontal"},"66":{"t":"tree-solo-2"},"67":{"t":"road-horizontal"},"68":{"t":"lake-top"},"69":{"t":"lake-bottom"},"81":{"t":"road-stop-right","m":"green"},"83":{"t":"road-horizontal"},"84":{"t":"road-stop-up","m":"red"},"85":{"t":"road-vertical"},"86":{"t":"road-corner-downright"},"99":{"t":"road-horizontal"},"100":{"t":"tree-top"},"101":{"t":"tree-bottom"},"102":{"t":"road-horizontal"},"113":{"t":"building-one-1"},"114":{"t":"building-one-3"},"115":{"t":"road-downy","b":{"c":"gray","d":[4,3,4,5]}},"116":{"t":"road-vertical"},"117":{"t":"road-vertical"},"118":{"t":"road-upty"},"129":{"t":"building-one-2"},"130":{"t":"building-one-4"},"131":{"t":"road-horizontal"},"132":{"t":"tree-top"},"133":{"t":"tree-bottom"},"134":{"t":"road-horizontal"},"145":{"t":"road-stop-up","m":"green"},"146":{"t":"road-vertical"},"147":{"t":"road-inter"},"148":{"t":"road-vertical"},"149":{"t":"road-stop-down","m":"green"},"150":{"t":"road-stop-right","m":"blue"},"163":{"t":"road-stop-right","m":"orange"}}, "initial": [2, 4, "#779ECB"]};

(function($) {
    $.fn.loadLevel = function(images, levelID) {
        var height  = parseInt(this.attr("data-height"));
        var width   = parseInt(this.attr("data-width"));

        $.drawOnCanvas(this, images, level, width, height);
        return this;
    };

    $.drawOnCanvas = function(target, images, level, width, height) {
        var levelHeight = level.dim.y;
        var levelWidth  = level.dim.x;
        var map         = level.map;

        var canvas = document.createElement('canvas');
        var context = canvas.getContext("2d");

        canvas.height = height;
        canvas.width  = width;

        var tileSize = parseInt((width - 40) / levelWidth);
        var offsetLeft = (width - levelWidth * tileSize) / 2;
        var offsetTop = (height - levelHeight * tileSize) / 2;

        context.fillStyle = "#604B3E";
        context.fillRect(0, 0, width, height);

        for(var key in map) {
            var pos     = byteToPos(key);
            var button  = map[key].t;
            var mark    = map[key].t;
            var tex     = map[key].t;

            context.drawImage(images[])
        }

        target.append(canvas);
    }
}(jQuery));