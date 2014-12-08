(function($) {
    $.fn.loadLevel = function(images, callback) {
        var height  = parseInt(this.attr("data-height"));
        var width   = parseInt(this.attr("data-width"));
        var id      = parseInt(this.attr('data-level'));
        var me      = this;

        $.ajax({
            dataType: "json",
            url: "http://104.131.173.250/koding/glevel.php?id=" + id,
            type: 'GET',
            success: function(data) {
                me.data("level", data);
                $.drawOnCanvas(me, images, data.data, width, height, callback);
            },

            error: function() {
                console.log("Sorry!, ajax error :(");
            }
        });
        return this;
    };

    $.drawOnCanvas = function(target, images, level, width, height, callback) {
        var levelHeight = parseInt(level.dim.y) + 2;
        var levelWidth  = parseInt(level.dim.x) + 2;
        var map         = level.map;

        var canvas  = document.createElement('canvas');
        var context = canvas.getContext("2d");

        canvas.height = height;
        canvas.width  = width;

        var tileSize = parseInt((width - 20) / levelWidth);
        if(parseInt((height - 20) / levelHeight) < tileSize)
            tileSize = parseInt((height - 20) / levelHeight);

        var offsetLeft = (width - levelWidth * tileSize) / 2;
        var offsetTop = (height - levelHeight * tileSize) / 2;

        context.fillStyle = "#604B3E";
        context.fillRect(0, 0, width, height);

        var matrix = $.genMatrix(levelWidth, levelHeight);

        for(var key in map) {
            var pos     = byteToPos(key);

            pos.x += 1;
            pos.y += 1;

            matrix[pos.x][pos.y].t = images[map[key].t];
            matrix[pos.x][pos.y].b = map[key].b;
            matrix[pos.x][pos.y].m = map[key].m;
        }

        var deathEnds = [];

        for(var x = 0; x < levelWidth; x++)
            for(var y = 0; y < levelHeight; y++) {
                var tile = matrix[x][y];
                context.drawImage(tile.t, offsetLeft + x * tileSize, offsetTop + y * tileSize,
                    tileSize, tileSize);

                if(tile.b != undefined) {
                    context.drawImage(images["button-" + tile.b.c], offsetLeft + x * tileSize, offsetTop + y * tileSize,
                          tileSize, tileSize);

                    for(var i = 0; i < tile.b.d.length; i+=2) {
                        deathEnds.push(tile.b.d[i] + 1);
                        deathEnds.push(tile.b.d[i + 1] + 1);
                        deathEnds.push(tile.b.c);
                    }

                } else if(tile.m != undefined) {
                    context.drawImage(images["mark-" + tile.m], offsetLeft + x * tileSize, offsetTop + y * tileSize,
                        tileSize, tileSize);
                }
            }

        for(var j = 0; j < deathEnds.length; j+=3) {
            context.drawImage(images["deathend-" + deathEnds[j + 2]], offsetLeft + deathEnds[j] * tileSize,
                offsetTop + deathEnds[j + 1] * tileSize, tileSize, tileSize);
        }

        for(var t = 0; t < level.initial.length; t+=3) {
            context.drawImage(images["truck-" + colorNamesTable[level.initial[t+2]]],
                offsetLeft + (level.initial[t] + 1) * tileSize,
                offsetTop + (level.initial[t + 1] + 1) * tileSize, tileSize, tileSize);
        }

        target.append(canvas);

        if(callback != undefined)
            callback(target);
        matrix = undefined;
    };

    $.genMatrix = function(width, height) {
        var matrix = [];

        for(var x = 0; x < width; x++) {
            var subm = [];

            for(var y = 0; y < height; y++) {
                if(y == 0 && x == 0)                          subm.push({t: images['corner-1']});
                else if(y == 0 && x == width - 1)             subm.push({t: images['corner-2']});
                else if(y == height - 1 && x == width - 1)    subm.push({t: images['corner-3']});
                else if(y == height - 1 && x == 0)            subm.push({t: images['corner-4']});
                else                                          subm.push({t: images['tile']});
            }

            matrix.push(subm);
        }

        return matrix;
    };
}(jQuery));