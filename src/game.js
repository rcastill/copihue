var colors = [
    '#779ECB', '#77DD77', '#C23B22', '#836953', '#AEC6CF'
];

/*
 * add a truck to the final of the hierarchy.
 */
function addTruck(color, locked) {
    // create DOM elements.
    var truck = $('<div class="truck">');
    var truckColor = $('<div class="truck-color">');
    var truckCommands = $('<div class="truck-commands">');

    // modify truck's color
    truckColor.css('background-color', color);
    truckColor.attr('data-color', color);
    if(locked)
        truckColor.html('<img src="img/lock.png">');

    // append children to the truck.
    truck.append(truckColor);
    truck.append(truckCommands);

    // add events.
    truckCommands.droppable(truckCommandsDrop);
    truckCommands.sortable();
    truckCommands.click(function() {
        truckCommandsClick($(this));
    });

    $('#trucks').append(truck);
}

/*
 * When the user clicks in the command section of a truck it checks if there is a
 * selected command, from the command nav, if so, we add it to the list.
 */
function truckCommandsClick(target) {
    $('.nav-command').each(function() {
        if($(this).hasClass('selected')) {
            var img = $('<img>');
            img.attr('src', $(this).attr('src'));
            img.attr('data-id', $(this).attr('id'));

            target.append(img);
        }
    });
}

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
 * Used when something has been dropped inside a command section.
 */
var truckCommandsDrop = {
    drop: function(event, ui) {
        if(ui.draggable.hasClass('nav-command')) {
            var img = $('<img>');
            img.attr('src', ui.draggable.attr('src'));
            img.attr('data-id', ui.draggable.attr('id'));
            $(this).append(img);
        }
    }
};

$(document).ready(function() {
    $(document).disableSelection();
    addTruck(colors[0]);

    $('.nav-command').draggable(navCommandDrag);
    $('.nav-command').click(function() {
        var command = $(this);

        $('.nav-command').each(function() {
            if($(this).attr('src') != command.attr('src'))
                $(this).removeClass('selected');
        });

        $(this).toggleClass('selected');
    });

    $('#plus-button').click(function() {
        var available = colors.slice();

        $('.truck-color').each(function() {
            var color = $(this).attr('data-color');
            var index = available.indexOf(color);
            available.splice(index, 1);
        });

        if(available.length > 0)
            addTruck(available[Math.floor(Math.random() * available.length)], false);
    });
});