<template>
    <ToastList v-if="SHOW_TOAST && toastIDStart !== 0" :messages="messages" @finish="deleteToast" />

    <h1>{{ CONTAINER_NAME }}</h1>
    <StatItem name="CPU" :value="cpu" unit="%" />
    <StatItem name="RAM" :value="ram" :auto-data-unit="true" />
    <StatItem name="TX" :value="tx" :auto-data-unit="true" :aggregate="AGGREGATE" />
    <StatItem name="RX" :value="rx" :auto-data-unit="true" :aggregate="AGGREGATE" />
    <StatItem name="Read" :value="read" :auto-data-unit="true" :aggregate="AGGREGATE" />
    <StatItem name="Write" :value="write" :auto-data-unit="true" :aggregate="AGGREGATE" />

    <!-- SHOW_ALL_UI -->
    <div class="show-all-ui-container" v-if="SHOW_ALL_UI">
        <StatItem name="CPU" :value="cpu" unit="%" />
        <StatItem name="RAM" :value="ram" :auto-data-unit="true" />
        <StatItem name="TX" :value="tx" :auto-data-unit="true" />
        <StatItem name="Read" :value="read" :auto-data-unit="true" />
        <ToastList :messages="{ msg: 'SHOW_ALL_UI\nDesign your own theme with this mode!' }" />
        <ToastList :messages="{ msg: 'This toast box will contain very loooooooooooooooooooong messages and newlines.\n1\n2\n3\n4\n5\n6\n7\n8\n9' }" />
    </div>
</template>

<script setup>
// comp
import StatItem from "./components/StatItem.vue";
import ToastList from "./components/ToastList.vue";
// module (import order is IMPORTANT. toast => user-props => puller)
import { deleteToast, messages } from "./toast";
import { SHOW_ALL_UI, SHOW_TOAST, CONTAINER_NAME, AGGREGATE } from "./user-props";
import { refresh, cpu, ram, tx, rx, read, write } from "./puller";

// start puller
refresh();
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
