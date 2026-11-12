/* ============================================================
   KEYCRAFT // LOCAL USER SYSTEM
   Frontend-only authentication using localStorage.
   ============================================================ */

const KC_USERS_KEY = "keycraft_users";
const KC_SESSION_KEY = "keycraft_session";


/* ============================================================
   USER STORAGE
   ============================================================ */

/**
 * Get all registered users.
 */
function kcGetUsers() {
    try {
        const storedUsers = localStorage.getItem(KC_USERS_KEY);

        if (!storedUsers) {
            return {};
        }

        const users = JSON.parse(storedUsers);

        return users && typeof users === "object"
            ? users
            : {};

    } catch (error) {
        console.error("KeyCraft: Could not read users.", error);
        return {};
    }
}


/**
 * Save all users.
 */
function kcSaveUsers(users) {
    try {
        localStorage.setItem(
            KC_USERS_KEY,
            JSON.stringify(users)
        );

        return true;

    } catch (error) {
        console.error("KeyCraft: Could not save users.", error);
        return false;
    }
}


/**
 * Get currently logged-in username.
 */
function kcGetCurrentUsername() {
    return localStorage.getItem(KC_SESSION_KEY);
}


/**
 * Get currently logged-in user.
 */
function kcGetCurrentUser() {

    const username = kcGetCurrentUsername();

    if (!username) {
        return null;
    }

    const users = kcGetUsers();

    return users[username] || null;
}


/* ============================================================
   KEYCRAFT ID GENERATOR
   ============================================================ */

function kcGenerateID(username) {

    const random = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    const cleanName = String(username)
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0, 4)
        .toUpperCase();

    return `KC-${random}-${cleanName || "USER"}`;
}


/* ============================================================
   REGISTER
   ============================================================ */

function kcRegister(userData = {}) {

    const users = kcGetUsers();

    const username = String(userData.username || "")
        .trim()
        .toLowerCase();

    const nickname = String(userData.nickname || "").trim();

    const password = String(userData.password || "");

    const bio = String(userData.bio || "").trim();

    const favoriteSound =
        userData.favoriteSound || "thock";

    const profilePhoto =
        userData.profilePhoto || "";


    /* USERNAME VALIDATION */

    if (!username) {

        return {
            success: false,
            message: "USERNAME REQUIRED."
        };

    }


    if (username.length < 3) {

        return {
            success: false,
            message: "USERNAME MUST BE AT LEAST 3 CHARACTERS."
        };

    }


    /* PASSWORD VALIDATION */

    if (!password) {

        return {
            success: false,
            message: "PASSWORD REQUIRED."
        };

    }


    if (password.length < 4) {

        return {
            success: false,
            message: "PASSWORD MUST BE AT LEAST 4 CHARACTERS."
        };

    }


    /* NICKNAME */

    if (!nickname) {

        return {
            success: false,
            message: "NICKNAME REQUIRED."
        };

    }


    /* CHECK EXISTING USER */

    if (users[username]) {

        return {
            success: false,
            message: "USERNAME ALREADY EXISTS."
        };

    }


    /* CREATE USER */

    const newUser = {

        username: username,

        nickname: nickname,

        password: password,

        bio: bio,

        favoriteSound: favoriteSound,

        profilePhoto: profilePhoto,

        keyID: kcGenerateID(username),

        createdAt: new Date().toISOString(),

        stats: {

            keysOwned: 0,

            customDesigns: 0

        }

    };


    /* SAVE USER */

    users[username] = newUser;

    const saved = kcSaveUsers(users);


    if (!saved) {

        return {
            success: false,
            message: "COULD NOT CREATE ACCOUNT."
        };

    }


    /* AUTOMATICALLY LOG USER IN */

    localStorage.setItem(
        KC_SESSION_KEY,
        username
    );


    return {

        success: true,

        user: newUser

    };

}


/* ============================================================
   LOGIN
   ============================================================ */

function kcLogin(username, password) {

    const users = kcGetUsers();

    const cleanUsername = String(username || "")
        .trim()
        .toLowerCase();

    const cleanPassword = String(password || "");

    const user = users[cleanUsername];


    /* USER NOT FOUND */

    if (!user) {

        return {

            success: false,

            message: "USER NOT FOUND."

        };

    }


    /* PASSWORD CHECK */

    if (user.password !== cleanPassword) {

        return {

            success: false,

            message: "INVALID PASSWORD."

        };

    }


    /* CREATE SESSION */

    localStorage.setItem(
        KC_SESSION_KEY,
        cleanUsername
    );


    return {

        success: true,

        user: user

    };

}


/* ============================================================
   UPDATE USER
   ============================================================ */

function kcUpdateUser(updates = {}) {

    const username =
        kcGetCurrentUsername();

    if (!username) {
        return false;
    }


    const users =
        kcGetUsers();


    if (!users[username]) {
        return false;
    }


    users[username] = {

        ...users[username],

        ...updates

    };


    /* Make sure username cannot accidentally be changed */

    users[username].username = username;


    const saved =
        kcSaveUsers(users);


    return saved;

}


/* ============================================================
   LOGOUT
   ============================================================ */

function kcLogout() {

    localStorage.removeItem(
        KC_SESSION_KEY
    );


    window.location.href =
        "login.html";

}


/* ============================================================
   REQUIRE LOGIN
   Use this on pages that require an account.
   ============================================================ */

function kcRequireLogin() {

    if (!kcGetCurrentUser()) {

        window.location.href =
            "login.html";

    }

}


/* ============================================================
   REDIRECT LOGGED-IN USERS
   Used by login/register pages.
   ============================================================ */

function kcRedirectIfLoggedIn() {

    if (kcGetCurrentUser()) {

        window.location.href =
            "index.html";

    }

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* ============================================================
   SAFE IMAGE URL
   ============================================================ */

function kcSafeImageURL(url) {

    if (!url) {
        return "";
    }


    const value = String(url).trim();


    /*
       Allow normal image URLs and local/data images.

       This keeps the frontend from inserting javascript:
       URLs into an <img> element.
    */

    if (
        value.startsWith("data:image/") ||
        value.startsWith("https://") ||
        value.startsWith("http://") ||
        value.startsWith("./") ||
        value.startsWith("../") ||
        value.startsWith("/")
    ) {

        return value;

    }


    return "";

}


/* ============================================================
   NAVBAR PROFILE CIRCLE
   ============================================================ */

function kcRenderNavUser() {

    const host =
        document.getElementById("kc-user-nav");


    /* No profile container on this page */

    if (!host) {
        return;
    }


    const user =
        kcGetCurrentUser();


    /* ========================================================
       NOT LOGGED IN
    ======================================================== */

    if (!user) {

        host.innerHTML = `

            <a
                href="login.html"
                class="kc-login-nav"
                aria-label="Login"
                title="LOGIN"
            >
                ◉
            </a>

        `;

        return;

    }


    /* ========================================================
       LOGGED IN
    ======================================================== */

    const nickname =
        escapeHTML(user.nickname || user.username);


    const safePhoto =
        kcSafeImageURL(user.profilePhoto);


    let photoHTML = "";


    /* USER PROFILE PHOTO */

    if (safePhoto) {

        photoHTML = `

            <img
                src="${escapeHTML(safePhoto)}"
                alt="${nickname}"
                class="kc-profile-image"
            >

        `;

    }


    /* DEFAULT AVATAR */

    else {

        photoHTML = `

            <span
                class="kc-avatar-placeholder"
                aria-hidden="true"
            >
                KC
            </span>

        `;

    }


    /* INSERT PROFILE */

    host.innerHTML = `

        <a
            href="user.html"
            class="kc-user-nav-link"
            aria-label="Open profile"
            title="${nickname}"
        >

            <span class="kc-nav-avatar">

                ${photoHTML}

            </span>

        </a>

    `;

}


/* ============================================================
   INITIALIZE NAV PROFILE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* Render profile circle */

        kcRenderNavUser();


        /* ====================================================
           LOGOUT BUTTONS
        ==================================================== */

        document
            .querySelectorAll("[data-kc-logout]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        kcLogout();

                    }
                );

            });

    }
);