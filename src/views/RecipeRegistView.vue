<template>
  <div>
    <!-- ★フォントをもう少し映えるものに変える -->
    <RecipiesEdit :pageTitle="pageTitle"></RecipiesEdit>
  </div>
</template>
<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import RecipiesEdit from "../components/RecipiesEdit.vue";
export default {
  data() {
    return {
      uid: "",
      pageTitle: "レシピ登録",
    };
  },
  props: {
    isLogin: {
      type: Boolean,
      default: false,
    },
    userInfo: {
      type: Object,
      default: null,
    },
  },
  components: {
    RecipiesEdit,
  },
  mounted() {
    if (this.isLogin) {
      this.uid = this.userInfo.uid;
    } else {
      // 直アクセスの場合はログイン状態をチェック
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.uid = user.uid;
        } else {
          // 未ログインもしくはログアウト後の場合はトップ画面に戻す
          this.$router.push({ path: "/" });
        }
      });
    }
  },
};
</script>
