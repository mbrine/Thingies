﻿// List of all usable test commands. This gets added on to by other modules for debugging purposes.
let utilCommands = {
    // Refresh the overlay
    "refresh":function (vars, message, tags, channel) {
        location.reload();
    },
}
// Convert hexadecimal color to RGB (No alpha)
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
// Convert hexadecimal color to RGBA
function hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255, 1];
    }
    throw new Error('Bad Hex');
}

// Return the left, top, width and height of a HTML element.
// Also the horizontal and vertical centers.
function getOffset(element, global = false) {
    const rect = element.getBoundingClientRect();
    if (!global) {
        return {
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            hcenter: (rect.right - rect.left) / 2 + rect.left + window.scrollX,
            vcenter: (rect.bottom - rect.top) / 2 + rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
        };
    }
    var _x = 0;
    var _y = 0;
    var el = element;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {
        left: _x,      
        top: _y,
        hcenter: (rect.right - rect.left) / 2 + _x,
        vcenter: (rect.bottom - rect.top) / 2 + _y,
        width: rect.width,
        height: rect.height,
};
}
// Returns a random (x,y) point within a HTML element.
function getRandPoint(element) {
    var r = getOffset(element);
    return {
        x: r.left + randomInRange(0, r.width),
        y: r.top + randomInRange(0, r.height)
    }
}
// Returns a random element in the provided array.
function randomInArray(array) {
    return array[Math.floor(array.length * Math.random())];
}
// Returns a random value between min and max.
function randomInRange(min, max) {
    return (((Math.random() * (max - min)) + min));
}
// Returns a vector that is perpendicular to the input vector.
function getPerpendicularVector(vector) {
    return {
        x: vector.y,
        y: -vector.x
    }
}
// Returns the magnitude of the input vector.
function magnitude(vector) {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}
// Returns the 
function normalize(vector) {
    var length = magnitude(vector);

    // Sanity check, if the length is 0 we just return a horizontal vector.
    if (length == 0)
        return { x: 1, y: 0 };

    return {
        x: vector.x / length,
        y: vector.y / length
    }
}
// Moves a float value from a to b by amount, clamped to b.
function moveTowardsFloat(a, b, amount) {
    if (b < a) {
        amount = -amount;
        return Math.max(a + amount, b);
    }
    else {
        return Math.min(a + amount, b);
    }
}
// Linearly interpolates a float between two values.
function lerp(a, b, amount) {
    return (b - a) * amount + a;
}
// Converts degrees to radians.
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}// Converts radians to degrees.
function radiansToDegrees(radians) {
    return radians / (Math.PI / 180);
}
// Takes a position and returns an array of points at specified distances away and at the given angle.
function circlePointDegrees(pos, angle, dist) {
    return circlePointRadians(pos, degreesToRadians(angle), dist);
}
// Same as circlePointDegrees, but takes angle in radians.
    var _dist = [1];
    if (dist != null)
        _dist = dist;
    var posx = Math.cos(angle);
    var posy = Math.sin(angle);

    let outarray = [];
    outarray.length = _dist.length;
    for (let i = 0; i < _dist.length; ++i) {
        outarray[i] =
        {
            x: pos.x + posx * _dist[i],
            y: pos.y + posy * _dist[i]
        };
    }
    return outarray;
}
// When a chat command is received.
function onCommand(message, tags, channel) {
    // Allow the streamer (and mbrine because yes) to trigger commands
    if (tags['display-name'].toLowerCase() == 'mbrine' || tags['display-name'].toLowerCase() == streamername) {

        //Split the message by spaces, first word would be the command
        var command = message.split(' ')[0];

        // Remove the $ at the start
        command = command.substring(1);

        // Does command exist in utilCommands? Call it!
        if (utilCommands[command]) {
            utilCommands[command](message.split(' '), message, tags, channel);
        }
    }
}
// Loads a JS file
function load_js(source) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = source;
    head.appendChild(script);
}
