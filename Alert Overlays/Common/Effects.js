//////////////////////
///                ///
///   Const vars   ///
///                ///
//////////////////////
const root = document.querySelector(':root');
const maxparticles = 100000;

//////////////////////
///                ///
///   Containers   ///
///                ///
//////////////////////
let sprites = {};
var effects = [];
var effectstoremove = [];

//////////////////////////////////////////////////
///                                            ///
///   Definition of all canvas objects here!   ///
///                                            ///
//////////////////////////////////////////////////
let canvasobjects = {
    // Pulse is a growing transparent circle that gets more transparent as time passes.
    "pulse": function (x, y, xscale, yscale, xspeed, yspeed, life, color) {
        this.name = "pulse",
        this.x = x;
        this.y = y;
        this.absx = this.x;
        this.absy = this.y;
        this.xscale = xscale;
        this.yscale = yscale;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = life;
        this.color = color;
        this.render = function (stage) {

            stage.globalCompositeOperation = "source-over";

            var rgb = this.color.replace(/[^\d,]/g, '').split(',');
            stage.fill
            stage.fillStyle = this.color;
            stage.globalAlpha = Math.max((this.life / this.mlife),0) * 0.8;
            stage.beginPath();

            stage.arc(this.x, this.y, ((this.mlife - this.life) * (0.1) + 1) * this.xscale / 2, 0, 2 * Math.PI);
            stage.fill();

        };
        this.update = function () {
            this.x += this.xspeed;
            this.y += this.yspeed;

            --this.life;

            if (this.life <= 0) {
                removeEffect(this);
            }
        };
    },
    // Line is rendered as a solid line.
    "line": function (x, y, endx, endy, life, color, extra) {
        var spread = 1.0;
        this.name = "line";
        this.color = color;
        this.life = life;
        this.mlife = life;
        this.width = 6;
        this.cap = "round";
        if (extra) {
            if (extra["width"])
                this.width = extra["width"];
            if (extra["cap"])
                this.cap = extra["cap"];
        }

        this.start = { x: x, y: y };
        this.end = { x: endx, y: endy };
        this.render = function (stage) {
            stage.globalCompositeOperation = "source-over";
            stage.strokeStyle = this.color;
            stage.lineWidth = this.width;
            stage.lineCap = this.cap;
            stage.beginPath();
            stage.lineTo(this.start.x, this.start.y);
            stage.lineTo(this.end.x, this.end.y);
            stage.stroke();

        };
        this.update = function () {
            --this.life;
            if (this.life <= 0)
                removeEffect(this);
        }
    },
    // Lightning is rendered as several segments with edge blurring and randomization
    "lightning": function (x, y, endx, endy, life, color, extra) {
        var spread = 1.0;
        this.name = "lightning";
        this.color = color;
        this.basecolor = "#FFFFFF";
        this.life = life;
        this.mlife = life;
        this.width = 6;
        this.blur = 10;
        this.randomness = 1;
        if (extra) {
            if (extra["spread"])
                spread = extra["spread"];
            if (extra["basecolor"])
                this.basecolor = extra["basecolor"];
            if (extra["blur"])
                this.blur = extra["blur"];
            if (extra["width"])
                this.width = extra["width"];
            if (extra["randomness"])
                this.randomness = extra["randomness"];
        }

        var start = { x: x, y: y };
        var end = { x: endx, y: endy };
        var dir = {
            x: end.x - start.x,
            y: end.y - start.y
        };
        end = {
            x: start.x + dir.x * spread,
            y: start.y + dir.y * spread

        };
        dir = {
            x: end.x - start.x,
            y: end.y - start.y
        };
        var perpdir = normalize(getPerpendicularVector(dir));
        var segmentHeight = magnitude(dir);
        var lightning = [];
        lightning.push({ x: start.x, y: start.y });
        lightning.push({ x: end.x, y: end.y });

        var currDiff = 10;
        while (segmentHeight > 5) {
            var newSegments = [];
            for (var i = 0; i < lightning.length - 1; i++) {
                var start = lightning[i];
                var end = lightning[i + 1];
                var midPos = {
                    x: (start.x + end.x) / 2,
                    y: (start.y + end.y) / 2
                };
                var rand = (Math.random() * 2 - 1);
                rand *= this.randomness;
                var newPos = {
                    x: midPos.x + rand * currDiff * perpdir.x,
                    y: midPos.y + rand * currDiff * perpdir.y
                };
                newSegments.push(start, newPos);
            }
            newSegments.push(lightning.pop());
            lightning = newSegments;

            currDiff /= 2;
            segmentHeight /= 2;
        }

        this.path = lightning;
        this.render = function (stage) {
            stage.globalCompositeOperation = "screen";
            stage.shadowBlur = this.blur * this.life / this.mlife + 0.01;
                stage.strokeStyle = this.basecolor;
                stage.shadowColor = this.color;
                stage.lineWidth = this.width * this.life / this.mlife + 0.01;
            stage.beginPath();
            const section = this.path;
            for (var o = 0; o < section.length; o++) {

                stage.lineTo(section[o].x, section[o].y);
                stage.stroke();
            }

        };
        this.update = function () {
            --this.life;
            if (this.life <= 0)
                removeEffect(this);
        }
    },
    // Lightningonelement is automatically locked to appear within the input element.
    "lightningonelement": function (element, life, color, spread, extra = {}) {
        var start = getRandPoint(element);
        var end = getRandPoint(element);
        var dir = {
            x: end.x - start.x,
            y: end.y - start.y
        };
        return new canvasobjects["lightning"](start.x, start.y, end.x, end.y, life, color, extra)
    },
    // Trails are rendered as paths, iterating from first to last in the path array.
    "trail": function (life) {
        this.name = null;
        this.path = [];
        this.running = true;
        this.pushpos = function (pos) {
            this.path.push(pos);
            this.running = true;
            while (this.path.length > this.life) {
                this.path.splice(0, 1);
            }
        }
        this.life = life;
        this.render = function (stage) {
            for (let i = this.path.length - 1; i > 0; --i) {
                var pos = this.path[i];

                if (pos == null) {
                    stage.beginPath();
                    continue;
                }

                var rgb = hexToRgbA(pos.color);
                if (pos.shadowblur)
                    stage.shadowBlur = pos.shadowblur;
                else
                    stage.shadowBlur = 0;
                if (pos.shadowcolor)
                    stage.shadowColor = pos.shadowcolor;
                if (pos.endwidth == null)
                    pos.endwidth = 0;
                if (pos.endalpha == null)
                    pos.endalpha = 0;
                stage.strokeStyle = "rgba(" +
                    rgb[0] + "," +
                    rgb[1] + "," +
                    rgb[2] + "," +
                    (pos.alpha + (i / this.life) * (pos.endalpha - pos.alpha)) + ")";
                stage.lineWidth = pos.width + ((pos.endwidth - pos.width) * (i / this.path.length));
                stage.lineTo(pos.x, pos.y);
                stage.stroke();
            }
        }
        this.update = function () {
            if (!this.running) {
                this.path.push(null);
                var deleteself = true;
                for (let i = 0; i < this.path.length; ++i) {
                    if (this.path[i] != null) {
                        deleteself = false;
                        break;
                    }
                }
                if (deleteself)
                    removeTrail(this);
            }
            if (this.path.length > this.life) {
                this.path.splice(0, 1);
            }
        }
        this.kill = function () {
            this.running = false;
        }
    },
    // Sprites! These can have a velocity attached to them, and update their current frame if they are gifs.
    "sprite": function (name, x, y, xscale, yscale, xspeed, yspeed, life, color) {
        this.name = name;

        this.x = x;
        this.y = y;
        this.absx = this.x;
        this.absy = this.y;
        this.xscale = xscale;
        this.yscale = yscale;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = life;
        this.color = color;
        if (sprites[name].type == "gif") {
            this.currentframe = 0;
            this.maxframes = sprites[name].totalframes;
            this.update = () => {
                this.x += this.xspeed;
                this.y += this.yspeed;

                --this.life;

                if (this.life <= 0) {
                    removeEffect(this);
                }
                if (this.postupdate)
                    this.postupdate();
                ++this.currentframe;
                if (this.currentframe > this.maxframes)
                    this.currentframe = 0;
            };
        }
        else {

            this.update = () => {
                this.x += this.xspeed;
                this.y += this.yspeed;

                --this.life;

                if (this.life <= 0) {
                    removeEffect(this);
                }
                if (this.postupdate)
                    this.postupdate();
            };
        }
        this.render = (stage) => {
            if (sprites[name].type == "gif") {

                var curr = sprites[name].getFrame(this.currentframe);
                var column = curr.x;
                var row = curr.y;
                stage.globalCompositeOperation = "source-over";
                stage.beginPath();
                stage.fillStyle = "rgba(" +
                    255 + "," +
                    255 + "," +
                    255 + "," +
                    1.0 + ")";
                stage.drawImage(sprites[name].image, column, row, sprites[name].framewidth, sprites[name].frameheight, this.x, this.y, this.xscale, this.yscale,);
                stage.fill();
            }
            else {
                stage.globalCompositeOperation = "source-over";
                stage.beginPath();
                stage.fillStyle = "rgba(" +
                    255 + "," +
                    255 + "," +
                    255 + "," +
                    1.0 + ")";
                stage.drawImage(sprites[name].image, this.x, this.y, this.xscale, this.yscale);
                stage.fill();
            }
        };

    },
    // Centeredsprite attempts to offset the sprite by its scale.
    "centeredsprite": function (name, x, y, xscale, yscale, xspeed, yspeed, life, color) {
        return canvasobjects["sprite"](name, x - xscale, y - yscale, xscale, yscale, xspeed, yspeed, life, color);
    },
    //Fire is rendered as a circle with velocity that shrinks and loses opacity over time.
    "fire": function (x, y, xscale, yscale, xspeed, yspeed, life) {
        this.x = x;
        this.y = y;
        this.xscale = xscale;
        this.yscale = yscale;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = this.life;
        this.render = function (stage) {
            stage.globalCompositeOperation = "lighter";
            stage.fillStyle = "rgba(" +
                (260 - ((this.mlife - this.life) * 2)) + "," +
                (((this.mlife - this.life) * 2) + 50) + "," +
                ((this.mlife - this.life) * 2) + "," +
                (this.life / this.mlife * 1) + ")";

            stage.beginPath();
            // Draw the particle as a circle, which gets slightly smaller the longer it's been alive for
            stage.arc(this.x, this.y, (this.life / this.mlife) * this.xscale, 0, 2 * Math.PI);
            stage.fill();
        };
        this.update = () => {
            this.x += this.xspeed;
            this.y += this.yspeed;

            --this.life;
            //If the particle has lived longer than we are allowing, remove it from the array.
            if (this.life <= 0) {
                removeEffect(this);
            }
        };

    },
    // Sparks are rendered as short trails with a radius and velocity.
    "spark": function (x, y, radius, xspeed, yspeed, life) {
        this.x = x;
        this.y = y;
        this.prevx = [];
        this.prevy = [];
        this.xscale = radius / 2;
        this.yscale = radius / 2;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = this.life;
        this.render = function (stage) {
            stage.globalCompositeOperation = "lighter";
            stage.fillStyle = "rgba(" +
                (255) + "," +
                (255) + "," +
                ((this.mlife - this.life) / this.mlife * 100) + "," +
                (this.life / this.mlife * 0.75) + ")";

            stage.beginPath();

            stage.strokeStyle = "rgba(" +
                (255) + "," +
                (255) + "," +
                ((this.mlife - this.life) / this.mlife * 100) + "," +
                (this.life / this.mlife * 0.75) + ")";
            stage.lineWidth = 5;
            stage.lineTo(this.x, this.y);
            for (let i = 0; i < this.prevx.length; ++i) {
                stage.lineTo(this.prevx[i], this.prevy[i])
            }
            this.prevx.push(this.x);
            this.prevy.push(this.y);
            if (this.prevx.length > 2) {
                this.prevx.splice(0, 1);
                this.prevy.splice(0, 1);
            }
            stage.stroke();
        };
        this.update = () => {
            this.x += this.xspeed;
            this.y += this.yspeed;
            this.yspeed += 3;

            --this.life;
            if (this.life <= 0) {
                removeEffect(this);
            }
        };

    },
    // Binary is rendered as either 1 or 0, randoly selected every frame. It can be made to follow a HTML element.
    "binary": function (x, y, xscale, yscale, xspeed, yspeed, life, color,elementtotrack) {
        this.x = x;
        this.y = y;
        this.absx = x;
        this.absy = y;
        this.xscale = xscale;
        this.yscale = yscale;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = this.life;
        this.color = color;
        this.elementtotrack = elementtotrack;
        this.render = function (stage) {
            var rgb = this.color.replace(/[^\d,]/g, '').split(',');
            stage.font = "30px Arial";
            stage.fillStyle = "rgba(" +
                rgb[0] + "," +
                rgb[1] + "," +
                rgb[2] + "," +
                (this.life / this.mlife * 1.5) + ")";
            stage.beginPath();
                stage.fillText(Math.round(Math.random()), this.absx, this.absy);
        };
        this.update = () => {
            if (this.elementtotrack != null) {
                var rect = this.elementtotrack.getBoundingClientRect();
                this.x += this.xspeed;
                this.y += this.yspeed;
                this.absx = this.x + rect.left;
                this.absy = this.y + rect.top;
            }
            else {
                this.absx += this.xspeed;
                this.absy += this.yspeed;
            }

            --this.life;

            //  If the particle has lived longer than we are allowing, remove it from the array.
            if (this.life <= 0) {
                removeEffect(this);
            }
        };

    },
    // Text is what it says on the tin.
    "text": function (text,x, y, fontsize, xspeed, yspeed, life, color,elementtotrack) {
        this.x = x;
        this.y = y;
        this.absx = x;
        this.absy = y;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = this.life;
        this.color = color;
        this.elementtotrack = elementtotrack;
        this.fontsize = fontsize;
        this.render = function (stage) {
            var rgb = this.color.replace(/[^\d,]/g, '').split(',');
            stage.font = this.fontsize + "px Arial";
            stage.fillStyle = "rgba(" +
                rgb[0] + "," +
                rgb[1] + "," +
                rgb[2] + "," +
                (this.life / this.mlife * 1.5) + ")";
            stage.beginPath();
                stage.fillText(text, this.absx, this.absy);
        };
        this.update = () => {
            if (this.elementtotrack != null) {
                var rect = this.elementtotrack.getBoundingClientRect();
                this.x += this.xspeed;
                this.y += this.yspeed;
                this.absx = this.x + rect.left;
                this.absy = this.y + rect.top;
            }
            else {
                this.absx += this.xspeed;
                this.absy += this.yspeed;
            }

            --this.life;
            //If the particle has lived longer than we are allowing, remove it from the array.
            if (this.life <= 0) {
                removeEffect(this);
            }
        };

    },
    // Does not render a sprite, you can use this for position tracking.
    "placeholder": function (x, y, xscale, yscale, xspeed, yspeed, life) {
        this.x = x;
        this.y = y;
        this.absx = x;
        this.absy = y;
        this.xscale = xscale;
        this.yscale = yscale;
        this.xspeed = xspeed;
        this.yspeed = yspeed;
        this.life = life;
        this.mlife = life;
        this.render = function (stage) {
        };
        this.update = () => {
            this.x += this.xspeed;
            this.y += this.yspeed;
            --this.life;
            if (this.postUpdate)
                this.postUpdate();
            //If the particle has lived longer than we are allowing, remove it from the array.
            if (this.life <= 0) {
                removeEffect(this);
            }
        };
    }
}
function loadSprite(name, source, type = "png", extra = null) {
    // Overwrite an already loaded image if it exists. No dupes!
    if (sprites[name] != null) {
        var image = document.getElementById(name);
        image.remove();
    }

    // PNG images are simple, just load the image and append it to the hidden div
    if (type == "png") {
        var image = document.createElement("img");
        document.getElementById("Hidden").appendChild(image);
        image.src = source;
        image.id = name;
        sprites[name] = {
            "image": image,
            "type": type,
            "render": function (stage) {
            }
        };
    }
    // GIFs are currently loaded as a PNG spritesheet, no support for actual GIF files at the moment :(
    else if (type == "gif") {
        var image = document.createElement("img");
        document.getElementById("Hidden").appendChild(image);
        image.src = source;
        image.id = name;
        sprites[name] = {
            "image": image,
            "type": type,
            "totalframes": extra.totalframes,
            "framewidth": extra.framewidth,
            "frameheight": extra.frameheight,
            "hframes": extra.framesperrow,
            "currentframe": 0,
            // When updated, cycle the frames automatically
            "update": function () {
                ++this.currentframe;
                if (this.currentframe > this.totalframes)
                    this.currentframe = 0;
                if (this.postupdate)
                    this.postupdate();
            },
            // Handy way to get the x and y pixels of the current frame
            "getCurrentFrame": function () {
                let row = Math.floor(this.currentframe / this.hframes);
                let column = this.currentframe - (row * this.hframes);

                return {
                    x: this.framewidth * column,
                    y: this.frameheight * row,
                }
            },
            // Handy way to get the x and y pixels of a given frame
            "getFrame": function (num) {
                let row = Math.floor(num / this.hframes);
                let column = num - (row * this.hframes);

                return {
                    x: this.framewidth * column,
                    y: this.frameheight * row,
                }
            },
            "render": function (stage) {
            }
        }
    }
    // Default, only allow PNG or GIF currently.
    else
        return null;
    return sprites[name];
}


function initEffects() {
    // Reference to the HTML element
    canvas = document.getElementById("ParticleCanvas");
    canvas.clientWidth = 1920;
    canvas.clientHeight = 1080;

    // See if the browser supports canvas
    if (canvas.getContext) {
        stage = canvas.getContext("2d");

        stage.globalCompositeOperation = "lighter";
        var timer = setInterval(updateCanvas, 40);

    } else {
        alert("Canvas not supported.");
    }
}

// This marks an effect to be deleted AFTER THIS FRAME. DO NOT DELETE DURING THE UPDATE CYCLE.
// I TAKE NO RESPONSIBILITY FOR THE CHAOS THAT WILL ENSUE.
function removeEffect(item) {
    effectstoremove.push(item);
}

// Update the effects system here
function updateCanvas() {
    // Shrink the effects array to maxparticles if it exceeds
    while (effects.length > maxparticles) {
            effects.pop();
    }

    // Live resize the canvas, just in case
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear the stage so we can draw the new frame
    stage.clearRect(0, 0, canvas.width, canvas.height);

    // Cycle through all the particles to draw them
    for (i = 0; i < effects.length; i++) {
        // Reset vars here, so that each effect being drawn doesn't need to do so
        stage.globalAlpha = 1.0;
        stage.lineWidth = 0;
        stage.shadowBlur = 0;

        // Call all the member functions of the effect
        var effect = effects[i];
        if (effect["update"])
            effect["update"]();
        if (effect["postUpdate"])
            effect["postUpdate"]();
        if (effect["render"])
            effect["render"](stage);
    }

    // Clear effects marked for deletion
    for (let i = 0; i < effectstoremove.length; ++i) {

        // Call the effect's onDestroy function
        var effect = effectstoremove[i];
        if (effect["onDestroy"])
            effect["onDestroy"]();

        // Remove the effect from the main array
        var index = effects.indexOf(effect);
        if (index !== -1) {
            effects.splice(index, 1);
        }
    }

    // Wipe the removal array
    effectstoremove = [];

    // Default out the canvas border in case something happened to it
    canvas.style.border = "1px solid #000000";
}