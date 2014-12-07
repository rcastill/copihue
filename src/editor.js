function debugMatrix(matrix) {
    for(var y = 0; y < matrix[0].length; y++) {
        var list = [];
        for(var x = 0; x < matrix.length; x++)
            list.push(matrix[x][y]);

        console.log(list);
    }
}

function detectRoadPieces(matrix) {
    var width   = matrix.length;
    var height  = matrix[0].length;

    var result = [];
    for(var x = 0; x < width; x++) {
        var dm = [];
        for(var y = 0; y < height; y++)
            dm.push("  ");
        result.push(dm);
    }

    for(var x = 0; x < width; x++) {
        for(var y = 0; y < height; y++) {
            if(matrix[x][y] === 0)
                continue;

            var bottom  = false;
            var right   = false;
            var left    = false;
            var top     = false;

            if(x > 0 && matrix[x - 1][y] == 1)          left    = true;
            if(x < width - 2 && matrix[x + 1][y] == 1)  right   = true;
            if(y > 0 && matrix[x][y - 1] == 1)          top     = true;
            if(y < height - 2 && matrix[x][y + 1])      bottom  = true;

            if(bottom && top && left && right)
                result[x][y] = 'II';
            else {
                if(left && top && bottom)           result[x][y] = 'LL';
                else if(right && bottom && left)    result[x][y] = 'DD';
                else if(top && bottom && right)     result[x][y] = 'RR';
                else if(right && top && left)       result[x][y] = 'TT';
                else {
                    if(left && right)       result[x][y] = 'HH';
                    else if(top && bottom)  result[x][y] = 'VV';
                    else {
                        if(top && left)             result[x][y] = 'TL';
                        else if(top && right)       result[x][y] = 'TR';
                        else if(bottom && left)     result[x][y] = 'BL';
                        else if(bottom && right)    result[x][y] = 'BR';
                        else {
                            if(left)        result[x][y] = 'SR';
                            else if(right)  result[x][y] = 'SL';
                            else if(bottom) result[x][y] = 'ST';
                            else if(top)    result[x][y] = 'SB';
                        }
                    }
                }
            }
        }
    }

    return result;
}