<template>
  <div v-if="recipies.length == 0">
    <div style="text-align: center">登録済みのレシピはありません</div>
  </div>
  <div v-else>
    <draggable draggable=".recipies">
      <li
        class="recipies"
        style="list-style: none"
        v-for="(item, index) in recipies"
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
            <v-container>
              <v-row>
                <v-col cols="10">
                  <p>
                    <!-- ★改行コードを実際の改行に反映したい -->
                    説明文-{{ item.description }}
                  </p>
                </v-col>
                <v-col cols="2">
                  <v-btn
                    width="100%"
                    class="mb-2"
                    small
                    outlined
                    color="orange"
                    @click="transitionExternalLink(item.url)"
                    >URL</v-btn
                  >
                  <v-btn
                    width="100%"
                    class="mb-2"
                    small
                    outlined
                    color="primary"
                    >編集</v-btn
                  >

                  <v-btn width="100%" small outlined color="red">削除</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </slideupdown>
        </v-card>
      </li>
    </draggable>
  </div>
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
      nonrecipies: [],
      recipies: [
        {
          name: "卵焼き",
          rating: 4,
          drawer: false,
          url: "https://google.com",
          description: "評判よし。甘めも今度試してみる",
        },
        {
          name: "そぼろご飯",
          rating: 5,
          drawer: false,
          url: "https://yahoo.co.jp",
          description: "ほうれん草は中華風の味付けが評判¥n肉は味濃いめが好み",
        },
        {
          name: "ハンバーグ",
          rating: 3,
          drawer: false,
          url: "https://github.com/Ke-E/DMH/tree/master",
          description:
            "200文字入れてみる¥nABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQR",
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
  // ★mouted() で、取得した uid を用いてレシピ一覧を取得する
  mounted() {},
  methods: {
    dragStart(index) {
      this.dragIndex = index;
    },
    dragEnter(index) {
      if (this.dragIndex === index) return;
      const deleteElement = this.recipies.splice(this.dragIndex, 1)[0];
      this.recipies.splice(index, 0, deleteElement);
      this.dragIndex = index;
      console.log(this.recipies[0]);
    },
    transitionExternalLink(url) {
      window.open(url, "_blank");
    },
  },
};
</script>
