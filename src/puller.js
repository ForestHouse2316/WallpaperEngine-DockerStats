import { ref, computed } from "vue";
import { makeToast } from "./toast";
import { getRandom } from "./utils";
import * as up from "./user-props";

const FETCH_TIMEOUT = 20000;

export const cpu = ref(0);
export const ram = ref(0);
export const tx = ref(0);
export const rx = ref(0);
export const read = ref(0);
export const write = ref(0);
export const API_URL = computed(() => `http://${up.ADDRESS.value}:${up.API_PORT.value}/${up.CONTAINER_NAME.value}`);
export const STREAM_URL = computed(() => `http://${up.ADDRESS.value}:${up.API_PORT.value}/stream/${up.CONTAINER_NAME.value}`);

let puller;
let streamPuller = null;
let prevTX = 0,
    prevRX = 0,
    prevRead = 0,
    prevWrite = 0;


export function refresh() {
    clearInterval(puller);
    streamPuller?.close();

    if (up.RAND_STAT_VAL) {
        puller = setInterval(() => {
            cpu.value = getRandom(0, 100);
            ram.value = getRandom(0, 1099511627776); // ~ 1TB
            tx.value = getRandom(0, 1073741824); // ~ 1GB
            read.value = getRandom(0, 1048576); // ~ 1MB
        }, 1000);
        return;
    }

    // re-assign puller
    if (up.STREAM_MODE.value) {
        streamPuller = fetchStreamData();
        puller = setInterval(() => {
            if (streamPuller === null) streamPuller = fetchStreamData();
        }, 5000);
    } else puller = setInterval(fetchData, up.PULL_INTERVAL.value);
}

// one-shot fetch (non-stream mode)
function fetchData() {
    if (up.DEBUG_MODE.value) makeToast(`GET > ${API_URL.value}`, 1);
    fetch(API_URL.value, { signal: AbortSignal.timeout(FETCH_TIMEOUT) })
        .then((res) => res.json())
        .then(processStat)
        .catch((err) => {
            makeToast(`Error on fetch : ${err}`, 3);
        });
}

function fetchStreamData() {
    const STREAM_URL = `http://${up.ADDRESS.value}:${up.API_PORT.value}/stream/${up.CONTAINER_NAME.value}`;
    const eventSource = new EventSource(STREAM_URL);
    if (up.DEBUG_MODE.value) makeToast(`Open SSE connection > ${STREAM_URL}`, 1);

    eventSource.onmessage = (event) => {
        let stat;
        try {
            stat = JSON.parse(event.data);
            processStat(stat);
        } catch (error) {
            makeToast(error, 3);
            return;
        }
    };

    eventSource.onerror = (err) => {
        makeToast(`Stream error occured.`, 3);
        eventSource.close();
        streamPuller = null;
    };

    return eventSource;
}

function processStat(stat) {
    if (up.DEBUG_MODE.value) makeToast("< Fetched", 1);

    // Catch API error
    if (stat.error != null) {
        makeToast(stat, 3);
        return;
    }

    // CPU
    cpu.value = 0;
    let cpuDelta = stat.cpu_stats.cpu_usage.total_usage - stat.precpu_stats.cpu_usage.total_usage;
    let sysDelta = stat.cpu_stats.system_cpu_usage - stat.precpu_stats.system_cpu_usage;
    let onlineCpu = stat.cpu_stats.online_cpus ?? 1;

    if (cpuDelta > 0 && sysDelta > 0) {
        cpu.value = (cpuDelta / sysDelta) * onlineCpu * 100;
    }

    // RAM
    ram.value = stat.memory_stats.usage ?? 0;

    // TX/RX
    let txSum = 0,
        rxSum = 0;
    for (const adapter in stat.networks) {
        txSum += stat.networks[adapter].tx_bytes ?? 0;
        rxSum += stat.networks[adapter].rx_bytes ?? 0;
    }
    if (up.AGGREGATE.value) {
        tx.value = txSum;
        rx.value = rxSum;
    } else {
        tx.value = txSum - prevTX;
        rx.value = rxSum - prevRX;
        prevTX = txSum;
        prevRX = rxSum;
    }

    // I/O
    let ioStat = stat.blkio_stats.io_service_bytes_recursive;
    if (ioStat === null) {
        read.value = 0;
        write.value = 0;
        prevRead = 0;
        prevWrite = 0;
    } else if (up.AGGREGATE.value) {
        read.value = ioStat[0]?.value ?? 0;
        write.value = ioStat[1]?.value ?? 0;
    } else {
        read.value = Math.max((ioStat[0]?.value ?? 0) - prevRead, 0);
        write.value = Math.max((ioStat[1]?.value ?? 0) - prevWrite, 0);
        prevRead = ioStat[0]?.value ?? 0;
        prevWrite = ioStat[1]?.value ?? 0;
    }

    if (up.DEBUG_MODE.value) makeToast("Value updated", 1);
}
