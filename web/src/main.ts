import { createApp } from "vue";
import { createPinia } from "pinia";
import { Message } from "@arco-design/web-vue";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);
Message._context = app._context;

app.use(createPinia());
app.use(router);

app.mount("#app");
