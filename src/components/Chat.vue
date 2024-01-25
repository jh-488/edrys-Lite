<script lang="ts">
import { copyToClipboard } from "../ts/Utils";

export default {
name: "Chat",
props: ["messages"],

  data() {
    return {
      message: "",
    };
  },

  methods: {
    copyPeerID() {
      copyToClipboard(getPeerID(false));
    },
  },
};
</script>

<template>
  <v-list>
    <v-list-item title="Drawer right"></v-list-item>
  </v-list>
</template>
