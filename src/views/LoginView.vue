<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <button @click="login()">ログイン</button>
    <div v-if="isSignIn">
      <p>{{ result.user.displayName }}</p>
      <img :src="result.user.photoURL" height="50" />
    </div>
  </div>
</template>
<script>
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default {
  data() {
    return {
      title: "Login",
      message: "login view",
      recipis: [],
      isSignIn: false,
      result: {},
      app: {},
      credential: {},
      accessToken: "",
    };
  },
  created() {
    this.app = this.initialize();
  },
  methods: {
    login() {
      const provider = new GoogleAuthProvider();
      signInWithPopup(getAuth(), provider).then((result) => {
        this.credential = GoogleAuthProvider.credentialFromResult(result);
        this.accessToken = this.credential.accessToken;
        this.result = result;
        console.log(this.credential);
        console.log(this.result);
        this.isSignIn = true;
        this.$emit("access-token", this.accessToken);
      });
    },
    initialize() {
      const config = {
        apiKey: "AIzaSyD8g_p8TFUcZVMY1yczZ8T3wcdG_Qpg2M4",
        authDomain: "dinnermenuhelper.firebaseapp.com",
        databaseURL: "https://dinnermenuhelper-default-rtdb.firebaseio.com",
        projectId: "dinnermenuhelper",
        storageBucket: "dinnermenuhelper.appspot.com",
        messagingSenderId: "447179301959",
        appId: "1:447179301959:web:db4d2f9b1ce45138d4fd62",
        measurementId: "G-NV142BEJDC",
      };
      return initializeApp(config);
    },
  },
};
</script>
