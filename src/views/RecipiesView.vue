<template>
  <draggable tag="ul">
    <li v-for="(item, index) in testlist" :key="item.name">
      {{ item.name }}-{{ index }}
    </li>
  </draggable>
</template>
<script>
import draggable from "vuedraggable";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  data() {
    return {
      uid: "",
      testlist: [
        {
          name: "卵焼き",
        },
        {
          name: "そぼろご飯",
        },
        {
          name: "ハンバーグ",
        },
      ],
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
    draggable,
  },
  created() {
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
  // ★mouted() で取得した uid を用いてレシピ一覧を取得する
  // 1件もなければ「データは存在しません」と画面に表記する
};
</script>
