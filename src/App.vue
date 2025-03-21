<template>
    <ToastList v-if="SHOW_TOAST && toastIDStart !== 0" :messages="messages" @finish="deleteToast" />

    <h1>{{ CONTAINER_NAME }}</h1>
    <StatItem name="CPU" :value="cpu" unit="%" />
    <StatItem name="RAM" :value="ram" :auto-data-unit="true" />
    <StatItem name="TX" :value="tx" :auto-data-unit="true" />
    <StatItem name="RX" :value="rx" :auto-data-unit="true" />
    <StatItem name="Read (aggregate)" :value="read" :auto-data-unit="true" />
    <StatItem name="Write (aggregate)" :value="write" :auto-data-unit="true" />

    <!-- SHOW_ALL_UI -->
    <div class="show-all-ui-container" v-if="SHOW_ALL_UI">
        <StatItem name="CPU" :value="cpu" unit="%" />
        <StatItem name="RAM" :value="ram" :auto-data-unit="true" />
        <StatItem name="TX" :value="tx" :auto-data-unit="true" />
        <StatItem name="Read (aggregate)" :value="read" :auto-data-unit="true" />
        <ToastList :messages="{ msg: 'SHOW_ALL_UI\nDesign your own theme with this mode!' }" />
        <ToastList :messages="{ msg: 'This toast box will contain very loooooooooooooooooooong messages and newlines.\n1\n2\n3\n4\n5\n6\n7\n8\n9' }" />
    </div>
</template>

<script setup>
// comp
import { getRandom } from "./utils";
import StatItem from "./components/StatItem.vue";
import ToastList from "./components/ToastList.vue";

import { ref, computed } from "vue";

const FETCH_TIMEOUT = 20000;

// user-properties variables (linked with WallpaperEngine)
const ADDRESS = ref(process.env.VUE_APP_ADDRESS ?? "127.0.0.1"); // address
const API_PORT = ref(process.env.VUE_APP_API_PORT ?? "1202"); // apiport
const CONTAINER_NAME = ref(process.env.VUE_APP_CONTAINER_NAME ?? "docker-stats-api"); // containername
const PULL_INTERVAL = ref(Number(process.env.VUE_APP_PULL_INTERVAL ?? 5000)); // pullinterval
const SHOW_TOAST = ref(process.env.VUE_APP_SHOW_TOAST === "true"); // showtoast
const DEBUG_MODE = ref(process.env.VUE_APP_DEBUG_MODE === "true"); // debugmode

// development options
const SHOW_ALL_UI = process.env.VUE_APP_SHOW_ALL_UI === "true";
const RAND_STAT_VAL = process.env.VUE_APP_RAND_STAT_VAL === "true";

// stats (ref)
const cpu = ref(0);
const ram = ref(0);
const tx = ref(0);
const rx = ref(0);
const read = ref(0);
const write = ref(0);

// toast message system
const toastIDStart = ref(0);
const toastIDEnd = ref(0);
const messages = ref({}); // used object to maintain order and state of toast components
function makeToast(msg, lvl = 0) {
    if (!SHOW_TOAST.value) return;
    let icon = "";
    switch (lvl) {
        case 1:
            icon = "💡 "; // info, tip
            break;
        case 2:
            icon = "⚠️ "; // warn
            break;
        case 3:
            icon = "🛑 "; // error
            break;
    }
    messages.value[toastIDStart.value++] = icon + msg;
}
function deleteToast() {
    delete messages.value[toastIDEnd.value++];
    if (toastIDStart.value === toastIDEnd.value) {
        toastIDStart.value = toastIDEnd.value = 0;
    }
}
function clearAllToast() {
    messages.value = {};
    toastIDStart.value = toastIDEnd.value = 0;
}

// user-properties sync
window.wallpaperPropertyListener = {
    applyUserProperties: function (properties) {
        if (properties.address) ADDRESS.value = properties.address.value;
        if (properties.apiport) API_PORT.value = properties.apiport.value;
        if (properties.containername) CONTAINER_NAME.value = properties.containername.value;
        if (properties.pullinterval) {
            let interval = Number(properties.pullinterval.value);
            if (isNaN(interval)) makeToast(`${properties.pullinterval.value} is not a digit!`, 3);
            else if (interval < 500) makeToast(`Pull interval cannot be lower than 500ms to prevent unexpected operation. The new value ${interval}ms will be ignored.`, 2);
            else {
                PULL_INTERVAL.value = interval;
                if (interval < 3000) makeToast(`Frequent pulling(${PULL_INTERVAL.value}ms) can cause performance degradation of your server, increase network usage, and occur fetch timeoue error.`, 2);
            }
        }
        if (properties.showtoast) {
            SHOW_TOAST.value = properties.showtoast.value;
            if (!SHOW_TOAST.value) clearAllToast();
        }
        if (properties.debugmode) {
            DEBUG_MODE.value = properties.debugmode.value;
            if (DEBUG_MODE.value) makeToast("Debug Mode consumes a lot of resources. This can cause fetch timeout error.", 2);
        }
        /* Add additional properties here when you customize this. */

        if (DEBUG_MODE.value) makeToast(`Properties changed.\n${JSON.stringify(properties)}`, 1);
        refreshPuller();
    },
};

// fetch stats data
let puller;
const API_URL = ref(`http://${ADDRESS.value}:${API_PORT.value}/${CONTAINER_NAME.value}`);
if (RAND_STAT_VAL) {
    puller = setInterval(() => {
        cpu.value = getRandom(0, 100);
        ram.value = getRandom(0, 1099511627776); // ~ 1TB
        tx.value = getRandom(0, 1073741824); // ~ 1GB
        read.value = getRandom(0, 1048576); // ~ 1MB
    }, 1000);
}
else refreshPuller();

function refreshPuller() {
    API_URL.value = `http://${ADDRESS.value}:${API_PORT.value}/${CONTAINER_NAME.value}`;
    clearInterval(puller);
    puller = setInterval(fetchData, PULL_INTERVAL.value);
}
function fetchData() {
    if (DEBUG_MODE.value) makeToast(`GET > ${API_URL.value}`, 1);
    fetch(API_URL.value, { signal: AbortSignal.timeout(FETCH_TIMEOUT) })
        .then((res) => res.json())
        .then((stat) => {
            if (DEBUG_MODE.value) makeToast("< Fetched", 1);

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
            tx.value = txSum;
            rx.value = rxSum;

            // I/O
            let ioStat = stat.blkio_stats.io_service_bytes_recursive;
            read.value = ioStat[0].value ?? 0;
            write.value = ioStat[1].value ?? 0;

            if (DEBUG_MODE.value) makeToast("Value updated", 1);
        })
        .catch((err) => {
            makeToast(`Error on fetch : ${err}`, 3);
        });
}
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    background-color: white;
    margin: 0;
    padding: 0;
    scrollbar-width: 0;
    scroll-margin: 0;
    scroll-padding: 0;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
}

body {
    margin: 0;
}

.align-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

* {
    /* prohibit text selecting */
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    user-select: none;
}

/* for layout debugging */
.de1 {
    border: red 1px solid;
}

.de2 {
    border: green 1px solid;
}

.show-all-ui-container {
    position: fixed;
    top: 0;
    left: 0;
    padding: 5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    height: 100vh;
    width: 100vw;
    overflow-y: scroll;
}
.show-all-ui-container > * {
    flex-shrink: 0 !important;
    margin-bottom: 5rem;
    position: relative !important;
    border: solid 1px red;
}
</style>
