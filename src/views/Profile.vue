<script lang="ts">
import Menu from "../components/Menu.vue";
import { getPeerID } from "../ts/Utils";

export default {
  name: "Profile",
  components: { Menu },
  data() {
    return {
      avatar:
        "https://www.mmm.ucar.edu/sites/default/files/img/default-avatar.jpg",
      peerID: getPeerID(false),
      userName: "Jihad",
      password: "",
      level: 0,
      userPoints: 0,
      userProgress: 20,
      newAvatarUrl: "",
    };
  },
  methods: {
    changeAvatar() {
      this.avatar = this.newAvatarUrl;
    },
    saveUsername() {},
    savePassword() {},
  },
};
</script>

<template>
  <v-app>
    <v-app-bar color="surface-variant">
      <template v-slot:prepend>
        <v-app-bar-title
          tag="a"
          style="color: white; text-decoration: none"
          title="Back to Homepage"
        >
          <a
            href="./?/home"
            style="
              color: white;
              text-decoration: none;
              display: flex;
              align-items: center;
              gap: 5px;
            "
            ><v-icon icon="mdi-home"></v-icon>edrys-lite</a
          >
        </v-app-bar-title>
      </template>
      <Menu :peerID="peerID"></Menu>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col align="center" justify="center">
            <v-avatar
              size="150"
              style="
                border: 3px solid #8a8a8a;
                margin-right: 5px;"
            >
              <v-img :src="avatar" alt="User Avatar" cover></v-img>
            </v-avatar>
            <v-btn size="30" title="Change avatar" elevation="5">
              <v-icon icon="mdi-pencil"></v-icon>
              <v-overlay
                activator="parent"
                location-strategy="connected"
                scroll-strategy="block"
              >
                <v-card class="pa-2" width="300">
                  <v-text-field
                    v-model="newAvatarUrl"
                    label="Enter new avatar URL"
                    append-inner-icon="mdi-send"
                    @click:append-inner="changeAvatar"
                  >
                  </v-text-field>
                </v-card>
              </v-overlay>
            </v-btn>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col align="center" cols="12" sm="4">
            <v-chip
              color="#496989"
              variant="flat"
              class="ma-5 pa-5"
              style="
                font-size: 1.2rem;
                box-shadow: 0 3px 0 0 rgba(73, 105, 137, 0.5);
              "
            >
              Lvl {{ level }}
            </v-chip>
            <v-chip
              color="#496989"
              variant="outlined"
              class="pa-5"
              style="
                font-size: 1.2rem;
                box-shadow: 0 3px 0 0 rgba(73, 105, 137, 0.5);
              "
            >
              Points {{ userPoints }}
            </v-chip>
            <v-progress-linear
              style="border: 1px solid #31b231"
              color="#31b231"
              height="20"
              v-model="userProgress"
              striped
            ></v-progress-linear>
          </v-col>
        </v-row>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" lg="6">
            <v-text-field label="ID" v-model="peerID" readonly></v-text-field>
            <v-text-field
              label="Username"
              v-model="userName"
              append-inner-icon="mdi-send"
              @click:append-inner="saveUsername"
            ></v-text-field>
            <v-text-field
              type="password"
              label="Password"
              v-model="password"
              append-inner-icon="mdi-send"
              @click:append-inner="savePassword"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
