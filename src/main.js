import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase/firebase-config";

Vue.config.productionTip = false;

initializeApp(firebaseConfig);

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
