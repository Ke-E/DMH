<template>
  <v-app>
    <template v-if="isLoading">
      <div id="loading">
        <!-- ★単純なサークルなのでもう少しデザインチックにしたい -->
        <v-progress-circular indeterminate />
      </div>
    </template>
    <v-navigation-drawer color="#fffacd" app clipped v-model="drawer">
      <v-container>
        <v-list dense nav>
          <v-list-item
            v-for="page in targetItems"
            :to="page.link"
            :key="page.name"
          >
            <v-list-item-icon>
              <v-icon>{{ page.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ page.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-container>
    </v-navigation-drawer>
    <v-app-bar color="#f5deb3" app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title style="cursor: pointer" @click="$router.push('/')">
        Dinner Menu Helper
      </v-toolbar-title>
      <v-spacer />
      <div v-if="isShowSuccessAlert">
        <alert-success />
      </div>
      <v-spacer />
      <v-toolbar-items>
        <template v-if="!isLogin">
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" text>login<v-icon>mdi-menu-down</v-icon></v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="provider in providers"
                :key="provider.name"
                @click="googleLogin(provider.event)"
              >
                <v-list-item-icon>
                  <v-icon>{{ provider.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ provider.name }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-else>
          <v-btn @click="signout()" text>logout</v-btn>
        </template>
        <template v-if="isLogin">
          <img style="border-radius: 50%" :src="userInfo.photoURL" />
        </template>
      </v-toolbar-items>
    </v-app-bar>
    <v-main style="background-color: #fff3e0">
      <!-- このタグを入れることで[router/index.js]に記載のURLパスに紐づく画面が表示される -->
      <router-view :isLogin="isLogin" :userInfo="userInfo" />
    </v-main>
  </v-app>
</template>
<script>
import {
  getAuth,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import AlertSuccess from "./components/AlertSuccess.vue";
import { pageList } from "./components/list_item/page-list.js";
import { providerList } from "./components/list_item/provider-list.js";

export default {
  components: { AlertSuccess },
  data() {
    return {
      drawer: null,
      isLogin: false,
      // トークンは必要？
      accessToken: "default",
      userInfo: {},
      isLoading: false,
      isShowSuccessAlert: false,
      providers: providerList,
    };
  },
  created() {
    // ローディング画面の表示
    this.isLoading = true;

    // firebaseの認証情報を取得
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        // ログイン成功後のリダイレクトフロー
        // ★uidに紐づくデータがfirebase/recipiesに存在するかをチェック
        //  存在する場合 → 特に操作なし
        //  存在しない場合 → 新規でデータ作成
        this.userInfo = result.user;
        console.log(this.userInfo);
        console.log(this.userInfo.uid);
        this.accessToken = this.userInfo.accessToken;
        this.isLogin = true;
        this.isShowSuccessAlert = true;
      })
      .catch(() => {
        // ページを開いたときのログイン状態確認処理
        onAuthStateChanged(auth, (user) => {
          if (user) {
            // ログイン状態
            this.userInfo = user;
            this.isLogin = true;
          }
        });
      })
      .finally(() => {
        this.isLoading = false;
      });
  },
  computed: {
    targetItems() {
      return pageList.filter((item) => item.isLogin !== this.isLogin);
    },
  },
  methods: {
    googleLogin(event) {
      /*
       引数の内容によってgoogleか、twitterか、としたい
       引数を用いないとエラーが出るのでとりあえずconsole.logしておく
      */
      console.log(event);
      const provider = new GoogleAuthProvider();
      signInWithRedirect(getAuth(), provider);
    },
    signout() {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          console.log("logout success!");
          this.$router.go({
            // ✖未解決：本当はホーム画面に飛ばしたいが、何故か飛ばない…
            // onAuthStateChanged のfalseに入れてしまうと無限ループに陥る
            // 一旦は子コンポーネント側で遷移するようにハンドリング
            path: "/",
            force: true,
          });
        })
        .catch((error) => {
          console.log("logout failed...");
          console.log(error);
        });
    },
  },
};
</script>
<style lang="scss">
#loading {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  position: fixed;
  background-color: rgba(#000, 0.5);
}
</style>
