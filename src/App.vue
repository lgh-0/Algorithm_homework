<template>
  <div class="app-container">
    <router-view id="router-a1"></router-view>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: rgb(233, 238, 230);  
}

#router-a1 {
  width: 80%;
  height: 80%;
  display: block;
}
</style>
