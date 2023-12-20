<template>
  <v-alert
    :value="show"
    max-width="100%"
    style="margin: 0 0 0 auto"
    border="left"
    color="orange"
    shaped
    transition="slide-y-transition"
    type="success"
  >
    Login Success！
  </v-alert>
</template>
<script>
export default {
  data() {
    return {
      show: true,
    };
  },
  created() {
    setTimeout(() => {
      this.show = false;
    }, 3000);
  },
};
</script>
