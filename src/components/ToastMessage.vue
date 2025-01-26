<template>
    <div class="toast-container">
        <p class="toast-msg">{{ msg }}</p>
        <div class="progress-wrap">
            <progress class="toast-life" value="1" @animationend="emit('finish')"></progress>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    msg: {
        type: String,
        default: "",
    },
});
const emit = defineEmits(["finish"]);
</script>

<style scoped>
.toast-container {
    margin: 0.2rem 0;
    padding: 0;
    background-color: rgba(221, 255, 177, 0.226);
    border-radius: 7px;

    animation: toast-up 0.5s linear forwards;
}

.toast-msg {
    padding: 1rem;
    text-align: left;
    margin: 0;
    white-space: pre-line;
    word-break: break-all;
}

.progress-wrap {
    position: relative;
    left: 0;
    bottom: 0;
    padding: 0;
    border: 0;
    height: 3px;
    overflow: hidden;
    border-bottom-left-radius: 7px;
    border-bottom-right-radius: 7px;

    background-color: rgba(255, 148, 207, 0.404);
}

.toast-life {
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0;
    border: 0;
    width: 100%;
    height: 3px;
    overflow: hidden;
    appearance: none;

    animation: progress-timer 5s linear forwards;
}

::-webkit-progress-value {
    background-color: rgb(22, 223, 56);
    animation: progress-gradation 5s linear forwards; /* The animation... does not works on WebKit-based browsers :( */
    /* DO NOT merge this with ::-mox-progress-bar. There's a Chromium bug... */
}

::-moz-progress-bar {
    background-color: rgb(102, 255, 55);
    animation: progress-gradation 5s linear forwards;
}

@keyframes toast-up {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes progress-timer {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}

@keyframes progress-gradation {
    from {
        background-color: rgb(102, 255, 55);
    }
    to {
        background-color: rgb(20, 228, 255);
    }
}
</style>
