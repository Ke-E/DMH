import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../firebase/firebase-config.js";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/list",
    name: "list",
    component: () => import("../views/RecipiesView.vue"),
  },
  {
    path: "/enterprise",
    name: "enterprise",
    component: () => import("../views/EnterpriseView.vue"),
  },
  {
    path: "/regist",
    name: "regist",
    component: () => import("../views/RecipeRegistView.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;

const app = initializeApp(firebaseConfig);
getAuth(app);
