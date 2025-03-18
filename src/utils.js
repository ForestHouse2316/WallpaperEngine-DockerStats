export function sleep(ms) {
    const targetTime = Date.now() + ms;
    while (Date.now() < targetTime) {
        //
    }
}

export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandom(from, to) {
    let diff = to - from;
    return Math.random() * diff;
}

export function getRandomInt(from, to) {
    let diff = to - from;
    return Math.floor(Math.random() * (diff+1));
}