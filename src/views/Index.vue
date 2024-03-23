<script>
    export default {
        name: "Index",
        
        data() {
            return {
                username: "",
                password: "",
                usernameRules: [
                    (v) => !!v || "Username is required",
                    (v) => (v && v.length <= 20) || "Username must be less than 20 characters",
                ],
                passwordRules: [
                    (v) => !!v || "Password is required",
                    (v) => (v && v.length >= 8) || "Password must be at least 8 characters",
                ],
                hasAccount: false,
            };
        },

        methods: {
            toggleSignIn() {
                this.hasAccount = !this.hasAccount;
            },
        },
    };
</script>

<template>
    <v-app>
        <v-app-bar color="surface-variant">
            <template v-slot:prepend>
                <v-app-bar-title
                    style="color: white;"
                >
                    edrys-lite
                </v-app-bar-title>
            </template>
        </v-app-bar>

        <v-main class="d-flex flex-column align-center justify-center" style="gap: 50px;">
            <div class="text-h1 font-weight-light">Welcome to Edrys</div>
            <v-sheet v-if="!hasAccount" class="form pa-10" width="400" elevation="5">
                <v-form fast-fail @submit.prevent>
                <v-text-field
                    v-model="username"
                    :rules="usernameRules"
                    label="Username"
                    variant="outlined"
                ></v-text-field>

                <v-text-field
                    v-model="password"
                    :rules="passwordRules"
                    label="Password"
                    variant="outlined"
                ></v-text-field>

                <v-btn color="surface-variant" class="mt-2" type="submit" block>Register</v-btn>
                </v-form>
                <div class="d-flex align-center justify-center mt-5">
                    <p>Already have an account? <span id="sign-in-link" @click="toggleSignIn">Sign In</span></p>
                </div>
            </v-sheet>

            <v-sheet v-if="hasAccount" class="form pa-10" width="400" elevation="5">
                <v-form fast-fail @submit.prevent>
                <v-text-field
                    v-model="username"
                    :rules="usernameRules"
                    label="Username"
                    variant="outlined"
                ></v-text-field>

                <v-text-field
                    v-model="password"
                    :rules="passwordRules"
                    label="Password"
                    variant="outlined"
                ></v-text-field>

                <v-btn color="surface-variant" class="mt-2" type="submit" block>Sign In</v-btn>
                </v-form>
                <div class="d-flex align-center justify-center mt-5">
                    <p>Back to <span id="sign-in-link" @click="toggleSignIn">Register</span></p>
                </div>
            </v-sheet>
        </v-main>
    </v-app>
</template>


<style>
    @keyframes fadeInOut {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }

    .form {
        animation: fadeInOut .5s ease-in-out;
    }

    #sign-in-link {
        color: #496989; 
        font-weight: 600;
        text-decoration: underline; 
        cursor: pointer;
    }

    #sign-in-link:hover {
        opacity: .8;
    }
</style>