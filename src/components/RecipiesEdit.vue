<template>
  <div>
    <v-container>
      <h1 style="text-decoration: underline">
        {{ pageTitle }}
      </h1>
      <v-form ref="form" v-model="valid">
        <v-text-field
          v-model="name"
          :counter="50"
          :rules="rules.name"
          label="レシピ名"
          required
        ></v-text-field>

        <v-text-field
          v-model="description"
          :rules="rules.description"
          label="備考"
        ></v-text-field>

        <v-text-field
          v-model="url"
          :rules="rules.url"
          label="URL"
        ></v-text-field>

        <starrating
          v-model="rating"
          :increment="1"
          :max-rating="5"
          :read-only="false"
          :star-size="30"
          :show-rating="false"
        ></starrating>

        <v-divider></v-divider>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mt-4 mr-4"
          @click="insert"
        >
          登録
        </v-btn>
        <v-btn color="primary" class="mt-4 mr-4" outlined @click="clearForm">
          クリア
        </v-btn>
      </v-form>
    </v-container>
  </div>
</template>
<script>
import starrating from "vue-star-rating";
import { getDatabase, ref, update } from "firebase/database";

export default {
  data: () => ({
    valid: true,
    name: "",
    description: "",
    rating: 1,
    url: "",
    rules: {
      name: [
        (v) => !!v || "'レシピ名'は必須です。",
        (v) =>
          (v && v.length <= 50) ||
          "'レシピ名'は50文字以下である必要があります。",
      ],
      description: [
        (v) => v.length <= 200 || "'備考'は200文字以下である必要があります。",
      ],
      url: [
        (v) => v.length <= 1000 || "'URL'は1000文字以下である必要があります。",
      ],
    },
    select: null,
    items: ["Item 1", "Item 2", "Item 3", "Item 4"],
    checkbox: false,
  }),
  props: {
    pageTitle: {
      type: String,
      default: "想定しない文字列",
    },
    uid: {
      type: String,
      default: "",
    },
  },
  components: {
    starrating,
  },
  methods: {
    // 入力フォームのバリデーション
    validate() {
      this.$refs.form.validate();
    },
    // データ投入
    insert() {
      if (this.$refs.form.validate()) {
        update(ref(getDatabase(), `recipies/${this.uid}`), {
          [this.name]: {
            description: this.description,
            imagePath: "",
            url: this.url,
            rating: this.rating,
            sort: 0,
            deleteFlg: false,
          },
        })
          .then(() => {
            console.log("登録完了");
            this.$emit("dialogFunc", true, "登録に成功しました！", "");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    // フォームのクリア
    clearForm() {
      this.name = "";
      this.description = "";
      this.url = "";
      this.rating = 1;
      this.$refs.form.resetValidation();
    },
  },
};
</script>
