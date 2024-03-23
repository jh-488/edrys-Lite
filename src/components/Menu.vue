<script>
import { copyToClipboard } from "../ts/Utils";

export default {
  name: "Menu",
  props: {
    peerID: String,
    required: true,
  },
  methods: {
    copyPeerID() {
      copyToClipboard(this.peerID);
    },
  },
};
</script>

<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" icon="mdi-dots-vertical"> </v-btn>
    </template>

    <v-list>
      <v-list-item>
        <v-list-item-title> User ID: </v-list-item-title>
        <v-list-item-subtitle>
          {{ peerID }}
          <v-btn
            icon="mdi-content-copy"
            size="small"
            variant="flat"
            @click="copyPeerID()"
          >
          </v-btn>
        </v-list-item-subtitle>
        <v-list-item-title style="cursor: pointer;">
          <a :href="`./?/profile/${peerID}`" class="profile_link"><v-icon icon="mdi-account"></v-icon> Profile</a>
        </v-list-item-title>
      </v-list-item>
      <slot></slot>
    </v-list>
  </v-menu>
</template>


<style>
.profile_link {
  color: black;
  text-decoration: none;
}
</style>
