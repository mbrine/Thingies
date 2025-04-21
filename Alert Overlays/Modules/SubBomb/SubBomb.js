///////////////////////////////////
///                             ///
///     Registering assets      ///
///                             ///
///////////////////////////////////
const filePath = function (name) {
    return "Modules/SubBomb/Source_SubBomb/" + name;
}
// Audio to register
registerAudio("SoundSub1", filePath("Sub_Clean.mp3"),"mp3");
registerAudio("SoundExplosion", filePath("explosion.wav"), "wav");

// Sprites to load
loadSprite("Heart", filePath("BleedPurple.png"));

///////////////////////////////
///                         ///
///     Debug commands      ///
///                         ///
///////////////////////////////
utilCommands["sub"] = function (vars, message, tags, channel) {
    var name = vars[1];
    var amount = vars[2];
    var extra = "0"
    if (vars.length > 3)
        extra = vars[3]

    var userstate = {
        "recipient": name,
        "sender": name,
        "msg-param-cumulative-months": Number.parseInt(amount ? amount : "1"),
        "msg-param-sender-count": 420,
        "msg-param-sub-plan-name": "Testing",
        "msg-param-sub-plan": extra,
    }
    onSub(vars[0].substr(1), streamername, name, 1, "TEST SUBSCRIPTION", userstate)
}
utilCommands["resub"] = function (vars, message, tags, channel) {
    var name = vars[1];
    var amount = vars[2];
    var extra = "0"
    if (vars.length > 3)
        extra = vars[3]

    var userstate = {
        "recipient": name,
        "sender": name,
        "msg-param-cumulative-months": Number.parseInt(amount ? amount : "1"),
        "msg-param-sender-count": 420,
        "msg-param-sub-plan-name": "Testing",
        "msg-param-sub-plan": extra,
    }
    onSub("resub", streamername, name, 1, "TEST SUBSCRIPTION", userstate)
}
utilCommands["submysterygift"] = function (vars, message, tags, channel) {
    var name = vars[1];
    var amount = vars[2];
    var extra = "0"
    if (vars.length > 3)
        extra = vars[3]

    var userstate = {
        "recipient": name,
        "sender": name,
        "msg-param-sender-count": 420,
        "msg-param-sub-plan-name": "Testing",
        "msg-param-sub-plan": extra,
    }
    onSub("submysterygift", 'mbrine', name, Number.parseInt(amount ? amount : "1"), "Mooooooooooo lah", userstate)
}

////////////////////////////////////
///                              ///
///     Subscription events      ///
///                              ///
////////////////////////////////////

// Anonymously gifted subscription being upgraded by recipient
client.on("anongiftpaidupgrade", (channel, username, userstate) => {
    onSub("anongiftpaidupgrade", channel, username, 1, "", userstate);
});

// Gifted subscription being upgraded by recipient
client.on("giftpaidupgrade", (channel, username, sender, userstate) => {
    // Add sender to the userstate
    userstate.sender = sender;
    onSub("giftpaidupgrade", channel, username, 1, "", userstate)

});

// Direct sub gift
client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {

    if (streakMonths == 0)
        return;
    userstate.recipient = recipient;
    onSub("subgift", channel, username, streakMonths, "", userstate)
});

// Random / Community sub gift
client.on("submysterygift", (channel, username, numbOfSubs, methods, userstate) => {
    onSub("submysterygift", channel, username, numbOfSubs, "", userstate);

});

// First time subscription
client.on("subscription", (channel, username, method, message, userstate) => {
    onSub("subscription", channel, username, 1, message, userstate);
});

// Resubscription
client.on("resub", (channel, username, months, message, userstate, methods) => {
    onSub("resub", channel, username, months, message, userstate);
});

///////////////////////////////
///                         ///
///     Main functions      ///
///                         ///
///////////////////////////////

// Main onSub function, handles processing logic before calling throwSub
function onSub(type, channel, username, count, message, userstate) {
    console.log("SUB RECEIVED!: " + type + "," + count + "," + message);
    console.log(userstate);
    // 1000 refers to Sub Tier 1, we use this as the default
    switch (type) {
        case "subgift":
            throwSub('gift', 1, username, 1000, [userstate.recipient]);
            break;
        case "anongiftpaidupgrade":
            throwSub('sub', 1, username, 1000);
            break;
        case "giftpaidupgrade":
            throwSub('sub', 1, username, 1000);
            break;
        case "submysterygift":
            throwSub('gift', count, username, 1000);
            break;
        case "subscription":
        case "sub":
            throwSub('sub', 1, username, userstate["msg-param-sub-plan"]);
            break;
        case "resub":
            let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
            throwSub('sub', cumulativeMonths, username, userstate["msg-param-sub-plan"]);
            break;
    }
}

// Throw Subscription function, this handles calculating the starting velocity of the subscription object
function throwSub(type, amount, name, tier, extra) {
    var power = 300;
    var dirX, dirY;
    var deg = (360 * Math.random());
    dirX = Math.cos(deg) * power;
    dirY = Math.sin(deg) * power;
    createSub(randomInRange(100, 1820), randomInRange(100, 980), dirX, dirY, type, amount, name, tier, extra);
}

// Create Sub function, this handles the data being passed to Matter.js and logic for the thrown sub.
// May contain spaghet.
function createSub(x, y, dx, dy, type, amount, name, tier, extra) {
    // Init some variables with default values here
    let scale = 0.2, // Size of the 
        texPath = filePath("SubGift.png"),
        mscale = 250,
        mass = 1000;

    // Choose the sprite to render based on the subscription type
    switch (type) {
        case 'sub':
            texPath = filePath("Sub.png");
            scale = 0.2 + amount * 0.02;
            // Prime tier gets a special sprite <3 <3 <3
            if (tier == "Prime")
                texPath = filePath("Prime.png");
            break;
        case 'gifted':
            texPath = filePath("Sub.png");
            scale = 0.2 + amount * 0.02;
            break;
        case 'gift':
            scale = 0.5;
            break;
    }

    // Create the rigidbody
    var subObject = Bodies.rectangle(x, y, mscale * scale, mscale * scale, {
        render: {
            sprite: {
                texture: texPath,
                xScale: scale * 7.5,
                yScale: scale * 7.5
            },
            fillStyle: "transparent",
            strokeStyle: "transparent",
            texttag: {
                content: name + "(" + amount + ")",
                color: "white",
                stroke: "black",
                size: 50,
                rotate: false,
                offsetX: 0,
                offsetY: -scale * 150,
            }
        }
    });

    // Assign some values to the rigidbody
    subObject.mass = mass;
    subObject.restitution = 1;
    subObject.friction = 0.005;
    subObject.frictionAir = 0.01;

    // Launch the object with the provided dx and dy values
    Matter.Body.applyForce(subObject, subObject.position, { x: subObject.mass * dx / 1000, y: subObject.mass * dy / 1000 });

    // Add the rigidbody to Matter's world
    Composite.add(engine.world, [subObject]);


    // THIS IS THE PART WHERE YOU CHOOSE TO DO WHATEVER YOU WANT WITH THE PHYSICS OBJECTS.
    // MAKE SURE YOU CLEAR THEM EVENTUALLY IF YOU DO NOT WANT TO LAG OUT AHAHAHAHAHAHA

    // create a copy of scale to shrink the thrown objects over time
    //var scale = scale;
    // Function that creates a heart fountain and scaling interval for reuse
    var createHeartFountainScaleInterval = function (object) {
        return setInterval(function () {
            var prebscale = scale;
            scale -= (50 / 1000) * 0.02;
            var p = new canvasobjects["sprite"](
                "Heart",
                object.position.x,
                object.position.y,
                mscale * scale,
                mscale * scale,
                (Math.random() * 2 - 1) * 20,
                -20,
                20
            );
            p.postUpdate = () => {
                p.yspeed += 1;
            }

            Matter.Body.scale(object, scale / prebscale, scale / prebscale);
            object.render.sprite.xScale *= scale / prebscale;
            object.render.sprite.yScale *= scale / prebscale;
            effects.push(p);
        }, 50);
    }

    switch (type) {
        case 'sub':
            // Create an interval to 
            var heartFountainInterval = createHeartFountainScaleInterval(subObject);

            playAudio("SoundSub1", 1.0, true);

            // This timeout is when the Sub Object expires
            setTimeout(function () {
                // Stop the Heart Fountain
                window.clearInterval(heartFountainInterval);

                // Remove the rigidbody
                Matter.World.remove(engine.world, subObject);

                // Set an amount and power of heart particles to launch
                const amt = 20;
                const power = 10;
                for (let i = 0; i < amt; ++i) {
                    var deg = (360 * Math.random());
                    dirX = Math.cos(deg) * power;
                    dirY = Math.sin(deg) * power;
                    var p = new canvasobjects["sprite"](
                        "Heart",
                        subObject.position.x,
                        subObject.position.y,
                        mscale * scale,
                        mscale * scale,
                        (Math.random() * 2 - 1) * 20,
                        -20,
                        20
                    );
                    effects.push(p);
                }

                playAudio("SoundExplosion", 0.05, true);
            }, amount * 1000 + 5000);
            break;
        case 'gifted':
            subObject.render.texttag.content = name;
            var heartFountainInterval = createHeartFountainScaleInterval(subObject);

            setTimeout(function () {
                window.clearInterval(heartFountainInterval);
                Matter.World.remove(engine.world, subObject);
                const amt = 20;
                const power = 10;
                for (let i = 0; i < amt; ++i) {
                    var deg = (360 * Math.random());
                    dirX = Math.cos(deg) * power;
                    dirY = Math.sin(deg) * power;
                    var p = new canvasobjects["sprite"](
                        "Heart",
                        subObject.position.x,
                        subObject.position.y,
                        mscale * scale,
                        mscale * scale,
                        dirX,
                        dirY,
                        20
                    );
                    effects.push(p);
                }

                playAudio("SoundExplosion", 0.2, true);
            }, amount * 1000 + 5000);
            break;
        case 'gift':
            playAudio("SoundSub1", 1.0, true);
            // Special setInterval here because we want the hearts to rise up
            var heartFountainInterval = setInterval(function () {
                var p = new canvasobjects["sprite"](
                    "Heart",
                    subObject.position.x,
                    subObject.position.y,
                    mscale * scale,
                    mscale * scale,
                    (Math.random() * 2 - 1) * 20,
                    -20,
                    20
                );
                p.postUpdate = () => {
                    p.yspeed += 1;
                }
                effects.push(p);
            }, 50);
            setTimeout(function () {
                window.clearInterval(heartFountainInterval);
                Matter.World.remove(engine.world, subObject);
                const amt = 20;
                power = 10;
                const gifts = amount;
                const gifter = name;
                for (let i = 0; i < amt; ++i) {
                    var deg = (360 / amt) * i;
                    dirX = Math.cos(deg) * power;
                    dirY = Math.sin(deg) * power;
                    var p = new canvasobjects["sprite"](
                        "Heart",
                        subObject.position.x,
                        subObject.position.y,
                        mscale * scale,
                        mscale * scale,
                        dirX,
                        dirY,
                        50
                    );
                    effects.push(p);
                }
                for (let i = 0; i < gifts; ++i) {
                    var power = 300;
                    var dirX, dirY;
                    var deg = 360 * Math.random();
                    dirX = Math.cos(deg) * power;
                    dirY = Math.sin(deg) * power;
                    createSub(subObject.position.x, subObject.position.y, dirX, dirY, 'gifted', i / 10, gifter, 1, extra);
                }
                playAudio("SoundExplosion", 0.1, true);
            }, 5000);
            break;
    }
}