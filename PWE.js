const PRG = {
    VERSION: "1.04.03",
    NAME: "Princess Wants Everything",
    INIT: function () {
        //console.clear();
        console.log(PRG.NAME + " " + PRG.VERSION + " by Lovro Selic, (c) C00lSch00l/LaughingSkull 2016");
        $("#title").html(PRG.NAME);
        $(".prg_name").html(PRG.NAME);
        $("#version").html(PRG.NAME + " V" + PRG.VERSION + " by Lovro Selič <span style='font-size:14px'>&copy</span> .0Sch00l/LaughingSkull 2016");
        $("input#toggleAbout").val("About " + PRG.NAME);
        $("#about fieldset legend").append(" " + PRG.NAME + " ");
        Command.count = 0;
    }
};

var INI = {};
INI.LOAD_W = 202;
INI.LOAD_H = 22;
INI.ROOM_WIDTH = 512;
INI.ROOM_HEIGHT = 512;
INI.STATUS_HEIGHT = 250;
INI.STATUS_WIDTH = 312;
INI.QUERY_WIDTH = INI.STATUS_WIDTH;
INI.QUERY_HEIGHT = INI.ROOM_HEIGHT - INI.STATUS_HEIGHT - 6;
INI.GAME_WIDTH = INI.ROOM_WIDTH + INI.STATUS_WIDTH + 4;
INI.STDW = 360;
INI.STDH = 72;
INI.DOORW = 48;
INI.DOORH = 48;
INI.DOORC = 12;
INI.SOURCE = "Assets/Graphics/Legacy/";
INI.NBS = "&nbsp";
INI.WOODPATTERN = 100;
INI.GRIDPX = 50;
INI.COOLIE_MAX_INV = 8;
INI.LAST_LEVEL = 2;

Array.prototype.clear = function () {
    this.splice(0, this.length);
};
Array.prototype.compare = function (array) {
    if (!array)
        return false;
    var LN = this.length;
    if (LN !== array.length)
        return false;
    for (var x = 0; x < LN; x++) {
        if (this[x] !== array[x])
            return false;
    }
    return true;
};
Array.prototype.remove = function (value) {
    var LN = this.length;
    for (var x = 0; x < LN; x++) {
        if (this[x] === value) {
            this.splice(x, 1);
            this.remove(value);
        }
    }
};
Array.prototype.chooseRandom = function () {
    var LN = this.length;
    var choose = rnd(1, LN) - 1;
    return this[choose];
};
Array.prototype.removeRandom = function () {
    var LN = this.length;
    var choose = rnd(1, LN) - 1;
    return this.splice(choose, 1);
};
Array.prototype.swap = function (x, y) {
    var TMP = this[x];
    this[x] = this[y];
    this[y] = TMP;
    return this;
};
Array.prototype.shuffle = function () {
    var i = this.length,
            j;
    while (--i > 0) {
        j = rnd(0, i);
        this.swap(i, j);
    }
    return this;
};

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
};

var Sprite = {
    draw: function (X, Y, id) {
        var image = $("#" + id)[0];
        var CTX = RoomScreen.ctx;
        CTX.drawImage(image, X, Y);
    },
    drawStatus: function (X, Y, id) {
        var image = $("#" + id)[0];
        var CTX = StatusScreen.ctx;
        CTX.drawImage(image, X, Y);
    }
};

var COOLIE = {
    id: "Coolie2",
    init: function () {
        COOLIE.room = 8;
        COOLIE.X = 2;
        COOLIE.Y = 3;
        COOLIE.inventory = [];
    },
    draw: function () {
        var xx = MAP["room" + COOLIE.room].grid.iX + COOLIE.X * INI.GRIDPX;
        var yy = MAP["room" + COOLIE.room].grid.iY + COOLIE.Y * INI.GRIDPX;
        Sprite.draw(xx, yy, COOLIE.id);
    },
    move: {
        left: function () {
            if (COOLIE.X > 0) {
                COOLIE.X--;
                gameState.frameDraw();
                return;
            }
            COOLIE.throughDoor();
        },
        right: function () {
            var maxX = MAP["room" + COOLIE.room].grid.maxX;
            if (COOLIE.X < maxX) {
                COOLIE.X++;
                gameState.frameDraw();
                return;
            }
            COOLIE.throughDoor();
        },
        down: function () {
            var maxY = MAP["room" + COOLIE.room].grid.maxY;
            if (COOLIE.Y < maxY) {
                COOLIE.Y++;
                gameState.frameDraw();
                return;
            }
            COOLIE.throughDoor();
        },
        up: function () {
            if (COOLIE.Y > 0) {
                COOLIE.Y--;
                gameState.frameDraw();
                return;
            }
            COOLIE.throughDoor();
        }
    },
    containerInRoom: function () {
        var cont;
        if (MAP["room" + COOLIE.room].container) {
            cont = MAP["room" + COOLIE.room].container.name;
        }
        return cont || false;
    },
    throughDoor: function () {
        var door = COOLIE.closeToDoor();
        if (door === null) {
            return;
        }
        var doorType = MAP["room" + COOLIE.room][door];
        if (doorType !== "open") {
            return;
        }
        var orientation = COOLIE.getOrientation(door);
        var newRoom = MAP["room" + COOLIE.room][orientation + "Con"];
        COOLIE.room = newRoom;
        var newCoord = COOLIE.getStartingPoint(COOLIE.room, COOLIE.flipOrientation(orientation));
        COOLIE.X = newCoord[0];
        COOLIE.Y = newCoord[1];
        gameState.frameDraw();
    },
    closeToDoor: function () {
        var maxY = MAP["room" + COOLIE.room].grid.maxY;
        var maxX = MAP["room" + COOLIE.room].grid.maxX;
        if (COOLIE.X === maxX / 2 && COOLIE.Y === 0) {
            return "ndoor";
        }
        if (COOLIE.X === maxX / 2 && COOLIE.Y === maxY) {
            return "sdoor";
        }
        if (COOLIE.X === maxX && COOLIE.Y === maxY / 2) {
            return "edoor";
        }
        if (COOLIE.X === 0 && COOLIE.Y === maxY / 2) {
            return "wdoor";
        }
        return null;
    },
    getStartingPoint: function (room, orientation) {
        var maxY = MAP["room" + room].grid.maxY;
        var maxX = MAP["room" + room].grid.maxX;
        var newX, newY;
        switch (orientation) {
            case "n":
                newX = maxX / 2;
                newY = 0;
                break;
            case "s":
                newX = maxX / 2;
                newY = maxY;
                break;
            case "e":
                newX = maxX;
                newY = maxY / 2;
                break;
            case "w":
                newX = 0;
                newY = maxY / 2;
                break;
        }
        return [newX, newY];
    },
    flipOrientation: function (orientation) {
        if (orientation === "n")
            return "s";
        if (orientation === "s")
            return "n";
        if (orientation === "e")
            return "w";
        if (orientation === "w")
            return "e";
    },
    getOrientation: function (door) {
        return door.charAt(0);
    },
    getRoomInv: function () {
        var inventory = MAP["room" + COOLIE.room].inv;
        var roomInv = [];
        var tmpType;
        var flag = 1;
        if (inventory) {
            var LN = inventory.length;
            for (var i = 0; i < LN; i++) {
                tmpType = inventory[i].type;
                roomInv.push(inventory[i].name);
                if (flag && tmpType === "key") {
                    roomInv.push("the key");
                    flag = 0;
                }
            }
            return roomInv;
        } else
            return null;
    },
    getRoomInvStrict: function () {
        var inventory = MAP["room" + COOLIE.room].inv;
        var roomInv = [];
        if (inventory) {
            var LN = inventory.length;
            for (var i = 0; i < LN; i++) {
                roomInv.push(inventory[i].name);
            }
            return roomInv;
        } else
            return null;
    },
    getCOOLIEInvNames: function () {
        var invNames = [];
        if (COOLIE.inventory) {
            var LN = COOLIE.inventory.length;
            for (var x = 0; x < LN; x++) {
                invNames.push(COOLIE.inventory[x].name);
            }
        }
        return invNames;
    },
    under: function (prop) {
        var inventory = MAP["room" + COOLIE.room].inv;
        if (inventory) {
            var LN = inventory.length;
            var tx, ty, item;
            for (var i = 0; i < LN; i++) {
                tx = inventory[i].X;
                ty = inventory[i].Y;
                if (tx === COOLIE.X && ty === COOLIE.Y) {
                    return inventory[i][prop];
                }
            }
        }
        return null;
    },
    pick: function (name) {
        var LN = MAP["room" + COOLIE.room].inv.length;
        for (var i = 0; i < LN; i++) {
            if (MAP["room" + COOLIE.room].inv[i].name === name) {
                COOLIE.inventory.push(MAP["room" + COOLIE.room].inv.splice(i, 1)[0]);
                return;
            }
        }
    },
    drop: function (name) {
        var invIdx = COOLIE.hasItIndex(name);
        if (invIdx > -1) {
            if (COOLIE.under("name")) {
                print(["There is no place on the floor.", "Not here.", "There is already " + COOLIE.under("name") + " here."].chooseRandom());
                return;
            } else {
                var removed = COOLIE.inventory.splice(invIdx, 1)[0];
                removed.X = COOLIE.X;
                removed.Y = COOLIE.Y;
                if (!MAP["room" + COOLIE.room].inv) {
                    MAP["room" + COOLIE.room].inv = [];
                }
                MAP["room" + COOLIE.room].inv.push(removed);
                print("Coolie dropped " + name);
                return;
            }
        } else {
            if (name === "key" || name === "a key" || name === "the key") {
                print(["Be more specific.", "Which key?", "Which colour?"].chooseRandom());
                return;
            }
            print(["You can't drop what you don't have.", "Coolie doesn't have it."].chooseRandom());
            return;
        }
    },
    inventoryFull: function () {
        if (COOLIE.inventory.length < INI.COOLIE_MAX_INV) {
            return false;
        } else
            return true;
    },
    hasIt: function (what) {
        var LN = COOLIE.inventory.length;
        for (var i = 0; i < LN; i++) {
            if (COOLIE.inventory[i].name === what) {
                return true;
            }
        }
        return false;
    },
    hasItIndex: function (what) {
        var LN = COOLIE.inventory.length;
        for (var i = 0; i < LN; i++) {
            if (COOLIE.inventory[i].name === what) {
                return i;
            }
        }
        return -1;
    },
    closeToActor: function () {
        var room = MAP["room" + COOLIE.room];
        var dx, dy;
        if (room.actor) {
            dx = Math.abs(COOLIE.X - room.actor.gridX);
            dy = Math.abs(COOLIE.Y - room.actor.gridY);
            if (dx >= 2 || dy >= 2) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
};

var Vector = function (x, y) {
    this.x = parseInt(x, 10);
    this.y = parseInt(y, 10);
};

Vector.prototype.cw = function () {
    var x = this.x;
    var y = this.y;
    var newX, newY;
    if (x !== 0) {
        newX = 0;
        newY = x * -1;
    } else {
        newX = y * -1;
        newY = 0;
    }
    var newVector = {
        x: newX,
        y: newY
    };
    return newVector;
};

var tileGraphics = [];
var RoomScreen = {};
var StatusScreen = {
    render: function () {
        StatusScreen.background();
        StatusScreen.title();
        StatusScreen.inventory();
    },
    background: function () {
        var CTX = StatusScreen.ctx;
        CTX.fillStyle = "#000";
        CTX.fillRect(0, 0, INI.STATUS_WIDTH, INI.STATUS_HEIGHT);
    },
    title: function () {
        var CTX = StatusScreen.ctx;
        CTX.lineWidth = 1;
        CTX.textAlign = "center";
        var grad = CTX.createLinearGradient(0, 0, INI.STATUS_WIDTH, 0);
        grad.addColorStop("0", "orange");
        grad.addColorStop("0.1", "#ffc04d");
        grad.addColorStop("0.2", "orange");
        grad.addColorStop("0.3", "#ffc04d");
        grad.addColorStop("0.4", "orange");
        grad.addColorStop("0.5", "#ffc04d");
        grad.addColorStop("0.6", "orange");
        grad.addColorStop("0.7", "#ffc04d");
        grad.addColorStop("0.8", "orange");
        grad.addColorStop("0.7", "#ffc04d");
        grad.addColorStop("1", "orange");
        CTX.fillStyle = grad;
        var x = INI.STATUS_WIDTH / 2;
        CTX.font = "10px Consolas";
        var y = 45;
        CTX.shadowColor = "yellow";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 2;
        CTX.fillText("Version " + PRG.VERSION, x, y);
        y = 57;
        CTX.fillText("by Lovro Selič", x, y);
        CTX.font = "20px Verdana";
        y = 30;
        CTX.shadowColor = "yellow";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 3;
        CTX.fillText(PRG.NAME, x, y);
        CTX.beginPath();
        CTX.lineWidth = 1;
        CTX.strokeStyle = "#0E0";
        CTX.shadowColor = "#00FF00";
        CTX.shadowOffsetX = 3;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 2;
        y = 72;
        CTX.moveTo(20, y);
        CTX.lineTo(INI.STATUS_WIDTH - 20, y);
        CTX.closePath();
        CTX.stroke();
        CTX.beginPath();
        CTX.moveTo(20, INI.STATUS_HEIGHT - 4);
        CTX.lineTo(INI.STATUS_WIDTH - 20, INI.STATUS_HEIGHT - 4);
        CTX.closePath();
        CTX.stroke();
    },
    makeGrid: function () {
        var x = 24;
        var y = 104;
        var xd = 70;
        var yd = 64;
        for (var q = 0; q < 4; q++) {
            StatusScreen.grid.push([x + xd * q, y]);
        }
        y += yd;
        for (q = 0; q < 4; q++) {
            StatusScreen.grid.push([x + xd * q, y]);
        }
        return;
    },
    grid: [],
    inventory: function () {
        var CTX = StatusScreen.ctx;
        CTX.shadowColor = "#000";
        CTX.shadowOffsetX = 0;
        CTX.shadowOffsetY = 0;
        CTX.shadowBlur = 0;
        var CIL = COOLIE.inventory.length;
        if (CIL > 0) {
            for (var t = 0; t < CIL; t++) {
                Sprite.drawStatus(StatusScreen.grid[t][0], StatusScreen.grid[t][1], COOLIE.inventory[t].tile.id);
            }
        }
    }
};

var Command = {
    get: function () {
        var commandLine = $("#Input").val();
        Command.print(commandLine);
        Command.store(commandLine.toLowerCase());
        Command.interpret();
        if (!gameState.won) {
            Command.new();
        } else {
            gameState.gameOver();
        }
    },
    interpret: function () {
        Command.count++;
        var firstCommand = Command.storage.shift();
        if (typeof Command.com[firstCommand] === "function") {
            Command.com[firstCommand]();
        } else {
            Command.syntaxError();
        }
    },
    syntaxError: function () {
        var ErrorMessages = ["This is not valid command.", "You want what?", "Try making sense.", "I don't understand you.", "Just typing rubbish or what?", "Hmm?", "What do you want?", "This makes no sense.", "Please try again, I don' understand.", "What??"];
        print(ErrorMessages.chooseRandom());
    },
    new : function () {
        if (Engine.alertMode === false) {
            input();
        }
    },
    print: function (data) {
        $("#line").remove();
        print(">" + data.toUpperCase());
    },
    storage: [],
    store: function (data) {
        Command.storage.clear();
        var array = data.split(" ");
        array.remove("");
        Command.storage = array;
    },
    collect: function () {
        var completeCommand = [];
        var what = Command.storage.shift();
        while (what) {
            completeCommand.push(what);
            what = Command.storage.shift();
        }
        var completed = completeCommand.join(" ");
        return completed;
    },
    prepTest: function (what, storage) {
        var idx = what.indexOf(" ");
        var prep = what.substring(0, idx);
        var remains = what.substring(idx + 1);
        var prepTest = "the " + what;
        var remTest = "the " + remains;
        if ((prep === "a" || prep === "an") && storage.indexOf(remTest) !== -1) {
            print(["Please use definite preposition 'the' instead of 'a' or 'an'."].chooseRandom());
            return true;
        }
        if (storage.indexOf(prepTest) !== -1) {
            print(["Please use adjective or preposition 'the'."].chooseRandom());
            return true;
        }
        return false;

    },
    com: {
        help: function () {
            print("List of commands:");
            var keys = Object.keys(Command.com);
            var cheats = ["cheat", "debug", "otd", "win", "have", "tp"];
            for (var cheat in cheats) {
                keys.remove(cheats[cheat]);
            }
            var text = keys.join(", ").toUpperCase();
            print(text);
        },
        look: function () {
            print("Coolie is in " + MAP["room" + COOLIE.room].name + ".");
            var inv = COOLIE.getRoomInvStrict();
            if (inv && inv.length) {
                var LN = inv.length;
                var txt = "";
                for (var i = 0; i < LN; ) {
                    txt += inv[i];
                    i++;
                    if (i < LN - 1) {
                        txt += ", ";
                    } else if (i < LN) {
                        txt += " and ";
                    } else {
                        txt += ".";
                    }
                }
                print("In the room you see: " + txt);
            }
            var under = COOLIE.under("name");
            if (under) {
                print("Under Coolie you see " + under + ".");
            }
            var cont = MAP["room" + COOLIE.room].container;
            if (cont) {
                print("There is " + cont.name + " in the room.");
            }
            var actor = MAP["room" + COOLIE.room].actor;
            if (actor) {
                print("There is " + actor.name + " in the room.");
            }
        },
        open: function () {
            var prep = Command.storage.shift();
            var obj = Command.storage.shift();
            var door, doorType;

            if (prep === undefined) {
                print(["Open what?", "Sesame. Nope. Doesn't work.", "What do you want to open?", "It seems you want to open something ..."].chooseRandom());
                return;
            }
            if (prep === "door") {
                print(["Did you want to open THE door?", "Please use preposition 'the'."].chooseRandom());
                return;
            }
            var what = prep + " " + obj;
            if (what === "the door") {
                door = COOLIE.closeToDoor();
                doorType = MAP["room" + COOLIE.room][door];
                if (door === null || doorType === null) {
                    print(["Try getting closer.", "You are not close enough.", "You are too far from the door.", "From here?"].chooseRandom());
                    return;
                }
                if (doorType === "open") {
                    print(["This door is already open.", "Seems open to me ..."].chooseRandom());
                    return;
                }
                if (doorType === "wood") {
                    MAP["room" + COOLIE.room][door] = "open";
                    gameState.frameDraw();
                    print("Coolie opened the door.");
                    return;
                }
                let key = `the ${doorType} key`;
                if (COOLIE.hasIt(key)) {
                    MAP["room" + COOLIE.room][door] = "open";
                    gameState.frameDraw();
                    print("Coolie opened " + doorType + " door.");
                    return;
                } else {
                    print(["The door is locked.", "You need a key."].chooseRandom());
                    return;
                }
            } else if ((prep === "orange" || prep === "silver" || prep === "gold" || prep === "red" || prep === "green" || prep === "blue" || prep === "silver" || prep === "pink" || prep === "yellow") && obj === "door") {
                door = COOLIE.closeToDoor();
                doorType = MAP["room" + COOLIE.room][door];
                if (doorType === "open") {
                    print("This door is already open.");
                    return;
                }
                if (door === null || doorType === null) {
                    print(["Try getting closer.", "You are not close enough.", "You are too far from the door.", "From here?"].chooseRandom());
                    return;
                }
                if (doorType !== prep) {
                    print("You are not close to " + prep + " door.");
                    return;
                }
                let key = `the ${prep} key`;
                if (COOLIE.hasIt(key)) {
                    MAP["room" + COOLIE.room][door] = "open";
                    gameState.frameDraw();
                    print("Coolie opened the " + prep + " door.");
                    return;
                } else {
                    print("Locked! You need " + doorType + " key.");
                    return;
                }
                return;
            } else if (Containers.indexOf(what) > -1) {
                if (what === COOLIE.containerInRoom()) {
                    print(["Perhaps you should search " + what + ".", "Maybe it will be better to examine " + what + "."].chooseRandom());
                    return;
                } else {
                    print(["Coolie does not see " + what + ".", "Perhaps you should rethink your strategy.", "Where do you see " + what + "?"].chooseRandom());
                    return;
                }
            } else if (prep !== "the") {
                print(["You should use the preposition 'THE'."].chooseRandom());
                return;
            }
            print(["I don't think so.", "You want to open what?", "You are not serious."].chooseRandom());
        },
        close: function () {
            print(["Coolie is not big on closing things ...", "Nah, let's leave it open.", "Why?"].chooseRandom());
        },
        take: function () {
            var what = Command.collect();
            var inventory = MAP["room" + COOLIE.room].inv;
            if (inventory) {
                var possibleItemNames = COOLIE.getRoomInv();
                if (Command.prepTest(what, possibleItemNames))
                    return;
                if (what) {
                    var inRoom = possibleItemNames.indexOf(what);
                    if (inRoom === -1) {
                        print(["There is nothing by that name in the room.", "Coolie doesn't see that.", "It's not here."].chooseRandom());
                        return;
                    } else {
                        if (what === COOLIE.under("name") || (what === "the key" && COOLIE.under("type") === "key")) {
                            if (COOLIE.inventoryFull()) {
                                print(["Can't carry any more.", "Coolie's bag is already full.", "There is no space in pockets anymore."].chooseRandom());
                                return;
                            } else {
                                if (what === "the key") {
                                    what = COOLIE.under("name");
                                }
                                print("Coolie takes " + what + ".");
                                COOLIE.pick(what);
                                gameState.frameDraw();
                                return;
                            }
                        } else {
                            print(["Move closer.", "Coolie is not close enough.", "Coolie is too far."].chooseRandom());
                            return;
                        }
                    }
                } else {
                    print(["Be more specific.", "Take what?", "You want what?"].chooserandom());
                    return;
                }
            } else {
                print(["There is nothing in the room.", "Nothing worth taking here.", "Take what?", "Not from this room ..."].chooseRandom());
                return;
            }
        },
        inventory: function () {
            var LN = COOLIE.inventory.length;
            if (LN) {
                var txt = "Coolie carries: ";
                for (var i = 0; i < LN; ) {
                    txt += COOLIE.inventory[i].name;
                    i++;
                    if (i < LN) {
                        txt += ", ";
                    } else {
                        txt += ".";
                    }
                }
                print(txt);
                return;
            } else {
                print(["Coolie carries nothing.", "Coolie has empty pockets."].chooseRandom());
                return;
            }
        },
        drop: function () {
            var what = Command.collect();
            if (Command.prepTest(what, COOLIE.getCOOLIEInvNames()))
                return;
            if (what) {
                COOLIE.drop(what);
                gameState.frameDraw();
                return;
            } else {
                print(["Drop what?", "What?", "What do you want to drop?"].chooseRandom());
                return;
            }
        },
        give: function () {
            var prep = Command.storage.shift();
            var obj = Command.storage.shift();
            var prep2 = Command.storage.shift();
            var prep3 = Command.storage.shift();
            var subj = Command.storage.shift();
            if (prep2 === "key") {
                print(["No way.", "Collie does not want to give away keys."].chooseRandom());
                return;
            }
            var itemName = prep + " " + obj;
            var toWhom = prep3 + " " + subj;
            var actor = MAP["room" + COOLIE.room].actor;
            var givenItem, actorName;
            if (actor) {
                givenItem = actor.item;
                actorName = actor.name;
            } else {
                print(["There is nobody here ...", "Coolie is alone in this room."].chooseRandom());
                return;
            }
            if (prep !== "the" || prep3 !== "the") {
                print("You should use preposition 'the' when describing the item you want to give or the person you want to give it to.");
                return;
            }
            if (prep2 !== "to") {
                print("You want to give something TO someone?");
                return;
            }
            if (obj === "key") {
                print(["No way.", "Collie does not want to give away keys."].chooseRandom());
                return;
            }
            if (!COOLIE.hasIt(itemName)) {
                print(["Coolie does not have " + itemName + "."].chooseRandom());
                return;
            }
            if (subj === undefined) {
                print(["To whom you want to give it?", "You want to give " + itemName + " to somebody. But who?"].chooseRandom());
                return;
            }
            if (toWhom !== actor.name) {
                print([toWhom.capitalize() + " is not in the room.", "It seems that " + toWhom + " is not in the room.", "Coolie does not see " + toWhom + "."].chooseRandom());
                return;
            }
            var closeness = COOLIE.closeToActor();
            if (!closeness) {
                print(["You reach out but you are not close enough.", "Go closer to " + actor.name + ".", "Perhaps if you would be closer ..."].chooseRandom());
                return;
            }
            if (actor.wants !== itemName) {
                print(actor.name.capitalize() + " doesn't want " + itemName + ".");
                return;
            }
            actor.item = COOLIE.inventory.splice(COOLIE.hasItIndex(itemName), 1)[0];
            COOLIE.inventory.push(givenItem);
            StatusScreen.render();
            print("Coolie gave " + itemName + " to " + toWhom + ".");
            print(toWhom.capitalize() + " gives Coolie " + givenItem.name + ".");
            Engine.alert(MAP["room" + COOLIE.room].questCompleted);
            MAP["room" + COOLIE.room].questFlag = true;
            if (COOLIE.room === 0) {
                gameState.level++;
                if (gameState.level > INI.LAST_LEVEL) {
                    gameState.won = true;
                    return;
                }
                gameState.setLevel();
            }
        },
        talk: function () {
            var prep = Command.storage.shift();
            var actorName;
            if (prep !== "to") {
                print("You wanted to talk TO someone?");
                return;
            }
            if (MAP["room" + COOLIE.room].actor) {
                actorName = MAP["room" + COOLIE.room].actor.name;
            } else {
                actorName = null;
            }
            if (actorName) {
                var prep2 = Command.storage.shift();
                var subj = Command.storage.shift();
                if (prep2 !== "the") {
                    if (subj) {
                        print("Did you mean THE " + subj + "?");
                        return;
                    } else {
                        print("Please use the preposition 'the' if you want to be understood.");
                        return;
                    }
                }
                var whom = prep2 + " " + subj;
                if (actorName === whom) {
                    if (MAP["room" + COOLIE.room].questFlag) {
                        Engine.alert(MAP["room" + COOLIE.room].questCompleted);
                    } else {
                        Engine.alert(MAP["room" + COOLIE.room].alert);
                    }
                    print(actorName.capitalize() + " speaks ...");
                    return;
                } else {
                    print(whom.capitalize() + " is not here.");
                    return;
                }
            } else {
                print(["There is no one in the room.", "Talking to yourself?"].chooseRandom());
                return;
            }
        },
        search: function () {
            var what = Command.collect();
            if (Command.prepTest(what, Containers))
                return;
            var cont = MAP["room" + COOLIE.room].container;
            if (cont) {
                if (what === cont.name) {
                    if (cont.in === null) {
                        print(cont.name.capitalize() + " is empty.");
                        return;
                    }
                    if (COOLIE.inventoryFull()) {
                        if (!(MAP["room" + COOLIE.room].inv))
                            MAP["room" + COOLIE.room].inv = [];
                        if (COOLIE.under("name")) {
                            print("While searching " + cont.name + " Coolie found " + cont.in.name + " and left it there because her pockets are full.");
                            return;
                        }
                        MAP["room" + COOLIE.room].inv.push(cont.in);
                        print("While searching " + cont.name + " Coolie found " + cont.in.name + " an put it on the floor.");
                        cont.in = null;
                    } else {
                        COOLIE.inventory.push(cont.in);
                        print("While searching " + cont.name + " Coolie found " + cont.in.name + " an put it in its pocket.");
                        cont.in = null;
                    }
                    gameState.frameDraw();
                    return;
                } else {
                    print([what + " is not here.", "Coolie does not see " + what + "."].chooseRandom());
                    return;
                }
            } else {
                print(["There is nothing worth searching here.", "Nothing to search here."].chooseRandom());
                return;
            }
        },
        examine: function () {
            Command.com.search();
        }
    }
};

var Tile = function (id, x, y, type) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.type = type;
};

{
    var BrickWall = new Tile("BrickWall", 128, 128, "jpg");
    var BrickWall2 = new Tile("BrickWall2", 225, 225, "jpg");
    var BrickWall3 = new Tile("BrickWall3", 200, 200, "jpg");
    var BrickWall4 = new Tile("BrickWall4", 128, 72, "jpg");
    var BrokenRuin = new Tile("BrokenRuin", 128, 128, "jpg");
    var CastleWall = new Tile("CastleWall", 128, 128, "jpg");
    var DungeonFloor = new Tile("DungeonFloor", 64, 64, "jpg");
    var DungeonFloor2 = new Tile("DungeonFloor2", 256, 256, "jpg");
    var DungeonWall = new Tile("DungeonWall", 236, 236, "jpg");
    var DungeonWall2 = new Tile("DungeonWall2", 214, 214, "jpg");
    var DungeonWall3 = new Tile("DungeonWall3", 128, 128, "jpg");
    var Grass = new Tile("Grass", 200, 200, "jpg");
    var Gravel = new Tile("Gravel", 200, 200, "jpg");
    var HedgeWall = new Tile("HedgeWall", 200, 200, "jpg");
    var MorgueFloor = new Tile("MorgueFloor", 128, 128, "jpg");
    var OldWall = new Tile("OldWall", 200, 200, "jpg");
    var Pavement = new Tile("Pavement", 200, 200, "jpg");
    var Pavement2 = new Tile("Pavement2", 200, 200, "jpg");
    var RockFloor = new Tile("RockFloor", 128, 128, "jpg");
    var SlateWall = new Tile("SlateWall", 256, 256, "jpg");
    var StoneFloor = new Tile("StoneFloor", 256, 171, "jpg");
    var StoneFloor2 = new Tile("StoneFloor2", 256, 171, "jpg");
    var StoneFloor3 = new Tile("StoneFloor3", 256, 171, "jpg");
    var StoneFloor4 = new Tile("StoneFloor4", 256, 171, "jpg");
    var StoneWall = new Tile("StoneWall", 128, 128, "jpg");
    var StoneWall2 = new Tile("StoneWall2", 128, 128, "jpg");
    var StrangeWall = new Tile("StrangeWall", 128, 128, "jpg");
    var ThachFloor = new Tile("ThatchFloor", 200, 200, "jpg");
    var WhiteWall = new Tile("WhiteWall", 217, 118, "jpg");
    var YellowBrick = new Tile("YellowBrick", 200, 200, "jpg");
    var Coolie = new Tile("Coolie2", 48, 48, "png");
    var BlueKey = new Tile("BlueKey", 48, 48, "png");
    var RedKey = new Tile("RedKey", 48, 48, "png");
    var GreenKey = new Tile("GreenKey", 48, 48, "png");
    var GoldKey = new Tile("GoldKey", 48, 27, "png");
    var OrangeKey = new Tile("orangeKey", 48, 42, "png");
    var SilverKey = new Tile("SilverKey", 48, 24, "png");
    var PinkKey = new Tile("pinkKey", 48, 41, "png");
    var YellowKey = new Tile("yellowKey", 48, 25, "png");
    var Hat = new Tile("hat", 48, 21, "png");
    var Sword = new Tile("sword", 48, 48, "png");
    var Corn = new Tile("corn2", 32, 48, "png");
    var Princess = new Tile("princess_throne", 100, 100, "png");
    var Faerie = new Tile("faerie", 71, 100, "png");
    var Cat = new Tile("Cat", 100, 100, "png");
    var Skeleton = new Tile("skeleton", 63, 100, "png");
    var Bear = new Tile("bear", 86, 100, "png");
    var Squirrel = new Tile("squirrel", 100, 100, "png");
    var Witch = new Tile("witch", 67, 100, "png");
    var Horse = new Tile("horse", 111, 100, "png");
    var Knight = new Tile("knight", 41, 100, "png");
    var Ghost = new Tile("ghost", 100, 91, "png");
    var Hen = new Tile("hen", 59, 60, "png");
    var Crown = new Tile("crown", 48, 42, "png");
    var Lantern = new Tile("lantern", 32, 48, "png");
    var Apple = new Tile("apple2", 48, 48, "png");
    var Pear = new Tile("pear2", 48, 48, "png");
    var Pineapple = new Tile("pineapple2", 48, 48, "png");
    var Watermelon = new Tile("watermelon2", 48, 48, "png");
    var Banana = new Tile("banana2", 48, 48, "png");
    var Ring = new Tile("ring", 48, 42, "png");
    var Acorn = new Tile("acorn", 48, 41, "png");
    var Frog = new Tile("frog", 48, 35, "png");
    var Necklace = new Tile("necklace", 39, 48, "png");
    var Mushroom = new Tile("mushroom2", 33, 48, "png");
    var Candle = new Tile("candle", 15, 48, "png");
    var Potato = new Tile("potato2", 48, 39, "png");
    var Strawberry = new Tile("strawberry2", 48, 45, "png");
    var Orange = new Tile("orange2", 48, 45, "png");
    var Tomato = new Tile("tomato2", 48, 48, "png");
    var Egg = new Tile("egg", 41, 48, "png");
    var Carrot = new Tile("carrot2", 48, 8, "png");
    var Cake = new Tile("cake2", 48, 46, "png");
    var Mouse = new Tile("mouse", 48, 47, "png");
    var Sheep = new Tile("sheep", 45, 48, "png");
    var TallClock = new Tile("TallClock", 28, 100, "png");
    var Rug1 = new Tile("rug1", 300, 197, "png");
    var Rug2 = new Tile("rug2", 300, 217, "png");
    var Rug3 = new Tile("rug3", 300, 217, "png");
    var Rug4 = new Tile("bearskinRug", 300, 276, "png");
    var Gate = new Tile("gate", 62, 72, "png");
    var Fireplace = new Tile("fireplace", 72, 72, "png");
    var LanternPole = new Tile("lanternPole", 20, 72, "png");
    var LanternPole1S = new Tile("lanternPole1S", 20, 72, "png");
    var LanternPole3 = new Tile("lanternPole3", 15, 72, "png");
    var LanternPole3S = new Tile("lanternPole3S", 15, 72, "png");
    var LanternPole2W = new Tile("lanternpole2W", 72, 21, "png");
    var LanternPole2E = new Tile("lanternpole2E", 72, 21, "png");
    var Wardrobe1 = new Tile("wardrobe1", 57, 72, "png");
    var Wardrobe2 = new Tile("wardrobe2", 78, 72, "png");
    var PIC_Hero = new Tile("HeroPicture", 72, 54, "png");
    var PIC_SVS = new Tile("SpyVsSpyPicture", 72, 53, "png");
    var PIC_Hobbit = new Tile("TheHobbitPicture", 72, 53, "png");
    var PIC_AA = new Tile("AticAtacPicture", 72, 51, "png");
    var PIC_DM = new Tile("DungeonMasterPicture", 72, 51, "png");
    var PIC_DM2 = new Tile("DungeonMasterPicture2", 72, 53, "png");
    var PIC_DM3 = new Tile("DungeonMasterPicture3", 72, 54, "png");
    var PIC_Pacman = new Tile("pacman", 72, 53, "png");
    var PIC_ForbidenForest = new Tile("ForbiddenForest", 72, 54, "png");
    var PIC_WOW = new Tile("WizardOfWor", 72, 54, "png");
    var Taperstry1L = new Tile("Taperstry1L", 70, 101, "png");
    var Taperstry2B = new Tile("tapestry2B", 144, 70, "png");
    var Taperstry3R = new Tile("Taperstry3R", 70, 107, "png");
    var Taperstry4T = new Tile("tapestry4T", 128, 70, "png");
    var Taperstry6L = new Tile("tapestry6L", 64, 93, "png");
    var Taperstry6R = new Tile("tapestry6R", 64, 93, "png");
    var Taperstry7T = new Tile("tapestry7T", 165, 70, "png");
    var WallLampL = new Tile("WallLamp", 26, 60, "png");
    var WallLampR = new Tile("WallLampR", 26, 60, "png");
    var Crack1 = new Tile("crack1", 72, 72, "png");
    var Crack2 = new Tile("crack2", 63, 70, "png");
    var Coin = new Tile("goldCoin", 48, 47, "png");
    var Pond = new Tile("pond", 300, 99, "png");
    var Cauldron = new Tile("cauldron", 100, 84, "png");
    var Cauldron2 = new Tile("cauldron2", 91, 100, "png");
    var Chest = new Tile("chest", 70, 60, "png");
    var Clock = new Tile("clock2", 53, 52, "png");
    var Plant1 = new Tile("plant1", 80, 80, "png");
    var Plant2 = new Tile("plant2", 47, 80, "png");
    var Plant3 = new Tile("plant3", 80, 80, "png");
    var Tree1 = new Tile("tree1", 56, 80, "png");
    var Tree2 = new Tile("tree2", 57, 80, "png");
    var SpiderWeb = new Tile("Spider-Web", 100, 100, "png");
    var Spider = new Tile("spider", 100, 76, "png");
    var Cow = new Tile("cow", 100, 81, "png");
    var Wolf = new Tile("wolf", 74, 100, "png");
    var Dog = new Tile("dog", 100, 81, "png");
    var Bone = new Tile("bone", 48, 48, "png");
    var Fly = new Tile("fly", 48, 48, "png");
    var Frogger = new Tile("Frogger", 72, 45, "png");
    var Knightlore_BT = new Tile("Knightlore_BT", 72, 54, "png");
    var Knightlore = new Tile("Knightlore", 72, 54, "png");
    var Pitfall2_right = new Tile("Pitfall2_right", 53, 72, "png");
    var SheepSkinRug = new Tile("sheepskinRug", 250, 170, "png");
    var Bush1 = new Tile("bush1", 100, 86, "png");
    var Torch2_LR = new Tile("torch2_LR", 60, 36, "png");
    var Torch2_BL = new Tile("torch2_BL", 36, 60, "png");
    var Torch2_BR = new Tile("torch2_BR", 36, 60, "png");
    var Torch2_RL = new Tile("torch2_RL", 60, 36, "png");
    var Torch1_RR = new Tile("torch1_RR", 60, 28, "png");
    var Torch1_LL = new Tile("torch1_LL", 60, 28, "png");
    var Torch1_TL = new Tile("torch1_TL", 28, 60, "png");
    var Torch1_TR = new Tile("torch1_TR", 28, 60, "png");
    var Rug6 = new Tile("rug6", 225, 225, "png");
    var Rug5 = new Tile("rug5", 250, 252, "png");
    var FF3_left = new Tile("FF3_leftt", 53, 72, "png");
    var FF3_right = new Tile("FF3_right", 53, 72, "png");
    var AA4_BT = new Tile("AA4_BT", 72, 53, "png");
    var SVS_right = new Tile("SpyVsSpyPicture_right", 53, 72, "png");
    var DM2_BT = new Tile("DungeonMasterPicture2_BT", 72, 53, "png");
    var AA3_right = new Tile("AA3_right", 54, 72, "png");
    var AA3 = new Tile("AA3", 72, 54, "png");
    var AA2_left = new Tile("AA2_left", 54, 72, "png");
    var AA2 = new Tile("AA2", 72, 54, "png");
    var FF2 = new Tile("FF2", 72, 54, "png");
    var FF2_BT = new Tile("FF2_BT", 72, 54, "png");
    var HOB1_BT = new Tile("TheHobbitPicture_BT", 72, 53, "png");
    var HOB2_BT = new Tile("HOB2_BT", 72, 38, "png");
    var Hero_BT = new Tile("Hero_BT", 72, 54, "png");
    var HOB2 = new Tile("HOB2", 72, 38, "png");
    var HOB2_left = new Tile("HOB2_left", 38, 72, "png");
    var JSW = new Tile("JSW", 72, 53, "png");
    var JSW_left = new Tile("JSW_left", 53, 72, "png");
    var DM1_left = new Tile("DM1_left", 51, 72, "png");
    var Hero_left = new Tile("Hero_left", 54, 72, "png");
    var Lode = new Tile("Lode", 72, 45, "png");
    var Lode_BT = new Tile("Lode_BT", 72, 45, "png");
    var Lode_left = new Tile("Lode_left", 45, 72, "png");
    var Lode_right = new Tile("Lode_right", 45, 72, "png");
    var Frogger_BT = new Tile("Frogger_BT", 72, 45, "png");
    var Scramble_BT = new Tile("Scramble_BT", 51, 60, "png");
    var Galaxian_left = new Tile("galaxian_left", 45, 72, "png");
    var Galaxian = new Tile("galaxian", 72, 45, "png");
    var Tut_left = new Tile("Tut_left", 60, 53, "png");
    var Tut = new Tile("Tut", 53, 60, "png");
    var Prince = new Tile("Prince", 72, 36, "png");
    var Prince_BT = new Tile("Prince_BT", 72, 36, "png");
    var Prince_right = new Tile("Prince_right", 36, 72, "png");
    var Apshai = new Tile("Apshai", 72, 43, "png");
    var Apshai_BT = new Tile("Apshai_BT", 72, 43, "png");
    var Apshai_left = new Tile("Apshai_left", 43, 72, "png");
    var Under = new Tile("Under", 72, 54, "png");
    var Under_right = new Tile("Under_right", 54, 72, "png");
    var Dig = new Tile("Dig", 72, 45, "png");
    var Dig_right = new Tile("Dig_right", 45, 72, "png");
    var Invaders = new Tile("Invaders", 72, 60, "png");
    var Invaders_BT = new Tile("Invaders_BT", 72, 60, "png");
    var Invaders_left = new Tile("Invaders_left", 60, 72, "png");
    var Invaders_right = new Tile("Invaders_right", 60, 72, "png");
    var Pitfall = new Tile("Pitfall", 72, 46, "png");
    var Pitfall_BT = new Tile("Pitfall_BT", 72, 46, "png");
    var Pitfall_left = new Tile("Pitfall_left", 46, 72, "png");
    var Pitfall_right = new Tile("Pitfall_right", 46, 72, "png");
    var Aztec = new Tile("Aztec", 72, 51, "png");
    var Aztec_BT = new Tile("Aztec_BT", 72, 51, "png");
    var Aztec_left = new Tile("Aztec_left", 51, 72, "png");
    var Aztec_right = new Tile("Aztec_right", 51, 72, "png");
    var Pitfall2 = new Tile("Pitfall2", 72, 46, "png");
    var Pitfall2_BT = new Tile("Pitfall2_BT", 72, 46, "png");
    var Pitfall2_left = new Tile("Pitfall2_left", 46, 72, "png");
    var Pitfall3_right = new Tile("Pitfall2_right2", 46, 72, "png");
    var DK = new Tile("DK", 72, 53, "png");
    var DK_BT = new Tile("DK_BT", 72, 53, "png");
    var DK_left = new Tile("DK_left", 53, 72, "png");
    var DK_right = new Tile("DK_right", 53, 72, "png");
    var PAC2 = new Tile("PAC2", 53, 60, "png");
    var PAC2_BT = new Tile("PAC2_BT", 53, 60, "png");
    var PAC2_left = new Tile("PAC2_left", 60, 53, "png");
    var PAC2_right = new Tile("PAC2_right", 60, 53, "png");
    var Hay = new Tile("Hay", 100, 53, "png");
    var Hay2 = new Tile("Hay2", 100, 53, "png");
    var Gold2 = new Tile("Gold2", 100, 45, "png");
    var Gold1 = new Tile("Gold1", 100, 44, "png");
    var FF4 = new Tile("FF4", 72, 45, "png");
    var FF4_BT = new Tile("FF4_BT", 72, 45, "png");
    var FF4_left = new Tile("FF4_left", 45, 72, "png");
    var FF4_right = new Tile("FF4_right", 45, 72, "png");
    var Phara = new Tile("Phara", 72, 51, "png");
    var Phara_BT = new Tile("Phara_BT", 72, 51, "png");
    var Phara_left = new Tile("Phara_left", 51, 72, "png");
    var Phara_right = new Tile("Phara_right", 51, 72, "png");
    var RRR = new Tile("RRR", 66, 66, "png");
    var RRR_BT = new Tile("RRR_BT", 66, 66, "png");
    var RRR_left = new Tile("RRR_left", 66, 66, "png");
    var RRR_right = new Tile("RRR_right", 66, 66, "png");
    var Bed = new Tile("bed2", 72, 100, "png");
    var Sign = new Tile("treasury", 65, 178, "png");
    var WallLamp_BT_L = new Tile("WallLamp_BT_L", 26, 60, "png");
    var WallLamp_BT_R = new Tile("WallLamp_BT_R", 26, 60, "png");
    var WallLamp_LR = new Tile("WallLamp_LR", 60, 26, "png");
    var WallLamp_RR = new Tile("WallLamp_RR", 60, 26, "png");
    var WallLamp_RL = new Tile("WallLamp_RL", 60, 26, "png");
    var WallLamp_LL = new Tile("WallLamp_LL", 60, 26, "png");
    var Tut2 = new Tile("Tut2", 72, 61, "png");
    var Tut2_BT = new Tile("Tut2_BT", 72, 61, "png");
    var Tut2_left = new Tile("Tut2_left", 61, 72, "png");
    var Tut2_right = new Tile("Tut2_right", 61, 72, "png");
    var AA5 = new Tile("AA5", 72, 56, "png");
    var AA5_BT = new Tile("AA5_BT", 72, 56, "png");
    var AA5_left = new Tile("AA5_left", 56, 72, "png");
    var AA5_right = new Tile("AA5_right", 56, 72, "png");
    var DM5 = new Tile("DM5", 72, 45, "png");
    var DM5_BT = new Tile("DM5_BT", 72, 45, "png");
    var DM5_left = new Tile("DM5_left", 45, 72, "png");
    var DM5_right = new Tile("DM5_right", 45, 72, "png");
    var DM3 = new Tile("DM3", 72, 46, "png");
    var DM3_BT = new Tile("DM3_BT", 72, 46, "png");
    var DM3_left = new Tile("DM3_left", 46, 72, "png");
    var DM3_right = new Tile("DM3_right", 46, 72, "png");
    var SW2 = new Tile("SW2", 72, 57, "png");
    var SW2_BT = new Tile("SW2_BT", 72, 57, "png");
    var SW2_left = new Tile("SW2_left", 57, 72, "png");
    var SW2_right = new Tile("SW2_right", 57, 72, "png");
    var LTUT = new Tile("LTUT", 72, 47, "png");
    var LTUT_BT = new Tile("LTUT_BT", 72, 47, "png");
    var LTUT_left = new Tile("LTUT_left", 47, 72, "png");
    var LTUT_right = new Tile("LTUT_right", 47, 72, "png");
    var Tut_BT = new Tile("Tut_BT", 53, 60, "png");
    var WizardOfWor_right = new Tile("WizardOfWor_right", 54, 72, "png");
    var Dig_BT = new Tile("Dig_BT", 72, 45, "png");
}

var World = {
    wall: [BrickWall, BrickWall2, BrickWall3, BrickWall4, DungeonWall, DungeonWall2, DungeonWall3, WhiteWall, CastleWall, HedgeWall, OldWall, SlateWall, StoneWall, StoneWall2, StrangeWall],
    floor: [MorgueFloor, DungeonFloor, DungeonFloor2, StoneFloor, BrokenRuin, StoneFloor2, StoneFloor3, StoneFloor4, Grass, Gravel, Pavement, Pavement2, RockFloor, ThachFloor, YellowBrick],
    sprite: [Coolie],
    item: [Sword, Crown, Lantern, Apple, Pear, Banana, Watermelon, Pineapple, Ring, Acorn, Frog, Coin, Candle, Mushroom, Necklace, Cake, Carrot, Egg, Tomato, Orange, Strawberry, Potato, Corn, Mouse, Fly, Bone, Sheep, Hat],
    key: [BlueKey, RedKey, GreenKey, GoldKey, OrangeKey, SilverKey, PinkKey, YellowKey],
    actor: [Princess, Knight, Ghost, Witch, Horse, Squirrel, Skeleton, Bear, Hen, Faerie, Cat, Dog, Wolf, Spider, Cow],
    furniture: [Rug1, Rug2, Rug3, Rug4, Gate, Fireplace, LanternPole, Wardrobe1, Wardrobe2, LanternPole1S, LanternPole3, LanternPole3S, LanternPole2W, LanternPole2E, PIC_Hero, PIC_SVS, PIC_Hobbit, PIC_AA, PIC_DM, Taperstry1L, Taperstry2B, Taperstry3R, Crack2, Crack1, WallLampL, Taperstry7T, Taperstry6R, Taperstry6L, Taperstry4T, WallLampR, PIC_ForbidenForest, PIC_WOW, PIC_Pacman, Cauldron, Cauldron2, Pond, Chest, PIC_DM2, PIC_DM3, Clock, TallClock, Tree2, Tree1, Plant1, Plant2, Plant3, SpiderWeb, Frogger, Knightlore_BT, Knightlore, Pitfall2_right, SheepSkinRug, Bush1, Rug6, Rug5, FF3_left, FF3_right, AA4_BT, AA3_right, AA3, AA2_left, AA2, FF2, FF2_BT, SVS_right, DM2_BT, Lode_right, Lode_left, Lode_BT, Lode, Hero_left, DM1_left, JSW_left, JSW, HOB2_left, HOB2, Hero_BT, HOB2_BT, HOB1_BT, Dig_right, Dig, Under_right, Under, Apshai_left, Apshai_BT, Apshai, Prince_right, Prince_BT, Prince, Tut, Tut_left, Galaxian, Galaxian_left, Scramble_BT, Frogger_BT, Invaders, Invaders_BT, Invaders_left, Invaders_right, Pitfall, Pitfall_BT, Pitfall_left, Pitfall_right, Aztec, Aztec_BT, Aztec_left, Aztec_right, Pitfall2, Pitfall2_BT, Pitfall2_left, Pitfall3_right, DK, DK_BT, DK_left, DK_right, PAC2, PAC2_BT, PAC2_left, PAC2_right, Gold2, Gold1, Hay, Hay2, FF4, FF4_BT, FF4_left, FF4_right, Phara, Phara_BT, Phara_left, Phara_right, RRR, RRR_BT, RRR_left, RRR_right, Bed, Sign, Tut2, Tut2_BT, Tut2_left, Tut2_right, AA5, AA5_BT, AA5_left, AA5_right, DM5, DM5_BT, DM5_left, DM5_right, DM3, DM3_BT, DM3_left, DM3_right, SW2, SW2_BT, SW2_left, SW2_right, LTUT, LTUT_BT, LTUT_left, LTUT_right, Tut_BT, WizardOfWor_right, Dig_BT],
    torch: [Torch2_LR, Torch2_BL, Torch2_BR, Torch2_RL, Torch1_RR, Torch1_LL, Torch1_TL, Torch1_TR, WallLamp_BT_L, WallLamp_BT_R, WallLamp_LR, WallLamp_RR, WallLamp_RL, WallLamp_LL]
};
var Furniture = function (tile, x, y, name) {
    this.tile = tile;
    this.x = x;
    this.y = y;
    this.name = name;
};
var FURNITURE = {
    draw: function (x, y, id) {
        Sprite.draw(x, y, id);
    }
};

{
    FURNITURE.rug1 = new Furniture(Rug1, 72 + (360 - Rug1.x) / 2, 72 + (360 - Rug1.y) / 2, "the rug");
    FURNITURE.rug2 = new Furniture(Rug2, 72 + (360 - Rug2.x) / 2, 72 + (360 - Rug2.y) / 2, "the rug");
    FURNITURE.rug3 = new Furniture(Rug3, 72 + (360 - Rug3.x) / 2, 72 + (360 - Rug3.y) / 2, "the rug");
    FURNITURE.rug4 = new Furniture(Rug4, 72 + (360 - Rug4.x) / 2, 72 + (360 - Rug4.y) / 2, "the rug");
    FURNITURE.rug5 = new Furniture(Rug5, 72 + (360 - Rug5.x) / 2, 72 + (360 - Rug5.y) / 2, "the rug");
    FURNITURE.rug6 = new Furniture(Rug6, 72 + (360 - Rug6.x) / 2, 72 + (360 - Rug6.y) / 2, "the rug");
    FURNITURE.SheepSkinRug = new Furniture(SheepSkinRug, 72 + (360 - SheepSkinRug.x) / 2, 72 + (360 - SheepSkinRug.y) / 2, "the rug");
    FURNITURE.gate = new Furniture(Gate, 72 + (360 - Gate.x) / 2, 6, "the gate");
    FURNITURE.fireplaceL = new Furniture(Fireplace, 100, 17, "the fireplace");
    FURNITURE.fireplaceR = new Furniture(Fireplace, 342, 17, "the fireplace");
    FURNITURE.fireplaceC = new Furniture(Fireplace, 72 + (360 - Fireplace.x) / 2, 17, "the fireplace");
    FURNITURE.wardrobe1L = new Furniture(Wardrobe1, 100, 9, "the wardrobe");
    FURNITURE.wardrobe1R = new Furniture(Wardrobe1, 342, 9, "the wardrobe");
    FURNITURE.wardrobe2R = new Furniture(Wardrobe2, 342, 7, "the wardrobe");
    FURNITURE.wardrobe2L = new Furniture(Wardrobe2, 100, 7, "the wardrobe");
    FURNITURE.lanternPoleL = new Furniture(LanternPole, 212, 12, "the lantern pole");
    FURNITURE.lanternPoleR = new Furniture(LanternPole, 282, 12, "the lantern pole");
    FURNITURE.lanternPole3L = new Furniture(LanternPole3, 212, 12, "the lantern pole");
    FURNITURE.lanternPole3R = new Furniture(LanternPole3, 282, 12, "the lantern pole");
    FURNITURE.wallLamp_LT = new Furniture(WallLampL, 200, 12, "the wall lamp");
    FURNITURE.wallLamp_RT = new Furniture(WallLampR, 290, 12, "the wall lamp");
    FURNITURE.wallLamp_RB = new Furniture(WallLampR, 290, 106, "the wall lamp");
    FURNITURE.tree1_TLbD = new Furniture(Tree1, 200, 6, "the tree");
    FURNITURE.tree1_TRbD = new Furniture(Tree1, 290, 6, "the tree");
    FURNITURE.lanternPoleLS = new Furniture(LanternPole1S, 212, 512 - LanternPole1S.y - 12, "the lantern pole");
    FURNITURE.lanternPoleRS = new Furniture(LanternPole1S, 282, 512 - LanternPole1S.y - 12, "the lantern pole");
    FURNITURE.lanternPole3LS = new Furniture(LanternPole3S, 212, 512 - LanternPole3S.y - 12, "the lantern pole");
    FURNITURE.lanternPole3RS = new Furniture(LanternPole3S, 282, 512 - LanternPole3S.y - 12, "the lantern pole");
    FURNITURE.PIC_DM_TC = new Furniture(PIC_DM, 72 + (360 - PIC_DM.x) / 2, (72 - PIC_DM.y) / 2, "the painting");
    FURNITURE.PIC_DM3_BC = new Furniture(PIC_DM3, 72 + (360 - PIC_DM.x) / 2, 94 + (72 - PIC_DM.y) / 2, "the painting");
    FURNITURE.PIC_DM_TR = new Furniture(PIC_DM, 320, (72 - PIC_DM.y) / 2, "the painting");
    FURNITURE.PIC_DM2_TR = new Furniture(PIC_DM2, 320, (72 - PIC_DM.y) / 2, "the painting");
    FURNITURE.PIC_DM3_TR = new Furniture(PIC_DM3, 320, (72 - PIC_DM.y) / 2, "the painting");
    FURNITURE.PIC_Hobbit_BL = new Furniture(PIC_Hobbit, 72 + 50, 94 + (72 - PIC_Hobbit.y) / 2, "the painting");
    FURNITURE.PIC_Hobbit_BC = new Furniture(PIC_Hobbit, 72 + (360 - PIC_Hobbit.x) / 2, 94 + (72 - PIC_Hobbit.y) / 2, "the painting");
    FURNITURE.PIC_AA_TC = new Furniture(PIC_AA, 72 + (360 - PIC_AA.x) / 2, (72 - PIC_AA.y) / 2, "the painting");
    FURNITURE.PIC_AA_TR = new Furniture(PIC_AA, 320, (72 - PIC_AA.y) / 2, "the painting");
    FURNITURE.Frogger_TR = new Furniture(Frogger, 320, (72 - Frogger.y) / 2, "the painting");
    FURNITURE.PIC_AA_TL = new Furniture(PIC_AA, 72 + 50, (72 - PIC_AA.y) / 2, "the painting");
    FURNITURE.PIC_PAC_BC = new Furniture(PIC_Pacman, 72 + (360 - PIC_Pacman.x) / 2, 94 + (72 - PIC_Pacman.y) / 2, "the painting");
    FURNITURE.PC_Hero_TR = new Furniture(PIC_Hero, 320, (72 - PIC_Hero.y) / 2, "the painting");
    FURNITURE.PC_Hero_TC = new Furniture(PIC_Hero, 72 + (360 - PIC_Hero.x) / 2, (72 - PIC_Hero.y) / 2, "the painting");
    FURNITURE.PC_SVS_TL = new Furniture(PIC_SVS, 72 + 50, (72 - PIC_SVS.y) / 2, "the painting");
    FURNITURE.PC_SVS_TC = new Furniture(PIC_SVS, 72 + (360 - PIC_SVS.x) / 2, (72 - PIC_SVS.y) / 2, "the painting");
    FURNITURE.PC_FF_TR = new Furniture(PIC_ForbidenForest, 320, (72 - PIC_ForbidenForest.y) / 2, "the painting");
    FURNITURE.PC_FF_TC = new Furniture(PIC_ForbidenForest, 72 + (360 - PIC_ForbidenForest.x) / 2, (72 - PIC_ForbidenForest.y) / 2, "the painting");
    FURNITURE.PC_FF_TL = new Furniture(PIC_ForbidenForest, 105, (72 - PIC_ForbidenForest.y) / 2, "the painting");
    FURNITURE.PC_WOW_TR = new Furniture(PIC_WOW, 320, (72 - PIC_WOW.y) / 2, "the painting");
    FURNITURE.PC_WOW_TL = new Furniture(PIC_WOW, 105, (72 - PIC_WOW.y) / 2, "the painting");
    FURNITURE.tapestry1L = new Furniture(Taperstry1L, 4, 72 + (360 - Taperstry1L.y) / 2, "the tapestry");
    FURNITURE.tapestry2B = new Furniture(Taperstry2B, 72 + (360 - Taperstry2B.x) / 2, 72 + 364, "the tapestry");
    FURNITURE.tapestry3R = new Furniture(Taperstry3R, 438, 72 + (360 - Taperstry3R.y) / 2, "the tapestry");
    FURNITURE.lanternpole2WL = new Furniture(LanternPole2W, 12, 284, "the lantern pole");
    FURNITURE.lanternpole2WL_H = new Furniture(LanternPole2W, 96, 284, "the lantern pole");
    FURNITURE.lanternpole2WR = new Furniture(LanternPole2W, 12, 204, "the lantern pole");
    FURNITURE.lanternpole2WR_H = new Furniture(LanternPole2W, 96, 204, "the lantern pole");
    FURNITURE.lanternpole2EL = new Furniture(LanternPole2E, 512 - LanternPole2E.x - 12, 284, "the lantern pole");
    FURNITURE.lanternpole2ER = new Furniture(LanternPole2E, 512 - LanternPole2E.x - 12, 204, "the lantern pole");
    FURNITURE.lanternpole2EL_H = new Furniture(LanternPole2E, 428 - LanternPole2E.x - 12, 284, "the lantern pole");
    FURNITURE.lanternpole2ER_H = new Furniture(LanternPole2E, 428 - LanternPole2E.x - 12, 204, "the lantern pole");
    FURNITURE.tapestry6L_HR = new Furniture(Taperstry6L, 96, 72 + (360 - Taperstry6L.y) / 2, "the tapestry");
    FURNITURE.tapestry6L_R = new Furniture(Taperstry6L, 6, 72 + (360 - Taperstry6L.y) / 2, "the tapestry");
    FURNITURE.tapestry6R_HR = new Furniture(Taperstry6R, 350, 72 + (360 - Taperstry6R.y) / 2, "the tapestry");
    FURNITURE.tapestry1L_HR = new Furniture(Taperstry1L, 96, 72 + (360 - Taperstry1L.y) / 2, "the tapestry");
    FURNITURE.tapestry4T_H = new Furniture(Taperstry4T, 72 + (360 - Taperstry4T.x) / 2, 6, "the tapestry");
    FURNITURE.tapestry4T_B = new Furniture(Taperstry4T, 72 + (360 - Taperstry4T.x) / 2, 94, "the tapestry");
    FURNITURE.tapestry7T_H = new Furniture(Taperstry7T, 72 + (360 - Taperstry7T.x) / 2, 6, "the tapestry");
    FURNITURE.tapestry7T_B = new Furniture(Taperstry7T, 72 + (360 - Taperstry7T.x) / 2, 94, "the tapestry");
    FURNITURE.pond = new Furniture(Pond, 72 + (360 - Pond.x) / 2, 72 + (360 - Pond.y) / 2, "the pond");
    FURNITURE.cauldron = new Furniture(Cauldron, 152, 32, "the cauldron");
    FURNITURE.cauldron2 = new Furniture(Cauldron2, 348, 30, "the cauldron");
    FURNITURE.crack1_TR = new Furniture(Crack2, 320, 5, "the crack");
    FURNITURE.crack2 = new Furniture(Crack1, 72 + (360 - Crack1.x) / 2, 432 + (72 - Crack1.y) / 2, "the crack");
    FURNITURE.crack2L = new Furniture(Crack1, 120, 432 + (72 - Crack1.y) / 2, "the crack");
    FURNITURE.chest = new Furniture(Chest, 90, 48, "the chest");
    FURNITURE.tallClock_TL = new Furniture(TallClock, 120, 4, "the clock");
    FURNITURE.tallClock_TR = new Furniture(TallClock, 350, 4, "the clock");
    FURNITURE.tallClock_BL = new Furniture(TallClock, 120, 94, "the clock");
    FURNITURE.tallClock_BR = new Furniture(TallClock, 350, 94, "the clock");
    FURNITURE.tree1_TL = new Furniture(Tree1, 100, 4, "the tree");
    FURNITURE.tree2_TR = new Furniture(Tree2, 350, 4, "the tree");
    FURNITURE.tree2_TL = new Furniture(Tree2, 100, 4, "the tree");
    FURNITURE.tree2_BL = new Furniture(Tree2, 100, 100, "the tree");
    FURNITURE.tree1_TR = new Furniture(Tree1, 350, 4, "the tree");
    FURNITURE.plant2_TR = new Furniture(Plant2, 350, 4, "the plant");
    FURNITURE.plant3_TL = new Furniture(Plant3, 100, 4, "the plant");
    FURNITURE.plant1_TL = new Furniture(Plant1, 100, 4, "the plant");
    FURNITURE.bush_BL = new Furniture(Bush1, 100, 100, "the bush");
    FURNITURE.bush_TR = new Furniture(Bush1, 350, 4, "the bush");
    FURNITURE.clock_TL = new Furniture(Clock, 120, (72 - Clock.y) / 2, "the clock");
    FURNITURE.clock_TR = new Furniture(Clock, 350, (72 - Clock.y) / 2, "the clock");
    FURNITURE.spiderWeb = new Furniture(SpiderWeb, 350, 4, "the spider web");
    FURNITURE.spiderWeb_C = new Furniture(SpiderWeb, 72 + (360 - SpiderWeb.x) / 2, 6, "the spider web");
    FURNITURE.spiderWeb_L = new Furniture(SpiderWeb, 100, 3, "the spider web");
    FURNITURE.spiderWeb_HR = new Furniture(SpiderWeb, 295, 4, "the spider web");
    FURNITURE.FF2_BT = new Furniture(FF2_BT, 72 + (360 - FF2_BT.x) / 2, 438 + (72 - FF2_BT.y) / 2, "the painting");
    FURNITURE.AA2_right = new Furniture(AA2_left, 438 + (72 - (AA2_left.x)) / 2, 72 + (360 - AA2_left.y) / 2, "the painting");
    FURNITURE.FF3_left = new Furniture(FF3_left, (72 - (FF3_left.x)) / 2, 72 + (360 - FF3_left.y) / 2, "the painting");
    FURNITURE.FF3_right = new Furniture(FF3_right, 438 + (72 - (FF3_right.x)) / 2, 72 + (360 - FF3_right.y) / 2, "the painting");
    FURNITURE.torch_BL = new Furniture(Torch2_BL, 190, 512 - Torch2_BL.y - 12, "the torch");
    FURNITURE.torch_BR = new Furniture(Torch2_BR, 286, 512 - Torch2_BR.y - 12, "the torch");
    FURNITURE.torch_H_RL = new Furniture(Torch2_RL, 350, 190, "the torch");
    FURNITURE.torch_H_RR = new Furniture(Torch1_RR, 350, 284, "the torch");
    FURNITURE.torch_RL = new Furniture(Torch2_RL, 440, 190, "the torch");
    FURNITURE.torch_RR = new Furniture(Torch1_RR, 440, 284, "the torch");
    FURNITURE.torch_LL = new Furniture(Torch1_LL, 8, 284, "the torch");
    FURNITURE.torch_LR = new Furniture(Torch2_LR, 8, 190, "the torch");
    FURNITURE.torch_H_LL = new Furniture(Torch1_LL, 102, 284, "the torch");
    FURNITURE.torch_H_LR = new Furniture(Torch2_LR, 102, 190, "the torch");
    FURNITURE.AA3_right_H = new Furniture(AA3_right, 350 + (72 - (AA3_right.x)) / 2, 72 + (360 - AA3_right.y) / 2, "the painting");
    FURNITURE.Knightlore_BT = new Furniture(Knightlore_BT, 72 + (360 - Knightlore_BT.x) / 2, 438 + (72 - Knightlore_BT.y) / 2, "the painting");
    FURNITURE.AA4_BT = new Furniture(AA4_BT, 72 + (360 - AA4_BT.x) / 2, 438 + (72 - AA4_BT.y) / 2, "the painting");
    FURNITURE.AA3_TL = new Furniture(AA3, 72 + 50, (72 - AA3.y) / 2, "the painting");
    FURNITURE.Knightlore_TR = new Furniture(Knightlore, 320, (72 - Knightlore.y) / 2, "the painting");
    FURNITURE.Pitfall2_right_H = new Furniture(Pitfall2_right, 350 + (72 - (Pitfall2_right.x)) / 2, 72 + (360 - Pitfall2_right.y) / 2, "the painting");
    FURNITURE.Pitfall2_right = new Furniture(Pitfall2_right, 438 + (72 - (Pitfall2_right.x)) / 2, 72 + (360 - Pitfall2_right.y) / 2, "the painting");
    FURNITURE.SVS_right = new Furniture(SVS_right, 438 + (72 - (SVS_right.x)) / 2, 72 + (360 - SVS_right.y) / 2, "the painting");
    FURNITURE.FF2_BR = new Furniture(FF2, 320, 94 + (72 - FF2.y) / 2, "the painting");
    FURNITURE.DM1_left = new Furniture(DM1_left, (72 - (DM1_left.x)) / 2, 72 + (360 - DM1_left.y) / 2, "the painting");
    FURNITURE.Lode_right = new Furniture(Lode_right, 438 + (72 - (Lode_right.x)) / 2, 72 + (360 - Lode_right.y) / 2, "the painting");
    FURNITURE.HOB2_left_L = new Furniture(HOB2_left, (72 - (HOB2_left.x)) / 2, 320, "the painting");
    FURNITURE.HOB1_BT = new Furniture(HOB1_BT, 72 + (360 - HOB1_BT.x) / 2, 438 + (72 - HOB1_BT.y) / 2, "the painting");
    FURNITURE.Lode_left = new Furniture(Lode_left, (72 - (Lode_left.x)) / 2, 72 + (360 - Lode_left.y) / 2, "the painting");
    FURNITURE.JSW_left = new Furniture(JSW_left, (72 - (JSW_left.x)) / 2, 72 + (360 - JSW_left.y) / 2, "the painting");
    FURNITURE.Lode_TC = new Furniture(Lode, 72 + (360 - Lode.x) / 2, (72 - Lode.y) / 2, "the painting");
    FURNITURE.Hero_BT = new Furniture(Hero_BT, 72 + (360 - Hero_BT.x) / 2, 438 + (72 - Hero_BT.y) / 2, "the painting");
    FURNITURE.HOB2_BT = new Furniture(HOB2_BT, 72 + (360 - HOB2_BT.x) / 2, 438 + (72 - HOB2_BT.y) / 2, "the painting");
    FURNITURE.Galaxian_left = new Furniture(Galaxian_left, (72 - (Galaxian_left.x)) / 2, 72 + (360 - Galaxian_left.y) / 2, "the painting");
    FURNITURE.Tut_left_H = new Furniture(Tut_left, 94 + ((72 - (Tut_left.x)) / 2), 72 + (360 - Tut_left.y) / 2, "the painting");
    FURNITURE.Apshai_left = new Furniture(Apshai_left, (72 - (Apshai_left.x)) / 2, 72 + (360 - Apshai_left.y) / 2, "the painting");
    FURNITURE.Scramble_BT = new Furniture(Scramble_BT, 72 + (360 - Scramble_BT.x) / 2, 438 + (72 - Scramble_BT.y) / 2, "the painting");
    FURNITURE.Under_right = new Furniture(Under_right, 438 + (72 - (Under_right.x)) / 2, 72 + (360 - Under_right.y) / 2, "the painting");
    FURNITURE.Frogger_BT = new Furniture(Frogger_BT, 72 + (360 - Frogger_BT.x) / 2, 438 + (72 - Frogger_BT.y) / 2, "the painting");
    FURNITURE.Prince_BT = new Furniture(Prince_BT, 72 + (360 - Prince_BT.x) / 2, 438 + (72 - Prince_BT.y) / 2, "the painting");
    FURNITURE.Dig_right = new Furniture(Dig_right, 438 + (72 - (Dig_right.x)) / 2, 72 + (360 - Dig_right.y) / 2, "the painting");
    FURNITURE.Apshai_left_H = new Furniture(Apshai_left, 94 + ((72 - (Apshai_left.x)) / 2), 72 + (360 - Apshai_left.y) / 2, "the painting");
    FURNITURE.Prince_TDR = new Furniture(Prince, 320, 94 + (72 - Prince.y) / 2, "the painting");
    FURNITURE.Tut_TDL = new Furniture(Tut, 122, 94 + (72 - Tut.y) / 2, "the painting");
    FURNITURE.HOB2_W_BT = new Furniture(HOB2_BT, 72 + (360 - HOB2_BT.x) / 2, 344 + (72 - HOB2_BT.y) / 2, "the painting");
    FURNITURE.Apshai_W_BL = new Furniture(Apshai_BT, 124, 344 + (72 - Apshai_BT.y) / 2, "the painting");
    FURNITURE.Galaxian_TC = new Furniture(Galaxian, 72 + (360 - Galaxian.x) / 2, (72 - Galaxian.y) / 2, "the painting");
    FURNITURE.Hay_left = new Furniture(Hay2, 120, 50, "the hay");
    FURNITURE.Hay_right = new Furniture(Hay2, 280, 50, "the hay");
    FURNITURE.Pitfall3_right = new Furniture(Pitfall3_right, 438 + (72 - (Pitfall3_right.x)) / 2, 72 + (360 - Pitfall3_right.y) / 2, "the painting");
    FURNITURE.Gold1 = new Furniture(Gold1, 75, 60, "the gold");
    FURNITURE.Gold2 = new Furniture(Gold2, 330, 60, "the gold");
    FURNITURE.PAC2_right = new Furniture(PAC2_right, 438 + (72 - (PAC2_right.x)) / 2, 72 + (360 - PAC2_right.y) / 2, "the painting");
    FURNITURE.Invaders_BT = new Furniture(Invaders_BT, 72 + (360 - Invaders_BT.x) / 2, 438 + (72 - Invaders_BT.y) / 2, "the painting");
    FURNITURE.Aztec_left = new Furniture(Aztec_left, (72 - (Aztec_left.x)) / 2, 72 + (360 - Aztec_left.y) / 2, "the painting");
    FURNITURE.Pitfall2_left_L = new Furniture(Pitfall2_left, (72 - (Pitfall2_left.x)) / 2, 320, "the painting");
    FURNITURE.DK_left_R = new Furniture(DK_left, (72 - (DK_left.x)) / 2, 122, "the painting");
    FURNITURE.Aztec_BT_R = new Furniture(Aztec_BT, 320, 438 + (72 - Aztec_BT.y) / 2);
    FURNITURE.Pitfall_TL = new Furniture(Pitfall, 72 + 50, (72 - Pitfall.y) / 2, "the painting");
    FURNITURE.Pitfall_BT_W_R = new Furniture(Pitfall_BT, 320, 344 + (72 - Pitfall_BT.y) / 2);
    FURNITURE.Pitfall3_right_R = new Furniture(Pitfall3_right, 438 + (72 - (Pitfall3_right.x)) / 2, 320, "the painting");
    FURNITURE.bed = new Furniture(Bed, 66, 446 - Bed.y, "the bed");
    FURNITURE.sign = new Furniture(Sign, 94 + (72 - (Sign.x)) / 2, 72 + (360 - Sign.y) / 2, "the sign");
    FURNITURE.Phara_left_R = new Furniture(Phara_left, (72 - (Phara_left.x)) / 2, 120, "the painting");
    FURNITURE.RRR_left_L = new Furniture(RRR_left, 4 + (72 - (RRR_left.x)) / 2, 320, "the painting");
    FURNITURE.FF4_BT = new Furniture(FF4_BT, 72 + (360 - FF4_BT.x) / 2, 438 + (72 - FF4_BT.y) / 2, "the painting");
    FURNITURE.FF4_TC = new Furniture(FF4, 72 + (360 - FF4.x) / 2, (72 - FF4.y) / 2, "the painting");
    FURNITURE.PAC2_left_L = new Furniture(PAC2_left, (72 - (PAC2_left.x)) / 2, 320, "the painting");
    FURNITURE.DK_right_R = new Furniture(DK_right, 438 + (72 - (DK_right.x)) / 2, 320, "the painting");
    FURNITURE.RRR_BT_R = new Furniture(RRR_BT, 320, 438 + (72 - RRR_BT.y) / 2);
    FURNITURE.WallLamp_RL = new Furniture(WallLamp_RL, 440, 196, "the lamp");
    FURNITURE.WallLamp_RR = new Furniture(WallLamp_RR, 440, 286, "the lamp");
    FURNITURE.WallLamp_LL = new Furniture(WallLamp_LL, 8, 286, "the torch");
    FURNITURE.WallLamp_LR = new Furniture(WallLamp_LR, 8, 196, "the torch");
    FURNITURE.Pitfall2_BT = new Furniture(Pitfall2_BT, 72 + (360 - Pitfall2_BT.x) / 2, 438 + (72 - Pitfall2_BT.y) / 2, "the painting");
    FURNITURE.Galaxian_left_L = new Furniture(Galaxian_left, 4 + (72 - (Galaxian_left.x)) / 2, 320, "the painting");
    FURNITURE.Invaders_left = new Furniture(Invaders_left, (72 - (Invaders_left.x)) / 2, 72 + (360 - Invaders_left.y) / 2, "the painting");
    FURNITURE.Aztec_right = new Furniture(Aztec_right, 438 + (72 - (Aztec_right.x)) / 2, 72 + (360 - Aztec_right.y) / 2, "the painting");
    FURNITURE.Pitfall_left_H_L = new Furniture(Pitfall_left, 94 + (72 - (Pitfall_left.x)) / 2, 320, "the painting");
    FURNITURE.Phara_right_H = new Furniture(Phara_right, 350 + (72 - (Phara_right.x)) / 2, 72 + (360 - Phara_right.y) / 2, "the painting");
    FURNITURE.Prince_TC = new Furniture(Prince, 72 + (360 - Prince.x) / 2, (72 - Prince.y) / 2, "the painting");
    FURNITURE.RRR_BT = new Furniture(RRR_BT, 72 + (360 - RRR_BT.x) / 2, 438 + (72 - RRR_BT.y) / 2, "the painting");
    FURNITURE.Tut2_right = new Furniture(Tut2_right, 438 + (72 - (Tut2_right.x)) / 2, 72 + (360 - Tut2_right.y) / 2, "the painting");
    FURNITURE.DM5_left_L = new Furniture(DM5_left, (72 - (DM5_left.x)) / 2, 320, "the painting");
    FURNITURE.SW2_left_R = new Furniture(SW2_left, (72 - (SW2_left.x)) / 2, 120, "the painting");
    FURNITURE.DM3_BT_W_L = new Furniture(DM3_BT, 124, 344 + (72 - DM3_BT.y) / 2);
    FURNITURE.LTUT_left_H = new Furniture(LTUT_left, 94 + ((72 - (LTUT_left.x)) / 2), 72 + (360 - LTUT_left.y) / 2, "the painting");
    FURNITURE.DM3_left_H_R = new Furniture(DM3_left, 94 + ((72 - (DM3_left.x)) / 2), 120, "the painting");
    FURNITURE.AA5_BT = new Furniture(AA5_BT, 72 + (360 - AA5_BT.x) / 2, 438 + (72 - AA5_BT.y) / 2, "the painting");
    FURNITURE.Tut_BT_W = new Furniture(Tut_BT, 72 + (360 - Tut_BT.x) / 2, 344 + (72 - Tut_BT.y) / 2, "the painting");
    FURNITURE.Tut2_BT_W = new Furniture(Tut2_BT, 72 + (360 - Tut2_BT.x) / 2, 344 + (72 - Tut2_BT.y) / 2, "the painting");
    FURNITURE.DM5_right_H_R = new Furniture(DM5_right, 350 + (72 - (DM5_right.x)) / 2, 320, "the painting");
    FURNITURE.DM3_right_H_L = new Furniture(DM3_right, 350 + (72 - (DM3_right.x)) / 2, 120, "the painting");
    FURNITURE.LTUT_right_H = new Furniture(LTUT_right, 350 + (72 - (LTUT_right.x)) / 2, 72 + (360 - LTUT_right.y) / 2, "the painting");
    FURNITURE.AA5_left_H_L = new Furniture(AA5_left, 94 + (72 - (AA5_left.x)) / 2, 320, "the painting");
    FURNITURE.WallLamp_RL_H = new Furniture(WallLamp_RL, 350, 196, "the lamp");
    FURNITURE.WallLamp_RR_H = new Furniture(WallLamp_RR, 350, 286, "the lamp");
}

var Containers = ["the closet", "the chest"];
var Actor = function (tile, x, y, name, item, wants, gridX, gridY) {
    this.tile = tile;
    this.x = x;
    this.y = y;
    this.name = name;
    this.item = item;
    this.wants = wants;
    this.gridX = gridX;
    this.gridY = gridY;
};
var ACTORS = {
    draw: function (x, y, id) {
        Sprite.draw(x, y, id);
    }
};

var Item = function (tile, X, Y, type, name) {
    this.tile = tile;
    this.X = X;
    this.Y = Y;
    this.type = type;
    this.name = name;
};
var ITEMS = {
    draw: function (x, y, id) {
        var xx = MAP["room" + COOLIE.room].grid.iX + x * INI.GRIDPX;
        var yy = MAP["room" + COOLIE.room].grid.iY + y * INI.GRIDPX;
        Sprite.draw(xx, yy, id);
    }
};
{
    ITEMS.redkey = new Item(RedKey, 2, 2, "key", "the red key");
    ITEMS.bluekey = new Item(BlueKey, 2, 3, "key", "the blue key");
    ITEMS.greenkey = new Item(GreenKey, 2, 4, "key", "the green key");
    ITEMS.goldkey = new Item(GoldKey, 2, 4, "key", "the gold key");
    ITEMS.silverkey = new Item(SilverKey, 2, 4, "key", "the silver key");
    ITEMS.orangekey = new Item(OrangeKey, 2, 4, "key", "the orange key");
    ITEMS.pinkkey = new Item(PinkKey, 2, 4, "key", "the pink key");
    ITEMS.yellowkey = new Item(YellowKey, 2, 4, "key", "the yellow key");
    ITEMS.sword = new Item(Sword, 3, 3, "item", "the sword");
    ITEMS.crown = new Item(Crown, 3, 3, "item", "the crown");
    ITEMS.apple = new Item(Apple, 0, 6, "item", "the apple");
    ITEMS.corn = new Item(Corn, 3, 3, "item", "the corn");
    ITEMS.banana = new Item(Banana, 1, 6, "item", "the banana");
    ITEMS.watermelon = new Item(Watermelon, 3, 6, "item", "the watermelon");
    ITEMS.pineapple = new Item(Pineapple, 5, 6, "item", "the pineapple");
    ITEMS.pear = new Item(Pear, 6, 6, "item", "the pear");
    ITEMS.lantern = new Item(Lantern, 0, 0, "item", "the lantern");
    ITEMS.ring = new Item(Ring, 0, 0, "item", "the ring");
    ITEMS.acorn = new Item(Acorn, 0, 0, "item", "the acorn");
    ITEMS.frog = new Item(Frog, 2, 3, "item", "the frog");
    ITEMS.coin = new Item(Coin, 0, 0, "item", "the coin");
    ITEMS.mushroom = new Item(Mushroom, 3, 3, "item", "the mushroom");
    ITEMS.candle = new Item(Candle, 0, 6, "item", "the candle");
    ITEMS.candle2 = new Item(Candle, 2, 2, "item", "the candle");
    ITEMS.candle3 = new Item(Candle, 3, 3, "item", "the candle");
    ITEMS.necklace = new Item(Necklace, 0, 0, "item", "the necklace");
    ITEMS.cake = new Item(Cake, 0, 0, "item", "the cake");
    ITEMS.carrot = new Item(Carrot, 0, 0, "item", "the carrot");
    ITEMS.egg = new Item(Egg, 0, 0, "item", "the egg");
    ITEMS.tomato = new Item(Tomato, 1, 0, "item", "the tomato");
    ITEMS.potato = new Item(Potato, 3, 0, "item", "the potato");
    ITEMS.orange = new Item(Orange, 5, 0, "item", "the orange");
    ITEMS.strawberry = new Item(Strawberry, 6, 0, "item", "the strawberry");
    ITEMS.mouse = new Item(Mouse, 6, 0, "item", "the mouse");
    ITEMS.bone = new Item(Bone, 6, 0, "item", "the bone");
    ITEMS.sheep = new Item(Sheep, 6, 0, "item", "the sheep");
    ITEMS.hat = new Item(Hat, 6, 0, "item", "the hat");
    ITEMS.fly = new Item(Fly, 6, 0, "item", "the fly");
}
{
    ACTORS.princess = new Actor(Princess, 202, 16, "the princess", null, null, 3, 0);
    ACTORS.knight = new Actor(Knight, 165, 16, "the knight", ITEMS.bluekey, "the sword", 2, 0);
    ACTORS.ghost = new Actor(Ghost, 340, 16, "the ghost", ITEMS.ring, "the lantern", 6, 0);
    ACTORS.horse = new Actor(Horse, 220, 16, "the horse", ITEMS.greenkey, "the apple", 3, 0);
    ACTORS.squirrel = new Actor(Squirrel, 220, 16, "the squirrel", ITEMS.orangekey, "the acorn", 3, 0);
    ACTORS.witch = new Actor(Witch, 220, 16, "the witch", ITEMS.lantern, "the frog", 3, 0);
    ACTORS.bear = new Actor(Bear, 260, 16, "the bear", ITEMS.mouse, "the pear", 4, 0);
    ACTORS.skeleton = new Actor(Skeleton, 200, 16, "the skeleton", ITEMS.egg, "the coin", 2, 0);
    ACTORS.hen = new Actor(Hen, 170, 24, "the hen", ITEMS.cake, "the egg", 2, 0);
    ACTORS.faerie = new Actor(Faerie, 200, 24, "the faerie", ITEMS.pinkkey, "the cake", 2, 0);
    ACTORS.cat = new Actor(Cat, 280, 24, "the cat", ITEMS.silverkey, "the mouse", 4, 0);
    ACTORS.spider = new Actor(Spider, 120, 24, "the spider", ITEMS.goldkey, "the fly", 1, 0);
    ACTORS.wolf = new Actor(Wolf, 120, 24, "the wolf", ITEMS.bone, "the sheep", 1, 0);
    ACTORS.dog = new Actor(Dog, 120, 24, "the dog", ITEMS.hat, "the bone", 1, 0);
    ACTORS.cow = new Actor(Cow, 120, 24, "the cow", ITEMS.fly, "the hat", 1, 0);
}
var RoomGrid = function (shape, width, height, iX, iY, maxX, maxY) {
    this.shape = shape;
    this.iX = iX;
    this.iY = iY;
    this.maxX = maxX;
    this.maxY = maxY;
    if (width % 2)
        width--;
    if (height % 2)
        height--;
    var x = parseInt((INI.ROOM_WIDTH - width) / 2, 10);
    this.x = x;
    this.width = width;
    if (height) {
        this.height = height;
        this.y = parseInt((INI.ROOM_WIDTH - height) / 2, 10);
    } else {
        this.height = width;
        this.y = x;
    }
};

var SquareRM = new RoomGrid("square", INI.STDW, INI.STDW, 84, 84, 6, 6);
var WRectRM = new RoomGrid("wrect", INI.STDW, INI.STDW / 2, 84, 180, 6, 2);
var HRectRM = new RoomGrid("hrect", INI.STDW / 2, INI.STDW, 180, 84, 2, 6);

var MAP = {
    room0: {
        id: 0,
        name: "the throne room",
        type: "indoor",
        grid: SquareRM,
        wall: StoneWall,
        floor: StoneFloor3,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: null,
        eCon: 1,
        inv: [],
        actor: ACTORS.princess,
        alertFlag: true,
        alert: "Dear Coolie. Thanks for answering my summons. A most dreadful thing happened. I have lost my ring somewhere. Please find it or else ... ",
        furniture: [FURNITURE.rug3, FURNITURE.fireplaceL, FURNITURE.fireplaceR, FURNITURE.tapestry1L, FURNITURE.tapestry2B, FURNITURE.WallLamp_RL, FURNITURE.WallLamp_RR],
        questFlag: false,
        questCompleted: "GAME OVER."
    },
    room1: {
        id: 1,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall,
        floor: DungeonFloor2,
        ndoor: "wood",
        edoor: "wood",
        sdoor: "open",
        wdoor: "wood",
        eCon: 2,
        wCon: 0,
        nCon: 3,
        sCon: 4,
        inv: [],
        furniture: [FURNITURE.PIC_Hobbit_BL, FURNITURE.lanternpole2WL, FURNITURE.lanternpole2WR, FURNITURE.wallLamp_RB, FURNITURE.Pitfall_BT_W_R]
    },
    room2: {
        id: 2,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: DungeonWall,
        floor: StoneFloor,
        ndoor: null,
        edoor: "wood",
        sdoor: "wood",
        wdoor: "open",
        wCon: 1,
        sCon: 9,
        eCon: 43,
        furniture: [FURNITURE.PIC_AA_TC, FURNITURE.torch_H_LL, FURNITURE.torch_H_LR]
    },
    room3: {
        id: 3,
        name: "the Rainbow room",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall2,
        floor: MorgueFloor,
        ndoor: "red",
        edoor: "blue",
        sdoor: "open",
        wdoor: "green",
        sCon: 1,
        wCon: 5,
        nCon: 6,
        eCon: 7,
        furniture: [FURNITURE.PC_Hero_TR, FURNITURE.chest, FURNITURE.torch_BL, FURNITURE.torch_BR, FURNITURE.Pitfall3_right_R],
        inv: [ITEMS.candle, ITEMS.sword],
        container: {
            name: "the chest",
            in: ITEMS.coin
        }
    },
    room4: {
        id: 4,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: StoneWall,
        floor: StoneFloor3,
        ndoor: "wood",
        edoor: null,
        sdoor: "open",
        wdoor: null,
        nCon: 1,
        sCon: 8,
        furniture: [FURNITURE.lanternPoleL, FURNITURE.lanternPoleR, FURNITURE.tapestry6L_HR, FURNITURE.LTUT_right_H],
        alertFlag: true,
        alert: "Coolie just remembered a strange dream: the princess was calling her ... Coolie better finds the princess and finds out what the princess wants. The princess is probably in the throne room. "
    },
    room5: {
        id: 5,
        name: "the green room",
        type: "indoor",
        grid: SquareRM,
        wall: DungeonWall3,
        floor: ThachFloor,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: "wood",
        eCon: 3,
        wCon: 18,
        furniture: [FURNITURE.tapestry7T_H, FURNITURE.tree1_TL, FURNITURE.tree2_TR, FURNITURE.tapestry2B, FURNITURE.Phara_left_R, FURNITURE.RRR_left_L],
        actor: ACTORS.squirrel,
        alertFlag: true,
        alert: "The squirrel seems hungry ...",
        questFlag: false,
        questCompleted: "The squirrel is very grateful for the acorn."
    },
    room6: {
        id: 6,
        name: "the Skully's",
        type: "indoor",
        grid: SquareRM,
        wall: DungeonWall,
        floor: MorgueFloor,
        ndoor: null,
        edoor: "wood",
        sdoor: "open",
        wdoor: "wood",
        sCon: 3,
        eCon: 27,
        wCon: 32,
        actor: ACTORS.skeleton,
        furniture: [FURNITURE.PIC_DM_TR, FURNITURE.tallClock_TL, FURNITURE.HOB2_left_L, FURNITURE.rug3, FURNITURE.RRR_BT_R, FURNITURE.WallLamp_RL, FURNITURE.WallLamp_RR, FURNITURE.lanternPoleLS, FURNITURE.lanternPoleRS],
        alertFlag: true,
        alert: "The princess stole all my gold and everything I possesed. I need a least one coin to escape the castle. Would you help me?",
        questFlag: false,
        questCompleted: "Thank you for your help. I will escape as soon as I dare."
    },
    room7: {
        id: 7,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: CastleWall,
        floor: Pavement2,
        ndoor: null,
        edoor: "wood",
        sdoor: null,
        wdoor: "open",
        wCon: 3,
        eCon: 13,
        furniture: [FURNITURE.PIC_PAC_BC, FURNITURE.tallClock_BL]
    },
    room8: {
        id: 8,
        name: "Coolie's bedroom",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall4,
        floor: OldWall,
        ndoor: "wood",
        edoor: null,
        sdoor: null,
        wdoor: null,
        nCon: 4,
        furniture: [FURNITURE.rug1, FURNITURE.fireplaceR, FURNITURE.wardrobe1L, FURNITURE.wallLamp_LT, FURNITURE.wallLamp_RT, FURNITURE.FF2_BT, FURNITURE.AA2_right, FURNITURE.FF3_left, FURNITURE.bed],
        container: {
            name: "the closet",
            in: ITEMS.acorn
        }
    },
    room9: {
        id: 9,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: DungeonWall,
        floor: OldWall,
        ndoor: "open",
        edoor: "wood",
        sdoor: "wood",
        wdoor: null,
        nCon: 2,
        eCon: 10,
        sCon: 11,
        furniture: [FURNITURE.tapestry1L_HR, FURNITURE.lanternPole3LS, FURNITURE.lanternPole3RS, FURNITURE.lanternPole3L, FURNITURE.lanternPole3R, FURNITURE.lanternpole2EL_H, FURNITURE.lanternpole2ER_H]
    },
    room10: {
        id: 10,
        name: "the Knight's chamber",
        type: "indoor",
        grid: SquareRM,
        wall: OldWall,
        floor: BrickWall4,
        ndoor: null,
        edoor: null,
        sdoor: null,
        wdoor: "open",
        wCon: 9,
        furniture: [FURNITURE.rug4, FURNITURE.tapestry3R, FURNITURE.PC_FF_TR, FURNITURE.wardrobe2L, FURNITURE.WallLamp_LL, FURNITURE.WallLamp_LR, FURNITURE.Pitfall2_BT, FURNITURE.Galaxian_left_L],
        actor: ACTORS.knight,
        alertFlag: true,
        alert: "Oh poor me. It seems I have lost my sword somewhere ... If only someone could help me.",
        questFlag: false,
        questCompleted: "Thank you! I am a real knight again. I don't have to be afraid of the princess anymore. ",
        container: {
            name: "the closet",
            in: null
        }
    },
    room11: {
        id: 11,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: BrickWall,
        floor: RockFloor,
        ndoor: "open",
        edoor: "blue",
        sdoor: "wood",
        wdoor: null,
        nCon: 9,
        eCon: 12,
        sCon: 14,
        furniture: [FURNITURE.lanternPoleL, FURNITURE.lanternPoleR, FURNITURE.lanternPoleLS, FURNITURE.lanternPoleRS, FURNITURE.Pitfall_left_H_L, FURNITURE.WallLamp_RR_H, FURNITURE.WallLamp_RL_H]
    },
    room12: {
        id: 12,
        name: "the Castle entrance",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall3,
        floor: DungeonFloor2,
        wdoor: "open",
        ndoor: null,
        edoor: null,
        sdoor: "wood",
        wCon: 11,
        sCon: 41,
        furniture: [FURNITURE.gate, FURNITURE.wallLamp_LT, FURNITURE.crack2L, FURNITURE.PC_FF_TL, FURNITURE.wallLamp_RT, FURNITURE.FF3_right, FURNITURE.torch_BL, FURNITURE.torch_BR, FURNITURE.PAC2_left_L, FURNITURE.rug2],
        actor: ACTORS.ghost,
        alertFlag: true,
        alert: "I am so afraid of the princess. Please don't tell anybody, I want to go outside but I am so afraid of darkness ...",
        questFlag: false,
        questCompleted: "Thank you! Now I will not be afraid of darkness anymore and I can escape from the princess. Take this ring, it can make you invisible."
    },
    room13: {
        id: 13,
        name: "the Fruit storage",
        type: "indoor",
        grid: SquareRM,
        wall: WhiteWall,
        floor: Pavement2,
        ndoor: null,
        edoor: null,
        sdoor: null,
        wdoor: "open",
        wCon: 7,
        inv: [ITEMS.apple, ITEMS.pear, ITEMS.banana, ITEMS.pineapple, ITEMS.watermelon, ITEMS.carrot, ITEMS.tomato, ITEMS.potato, ITEMS.orange, ITEMS.strawberry],
        furniture: [FURNITURE.PIC_DM_TC, FURNITURE.WallLamp_LL, FURNITURE.WallLamp_LR, FURNITURE.FF4_BT, FURNITURE.Aztec_right]
    },
    room14: {
        id: 14,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: BrickWall4,
        floor: Pavement,
        ndoor: "open",
        edoor: null,
        sdoor: "blue",
        wdoor: "wood",
        nCon: 11,
        sCon: 21,
        wCon: 15,
        furniture: [FURNITURE.tree1_TRbD, FURNITURE.Phara_right_H]
    },
    room15: {
        id: 15,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall2,
        floor: DungeonFloor,
        ndoor: null,
        edoor: "open",
        sdoor: "green",
        wdoor: "wood",
        eCon: 14,
        wCon: 16,
        sCon: 17,
        furniture: [FURNITURE.lanternpole2EL, FURNITURE.lanternpole2ER, FURNITURE.tapestry4T_B, FURNITURE.DM3_BT_W_L]
    },
    room16: {
        id: 16,
        name: "the stable",
        type: "indoor",
        grid: SquareRM,
        wall: ThachFloor,
        floor: Grass,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: null,
        eCon: 15,
        inv: [],
        furniture: [FURNITURE.tree1_TR, FURNITURE.PC_WOW_TL, FURNITURE.HOB1_BT, FURNITURE.Galaxian_left, FURNITURE.Hay_left, FURNITURE.WallLamp_RR, FURNITURE.WallLamp_RL],
        actor: ACTORS.horse,
        alertFlag: true,
        alert: "The horse seems hungry. Coolie wonders ... which fruit horses love best?",
        questFlag: false,
        questCompleted: "The horse is very grateful for the apple."
    },
    room17: {
        id: 17,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: BrickWall2,
        floor: StoneFloor2,
        ndoor: "open",
        edoor: null,
        sdoor: null,
        wdoor: "orange",
        nCon: 15,
        wCon: 20,
        furniture: [FURNITURE.wallLamp_LT, FURNITURE.wallLamp_RT, FURNITURE.Knightlore_BT]
    },
    room18: {
        id: 18,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: BrickWall2,
        floor: StoneFloor4,
        ndoor: "wood",
        edoor: "open",
        sdoor: null,
        wdoor: "red",
        nCon: 19,
        eCon: 5,
        wCon: 28,
        furniture: [FURNITURE.wallLamp_LT, FURNITURE.wallLamp_RT, FURNITURE.FF4_BT]
    },
    room19: {
        id: 19,
        name: "the Pond cavern",
        type: "indoor",
        grid: SquareRM,
        wall: StrangeWall,
        floor: Grass,
        ndoor: null,
        edoor: null,
        sdoor: "open",
        wdoor: null,
        sCon: 18,
        furniture: [FURNITURE.pond, FURNITURE.Frogger_TR, FURNITURE.tree2_TL, FURNITURE.tree1_TLbD, FURNITURE.Invaders_left, FURNITURE.Pitfall3_right],
        inv: [ITEMS.frog]
    },
    room20: {
        id: 20,
        name: "the Witch's room",
        type: "indoor",
        grid: SquareRM,
        wall: DungeonWall2,
        floor: StoneFloor3,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: null,
        eCon: 17,
        furniture: [FURNITURE.cauldron, FURNITURE.crack1_TR, FURNITURE.crack2, FURNITURE.PC_WOW_TR, FURNITURE.Lode_left, FURNITURE.rug1, FURNITURE.torch_RL, FURNITURE.torch_RR],
        inv: [],
        actor: ACTORS.witch,
        alertFlag: true,
        alert: "This potion I am brewing will not work without a frog.",
        questFlag: false,
        questCompleted: "Thank you. I'll give this 'juice' to that annoying princess..."
    },
    room21: {
        id: 21,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: BrickWall3,
        floor: DungeonFloor,
        ndoor: "open",
        edoor: null,
        sdoor: "green",
        wdoor: null,
        nCon: 14,
        sCon: 22,
        furniture: [FURNITURE.wallLamp_LT, FURNITURE.wallLamp_RT, FURNITURE.torch_BL, FURNITURE.torch_BR, FURNITURE.AA5_left_H_L]
    },
    room22: {
        id: 22,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: SlateWall,
        floor: BrickWall,
        ndoor: "open",
        edoor: "yellow",
        sdoor: "orange",
        wdoor: null,
        nCon: 21,
        sCon: 23,
        eCon: 39,
        furniture: [FURNITURE.torch_H_RL, FURNITURE.torch_H_RR, FURNITURE.LTUT_left_H]
    },
    room23: {
        id: 23,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: StoneFloor,
        floor: OldWall,
        ndoor: "open",
        edoor: null,
        sdoor: "red",
        wdoor: null,
        nCon: 21,
        sCon: 24,
        furniture: [FURNITURE.AA3_right_H, FURNITURE.DM3_left_H_R]
    },
    room24: {
        id: 24,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: YellowBrick,
        floor: BrokenRuin,
        ndoor: "open",
        edoor: "wood",
        sdoor: "silver",
        wdoor: null,
        nCon: 23,
        sCon: 25,
        eCon: 29,
        furniture: [FURNITURE.lanternpole2EL_H, FURNITURE.lanternpole2ER_H, FURNITURE.Tut_left_H]
    },
    room25: {
        id: 25,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: StoneWall2,
        floor: StoneFloor4,
        ndoor: "open",
        edoor: null,
        sdoor: "gold",
        wdoor: null,
        nCon: 24,
        sCon: 26,
        furniture: [FURNITURE.torch_H_RR, FURNITURE.torch_BL, FURNITURE.torch_BR, FURNITURE.Pitfall2_right_H, FURNITURE.sign]
    },
    room26: {
        id: 26,
        name: "the Treasury",
        type: "indoor",
        grid: SquareRM,
        wall: CastleWall,
        floor: BrokenRuin,
        ndoor: "open",
        edoor: null,
        sdoor: null,
        wdoor: null,
        nCon: 25,
        furniture: [FURNITURE.AA3_TL, FURNITURE.Knightlore_TR, FURNITURE.Gold1, FURNITURE.Gold2, FURNITURE.PAC2_right, FURNITURE.Invaders_BT, FURNITURE.Aztec_left, FURNITURE.wallLamp_LT, FURNITURE.wallLamp_RT],
        inv: [ITEMS.crown]
    },
    room27: {
        id: 27,
        name: "the Bear's place",
        type: "indoor",
        grid: SquareRM,
        wall: DungeonWall2,
        floor: ThachFloor,
        ndoor: null,
        edoor: null,
        sdoor: null,
        wdoor: "open",
        wCon: 6,
        inv: [ITEMS.mushroom],
        actor: ACTORS.bear,
        alertFlag: true,
        alert: "'I am a bear and I want a ____. If you bring me the ____, I won't give you scare.'",
        questFlag: false,
        questCompleted: "'I am a bear and I have the pear. Now i will go and give the princess a good scare.'",
        furniture: [FURNITURE.PC_SVS_TC, FURNITURE.tree1_TR, FURNITURE.tree1_TL, FURNITURE.FF3_right, FURNITURE.AA5_BT, FURNITURE.WallLamp_LL, FURNITURE.WallLamp_LR]
    },
    room28: {
        id: 28,
        name: "the Henhouse",
        type: "indoor",
        grid: SquareRM,
        wall: Gravel,
        floor: Grass,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: "wood",
        eCon: 18,
        wCon: 30,
        inv: [ITEMS.corn],
        furniture: [FURNITURE.plant2_TR, FURNITURE.plant3_TL, FURNITURE.lanternpole2EL, FURNITURE.lanternpole2ER, FURNITURE.torch_LL, FURNITURE.torch_LR, FURNITURE.Knightlore_BT, FURNITURE.Prince_TC],
        actor: ACTORS.hen,
        alertFlag: true,
        alert: "Oh my god, I have lost my son. Have you seen him?",
        questFlag: false,
        questCompleted: "Thanks for reuniting my family. I was afraid princess ate him for breakfast."
    },
    room29: {
        id: 29,
        name: "the Faerie's",
        type: "indoor",
        grid: SquareRM,
        wall: OldWall,
        floor: StoneFloor,
        ndoor: null,
        edoor: null,
        sdoor: null,
        wdoor: "open",
        wCon: 24,
        inv: [],
        furniture: [FURNITURE.lanternpole2WL, FURNITURE.lanternpole2WR, FURNITURE.PIC_DM2_TR, FURNITURE.plant1_TL, FURNITURE.SVS_right, FURNITURE.RRR_BT],
        actor: ACTORS.faerie,
        alertFlag: true,
        alert: "The princess stole all my birthday presents. I am so sad ...",
        questFlag: false,
        questCompleted: "Thank you. With birthday cake I will celebrate my birthday with all castle creatures. Except the princess, of course."
    },
    room30: {
        id: 30,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall,
        floor: DungeonFloor,
        ndoor: null,
        edoor: "open",
        sdoor: "pink",
        wdoor: null,
        eCon: 28,
        sCon: 31,
        inv: [],
        furniture: [FURNITURE.PIC_DM3_BC, FURNITURE.FF3_left]
    },
    room31: {
        id: 31,
        name: "the Cat's room",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall3,
        floor: StoneFloor3,
        ndoor: "open",
        edoor: null,
        sdoor: null,
        wdoor: null,
        nCon: 30,
        inv: [],
        furniture: [FURNITURE.clock_TL, FURNITURE.cauldron2, FURNITURE.rug5, FURNITURE.Apshai_left, FURNITURE.Scramble_BT, FURNITURE.Under_right],
        actor: ACTORS.cat,
        alertFlag: true,
        alert: "The princess turned me into a cat. I hear the mouse stew might help turning me back.",
        questFlag: false,
        questCompleted: "Thanks for helping me. I am cooking mouse stew now. It's pitty the mouse was not real. I hope it will work anyway."
    },
    room32: {
        id: 32,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: StoneWall2,
        floor: StoneFloor4,
        ndoor: "wood",
        edoor: "open",
        sdoor: null,
        wdoor: "silver",
        eCon: 6,
        wCon: 33,
        nCon: 34,
        furniture: [FURNITURE.wallLamp_LT, FURNITURE.wallLamp_RT, FURNITURE.lanternpole2WL_H, FURNITURE.lanternpole2WR_H, FURNITURE.Frogger_BT, FURNITURE.DM5_right_H_R, FURNITURE.DM3_right_H_L]
    },
    room33: {
        id: 33,
        name: "the dusty storage",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall2,
        floor: BrickWall,
        ndoor: null,
        wdoor: null,
        sdoor: null,
        edoor: "open",
        eCon: 32,
        furniture: [FURNITURE.chest, FURNITURE.tallClock_TR, FURNITURE.PC_Hero_TC, FURNITURE.rug6, FURNITURE.Prince_BT, FURNITURE.Galaxian_left, FURNITURE.WallLamp_RR, FURNITURE.WallLamp_RL],
        container: {
            name: "the chest",
            in: ITEMS.necklace
        }
    },
    room34: {
        id: 34,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: CastleWall,
        floor: StoneFloor2,
        ndoor: "yellow",
        edoor: null,
        sdoor: "open",
        wdoor: "wood",
        sCon: 32,
        nCon: 35,
        wCon: 37,
        furniture: [FURNITURE.spiderWeb_HR, FURNITURE.Pitfall2_right_H]
    },
    room35: {
        id: 35,
        name: "the Spider's web",
        type: "indoor",
        grid: SquareRM,
        wall: WhiteWall,
        floor: StoneFloor,
        ndoor: null,
        edoor: null,
        sdoor: "open",
        wdoor: "wood",
        sCon: 34,
        wCon: 36,
        furniture: [FURNITURE.spiderWeb, FURNITURE.Dig_right, FURNITURE.Pitfall2_left_L, FURNITURE.DK_left_R, FURNITURE.Aztec_BT_R, FURNITURE.FF4_TC],
        inv: [],
        actor: ACTORS.spider,
        alertFlag: true,
        alert: "Come little fly ...",
        questFlag: false,
        questCompleted: "Hmm, lunch finally. Good work Coolie."
    },
    room36: {
        id: 36,
        name: "the Spider's storage",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall,
        floor: StoneFloor4,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: null,
        eCon: 35,
        inv: [ITEMS.candle3],
        furniture: [FURNITURE.Lode_TC, FURNITURE.spiderWeb, FURNITURE.spiderWeb_C, FURNITURE.spiderWeb_L, FURNITURE.JSW_left, FURNITURE.Hero_BT]
    },
    room37: {
        id: 37,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall,
        floor: DungeonFloor2,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: "wood",
        eCon: 34,
        wCon: 38,
        furniture: [FURNITURE.lanternpole2EL, FURNITURE.lanternpole2ER, FURNITURE.tapestry4T_B, FURNITURE.Tut2_BT_W]
    },
    room38: {
        id: 38,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall4,
        floor: DungeonWall2,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: "wood",
        eCon: 37,
        wCon: 40,
        furniture: [FURNITURE.PIC_Hobbit_BC, FURNITURE.tallClock_BR, FURNITURE.tree2_BL, FURNITURE.Tut_BT_W]
    },
    room39: {
        id: 39,
        name: "the dusty storage",
        type: "indoor",
        grid: SquareRM,
        wall: OldWall,
        floor: Pavement2,
        ndoor: null,
        edoor: null,
        sdoor: null,
        wdoor: "open",
        wCon: 22,
        furniture: [FURNITURE.wardrobe2R, FURNITURE.rug2, FURNITURE.fireplaceC, FURNITURE.PIC_AA_TL, FURNITURE.AA4_BT, FURNITURE.Tut2_right, FURNITURE.DM5_left_L, FURNITURE.SW2_left_R],
        inv: [],
        container: {
            name: "the closet",
            in: ITEMS.sheep
        }
    },
    room40: {
        id: 40,
        name: "the Wolf's den",
        type: "indoor",
        grid: SquareRM,
        wall: BrickWall,
        floor: YellowBrick,
        ndoor: null,
        edoor: "open",
        sdoor: null,
        wdoor: null,
        eCon: 38,
        inv: [],
        furniture: [FURNITURE.clock_TR, FURNITURE.PC_FF_TC, FURNITURE.tree1_TL, FURNITURE.tapestry6L_R, FURNITURE.SheepSkinRug, FURNITURE.HOB2_BT, FURNITURE.DK_right_R],
        actor: ACTORS.wolf,
        alertFlag: true,
        alert: "I fancy myself a woolly treat.",
        questFlag: false,
        questCompleted: "You brought me a toy sheep, so I am giving you a toy bone."
    },
    room41: {
        id: 41,
        name: "a hallway",
        type: "indoor",
        grid: HRectRM,
        wall: StoneWall,
        floor: StoneFloor4,
        ndoor: "open",
        edoor: null,
        sdoor: "wood",
        wdoor: null,
        nCon: 12,
        sCon: 42,
        furniture: [FURNITURE.Apshai_left_H]
    },
    room42: {
        id: 42,
        name: "the kennel",
        type: "indoor",
        grid: SquareRM,
        wall: DungeonWall,
        floor: StoneFloor3,
        ndoor: "open",
        edoor: null,
        sdoor: null,
        wdoor: null,
        nCon: 41,
        inv: [],
        furniture: [FURNITURE.PIC_AA_TR, FURNITURE.DM1_left, FURNITURE.Lode_right, FURNITURE.rug6, FURNITURE.Prince_BT, FURNITURE.Pitfall_TL],
        actor: ACTORS.dog,
        alertFlag: true,
        alert: "Princess made me tired. I would like to chew something in peace now.",
        questFlag: false,
        questCompleted: "Thanks fo bringing me this toy bone. I will enjoy my rest now. Leave me."
    },
    room43: {
        id: 43,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall4,
        floor: StoneFloor3,
        ndoor: null,
        edoor: "wood",
        sdoor: null,
        wdoor: "open",
        eCon: 44,
        wCon: 2,
        furniture: [FURNITURE.bush_BL, FURNITURE.FF2_BR, FURNITURE.Apshai_W_BL]
    },
    room44: {
        id: 44,
        name: "a hallway",
        type: "indoor",
        grid: WRectRM,
        wall: BrickWall2,
        floor: StoneFloor,
        ndoor: null,
        edoor: "yellow",
        sdoor: null,
        wdoor: "open",
        eCon: 45,
        wCon: 43,
        furniture: [FURNITURE.Prince_TDR, FURNITURE.Tut_TDL, FURNITURE.HOB2_W_BT],
        inv: [ITEMS.candle2]
    },
    room45: {
        id: 45,
        name: "the stable",
        type: "indoor",
        grid: SquareRM,
        wall: DungeonWall,
        floor: Grass,
        ndoor: null,
        edoor: null,
        sdoor: null,
        wdoor: "open",
        wCon: 44,
        furniture: [FURNITURE.bush_TR, FURNITURE.Galaxian_TC, FURNITURE.Scramble_BT, FURNITURE.Hay_right, FURNITURE.Pitfall3_right, FURNITURE.torch_LL, FURNITURE.torch_LR],
        inv: [],
        actor: ACTORS.cow,
        alertFlag: true,
        alert: "The princess is so pretty with a hat. I wish I would have one.",
        questFlag: false,
        questCompleted: "Thank you. I am the prettiest cow in the castle now."
    }
};

var gameState = {
    imagesLoaded: false,
    started: false,
    gameOver: function () {
        console.log("GAME OVER");
        console.log("gameState.won", gameState.won);
        gameState.endTime = new Date().getTime();
        gameState.played = (gameState.endTime - gameState.startTime) / 60000;
        Engine.alertMode = true;
        $(document).off("keydown");
        var line1 = "*********************<br>";
        var line2 = "<br>YOU HAVE WON THE GAME<br><br>";
        print("<span style='color: yellow'>" + line1 + line2 + line1 + "</span>");
        print("It took you " + gameState.played.toFixed(1) + " minutes.");
        print("You issued " + Command.count + " commands.");

    },
    frameDraw: function () {
        Engine.renderRoom();
        Engine.drawFurniture();
        Engine.drawItems();
        Engine.drawActor();
        StatusScreen.render();
        COOLIE.draw();
        Engine.drawAlert();
        if (Engine.alertMode === true) {
            $("#Input").hide();
            $("#line").remove();
        }
    },
    start: function () {
        StatusScreen.makeGrid();
        gameState.started = true;
        gameState.startTime = new Date().getTime();
        gameState.won = false;
        $("#QUERY").html("");
        $("#QUERY").show();
        print("Welcome to " + PRG.NAME + ".");
        print("Enter your command:");
        input();
        COOLIE.init();
        $(document).keydown(gameState.checkKey);
        gameState.level = 0;
        Engine.alertMode = false;
        gameState.setLevel();
        gameState.frameDraw();
    },
    alerts: ["Dear Coolie. Thanks for answering my summons. A most dreadful thing happened. I have lost my ring somewhere. Please find it or else ... ", "My gold necklade has gone missing. Find it for me. Now. Go.", "I need a crown to be true princess. Go fetch it for me."],
    completeAlerts: ["Thank you for finding my ring, Coolie. Now I can get invisible and scare other inhabitants of this castle. But your quest is not over yet. Talk to me when you are ready to serve me again.", "I am so pretty with this necklace. But you are not finished. Talk to me when you are ready to serve me again.", "Finally, I feel like a real princess. You did good. Have this apple for your deserved prize. They are supposed to be healthy. Now go outside and play with real friends. This GAME is OVER."],
    princesWants: ["the ring", "the necklace", "the crown"],
    princessReturns: [ITEMS.redkey, ITEMS.yellowkey, ITEMS.apple],
    setLevel: function () {
        MAP.room0.alert = gameState.alerts[gameState.level];
        MAP.room0.questCompleted = gameState.completeAlerts[gameState.level];
        ACTORS.princess.wants = gameState.princesWants[gameState.level];
        ACTORS.princess.item = gameState.princessReturns[gameState.level];
        MAP.room0.questFlag = false;
        return;
    },
    preLoadImages: function () {
        gameState.count = 0;
        var fileNames = getImgFileNames();
        gameState.HMI = fileNames.length;
        for (var ix = 0; ix < gameState.HMI; ix++) {
            tileGraphics[ix] = new Image();
            tileGraphics[ix].onload = cnt;
            tileGraphics[ix].src = fileNames[ix].filename;
            $("#preload").append("<img id='" + fileNames[ix].id + "' src='" + fileNames[ix].filename + "'/>");
        }
        return;

        function cnt() {
            gameState.count++;
            drawLoadingGraph();
            if (gameState.count === gameState.HMI) {
                gameState.imagesLoaded = true;
                $("#buttons").prepend("<input type='button' id='startGame' value='START'>");
                $("#load").addClass("hidden");
                $("#startGame").on("click", gameState.start);
            }
        }

        function drawLoadingGraph() {
            var percent = Math.floor((gameState.count / gameState.HMI) * 100);
            var CTX = gameState.ctx;
            CTX.clearRect(0, 0, INI.LOAD_W, INI.LOAD_H);
            CTX.beginPath();
            CTX.lineWidth = "1";
            CTX.strokeStyle = "black";
            CTX.rect(0, 0, INI.LOAD_W, INI.LOAD_H);
            CTX.closePath();
            CTX.stroke();
            CTX.fillStyle = "#999";
            CTX.fillRect(1, 1, Math.floor((INI.LOAD_W - 2) * (percent / 100)), INI.LOAD_H - 2);
            CTX.fillStyle = "black";
            CTX.font = "10px Verdana";
            CTX.fillText("Loading: " + percent + "%", INI.LOAD_W * 0.1, INI.LOAD_H * 0.62);
            return;
        }

        function getImgFileNames() {
            var fileNames = [];
            for (var prop in World) {
                var LN = World[prop].length;
                if (LN) {
                    for (var ix = 0; ix < LN; ix++) {
                        var name = INI.SOURCE + World[prop][ix].id + "." + World[prop][ix].type;
                        fileNames.push({
                            id: World[prop][ix].id,
                            filename: name
                        });
                    }
                }
            }
            return fileNames;
        }
    },
    setUp: function () {
        setupDiv();

        $("#toggleHelp").click(function () {
            $("#help").toggle(400);
        });
        $("#toggleAbout").click(function () {
            $("#about").toggle(400);
        });

        $("#QUERY").on('keypress', function (event) {
            if (event.which === 13) {
                event.preventDefault();
                Command.get();
            }
        });

        function setupDiv() {
            $("#game").width(INI.GAME_WIDTH);
            $("#game").append("<div class='gw' id ='ROOM'><canvas id='ROOM_canvas' width='" + INI.ROOM_WIDTH + "' height='" + INI.ROOM_HEIGHT + "'></canvas></div>");
            $("#game").append("<div class='gw' id ='STATUS'><canvas id='STATUS_canvas' width='" + INI.STATUS_WIDTH + "' height='" + INI.STATUS_HEIGHT + "'></canvas></div>");
            $("#game").append("<div id ='QUERY'></div>");
            $("#QUERY").height(INI.QUERY_HEIGHT);
            $("#QUERY").width(INI.QUERY_WIDTH);
            $("#temp").append("<canvas id ='temp_canvas'></canvas>");
            $("#load").append("<canvas id ='preload_canvas' width='" + INI.LOAD_W + "' height='" + INI.LOAD_H + "'></canvas>");
            RoomScreen.ctx = $("#ROOM_canvas")[0].getContext("2d");
            StatusScreen.ctx = $("#STATUS_canvas")[0].getContext("2d");
            gameState.ctx = $("#preload_canvas")[0].getContext("2d");
            gameState.createMaterial("wood");
            gameState.createMaterial("void");
            gameState.createMaterial("red");
            gameState.createMaterial("green");
            gameState.createMaterial("blue");
            gameState.createMaterial("gold");
            gameState.createMaterial("orange");
            gameState.createMaterial("silver");
            gameState.createMaterial("pink");
            gameState.createMaterial("yellow");
        }
    },
    material: {
        wood: {
            colors: ["#994d00", "#663300", "#663300", "#663300", "#663300", "#331a00", "#4d2600", "#4d2600", "#804000", "#442200"]
        },
        void: {
            colors: ["#000", "#111", "#222", "#000", "#000", "#000", "#111", "#000", "#111", "#000"]
        },
        red: {
            colors: ["#E60000", "#FF0000", "#EE0000", "#DD0000", "#E60000", "#FF0000", "#CC0000"]
        },
        green: {
            colors: ["#00E600", "#00FF00", "#00EE00", "#00DD00", "#00E600", "#00FF00", "#00CC00"]
        },
        blue: {
            colors: ["#0000E6", "#0000FF", "#0000EE", "#0000DD", "#0000E6", "#0000FF", "#0000CC"]
        },
        gold: {
            colors: ["#FFD700", "#D4AF37", "#DAA520", "#AE8913", "#CFB53B", "#D4AF37", "#C5B358", "#D4AF37", "#D4AF37", "#D4AF37", "#D4AF37", "#CFB53B", "#CFB53B"]
        },
        orange: {
            colors: ["#FFA500", "#FFA500", "#ffaf1a", "#FFA501", "#FFA502", "#FFA500"]
        },
        silver: {
            colors: ["#C0C0C0", "#C0C0C0", "#C0C0C0", "#C0C0C0", "#DCDCDC", "#D3D3D3", "#A9A9A9", "#C0C0C0", "#C0C0C0", "#C0C0C0"]
        },
        pink: {
            colors: ["#FFB6C1", "#FF69B4", "#FF1493", "#DB7093", "#FF69B4", "#FF69B4", "#FF1493", "#FF69B4", "#FF69B4"]
        },
        yellow: {
            colors: ["#ffff00", "#ffff00", "#ffff00", "#ffff00", "#ffff66", "#ffff1a", "#ffff33", "#ffff4d"]
        }
    },
    createMaterial: function (what) {
        var append = '<div id="' + what + '" class="hidden"></div>';
        $("body").append(append);
        $("#" + what).append("<canvas id ='" + what + "_canvas' width='100' height='100'></canvas>");
        gameState.material[what].ctx = $("#" + what + "_canvas")[0].getContext("2d");
        gameState.material[what].img = $("#" + what + "_canvas")[0];
        var colors = gameState.material[what].colors;
        var MCTX = gameState.material[what].ctx;

        for (var y = 0; y < INI.WOODPATTERN; y++) {
            for (var x = 0; x < INI.WOODPATTERN; x++) {
                setPixel(x, y, colors.chooseRandom());
            }
        }

        function setPixel(x, y, c) {
            MCTX.fillStyle = c;
            MCTX.fillRect(x, y, 1, 1);
        }
    },
    checkKey: function (e) {
        e = e || window.event;
        if (e.keyCode === 38) {
            COOLIE.move.up();
            e.preventDefault();
        } else if (e.keyCode === 40) {
            COOLIE.move.down();
            e.preventDefault();
        } else if (e.keyCode === 37) {
            COOLIE.move.left();
            e.preventDefault();
        } else if (e.keyCode === 39) {
            COOLIE.move.right();
            e.preventDefault();
        }
    }
};

var Engine = {
    clear: function () {
        var CTX = RoomScreen.ctx;
        CTX.clearRect(0, 0, INI.ROOM_WIDTH, INI.ROOM_HEIGHT);
        CTX.beginPath();
        CTX.closePath();
        CTX.lineWidth = 1;
    },
    renderRoom: function () {
        var type = MAP["room" + COOLIE.room].type;
        switch (type) {
            case "indoor":
                Engine.renderInsideRoom();
                break;
        }
    },
    renderInsideRoom: function () {
        var soba = MAP["room" + COOLIE.room];
        Engine.clear();
        var obj = soba.grid;
        var floor = $("#" + soba.floor.id)[0];
        var wall = $("#" + soba.wall.id)[0];
        var CTX = RoomScreen.ctx;
        CTX.lineWidth = 1;
        CTX.rect(obj.x, obj.y, obj.width, obj.height);
        var patF = CTX.createPattern(floor, "repeat");
        CTX.fillStyle = patF;
        CTX.fill();
        var TempCanvas = $("#temp_canvas")[0];
        TempCanvas.width = soba.wall.x;
        TempCanvas.height = soba.wall.y;
        var cw = TempCanvas.width;
        var ch = TempCanvas.height;
        var TPX = TempCanvas.getContext("2d");
        TPX.drawImage(wall, 0, 0);
        // TOP
        var patW = CTX.createPattern(TempCanvas, "repeat");
        CTX.beginPath();
        CTX.moveTo(obj.x, obj.y);
        CTX.lineTo(obj.x - INI.STDH, obj.y - INI.STDH);
        CTX.lineTo(obj.x + INI.STDH + obj.width, obj.y - INI.STDH);
        CTX.lineTo(obj.x + obj.width, obj.y);
        CTX.closePath();
        CTX.fillStyle = patW;
        CTX.fill();
        CTX.stroke();
        //BOTTOM
        TPX.clearRect(0, 0, cw, ch);
        TPX.translate(cw / 2, ch / 2);
        TPX.rotate(Math.PI);
        TPX.translate(-cw / 2, -ch / 2);
        TPX.drawImage(wall, 0, 0);
        patW = CTX.createPattern(TempCanvas, "repeat");
        CTX.beginPath();
        CTX.moveTo(obj.x + obj.width, obj.y + obj.height);
        CTX.lineTo(obj.x + INI.STDH + obj.width, obj.y + INI.STDH + obj.height);
        CTX.lineTo(obj.x - INI.STDH, obj.y + INI.STDH + obj.height);
        CTX.lineTo(obj.x, obj.y + obj.height);
        CTX.closePath();
        CTX.fillStyle = patW;
        CTX.fill();
        CTX.stroke();
        //RIGHT	
        TPX.translate(cw / 2, ch / 2);
        TempCanvas.height = cw;
        TempCanvas.width = ch;
        cw = TempCanvas.width;
        ch = TempCanvas.height;
        TPX.rotate(Math.PI / 2);
        TPX.translate(0, -cw);
        TPX.drawImage(wall, 0, 0);
        patW = CTX.createPattern(TempCanvas, "repeat");
        CTX.beginPath();
        CTX.moveTo(obj.x + obj.width, obj.y);
        CTX.lineTo(obj.x + INI.STDH + obj.width, obj.y - INI.STDH);
        CTX.lineTo(obj.x + INI.STDH + obj.width, obj.y + INI.STDH + obj.height);
        CTX.lineTo(obj.x + obj.width, obj.y + obj.height);
        CTX.closePath();
        CTX.fillStyle = patW;
        CTX.fill();
        CTX.stroke();
        //LEFT
        CTX.beginPath();
        CTX.moveTo(obj.x, obj.y + obj.height);
        CTX.lineTo(obj.x - INI.STDH, obj.y + INI.STDH + obj.height);
        CTX.lineTo(obj.x - INI.STDH, obj.y - INI.STDH);
        CTX.lineTo(obj.x, obj.y);
        CTX.closePath();
        CTX.fillStyle = patW;
        CTX.fill();
        CTX.stroke();
        //RENDER DOORS
        if (soba.ndoor !== null) {
            Engine.renderNDoor(obj, soba.ndoor);
        }
        if (soba.sdoor !== null) {
            Engine.renderSDoor(obj, soba.sdoor);
        }
        if (soba.edoor !== null) {
            Engine.renderEDoor(obj, soba.edoor);
        }
        if (soba.wdoor !== null) {
            Engine.renderWDoor(obj, soba.wdoor);
        }
    },
    renderNDoor: function (obj, type) {
        var inX = parseInt(obj.x + obj.width / 2, 10);
        var inY = obj.y;
        var direction = new Vector(0, -1);
        Engine.renderDoor(inX, inY, direction, type);
    },
    renderSDoor: function (obj, type) {
        var inX = parseInt(obj.x + obj.width / 2, 10);
        var inY = obj.y + obj.height;
        var direction = new Vector(0, 1);
        Engine.renderDoor(inX, inY, direction, type);
    },
    renderWDoor: function (obj, type) {
        var inX = obj.x;
        var inY = parseInt(obj.y + obj.height / 2, 10);
        var direction = new Vector(-1, 0);
        Engine.renderDoor(inX, inY, direction, type);
    },
    renderEDoor: function (obj, type) {
        var inX = obj.x + obj.width;
        var inY = parseInt(obj.y + obj.height / 2, 10);
        var direction = new Vector(1, 0);
        Engine.renderDoor(inX, inY, direction, type);
    },
    renderDoor: function (inX, inY, direction, type) {
        var CTX = RoomScreen.ctx;
        CTX.lineWidth = 1;
        CTX.strokeStyle = "#000";

        CTX.save();
        CTX.beginPath();
        var X1 = inX - (INI.DOORW / 2) * Math.abs(direction.y);
        var Y1 = inY - (INI.DOORW / 2) * Math.abs(direction.x);
        CTX.moveTo(X1, Y1);
        var X2 = X1 + direction.x * INI.DOORH;
        var Y2 = Y1 + direction.y * INI.DOORH;
        CTX.lineTo(X2, Y2);
        var X3 = X2 + Math.abs(direction.y * INI.DOORW);
        var Y3 = Y2 + Math.abs(direction.x * INI.DOORW);
        var CX, CY;
        if (direction.x === 0) {
            CY = Y3 + direction.y * INI.DOORC;
            CX = Math.abs(X3 - X2) / 2 + X2;
        } else {
            CX = X3 + direction.x * INI.DOORC;
            CY = Math.abs(Y3 - Y2) / 2 + Y2;
        }
        CTX.quadraticCurveTo(CX, CY, X3, Y3);
        var X4 = X3 + direction.x * INI.DOORH * -1;
        var Y4 = Y3 + direction.y * INI.DOORH * -1;
        CTX.lineTo(X4, Y4);
        CTX.lineTo(X1, Y1);

        CTX.clip();
        CTX.closePath();
        CTX.stroke();

        //Paint the door
        var pattern;
        if (type === "open") {
            pattern = CTX.createPattern(gameState.material.void.img, "repeat");
        } else {
            pattern = CTX.createPattern(gameState.material[type].img, "repeat");
        }
        CTX.fillStyle = pattern;
        var FX, FY, FW, FH;
        FX = X1;
        FY = Y1;
        FW = INI.DOORW;
        FH = INI.DOORH + INI.DOORC;
        if (Math.abs(direction.x)) {
            FH = INI.DOORW;
            FW = INI.DOORH + INI.DOORC;
        }
        if (direction.y === -1) {
            FY = Y1 - INI.DOORH - INI.DOORC;
            FW = INI.DOORW;
            FH = INI.DOORH + INI.DOORC;
        }
        if (direction.x === -1) {
            FX = X1 - INI.DOORH - INI.DOORC;
        }

        CTX.fillRect(FX, FY, FW, FH);
        CTX.restore();

        if (type !== "open") {
            var doorKnobX;
            if (X1 !== X4) {
                doorKnobX = Math.floor(X1 + X4) / 2;
            } else {
                doorKnobX = Math.floor(X1 + X3) / 2;
            }
            var doorKnobY;
            if (Y1 !== Y4) {
                doorKnobY = Math.floor(Y1 + Y4) / 2;
            } else {
                doorKnobY = Math.floor(Y1 + Y3) / 2;
            }

            var knobDirection = direction.cw();
            doorKnobX = doorKnobX + 12 * knobDirection.x;
            doorKnobY = doorKnobY + 12 * knobDirection.y * -1;
            Engine.doorKnobAt(doorKnobX, doorKnobY);
        }
    },
    doorKnobAt: function (x, y) {
        var CTX = RoomScreen.ctx;
        CTX.save();
        CTX.lineWidth = 1;
        CTX.strokeStyle = "#000";
        CTX.beginPath();
        CTX.arc(x, y, 3, 0, 2 * Math.PI);
        CTX.closePath();
        CTX.stroke();
        CTX.shadowColor = "#222";
        CTX.shadowBlur = 1;
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.fillStyle = "#000";
        CTX.fill();
        CTX.restore();
    },
    drawItems: function () {
        var inventory = MAP["room" + COOLIE.room].inv;
        if (inventory) {
            var L = inventory.length;
            for (var i = 0; i < L; i++) {
                ITEMS.draw(inventory[i].X, inventory[i].Y, inventory[i].tile.id);
            }
        }
    },
    drawActor: function () {
        var roomActor = MAP["room" + COOLIE.room].actor;
        if (roomActor) {
            ACTORS.draw(roomActor.x, roomActor.y, roomActor.tile.id);
        }
    },
    drawFurniture: function () {
        var roomFurniture = MAP["room" + COOLIE.room].furniture;
        if (roomFurniture) {
            var FL = roomFurniture.length;
            if (FL) {
                for (var i = 0; i < FL; i++) {
                    FURNITURE.draw(roomFurniture[i].x, roomFurniture[i].y, roomFurniture[i].tile.id);
                }
            }
        }
    },
    drawAlert: function () {
        if (MAP["room" + COOLIE.room].alertFlag) {
            MAP["room" + COOLIE.room].alertFlag = false;
            Engine.alert(MAP["room" + COOLIE.room].alert);
        }
    },
    alert: function (text) {
        Engine.alertMode = true;
        var CTX = RoomScreen.ctx;
        CTX.save();
        var words = text.split(" ");
        var lines = [];
        var line = '';
        var lineTest = '';
        var currentY = 0;
        var currentX = 0;
        CTX.font = Engine.alertINI.fontSize + 'px Consolas';
        for (var i = 0, len = words.length; i < len; i++) {
            lineTest = line + words[i] + ' ';
            if (CTX.measureText(lineTest).width > Engine.alertINI.width - 8) {
                currentY = lines.length * Engine.alertINI.fontSize + Engine.alertINI.fontSize;
                lines.push({
                    text: line,
                    height: currentY
                });
                line = words[i] + ' ';
            } else {
                line = lineTest;
            }
        }
        if (line.length > 0) {
            currentY = lines.length * Engine.alertINI.fontSize + Engine.alertINI.fontSize;
            lines.push({
                text: line.trim(),
                height: currentY
            });
        }
        Engine.alertINI.height = currentY + Engine.alertINI.buttonHeight;
        CTX.fillStyle = "#CCC";
        CTX.shadowOffsetX = 2;
        CTX.shadowOffsetY = 2;
        CTX.shadowBlur = 2;
        CTX.fillRect(Engine.alertINI.left, Engine.alertINI.top, Engine.alertINI.width, Engine.alertINI.height);
        CTX.fillStyle = "#111";
        CTX.shadowColor = "#000";
        CTX.shadowOffsetX = 1;
        CTX.shadowOffsetY = 1;
        CTX.shadowBlur = 1;
        len = lines.length;
        for (i = 0; i < len; i++) {
            CTX.fillText(lines[i].text, currentX + Engine.alertINI.left + Engine.alertINI.fontSize, Engine.alertINI.top + lines[i].height + Engine.alertINI.fontSize);
        }
        CTX.lineWidth = 2;
        CTX.strokeStyle = "#000";
        Engine.alertButton.okX = Engine.alertINI.left + Engine.alertINI.width / 2 - Engine.alertButton.width / 2;
        Engine.alertButton.okY = Engine.alertINI.top + currentY + Engine.alertINI.fontSize * 2;
        CTX.rect(Engine.alertButton.okX, Engine.alertButton.okY, Engine.alertButton.width, Engine.alertButton.heigth);
        CTX.stroke();
        CTX.fillText("OK", Engine.alertButton.okX + 16, Engine.alertButton.okY + 21);
        CTX.lineWidth = 1;
        CTX.restore();

        $("#ROOM_canvas").mousemove(function (event) {
            Engine.mouseOver(event);
        });

        $("#ROOM_canvas").click(function (event) {
            Engine.mouseClick(event);
        });
        $(document).off("keydown");
        return;
    },
    mouseOver: function (event) {
        var canvasOffset = $("#ROOM_canvas").offset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;
        mouseX = parseInt(event.pageX - offsetX - Engine.alertButton.okX, 10);
        mouseY = parseInt(event.pageY - offsetY - Engine.alertButton.okY, 10);
        if (mouseX >= 0 && mouseX < Engine.alertButton.width && mouseY >= 0 && mouseY < Engine.alertButton.heigth) {
            $("#ROOM_canvas").css("cursor", "pointer");
        } else {
            $("#ROOM_canvas").css("cursor", "auto");
        }
    },
    mouseClick: function (event) {
        var canvasOffset = $("#ROOM_canvas").offset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;
        mouseX = parseInt(event.pageX - offsetX - Engine.alertButton.okX, 10);
        mouseY = parseInt(event.pageY - offsetY - Engine.alertButton.okY, 10);
        if (mouseX >= 0 && mouseX < Engine.alertButton.width && mouseY >= 0 && mouseY < Engine.alertButton.heigth) {
            $("#ROOM_canvas").css("cursor", "auto");
            $("#ROOM_canvas").off();
            Engine.alertMode = false;
            gameState.frameDraw();
            if (!gameState.won) {
                $(document).keydown(gameState.checkKey);
                $("#Input").focus();
                input();
            }
        }
    },
    alertINI: {
        fontSize: 14,
        width: 350,
        heigth: 180,
        left: 80,
        top: 154,
        buttonHeight: 72
    },
    alertButton: {
        width: 48,
        heigth: 32
    }
};

function rnd(start, end) {
    return Math.floor(Math.random() * (++end - start) + start);
}

function print(data) {
    outp(data, "p");

    function outp(data, tag) {
        $("#QUERY").append("<" + tag + ">" + data + "</" + tag + ">");
        $("#QUERY").children().last()[0].scrollIntoView();
    }
}

function input() {
    $("#QUERY").append("<span id='line'> " + INI.NBS + "><input id='Input' type = 'text' value='' autofocus='autofocus' maxlength='39'></span>");
    $("#QUERY").children().last()[0].scrollIntoView();
    $("#Input").focus();
}

//MAIN ***********************
$(document).ready(function () {
    PRG.INIT();
    gameState.setUp();
    gameState.preLoadImages();
});
//****************************