<template>
  <draggable>
    <li
      style="list-style: none"
      v-for="(item, index) in testlist"
      :key="item.name"
      @dragstart="dragStart(index)"
      @dragenter="dragEnter(index)"
      @click="item.drawer = !item.drawer"
    >
      <!-- 
          dragのデザイン作り
          ★ ドラッグをしたときの残像、カーソルを当てた位置ではなくて右端が支点となってしまう・・・
            v-cardでなくdivだけだと問題ないのだけど…
        -->
      <v-card>
        <v-card-title>title-{{ item.name }}</v-card-title>
        <v-card-subtitle
          ><starrating
            v-model="item.rating"
            :max-rating="5"
            :read-only="true"
            :star-size="15"
            :show-rating="false"
          />
        </v-card-subtitle>
        <slideupdown :active="item.drawer">
          <v-card-text>テキストだよ</v-card-text>
        </slideupdown>
      </v-card>
    </li>
  </draggable>
</template>
<script>
import starrating from "vue-star-rating";
import slideupdown from "vue-slide-up-down";
import draggable from "vuedraggable";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  data() {
    return {
      uid: "",
      dragIndex: null,
      testlist: [
        {
          name: "卵焼き",
          rating: "4",
          drawer: false,
          dragging: false,
        },
        {
          name: "そぼろご飯",
          rating: "5",
          drawer: false,
          dragging: false,
        },
        {
          name: "ハンバーグ",
          rating: "3",
          drawer: false,
          dragging: false,
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
    starrating,
    slideupdown,
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
  methods: {
    dragStart(index) {
      this.dragIndex = index;
    },
    dragEnter(index) {
      if (this.dragIndex === index) return;
      const deleteElement = this.testlist.splice(this.dragIndex, 1)[0];
      this.testlist.splice(index, 0, deleteElement);
      this.dragIndex = index;
      console.log(this.testlist[0]);
    },
  },
  // ★mouted() で取得した uid を用いてレシピ一覧を取得する
  // 1件もなければ「データは存在しません」と画面に表記する
};
</script>
