const topBar = document.getElementById("topBar")
const points = document.createElement("div")
const coins = document.createElement("div")
const level = document.createElement("div")
const time = document.createElement("div")

export const initTopBar = function() {
    topBar.innerHTML = ""
    topBar.append(points, coins, level, time)
    points.classList.add("topBarElement", "topElementScoreWidth")
    coins.classList.add("topBarElement", "topElementWidth")
    level.classList.add("topBarElement", "topElementWidth")
    time.classList.add("topBarElement", "topElementWidth")

    setPoints("0")
    setCoins("0")
    setLevel("1-1")
    setTime("0")
}

export const setPoints = function(point) {
    points.textContent = `MARIO ${point.padStart(6, "0")}`
}

export const setCoins = function(coin) {
    coins.textContent = `COIN x ${coin.padStart(2, "0")}`
}

export const setLevel = function(newLevel) {
    level.textContent = `WORLD ${newLevel}`
}

export const setTime = function(seconds) {
    time.textContent = `TIME ${seconds.padStart(3, "0")}`
}
