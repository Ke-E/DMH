<template>
  <div>
    <h1>レシピ登録</h1>
    <p>{{ uid }}</p>
  </div>
</template>
<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  data() {
    return {
      uid: "",
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
