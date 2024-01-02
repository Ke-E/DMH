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
        v-show="!item.deleteFlg"
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
import { getDatabase, ref, child, get, set } from "firebase/database";
import starrating from "vue-star-rating";
import slideupdown from "vue-slide-up-down";
import draggable from "vuedraggable";
import { getAuth, onAuthStateChanged } from "firebase/auth";
export default {
  data() {
    return {
      uid: "",
      dragIndex: null,
      recipies: [],
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
    // ログイン状況の確認
    if (this.isLogin) {
      this.uid = this.userInfo.uid;
      this.getRecipies();
      // ページ離脱時にレシピ情報をプッシュする処理を追加
      //window.onbeforeunload = function () {
      //  this.save();
      //  return "データを保存しました。";
      //};
      //window.addEventListener("beforeunload", this.test());
    } else {
      // 直アクセスの場合はログイン状態をチェック
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.uid = user.uid;
          this.getRecipies();
          // ページ離脱時にレシピ情報をプッシュする処理を追加
          //window.onbeforeunload = function () {
          //  this.save();
          //  return "データを保存しました。";
          //};
          //window.addEventListener("beforeunload", this.test());
        } else {
          // 未ログインもしくはログアウト後の場合はトップ画面に戻す
          this.$router.push({ path: "/" });
        }
      });
    }
  },
  mounted() {},
  destroyed() {
    window.onbeforeunload = null;
    //window.removeEventListener("beforeunload", this.test);
  },
  // 別のページに遷移する前にソート状態をセーブする
  beforeRouteLeave(to, from, next) {
    this.save();
    next();
  },
  methods: {
    getRecipies() {
      const dbRef = ref(getDatabase());
      get(child(dbRef, "recipies/" + this.uid))
        .then((res) => {
          if (res.exists()) {
            const recipies = res.val();
            const keys = Object.keys(recipies);
            for (const key of keys) {
              this.recipies.push({
                name: key,
                description: recipies[key].description,
                url: recipies[key].url,
                rating: recipies[key].rating,
                imagePath: recipies[key].imagePath,
                sort: recipies[key].sort,
                drawer: false,
                deleteFlg: recipies[key].deleteFlg,
              });
            }
            // sort値で昇順に並び替え
            this.recipies.sort((a, b) => (a.sort > b.sort ? 1 : -1));
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
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
    // 現在の各レシピの情報をfirebaseに保存
    save() {
      const saveRecipies = {};
      for (const recipi in this.recipies) {
        saveRecipies[this.recipies[recipi].name] = {
          description: this.recipies[recipi].description,
          imagePath: this.recipies[recipi].imagePath,
          url: this.recipies[recipi].url,
          rating: this.recipies[recipi].rating,
          sort: recipi,
          deleteFlg: this.recipies[recipi].deleteFlg,
        };
      }
      set(ref(getDatabase(), "recipies/" + this.uid), saveRecipies)
        .then(() => {
          console.log("更新完了");
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
