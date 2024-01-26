<script lang="ts">
import { copyToClipboard } from "../ts/Utils";

export default {
  name: "Chat",
  props: ["show", "messages"],

  data() {
    return {
      message: "",
      open: this.show,
      history: [
        {
          id: Date.now(),
          msg: "löajsdl asöldjf asfdöjalsdfjafjoiweösjdf fj saljfdaosfas fljfd afsjöaj",
          name: "Horst Meier",
        },
      ],
    };
  },

  watch: {
    show() {
      this.open = this.show;
    },
  },

  methods: {
    permanent() {
      return window.innerWidth > 800;
    },

    send() {
      if (this.message.trim() !== "") {
        this.history.push({ id: Date.now(), msg: this.message, name: "sadfasfdasfd" });
        this.message = "";
      }
    },

    toDate(timestamp: string): string {
      try {
        const date = new Date(parseInt(timestamp));
        return date.toLocaleString();
      } catch (e) {}

      return timestamp;
    },
  },
};
</script>

<template>
  <v-navigation-drawer
    :width="400"
    :permanent="permanent()"
    v-model="open"
    location="right"
  >
    <v-container>
      <v-row align="center" justify="center">
        <v-col
          v-for="msg in history"
          :key="msg.id"
          cols="12"
          style="padding: 5px 0.5rem 5px 0.5rem"
        >
          <v-card variant="elevated" class="mx-auto">
            <v-card-text style="padding-bottom: 3px">
              <p>{{ msg.msg }}</p>

              <p
                class="text-end text-decoration-overline"
                style="font-size: 10px; color: gray"
              >
                {{ toDate(msg.id) }} / {{ msg.name }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <template v-slot:append>
      <div class="pa-2">
        <v-textarea counter no-resize rows="4" v-model="message"> </v-textarea>

        <v-btn
          append-icon="mdi-send-outline"
          depressed
          block
          class="mb-2"
          @click="send()"
        >
          Send
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>
