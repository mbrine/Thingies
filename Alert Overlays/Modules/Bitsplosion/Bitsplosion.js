/////////////////////////////////////
///                               ///
///     Registering variants      ///
///                               ///
/////////////////////////////////////

// Again, just remove the double slashes for whichever one you want to use.
const variantsToLoad = [
    //"Bits",
    //"LiveActionBits",
    //"Doodle",
    //"ShowLove",
    //"Shamrock",
    //"Kappa",
];

///////////////////////////////////
///                             ///
///     Registering assets      ///
///                             ///
///////////////////////////////////
const sourceFilePath = function (variant, name) {
    return variantFilePath(variant, "Source_" + variant + "/" + name);
}
const variantFilePath = function (variant, name) {
    return "Modules/Bitsplosion/Source_Bitsplosion/Variants/" + variant + "/" + name;
}

///////////////////////////////
///                         ///
///     Debug commands      ///
///                         ///
///////////////////////////////
utilCommands["cheer"] = function (vars, message, tags, channel) {
    var name = vars[1];
    var amount = vars[2];
    var extra = null
    if (vars.length > 3)
        extra = vars[3]

    onCheer(streamername, {
        'bits': amount,
        'display-name': name,
        'forcemode': extra,
    }, "DoodleCheer" + amount + " dingus gets the pringus");
}

///////////////////////
///                 ///
///   Loaded vars   ///
///                 ///
///////////////////////
//const available100kBits = ["doodle", "normal","liveaction"]
//const availableBits = ["doodle", "normal", "liveaction", "showlove", "shamrock", "kappa"]
let loadedBitsVariants = {}
for (let i = 0; i < variantsToLoad.length; ++i) {
    var bitsVariant = variantsToLoad[i];
    load_js(variantFilePath(bitsVariant, bitsVariant+".js"));
}
////////////////////////////
///                      ///
///     Cheer event      ///
///                      ///
////////////////////////////

// Register the cheer event listener to TMI
client.on("cheer", (channel, userstate, message) => {
    onCheer(channel, userstate, message);
    console.log(userstate);
});
function onCheer(channel, userstate, message) {
    var totalbits = userstate["bits"];
    cheerEvent(totalbits, userstate["forcemode"]);
}
function cheerEvent(amount, forcedtype) {
    // Force all does what it says on the tin.
    if (forcedtype == "all") {
        for (const variant in loadedBitsVariants) {
            throwBits(variant, amount);
        }
    }
    // If there is a variant specified, we directly try to call it. If it doesn't exist, log an error.
    else if (forcedtype != null) {
        var mode = loadedBitsVariants[forcedtype];
        if (mode != null) {
            console.log("BITS CHEERED! MODE: " + forcedtype);
            throwBits(amount, forcedtype);
        }
        else {
            console.error(forcedtype + " does not exist!");
        }
    }
    // Default behaviour is to randomly select from a pool of the best possible candidates
    else {
        // DEBUG
        //console.log(loadedBitsVariants);

        // Get the variants with the closest tier
        // (aka if you cheer 999 bits it'll search for variants closest to 999 without exceeding)
        var closestMaxTier = 0;
        let usableBitsVariants = [];

        // Iterate through every tier in every variant
        for (const variant in loadedBitsVariants) {
            for (const variantTier in loadedBitsVariants[variant]["tiers"]) {
                // We only consider the tier if it is <= the total amount of bits
                if (variantTier <= amount) {
                    // If the variant tier is more than the closest max, update closestmax and wipe usableBitsVariant
                    if (variantTier > closestMaxTier) {
                        closestMaxTier = variantTier;
                        usableBitsVariants = [];
                    }

                    // If the variant tier matches closest max, add this variant to usableBits
                    if (variantTier == closestMaxTier) {
                        usableBitsVariants.push(variant);
                    }
                }
            }
        }


        // Pick a random variant from the array
        var mode = RandomInArray(usableBitsVariants)
        if (mode == null) {
            console.error("NO BITS MODE FOUND!");
            return;
        }
        console.log("BITS CHEERED! MODE: " + mode);
        throwBits(amount, mode);
    }
}
function throwBits(totalbits, variant) {

    // Calculate the amount of each tier to throw
    var tieramounts = [];
    let tiers = loadedBitsVariants[variant]["tiers"]; 
    for (let i = 0; i < tiers.length; ++i) {
        tieramounts.push((totalbits - totalbits % tiers[i]) / tiers[i]);
        totalbits %= tiers[i];
    }

    loadedBitsVariants[variant]["spawn"](tieramounts);
}
// Function for creating bit physics objects
function createBitObject(x, y, dx, dy, type,life,variantName,spritePath)
{
    let scale = 1,
        texPath = sourceFilePath(variantName, spritePath),
        mscale = 250,
        spscale = 1.0,
        mass = type;
    // Scaling + texture path
    switch (type) {
        case 100000:
            scale = 1.1;
            break;
        case 10000:
            scale = 0.9;
            break;
        case 5000:
            scale = 0.75;
            break;
        case 1000:
            scale = 0.5;
            break;
        case 100:
            scale = 0.25;
            break;
        case 10:
            scale = 0.1;
            break;
        case 1:
            scale = 0.2;
            break;
    }

    //Life time auto assignment
    if (life == null) {
        switch (type) {
            case 100000:
                life = 10000;
                break;
            case 10000:
                life = 8000;
                break;
            case 5000:
                life = 8000;
                break;
            case 1000:
                life = 6000;
                break;
            case 100:
                life = 4000;
                break;
            case 10:
                life = 1000;
                break;
            case 1:
                life = 5000;
                break;
            default:
                life = 1000;
                break;
        }
    }

    // Spawn the rigidbody
    let bitObject = Bodies.circle(x, y, mscale * scale / 2, {
        render: {
            sprite: {
                texture: texPath,
                xScale: scale,
                yScale: scale
            }
        }
    });
    bitObject.mass = mass;
    bitObject.restitution = Math.max(scale, 0.99);
    Matter.Body.applyForce(bitObject, bitObject.position, { x: bitObject.mass * dx / 1000, y: bitObject.mass * dy / 1000 });
    Composite.add(engine.world, [bitObject]);

    // Set a timeout to callback and destroy the rigidbody
    setTimeout(function () {
        // Attempt to call onDestroy
        if (bitObject["onDestroy"])
            bitObject["onDestroy"]();
        else
        // FORCE the rigidbody to be deleted
        Matter.World.remove(engine.world, bitObject);
    }, life);
    return bitObject;
}