import { ref } from "vue";
import { SHOW_TOAST } from "./user-props";

export const messages = ref({}); // used object to maintain order and state of toast components
export const toastIDStart = ref(0);
export const toastIDEnd = ref(0);



export function makeToast(msg, lvl = 0) {
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
export function deleteToast() {
    delete messages.value[toastIDEnd.value++];
    if (toastIDStart.value === toastIDEnd.value) {
        toastIDStart.value = toastIDEnd.value = 0;
    }
}
export function clearAllToast() {
    messages.value = {};
    toastIDStart.value = toastIDEnd.value = 0;
}
