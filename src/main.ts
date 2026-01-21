import "@/assets/styles/main.css";
import "@/assets/styles/select.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";

import ui from "@nuxt/ui/vue-plugin";
import router from "./router";

import App from "./App.vue";

const pinia = createPinia();
const app = createApp(App);

app.use(ui);
app.use(pinia);
app.use(router);

app.mount("#app");
