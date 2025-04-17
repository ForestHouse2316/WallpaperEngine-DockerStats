import { ref } from "vue";
import { makeToast, clearAllToast } from "./toast";
import { refresh } from "./puller";

// user-properties variables (linked with WallpaperEngine)
export const ADDRESS = ref(process.env.VUE_APP_ADDRESS ?? "127.0.0.1"); // address
export const API_PORT = ref(process.env.VUE_APP_API_PORT ?? "1202"); // apiport
export const CONTAINER_NAME = ref(process.env.VUE_APP_CONTAINER_NAME ?? "docker-stats-api"); // containername
export const PULL_INTERVAL = ref(Number(process.env.VUE_APP_PULL_INTERVAL ?? 5000)); // pullinterval
export const SHOW_TOAST = ref(process.env.VUE_APP_SHOW_TOAST === "true"); // showtoast
export const STREAM_MODE = ref(process.env.VUE_APP_STREAM_MODE === "true"); // streammode
export const AGGREGATE = ref(process.env.VUE_APP_AGGREGATE === "true"); // aggregate
export const DEBUG_MODE = ref(process.env.VUE_APP_DEBUG_MODE === "true"); // debugmode

// development options (only adjustable via .env file)
export const SHOW_ALL_UI = process.env.VUE_APP_SHOW_ALL_UI === "true";
export const RAND_STAT_VAL = process.env.VUE_APP_RAND_STAT_VAL === "true";


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
        if (properties.streammode) {
            STREAM_MODE.value = properties.streammode.value;
            if (STREAM_MODE.value) makeToast("Stream mode is on 🚿", 1);
            else makeToast("One-shot mode (legacy mode) is on. Turn off this only when your interval is bigger than 5 seconds.", 2);
        }
        if (properties.aggregate) AGGREGATE.value = properties.aggregate.value;
        /* Add additional properties here when you customize this. */

        if (DEBUG_MODE.value) makeToast(`Properties changed.\n${JSON.stringify(properties)}`, 1);
        refresh();
    },
};