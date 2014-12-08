var colors = [
    '#779ECB', '#77DD77', '#C23B22', '#836953', '#FFB347'
];

/*
 * Used when a command in the nav is being dragged.
 */
var navCommandDrag = {
    start: function(event, ui) {
        ui.helper.addClass('no-transition');
    },

    stop: function(event, ui) {
        ui.helper.css('left', 0);
        ui.helper.css('top', 0);
        ui.helper.removeClass('no-transition');
    }
};

/*
 * Actions of the context menu.
 */
var contextMenuActions = {
    'lock / unlock': function(index) {
        var element = $('.truck:eq(' + index + ')');

        if(element.attr('data-locked') == 'true') {
            element.attr('data-locked', 'false');
        } else {
            element.attr('data-locked', 'true');
        }

        // avoid inconsistencies.
        element.children('.truck-color').html('');
        if(element.attr('data-locked') == 'true')
            element.children('.truck-color').html('<img src="img/lock.png">');
    },

    'delete': function(index) {
        var element = $('.truck:eq(' + index + ')');
        var color = element.children('.truck-color').attr('data-color');

        $('.command').each(function() {
            if($(this).attr('data-id').split('-')[1] == color)
                $(this).animate({
                    width: '0px',
                    height: '0px',
                    margin: '+=11px'
                }, function () {
                    $(this).remove();
                });
        });

        element.parent().slideUp(function() {
            $(this).remove();

        });
    }
};

/*
 * Used when something has been dropped inside a command section.
 */
var truckCommandsDrop = {
    drop: function(event, ui) {
        if($(this).parent().attr('data-locked') == 'true')
            return;

        // check if it is a command.
        if(ui.draggable.hasClass('nav-command')) {
            /*
             * If this is a command, we add its properties to a image and the that image to our commands.
             */
            var img = $('<img>');
            img.attr('src', ui.draggable.attr('src'));
            img.attr('data-id', ui.draggable.attr('id'));
            img.addClass('command');
            $(this).append(img);

            // delete this command when user clicks the secondary button.
            img.bind('contextmenu', function() {
                $(this).remove();
                return false;
            });

        } else if(ui.draggable.hasClass('truck-color')) {
            /*
             * If this is a truck's color we add its properties to a image and then and this image to our commands.
             */
            var img = $('<img>');
            img.attr('src', 'img/blank-command.png');
            img.attr('data-id', 'truck-' + ui.draggable.attr('data-color'));
            img.addClass('command');
            img.css('width', '26px');
            img.css('height', '26px');
            img.css('background-color', ui.draggable.attr('data-color'));
            img.css('border-radius', '50px');
            img.css('margin', '3px 2px 1px 2px');
            $(this).append(img);

            // delete this command when user clicks the secondary button.
            img.bind('contextmenu', function() {
                $(this).remove();
                return false;
            });
        }
    }
};

/*
 * Used when something has been dropped inside a command section.
 */
var truckColorDrag = {
    start: function(event, ui) {
        ui.helper.addClass('no-transition');
    },

    stop: function(event, ui) {
        ui.helper.css('left', 0);
        ui.helper.css('top', 0);
        ui.helper.removeClass('no-transition');
    }
};

/*
 * add a truck to the final of the hierarchy.
 */
function addTruck(color, byDefault) {
    // create DOM elements.
    var container       = $('<div class="container">');
    var truck           = $('<table class="truck">');
    var truckColor      = $('<td class="truck-color">');
    var truckCommands   = $('<td class="truck-commands">');

    // modify truck's color
    truckColor.css('background-color', color);
    truckColor.attr('data-color', color);

    // append children to the truck.
    truck.append(truckColor);
    truck.append(truckCommands);

    // add events to truck's commands.
    truckCommands.droppable(truckCommandsDrop);
    truckCommands.sortable();
    truckCommands.click(function() {
        truckCommandsClick($(this));
    });

    // add events to truck's color.
    truckColor.on('contextmenu', showContextMenu);
    truckColor.draggable(truckColorDrag);

    // add color change event only if is not a default truck.
    if(byDefault)   truck.attr('data-default', 'true');
    else            truckColor.click(truckColorClick);

    // add to container and hide.
    container.append(truck);
    container.hide();

    $('#trucks').append(container);
    container.slideDown();

    return truck;
}

/*
 * When the user clicks in the command section of a truck it checks if there is a
 * selected command, from the command nav, if so, we add it to the list.
 */
function truckCommandsClick(target) {
    if(target.parent().attr('data-locked') == 'true')
        return;

    $('.nav-command').each(function() {
        if($(this).hasClass('selected')) {
            var img = $('<img>');
            img.attr('src', $(this).attr('src'));
            img.attr('data-id', $(this).attr('id'));

            target.append(img);

            // delete this command when user clicks the secondary button.
            img.bind('contextmenu', function() {
                $(this).remove();
                return false;
            });
        }
    });
}

function truckColorClick() {
    var prevColor = $(this).attr('data-color');
    var color = getUnusedColor();
    if(color == false) return;

    $('.command').each(function() {
        if($(this).attr('data-id').split('-')[1] == prevColor) {
            $(this).attr('data-id', 'truck-' + color);
            $(this).css('background-color', color);
        }
    });

    $(this).css('background-color', color);
    $(this).attr('data-color', color);
}

function getUnusedColor() {
    var available = colors.slice();

    $('.truck-color').each(function() {
        var color = $(this).attr('data-color');
        var index = available.indexOf(color);
        available.splice(index, 1);
    });

    if(available.length > 0)
        return available[Math.floor(Math.random() * available.length)];
    else
        return false;
}

function showContextMenu(event) {
    var color   = event.currentTarget.attributes['data-color'].value;
    var pos     = event.clientY;
    var index   = -1;
    var dom;

    // find the element clicked.
    var found = false;
    $('.truck').each(function() {
        if(! found) {
            index++;
            if($(this).children('.truck-color').attr('data-color') == color) {
                dom = $(this);
                found = true;
            }
        }
    });

    // something really weird just happened.
    if(dom == undefined) return false;

    // hide delete button if it is a default truck.
    if(dom.attr('data-default') == 'true')
        $('#context-delete').css('display', 'none');
    else
        $('#context-delete').css('display', 'block');

    $('#context').attr('data-index', index).css('top', pos).slideDown(200);
    return false;
}

/*
 * Hierarchy initializer.
 */
function initHierarchy() {
    $('#context').click(function(e) {
        e.stopPropagation();
    });

    $('#context > a').click(function() {
        if($(this).text() in contextMenuActions)
            contextMenuActions[$(this).text()](parseInt($(this).parent().attr('data-index')));

        $('#context').slideUp();
    });

    // get trucks list height.
    var trucksHeight = window.innerHeight;
    $('#hierarchy > h1').each(function() {
        trucksHeight -= $(this).outerHeight();
    });
    trucksHeight -= $('#play-button').outerHeight() + $('#nav-commands').outerHeight() + $('#plus-button').outerHeight() + 10;
    $('#trucks').empty().height(trucksHeight);

    addTruck(colors[0], true);

    $('.nav-command')
        .draggable(navCommandDrag)
        .click(function() {
            var command = $(this);

            $('.nav-command').each(function() {
                if($(this).attr('src') != command.attr('src'))
                    $(this).removeClass('selected');
            });

            $(this).toggleClass('selected');
        });

    $('#plus-button').unbind().click(function() {
        var color = getUnusedColor();
        if(color != false)
            addTruck(color, false);
    });

    $('#save-button').unbind().click(function() {
        localStorage.setItem('copihue-saveSpace', JSON.stringify(getTrucksAndCommands()));
    });

    $('#play-button').unbind().click(function() {
        if(stop)
            start(getTrucksAndCommands());
        else
            finish();

        $(this).removeClass('stop');
        if(!stop) $(this).addClass('stop');
    });

    $('#back-button').click(function() {
        $('#game-page').fadeOut();
        $('#hierarchy').removeClass('initialize');
        stop = true;

        $('#display-container > div').each(function() {
            $(this).fadeOut();
        });

        closeCanvas();
    });
}

function getTrucksAndCommands() {
    var data = [];

    $('.truck').each(function() {
        var truck = {};
        var color = $(this).children('.truck-color').attr('data-color');
        var commands = [];

        $(this).children('.truck-commands').children('img').each(function() {
            commands.push($(this).attr('data-id'));
        });

        truck.color = color;
        truck.commands = commands;

        data.push(truck);
    });

    return data;
}

function displayText(array, time, callback) {
    if(array.constructor !== Array)
        console.error("displayText: argument is not an array");

    var display = $('<div class="text-display">');
    var back = $('<div class="display-back">');
    display.append(back);

    for(var i = 0; i < array.length; i+= 2) {
        var text = array[i];
        var size = array[i + 1];

        var div = $('<div style="font-size: ' + size + 'px">');
        div.text(text);
        display.append(div);
    }

    $('#display-container').append(display);
    display.css("margin-top", - display.outerHeight() / 2);

    setTimeout(function() {
        display.animate({
            opacity: 0
        }, function() {
            $(this).remove();
        });
        if(callback != undefined)
            callback();
    }, time);
}

/*
 * Takes in a given hierarchy.
 */
function take(_hierarchy) {
    for(var i = 0; i < _hierarchy.length; i++) {
        // find the truck definition if it exists.
        var found = false;
        $('.truck').each(function() {
            if($(this).children('.truck-color').attr('data-color') == _hierarchy[i].color) {
                truckCommands = $(this).children('.truck-commands');
                truckCommands.empty();
                found = true;
            }
        });

        // if the truck is not defined, we add it to the hierarchy.
        if(!found) {
            var truck = addTruck(_hierarchy[i].color, false);
            var truckCommands = truck.children('.truck-commands');
        }

        for(var j = 0; j < _hierarchy[i].commands.length; j++) {
            var prefix = _hierarchy[i].commands[j].split('-')[0];
            var command = _hierarchy[i].commands[j].split('-')[1];

            if(prefix == 'command') {
                /*
                 * If this is a command, we add its properties to a image and the that image to our commands.
                 */
                var img = $('<img>');
                img.attr('src', 'img/' + command + ".png");
                img.attr('data-id', _hierarchy[i].commands[j]);
                img.addClass('command');
                truckCommands.append(img);

                // delete this command when user clicks the secondary button.
                img.bind('contextmenu', function() {
                    $(this).remove();
                    return false;
                });

            } else if(prefix == 'truck') {
                /*
                 * If this is a truck's color we add its properties to a image and then and this image to our commands.
                 */
                var img = $('<img>');
                img.attr('src', 'img/blank-command.png');
                img.attr('data-id', _hierarchy[i].commands[j]);
                img.addClass('command');
                img.css('width', '26px');
                img.css('height', '26px');
                img.css('background-color', command);
                img.css('border-radius', '50px');
                img.css('margin', '3px 2px 1px 2px');
                truckCommands.append(img);

                // delete this command when user clicks the secondary button.
                img.bind('contextmenu', function() {
                    $(this).remove();
                    return false;
                });
            }
        }
    }
}