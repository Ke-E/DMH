<template>
  <div v-if="validRecipies == 0">
    <div style="text-align: center">登録済みのレシピはありません</div>
  </div>
  <div v-else>
    <v-dialog v-model="dialog.isDialog" width="50%" persistent>
      <v-card align="center">
        <v-card-title>以下を削除します</v-card-title>
        <v-card-text style="font-size: 100%">
          {{ dialog.recipiName }}
        </v-card-text>
        <v-btn @click="deleteRecipi()" outlined color="red" class="mb-3 mr-1"
          >OK</v-btn
        >
        <v-btn @click="closeDialog" outlined color="#90A4AE" class="mb-3 ml-1"
          >Cancel</v-btn
        >
      </v-card>
    </v-dialog>
    <draggable draggable=".recipies">
      <li
        class="recipies"
        style="list-style: none"
        v-for="(item, index) in recipies"
        v-show="!item.deleteFlg"
        :key="item.name"
        @dragstart="dragStart(index)"
        @dragenter="dragEnter(index)"
        @dragend="dragEnd()"
        @click="item.drawer = !item.drawer"
      >
        <!-- 
          dragのデザイン作り
          ★ ドラッグをしたときの残像、カーソルを当てた位置ではなくて右端が支点となってしまう・・・
            v-cardでなくdivだけだと問題ないのだけど…
        -->
        <v-card>
          <v-card-title>
            {{ item.name }}
            <v-spacer />
            <v-btn
              color="orange"
              :outlined="!item.ateFlg"
              class="mr-2"
              @click="ate(index)"
              >{{ item.ateFlg ? "下へ" : "食べた" }}</v-btn
            >
            <v-btn
              color="#F48FB1"
              :outlined="!item.eatFlg"
              class="mr-2"
              @click="eat(index)"
              >{{ item.eatFlg ? "上へ" : "食べたい" }}</v-btn
            >
          </v-card-title>
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

                  <v-btn
                    width="100%"
                    small
                    outlined
                    color="red"
                    @click="openDialog(index)"
                    >削除</v-btn
                  >
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
      validRecipies: 0,
      dialog: {
        isDialog: false,
        recipiName: "これが見えたらバグだよ",
        index: 0,
      },
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
    } else {
      // 直アクセスの場合はログイン状態をチェック
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.uid = user.uid;
          this.getRecipies();
        } else {
          // 未ログインもしくはログアウト後の場合はトップ画面に戻す
          this.$router.push({ path: "/" });
        }
      });
    }
  },
  watch: {
    // 削除フラグが動いた際に有効なレシピの件数を更新する(DeepWatch)
    recipies: {
      handler: function () {
        const count = this.recipies.filter((n) => n.deleteFlg == false).length;
        this.validRecipies = count;
      },
      deep: true,
    },
  },
  methods: {
    /**
     * firebaseからレシピ一覧を取得し、成形、ソートして格納する
     */
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
                deleteFlg: recipies[key].deleteFlg,
                drawer: false,
                ateFlg: false,
                eatFlg: false,
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
    dragEnd() {
      this.save();
    },
    /**
     * URLを別タブで開く
     */
    transitionExternalLink(url) {
      window.open(url, "_blank");
    },
    /**
     * 「食べた」ボタンを押下で「下へ」ボタンに変化
     * 「下へ」ボタンを押下で配列の最後尾へ移動し、状態を保存
     */
    ate(index) {
      if (!this.recipies[index].ateFlg) {
        this.recipies[index].ateFlg = true;
      } else {
        this.recipies[index].ateFlg = false;
        this.recipies.push(this.recipies.splice(index, 1)[0]);
        this.save();
      }
    },
    /**
     * 「食べたい」ボタンを押下で「上へ」ボタンに変化
     * 「上へ」ボタンを押下で配列の最前列へ移動し、状態を保存
     */
    eat(index) {
      if (!this.recipies[index].eatFlg) {
        this.recipies[index].eatFlg = true;
      } else {
        this.recipies[index].eatFlg = false;
        this.recipies.unshift(this.recipies.splice(index, 1)[0]);
        this.save();
      }
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
    openDialog(index) {
      this.dialog.recipiName = this.recipies[index].name;
      this.dialog.index = index;
      this.dialog.isDialog = true;
    },
    closeDialog() {
      this.dialog.isDialog = false;
    },
    deleteRecipi() {
      this.recipies[this.dialog.index].deleteFlg = true;
      this.save();
      this.dialog.isDialog = false;
    },
  },
};
</script>
