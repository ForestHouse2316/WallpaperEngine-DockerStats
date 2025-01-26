export function sleep(ms) {
    const targetTime = Date.now() + ms;
    while (Date.now() < targetTime) {
        //
    }
}

export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}