// initializing everything when the window is loaded
// create main container for the game layout

import { initTopBar, setCoins, setPoints, setTime } from "./topbar.js";
import levelData from "../levels.json" assert { type: "json" };
import { levelConstructor } from "./levels.js";
import { createPlayer } from "./player.js";
import { levelCreator } from "./levelCreator.js"

export let objectRatio = window.innerHeight / 12;
export let allElems = {
  character: undefined,
  gravity: new Array,
  obstacle: new Array,
  monster: new Array,
  collectible: new Array
}
const keysPressed = {}
const worldGravity = 50
const frameRate = 60;

let gameData = { time: 0, timeStart: 0 };
let gameEnd = "";
let sounds = {};
let soundOn = false;
let garbageCollector = {
  gravity: new Array,
  obstacle: new Array,
  monster: new Array,
  collectible: new Array,
  bullet: new Array
}

export function gameSetup(character = undefined, level = "lv1", gameTime = 150) {
  const mainContainer = document.getElementById("mainContainer")
    objectRatio = window.innerHeight / 12;
    // Clear all elements
    mainContainer.innerHTML = "";
    allElems = {
        character: character,
        gravity: new Array,
        obstacle: new Array,
        monster: new Array,
        collectible: new Array,
        bullet: new Array
    }
    unsetGameEnd();

  // scroll screen to 0,0 on page refresh or restart or at next level
  window.scroll(0, 0);
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };

  // create level scene
  levelConstructor(levelData[level], objectRatio);
  if (!allElems["character"]) {
    createPlayer();
    initTopBar();
  } else {
    allElems["character"] = character;
    allElems["gravity"].push(character);
    character.elem.style.left = "50px";
    character.ySpeed = 0;
    mainContainer.append(character.elem);
  }

  let screenWidth = levelData[level]["levelWidth"] * objectRatio;
  let screenHeight = window.innerHeight;

  mainContainer.style.height = screenHeight + "px";
  mainContainer.style.width = screenWidth + "px";
  mainContainer.style.backgroundImage = `url("https://cdn.dribbble.com/users/1100256/screenshots/12294406/media/679e0dcabffe421e242a55ff7e372582.jpg?compress=1&resize=400x300&vertical=top")`;

  document.addEventListener("keydown", function (e) {
    if (e.key.charCodeAt(0) == "65" || e.key.charCodeAt(0) == "32") {
      e.preventDefault();
      return false;
    }
    keysPressed[e.key] = true;
  });
  document.addEventListener("keyup", (e) => {
    delete keysPressed[e.key];
  });

  disableScroll();

    gameData["time"] = gameTime;
    gameData["timeStart"] = 0;

    window.requestAnimationFrame(update);
}

export const init = () => {
    // Add eventlistners for pause menu
    document.getElementById("resume").addEventListener('click', () => {
        pause = false
        window.requestAnimationFrame(update)
        document.getElementById("overlay").style.display = "none";
    });
    document.getElementById("restart").addEventListener('click', () => {
        pause = false
        mainContainer.innerHTML = ""
        document.getElementById("overlay").style.display = "none";
        document.getElementById("startMenu").style.display = "";
    });
    document.getElementById("toggleSound").checked = soundOn;
    document.getElementById("toggleSound").addEventListener('change', () => {
        soundOn = document.getElementById("toggleSound").checked;
    });
    document.getElementById("startGame").addEventListener('click', () => {
      gameSetup()
      document.getElementById("startMenu").style.display = "none";
    })
    document.getElementById("levelCreator").addEventListener('click', () => {
      console.log('load levelCreator()')
      gameSetup(undefined, "empty", 99999)
      levelCreator()
      document.getElementById("startMenu").style.display = "none";
    })
    document.getElementById("settings").addEventListener('click', () => {
      console.log('load settings')
      // document.getElementById("startMenu").style.display = "none";
    })
  // Prepare sound effects
  sounds["jump"] = new Audio("sounds/jump.mp3");
};

const GameManager = function() {
    this.gameContainer = document.getElementById("mainContainer")
    this.gravity = worldGravity / frameRate
    this.run = undefined
    this.applyMovement = function (obj) {
        if("activated" in obj) {
            if(!obj["activated"]) {
                // Check if this object needs to be activated
                if(window.scrollX+window.innerWidth < obj.elem.offsetLeft) {
                    // console.log(window.scrollX+window.innerWidth, " vs ", obj.elem.offsetLeft);
                    return
                }

        obj.activated = true;
      }
    }
    // handle friction to stop character moving automatically
    if (obj.xSpeed && obj.friction) obj.xForce(-obj.xSpeed / 12);

    // apply gravity
    obj.yForce(this.gravity);

    // move character every frame
    obj.yDisplace();

    if (obj.stayInScreen) {
      // Check that object is not about to exit screen
      if (obj.xSpeed + obj.elem.offsetLeft <= window.scrollX) {
        obj.xSpeed = 0;
        obj.elem.style.left = window.scrollX + "px";
      } else if (
        obj.xSpeed + obj.elem.offsetLeft + objectRatio >=
        document.getElementById("mainContainer").offsetWidth
      ) {
        obj.xSpeed = 0;
        obj.elem.style.left =
          document.getElementById("mainContainer").offsetWidth -
          objectRatio +
          "px";
      } else if (
        obj.elem.style.top.replace("px", "") >
        document.getElementById("mainContainer").offsetHeight
      ) {
        gameEnd = "die";
      }
    }
    // not necessary if there is a wall at the end?
    //  else {
    //     if(obj.xSpeed + obj.elem.offsetLeft <= 0 || obj.xSpeed + obj.elem.offsetLeft + objectRatio >= document.getElementById("mainContainer").offsetWidth) { // At the far left edge, reverse
    //         obj.xSpeed = -obj.xSpeed
    //     }
    // }
    obj.xDisplace();
  };

  this.checkCollectibleCollision = function (collectible, index) {
    const character = allElems["character"];
    const collisionAngle = character.collision(collectible);
    if (!collisionAngle) return;
    const collectibleType = collectible.content;
    switch (collectibleType) {
      case "mushroom":
        character.changeStrength(1);
        break;
      case "star":
        character.invincible = frameRate * 10;
        break;
      case "coin":
        character.coins++;
        character.points += 100;
        setCoins(character.coins.toString());
        setPoints(character.points.toString());
        break;
    }
    collectible.elem.classList.add("hidden");
    garbageCollector["collectible"].push(index);
  };
  this.checkMonsterCollision = function (monster, index) {
    const character = allElems["character"];
    const collisionAngle = character.collision(monster);
    if (!collisionAngle) return;
    switch (collisionAngle) {
      case "top":
        if (character.ySpeed < 0) return;
        character.ySpeed = 0;
        character.yForce(-4);
        character.points += monster.content;
        console.log(
          `kill monster, got points ${monster.content}. Player has now ${character.points} points`
        );
        setPoints(character.points.toString());
        monster.elem.classList.add("hidden");
        garbageCollector["monster"].push(index);

        // delete allElems["monster"][index]
        break;
      default:
        if (!character.invincible) {
          character.changeStrength(-1);
          if (!character.strength) gameEnd = "die";
          else character.invincible = 3 * frameRate;
          console.log(`monster hit. strength remaining ${character.strength}`);
        }
    }
  };
  this.checkBulletCollision = function (bullet, bulletIndex) {
    for (const [monsterIndex, monster] of Object.entries(allElems["monster"])) {
      if (bullet.collision(monster)) {
        allElems["character"].points += monster["content"];
        setPoints(allElems["character"].points.toString());
        monster.elem.classList.add("hidden");
        bullet.elem.classList.add("hidden");
        garbageCollector["monster"].push(monsterIndex);
      }
    }
  };
  this.checkObstacleCollision = function (character, index) {
    // check all obstacles collision every frame
    let inAir = true;
    for (const obstacle of allElems["obstacle"]) {
      const collisionAngle = character.collision(obstacle);
      // if (!character.elem.classList.contains("character")) console.log(collisionAngle)
      if (!collisionAngle) continue;
      if (
        obstacle.content.toString().includes("lv") &&
        character.elem.classList.contains("character")
      ) {
        gameSetup(allElems["character"], obstacle.content);
        break;
      }
      switch (collisionAngle) {
        case "bottom":
          if (character.elem.classList.contains("bullet")) break;
          character.ySpeed = 0;
          character.yForce(4);
          // handle destruction of obstacle
          obstacle.contentHandler(allElems);
          break;
        case "top":
          // stop character at ySpeed and set it on top of the obstacle. reset jumping to false
          character.ySpeed = 0;
          if (character.elem.classList.contains("bullet")) {
            // character.ySpeed = 0
            character.yForce(character.bounce);
            break;
          }
          character.elem.style.top =
            Number.parseFloat(obstacle.elem.style.top) -
            objectRatio * character.size +
            "px";
          inAir = false;
          break;
        case "left":
          if (character.elem.classList.contains("bullet")) {
            garbageCollector["gravity"].push(index);
            character.elem.classList.add("hidden");
          }
          // stop play character and bounce character back a bit
          if (character.elem.classList.contains("character")) {
            character.xSpeed = 0;
            character.xForce(-2);
          } else {
            // for moving objects other than player character
            character.xForce(-(character.xSpeed * 2));
          }
          break;
        case "right":
          if (character.elem.classList.contains("bullet")) {
            garbageCollector["gravity"].push(index);
            character.elem.classList.add("hidden");
          }
          // same as left
          if (character.elem.classList.contains("character")) {
            character.xSpeed = 0;
            character.xForce(2);
          } else {
            character.xForce(-(character.xSpeed * 2));
          }
          break;
      }
    }
    if (!inAir) character.jumping = false;
  };
};

const gameManager = new GameManager(worldGravity, frameRate); // 9.8, frameRate

// let previousTimestamp = 0;
// let fpsInterval = 1000 / frameRate; // 60 FPS

function update(timestamp) { // timestamp is declared 
  console.log(timestamp)
  if (!gameData["timeStart"]) {
    gameData["timeStart"] = timestamp;
  }

  if (gameEnd) {
    if (gameEndHandler()) {
      window.requestAnimationFrame(update);
    }
    return;
  }
  // Limit the FPS to 60
  //if (timestamp - previousTimestamp <= fpsInterval) {
  // window.requestAnimationFrame(update);
  //   return;
  // }
  //previousTimestamp = timestamp;

  updateTime(timestamp);
  // console.log(timestamp)
  if (pause) return;
  // handle invincible
  if (allElems["character"].invincible) allElems["character"].invincible--;
  if (keysPressed["a"]) {
    allElems["character"].facing = "left";
    allElems["character"].xForce(-5);
    //transform background to the right
    if (allElems["character"].elem.style.transform != "scaleX(-1)") {
      allElems["character"].elem.style.transform = "scaleX(-1)";
    }
  } else if (keysPressed["d"]) {
    allElems["character"].facing = "right";
    allElems["character"].xForce(5);
    if (allElems["character"].elem.style.transform != "scaleX(1)") {
      allElems["character"].elem.style.transform = "scaleX(1)";
    }
  }
  if (keysPressed["w"] && !allElems["character"].jumping) {
    allElems["character"].yForce(
      -Math.sqrt(((objectRatio * 4 * 2 * worldGravity) / frameRate) * 1.1)
    );
    playEffect("jump");
    allElems["character"].jumping = true;
  }
  if (
    keysPressed["e"] &&
    allElems["character"].strength >= 3 &&
    !allElems["character"].shootTimer
  ) {
    allElems["character"].shoot(10, 0, "orange", 0.2);
    allElems["character"].shootTimer = 30;
  }
  if (allElems["character"].shootTimer) allElems["character"].shootTimer--;
  // apply movement per frame
  for (let i = 0; i < allElems["gravity"].length; i++) {
    gameManager.applyMovement(allElems["gravity"][i]);
    gameManager.checkObstacleCollision(allElems["gravity"][i], i);
  }

  // check monsters' collision with player
  for (let j = 0; j < allElems["monster"].length; j++) {
    gameManager.checkMonsterCollision(allElems["monster"][j], j);
  }

  // check bullets' collision with monster
  for (let l = 0; l < allElems["bullet"].length; l++) {
    gameManager.checkBulletCollision(allElems["bullet"][l], l);
  }

  // check player's collision with collectibles
  for (let k = 0; k < allElems["collectible"].length; k++) {
    gameManager.checkCollectibleCollision(allElems["collectible"][k], k);
  }

  for (let m = 0; m < allElems["bullet"].length; m++) {
    if (allElems["bullet"][m].elem.classList.contains("hidden"))
      garbageCollector["bullet"].push(m);
  }
  garbageCollecting();

  // Check if character is passed 45% of screen
  if (
    window.scrollX + window.innerWidth / 2.22 <
    allElems["character"].elem.offsetLeft
  ) {
    window.scroll(
      allElems["character"].elem.offsetLeft - window.innerWidth / 2.22,
      0
    );
  }
  window.requestAnimationFrame(update);
}

const garbageCollecting = function() {
    for (const [key, garbage] of Object.entries(garbageCollector)) {
        for (let m = 0; m < garbage.length; m++) {
            delete allElems[key][garbage[m]]
            allElems[key] = allElems[key].filter(garbage => garbage)
        }
        garbageCollector[key] = []
    }
}

// Time handler
const updateTime = async (currentTS) => {
  let newTime = Math.floor(
    gameData["time"] - (currentTS - gameData["timeStart"]) / 450
  );
  setTime(newTime.toString());
  if (newTime <= 0) {
    // End game
    gameEnd = "timeout";
    return;
  }
};

// play sound
const playEffect = async (targetEffect) => {
  if (!soundOn) {
    console.log("Sound is off");
    return;
  }
  console.log("Sound is on and playing " + targetEffect);

  if (sounds[targetEffect].paused) {
    sounds[targetEffect].play();
  } else {
    sounds[targetEffect].currentTime = 0;
  }
};

const gameEndHandler = () => {
  const endGameContainer = document.getElementById("gameEnd");
  const tagetContainer = document.getElementById("gameEndMessage");

  if (gameEnd == "timeout") {
    endGameContainer.style.display = "";
    tagetContainer.innerHTML = "GAME OVER";
    tagetContainer.style.fontSize = "150%";
    return false;
  } else if (gameEnd == "die") {
    console.log("Character died ", allElems["character"]);
  }
};

const unsetGameEnd = () => {
  gameEnd = "";
  const endGameContainer = document.getElementById("gameEnd");
  endGameContainer.style.display = "none";
};

// pause handler
let pause = false;
document.addEventListener("keyup", function (e) {
  if (e.key == "Escape") {
    if (pause === true) {
      pause = false;
      window.requestAnimationFrame(update);
      document.getElementById("overlay").style.display = "none";
    } else {
      pause = true;
      document.getElementById("overlay").style.display = "";
      document.getElementById("resume").focus();
    }
    console.log("game paused");
  }
});

function preventDefault(e) {
  e.preventDefault();
}

// disable mouse and keyboard scrolling
var supportsPassive = false;
try {
  window.addEventListener(
    "test",
    null,
    Object.defineProperty({}, "passive", {
      get: function () {
        supportsPassive = true;
      },
    })
  );
} catch (e) { }

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent =
  "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

// call this to Disable
function disableScroll() {
  window.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
}
