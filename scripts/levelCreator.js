import { objectRatio } from "./main.js"
import { monsterTemplate, createObstacle, createCollectible, createMonster } from "./objects.js";

export function levelCreator() {
    const mainContainer = document.getElementById("mainContainer")
    
    // reset top bar
    const topBar = document.getElementById("topBar")
    
    // write innerHTML of the top bar structure
    topBar.innerHTML = `<form id="elementOptions">
    <label for="obstacleBtn" id="obstacleLabel">Obstacle</label>
    <input type="radio" id="obstacleBtn" name="elementBtn" value="obstacle" />

    <label for="monsterBtn" id="monsterLabel">Monster</label>
    <input type="radio" id="monsterBtn" name="elementBtn" value="monster" />

    <label for="collectibleBtn" id="collectibleLabel">Collectible</label>
    <input type="radio" id="collectibleBtn" name="elementBtn" value="collectible" />

    <button id="createJSON">Create Level</button>
    </form>
    `

    // create labels
    const obstacleLabel = document.getElementById("obstacleLabel")
    const monsterLabel = document.getElementById("monsterLabel")
    const collectibleLabel = document.getElementById("collectibleLabel")
    obstacleLabel.classList.add("topBarElement", "topElementLabel")
    monsterLabel.classList.add("topBarElement", "topElementLabel")
    collectibleLabel.classList.add("topBarElement", "topElementLabel")

    // create radio buttons
    const obstacleBtn = document.getElementById("obstacleBtn")
    const monsterBtn = document.getElementById("monsterBtn")
    const collectibleBtn = document.getElementById("collectibleBtn")
    obstacleBtn.classList.add("topBarElement", "topElementButton")
    monsterBtn.classList.add("topBarElement", "topElementButton")
    collectibleBtn.classList.add("topBarElement", "topElementButton")

    // add changes to different element types
    const elementOptions = document.getElementById("elementOptions")
    elementOptions.addEventListener('input', function(e) {
        console.log(e.target.value)
    })

    // export JSON format for creating the level data
    const submitBtn = document.getElementById("createJSON")
    submitBtn.classList.add("topBarElement")
    submitBtn.style.float = "right"
    submitBtn.style.marginRight = "5%"
    submitBtn.style.backgroundColor = "grey"
    submitBtn.style.borderRadius = "10%"

    submitBtn.addEventListener('click', function(e) {
        e.preventDefault()
        console.log("creating json")
        console.log(JSON.stringify(newLevelData))
    })

    // click to add element to the newLevelData object
    let xPos = 0
    let yPos = 0
    const newLevelData = {
        levelWidth: 200,
        obstacle: [
            [1,[],11,0,true,"grey",1,200]
        ],
        monster: [],
        collectible: []
    }
    mainContainer.addEventListener('click', function(e) {
        const selected = document.querySelector('input[name="elementBtn"]:checked')?.value;
        if (!selected) return
        console.log(`creating ${selected} element at ypos${yPos} xpos${xPos}}`)
        switch (selected) {
            case "obstacle":
                const obstacleData = [1, "mushroom", yPos, xPos, true, "grey"]
                newLevelData[selected].push(obstacleData)
                createObstacle(...obstacleData)
                break
            case "monster":
                const monsterData = ["placeholder", yPos, xPos, -1]
                newLevelData[selected].push(monsterData)
                monsterTemplate(...monsterData)
                break
            case "collectible":
                const collectibleData = [1, "mushroom", yPos, xPos, true, "green", 0, 0, "", false]
                newLevelData[selected].push(collectibleData)
                createCollectible(...collectibleData)
                break
        }
    })

    // add element tracker on mouse move
    const tracker = document.createElement("div")
    tracker.classList.add("tracker")
    tracker.style.height = objectRatio + "px"
    tracker.style.width = objectRatio + "px"
    console.log("hello")
    mainContainer.append(tracker)
    mainContainer.addEventListener('mousemove', function(e) {
        yPos = Math.floor(e.pageY / objectRatio)
        xPos = Math.floor(e.pageX / objectRatio)
        tracker.style.top = yPos * objectRatio + "px"
        tracker.style.left = xPos * objectRatio + "px"
    })
}