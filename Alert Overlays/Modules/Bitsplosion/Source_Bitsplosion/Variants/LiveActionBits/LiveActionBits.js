// Register all audio and sprites
registerAudio("SoundLiveActionBits1", sourceFilePath("LiveActionBits", "LiveActionBits1.mp3"), "mp3");
registerAudio("SoundLiveActionBits100", sourceFilePath("LiveActionBits", "LiveActionBits100.mp3"), "mp3");
registerAudio("SoundLiveActionBits1000", sourceFilePath("LiveActionBits", "LiveActionBits1000.mp3"), "mp3");
registerAudio("SoundLiveActionBits5000", sourceFilePath("LiveActionBits", "LiveActionBits5000.mp3"), "mp3");
registerAudio("SoundLiveActionBits10000", sourceFilePath("LiveActionBits", "LiveActionBits10000.mp3"), "mp3");
registerAudio("SoundLiveActionBits100000", sourceFilePath("LiveActionBits", "LiveActionBits100000.mp3"), "mp3");

loadSprite("LiveActionBits1Animated", sourceFilePath("LiveActionBits", "LiveActionBits1animated.png"), "gif", {
    totalframes: 77,
    frameheight: 300,
    framewidth: 300,
    framesperrow: 5,
});
loadSprite("LiveActionBits100Animated", sourceFilePath("LiveActionBits", "LiveActionBits100animated.png"), "gif", {
    totalframes: 76,
    frameheight: 300,
    framewidth: 300,
    framesperrow: 5,
});
loadSprite("LiveActionBits1000Animated", sourceFilePath("LiveActionBits", "LiveActionBits1000animated.png"), "gif", {
    totalframes: 77,
    frameheight: 300,
    framewidth: 300,
    framesperrow: 5,
});
loadSprite("LiveActionBits5000Animated", sourceFilePath("LiveActionBits", "LiveActionBits5000animated.png"), "gif", {
    totalframes: 97,
    frameheight: 300,
    framewidth: 300,
    framesperrow: 5,
});
loadSprite("LiveActionBits10000Animated", sourceFilePath("LiveActionBits", "LiveActionBits10000animated.png"), "gif", {
    totalframes: 185,
    frameheight: 300,
    framewidth: 300,
    framesperrow: 5,
});
loadSprite("LiveActionBits100000Animated", sourceFilePath("LiveActionBits", "LiveActionBits100000animated.png"), "gif", {
    totalframes: 401,
    frameheight: 300,
    framewidth: 300,
    framesperrow: 5,
});


// Define the variant
loadedBitsVariants["LiveActionBits"] = {
    "variantname": "LiveActionBits",
    "tiers": [100000, 10000, 5000, 1000, 100, 1],
    "spawnBitObject": function (x, y, dx, dy, type, life) {
        const self = this;
        let bitObject = createBitObject(x, y, dx, dy, type, life, "LiveActionBits", "LiveActionBits" + type + ".png");
        switch (type) {
            case 100000:
                // Audio!
                playAudio("SoundLiveActionBits100000", 1.0, true);

                // Add an onDestroy callback
                bitObject["onDestroy"] = function () {
                    Matter.World.remove(engine.world, bitObject);
                    var x = 0;
                    var intervalID = setInterval(function () {

                        self["spawnBitObject"](bitObject.position.x, bitObject.position.y, 0, -50, 10000, 5000 + x * 100 * Math.random());
                        if (++x === 10) {
                            window.clearInterval(intervalID);
                        }
                    }, 100);
                }
                break;
            case 10000:
                // Audio!
                playAudio("SoundLiveActionBits10000", 1.0, true);

                // Add an onDestroy callback
                bitObject["onDestroy"] = function () {
                    self["spawnBitObject"](bitObject.position.x, bitObject.position.y, -15, -50, 5000, 4000);
                    self["spawnBitObject"](bitObject.position.x, bitObject.position.y, 15, -50, 5000, 4500);
                    Matter.World.remove(engine.world, bitObject);
                }
                break;
            case 5000:
                // Audio!
                playAudio("SoundLiveActionBits5000", 1.0, true);

                // Add an onDestroy callback
                bitObject["onDestroy"] = function () {
                    Matter.World.remove(engine.world, bitObject);
                    for (let i = 0; i < 5; ++i) {
                        var dirX, dirY;
                        var deg = (360 / 5) * i - 90;
                        dirX = Math.cos(deg) * 10;
                        dirY = Math.sin(deg) * 10;
                        self["spawnBitObject"](bitObject.position.x, bitObject.position.y, dirX, dirY, 1000, 1000 + i * 1000 * Math.random());
                    }
                }
                break;
            case 1000:
                // Audio!
                playAudio("SoundLiveActionBits1000", 1.0, true);

                // Add an onDestroy callback
                bitObject["onDestroy"] = function () {
                    var x = 0;
                    var intervalID = setInterval(function () {
                        self["spawnBitObject"](bitObject.position.x, bitObject.position.y, (x - 5) * 40, -200, 100, x * 250)
                        //createBitObject(bitObject.position.x, bitObject.position.y, (x - 5) * 40, -200, 100, life + x * 250 * Math.random(), mode);
                        Matter.Body.scale(bitObject, 0.9, 0.9);
                        bitObject.render.sprite.xScale *= 0.9;
                        bitObject.render.sprite.yScale *= 0.9;
                        if (++x === 10) {
                            window.clearInterval(intervalID);
                            Matter.World.remove(engine.world, bitObject);
                        }
                    }, 500);
                }
                break;
            case 100:
                // Audio!
                playAudio("SoundLiveActionBits100", 1.0, true);

                // Add an onDestroy callback
                bitObject.onDestroy = function () {
                    var power = 4;
                    var i = 0;
                    Matter.Body.applyForce(bitObject, bitObject.position, { x: bitObject.mass * Math.random() / 2, y: bitObject.mass * Math.random() / 2 })
                    var intervalID = setInterval(function () {
                        var dirX, dirY;
                        var deg = (3600 / 100) * i;
                        dirX = Math.cos(deg) * power;
                        dirY = Math.sin(deg) * power;
                        Matter.Body.scale(bitObject, 0.99, 0.99);
                        bitObject.render.sprite.xScale *= 0.99;
                        bitObject.render.sprite.yScale *= 0.99;

                        var p = new canvasobjects["sprite"]("LiveActionBits1Animated", bitObject.position.x, bitObject.position.y, 50, 50, dirX, dirY, 50);
                        p.postUpdate = function () {
                            stage.globalAlpha = p.life / p.mlife;
                        }

                        effects.push(p);
                        if (++i === 50) {
                            window.clearInterval(intervalID);
                            Matter.World.remove(engine.world, bitObject);
                        }
                        if (Math.random() > 0.75)
                            playAudio("SoundLiveActionBits1", 1.0, true);

                    }, 50);
                }
                break;
            case 1:
                playAudio("SoundLiveActionBits1", 1.0, true)
                break;
        }
    },
    "spawn": function (tieramounts) {
        const self = this;
        // DEBUG
        //console.log(tieramounts);

        // Iterate through all the tier amounts
        for (let index = 0; index < tieramounts.length; ++index) {
            var tierType = self.tiers[index];
            let amount = tieramounts[index]

            // Only bother entering the switch-case if amount is more than 0
            if (amount > 0) {
                switch (tierType) {
                    case 100000:
                        for (let i = 0; i < amount; i++) {
                            // Create a new animated bit sprite
                            var bit = new canvasobjects["sprite"]("LiveActionBits100000Animated", canvas.width / 2, canvas.height / 2, 380, 380, 0, 0, 500);
                            // Sprite update function
                            bit.postUpdate = () => {
                                var completion = (bit.mlife - bit.life) / bit.mlife;
                                stage.globalAlpha = completion * 0.8 + 0.2;

                                // Set the X and Y randomly with more max distance as lifetime decreases,
                                // causes shaking effect
                                bit.x = canvas.width / 2 + (completion * (Math.random() * 2 - 1) * 30.0);
                                bit.y = canvas.height / 2 + (completion * (Math.random() * 2 - 1) * 30.0);
                                bit.currentframe += Math.floor(completion * 5);

                                // Random lightning effect that gets more frequent as the sprite lifetime decreases
                                if (Math.random() < 0.1 + completion * 0.4) {
                                    // Up to 5 lightning when lifetime is near 0
                                    for (let i = 0; i < Math.floor(Math.random() * 5 * completion) + 1; ++i) {
                                        var deg = (360 * Math.random());
                                        var dist = 105 + completion * 500;
                                        var dirX = Math.cos(deg);
                                        var dirY = Math.sin(deg);
                                        var centerx = bit.x;
                                        var centery = bit.y;
                                        var l = new canvasobjects["lightning"](centerx + dirX * bit.xscale / 2 * 0.9, centery + dirY * bit.xscale / 2 * 0.9, centerx + dirX * dist, centery + dirY * dist, 4, "#FF0", { randomness: completion * 10 });
                                        effects.push(l);
                                    }
                                }

                            }
                            // When the sprite is deleted
                            bit.onDestroy = function () {
                                self["spawnBitObject"](bit.x, bit.y, randomInRange(- 200, 200), randomInRange(-100, 100), 100000, null);
                            }
                            effects.push(bit);

                        }
                        break;
                    case 10000:
                        for (let i = 0; i < amount; i++) {
                            let bit = new canvasobjects["sprite"]("LiveActionBits10000Animated", (Math.random() * canvas.width - 270) / 2, (Math.random() * canvas.height - 270) / 2, 270, 270, Math.random() < 0.5 ? -10 : 10, Math.random() < 0.5 ? -10 : 10, 300);
                            bit.postUpdate = () => {
                                var completion = (bit.mlife - bit.life) / bit.mlife;
                                stage.globalAlpha = completion * 0.8 + 0.2;
                                bit.x = bit.absx + (completion * (Math.random() * 2 - 1) * 30.0);
                                bit.y = bit.absy + (completion * (Math.random() * 2 - 1) * 30.0);

                                bit.absx += bit.xspeed * (1.0 + completion * 5);
                                bit.absy += bit.yspeed * (1.0 + completion * 5);

                                if (bit.absx < 0) {
                                    bit.absx = 1;
                                    bit.xspeed = -bit.xspeed;
                                }
                                if (bit.absx > canvas.width - bit.xscale) {
                                    bit.absx = canvas.width - bit.xscale - 1;
                                    bit.xspeed = -bit.xspeed;
                                }
                                if (bit.absy < 0) {
                                    bit.absy = 1;
                                    bit.yspeed = -bit.yspeed;
                                }
                                if (bit.absy > canvas.height - bit.yscale) {
                                    bit.absy = canvas.height - bit.yscale - 1;
                                    bit.yspeed = -bit.yspeed;
                                }

                                bit.currentframe += Math.floor(completion * 3);
                                var centerx = bit.x;
                                var centery = bit.y;
                                if (Math.random() < 0.1 + completion * 0.5) {
                                    var l = new canvasobjects["lightning"](centerx, centery, centerx + bit.xspeed * 10, centery + bit.yspeed * 10, 8, "#F00", { randomness: 5 });
                                    effects.push(l);
                                }
                            }
                            // When the sprite is destroyed
                            bit.onDestroy = function () {
                                self["spawnBitObject"](bit.x, bit.y, bit.xspeed * 6, bit.yspeed * 6, 10000, null);
                            }
                            effects.push(bit);
                        }
                        break;
                    case 5000:
                        for (let i = 0; i < amount; i++) {
                            let bit = new canvasobjects["sprite"]("LiveActionBits5000Animated", (Math.random() * (canvas.width - 225)), (Math.random() * (canvas.height - 225)), 225, 225, 0, 0, 200);
                            var centerx = bit.x;
                            var centery = bit.y;
                            var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, 50, "#00F");
                            effects.push(p);
                            bit.postUpdate = () => {
                                var completion = (bit.mlife - bit.life) / bit.mlife;
                                stage.globalAlpha = completion;
                                bit.xscale = bit.yscale = completion * 255;
                                bit.x = bit.absx + (completion * (Math.random() * 2 - 1) * 5.0);
                                bit.y = bit.absy + (completion * (Math.random() * 2 - 1) * 5.0);


                                bit.currentframe += Math.floor(completion * 6);
                                if (bit.currentframe >= bit.maxframes)
                                    bit.currentframe = 0;
                                if (bit.currentframe == 0) {
                                    var centerx = bit.x;
                                    var centery = bit.y;
                                    var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, completion * 50, "#00F");
                                    effects.push(p);
                                }
                            }
                            bit.onDestroy = function () {
                                var centerx = bit.x;
                                var centery = bit.y;
                                var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, 50, "#00F");
                                effects.push(p);
                                self["spawnBitObject"](bit.x, bit.y, (Math.random() * 2 - 1) * 5.0, (Math.random() * 2 - 1) * 5.0, 5000, null);
                            }
                            effects.push(bit);
                        }

                        break;
                    case 1000:
                        for (let i = 0; i < amount; i++) {
                            let bit = new canvasobjects["sprite"]("LiveActionBits1000Animated", (Math.random() * (canvas.width - 150)), (Math.random() * (canvas.height - 150)), 150, 150, 0, 0, 150);
                            var centerx = bit.x;
                            var centery = bit.y;
                            var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, 40, "#00F7DA");
                            bit.postUpdate = () => {
                                var completion = (bit.mlife - bit.life) / bit.mlife;
                                stage.globalAlpha = completion;
                                bit.xscale = bit.yscale = completion * 150;
                                bit.x = bit.absx + (completion * (Math.random() * 2 - 1) * 5.0) - bit.xscale / 2;
                                bit.y = bit.absy + (completion * (Math.random() * 2 - 1) * 5.0) - bit.yscale / 2;

                                bit.currentframe += Math.floor(completion * 4);
                                if (bit.currentframe >= bit.maxframes)
                                    bit.currentframe = 0;
                                if (bit.currentframe == 0) {
                                    var centerx = bit.x;
                                    var centery = bit.y;
                                    var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, completion * 40, "#00F7DA");
                                    effects.push(p);
                                }
                            }
                            bit.onDestroy = function () {
                                var centerx = bit.x;
                                var centery = bit.y;
                                var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, 50, "#00F7DA");
                                effects.push(p);
                                self["spawnBitObject"](centerx, centery, randomInRange(- 50, 50), randomInRange(0, -20), 1000);
                            }
                            effects.push(bit);
                        }
                        break;
                    case 100:

                        var h = 0;
                        var hintervalID = setInterval(function () {
                            var bit = new canvasobjects["sprite"]("LiveActionBits100Animated", (Math.random() * (canvas.width - 75)), (Math.random() * (canvas.height - 75)), 75, 75, 0, 0, 91);
                            var centerx = bit.x;
                            var centery = bit.y;
                            var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, 10, "#BE61FF");
                            effects.push(p);

                            bit.postUpdate = () => {
                                var completion = (bit.mlife - bit.life) / bit.mlife;

                                // Gain alpha as the sprite approaches 0 lifetime
                                stage.globalAlpha = completion;
                            }

                            bit.onDestroy = function () {
                                var centerx = bit.x;
                                var centery = bit.y;

                                // Pulse!
                                var p = new canvasobjects["pulse"](centerx, centery, bit.xscale, bit.yscale, 0, 0, 50, "#BE61FF");
                                effects.push(p);

                                // Create the rigidbody
                                self["spawnBitObject"](centerx, centery, randomInRange(-300, 300), randomInRange(0, 100), 100);
                            }
                            effects.push(bit);

                            if (++h >= amount)
                                window.clearInterval(hintervalID);
                        }, 100);
                        break;
                    case 1:
                        var x = 0;
                        var intervalID = setInterval(function () {
                            // Random points on the screen to summon the bits and pulses
                            var centerx = randomInRange(20, 1900);
                            var centery = randomInRange(20, 1060);
                            var p = new canvasobjects["pulse"](centerx, centery, 60, 60, 0, 0, 20, "#A2A1A1");
                            effects.push(p);


                            // Create the Bit Object
                            self["spawnBitObject"](centerx, centery, randomInRange(-150, 150), 20, 1);

                            if (++x >= amount)
                                window.clearInterval(intervalID);
                        }, 20);
                        break;
                }
            }
        }
    },
}