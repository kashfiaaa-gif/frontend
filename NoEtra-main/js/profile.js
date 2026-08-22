/* =========================================================
   NoEtra - Profile
========================================================= */


/* =========================
   API
========================= */

const API =
    "http://localhost:3000/api";


/* =========================
   TOKEN HELPERS
========================= */

function getToken() {
    return localStorage.getItem("token");
}


function authHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };

}


document.addEventListener(
    "DOMContentLoaded",
    async function () {


        /* =================================================
           LOGIN CHECK
        ================================================= */

        if (!getToken()) {

            window.location.href =
                "login.html";

            return;
        }


        /* =================================================
           GET ELEMENTS
        ================================================= */

        const nameInput =
            document.getElementById(
                "profileName"
            );


        const emailInput =
            document.getElementById(
                "profileEmail"
            );


        const saveButton =
            document.getElementById(
                "saveProfile"
            );


        /* =================================================
           LOAD PROFILE FROM BACKEND
        ================================================= */

        let currentProfile = null;


        try {

            const response =
                await fetch(
                    `${API}/profile`,
                    {
                        headers: authHeaders()
                    }
                );


            if (response.status === 401 || response.status === 403) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href =
                    "login.html";

                return;
            }


            currentProfile =
                await response.json();


            if (!response.ok) {

                showProfileMessage(
                    currentProfile.error ||
                    "Could not load profile.",
                    "error"
                );

                return;
            }


            nameInput.value =
                currentProfile.full_name || "";


            emailInput.value =
                currentProfile.email || "";


            localStorage.setItem(
                "user",
                JSON.stringify(currentProfile)
            );

        } catch (error) {

            console.error(
                "Could not load profile:",
                error
            );

            showProfileMessage(
                "Backend server is not connected.",
                "error"
            );

        }


        /* =================================================
           SAVE PROFILE
        ================================================= */

        saveButton.addEventListener(
            "click",
            async function () {


                const full_name =
                    nameInput
                        .value
                        .trim();


                const email =
                    emailInput
                        .value
                        .trim()
                        .toLowerCase();


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (!full_name) {

                    showProfileMessage(
                        "Please enter your name.",
                        "error"
                    );

                    nameInput.focus();

                    return;
                }


                if (!email) {

                    showProfileMessage(
                        "Please enter your email.",
                        "error"
                    );

                    emailInput.focus();

                    return;
                }


                /* -----------------------------------------
                   EMAIL VALIDATION
                ----------------------------------------- */

                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(
                        email
                    )
                ) {

                    showProfileMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    emailInput.focus();

                    return;
                }


                /* -----------------------------------------
                   UPDATE PROFILE ON BACKEND
                   (username is kept as-is since there is
                   no username field on this page)
                ----------------------------------------- */

                try {

                    const response =
                        await fetch(
                            `${API}/profile`,
                            {
                                method: "PUT",

                                headers: authHeaders(),

                                body: JSON.stringify({

                                    full_name:
                                        full_name,

                                    username:
                                        currentProfile
                                            ? currentProfile.username
                                            : undefined,

                                    email:
                                        email

                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        showProfileMessage(
                            data.error ||
                            "Could not save profile.",
                            "error"
                        );

                        return;
                    }


                    currentProfile =
                        {
                            ...currentProfile,
                            ...data
                        };


                    localStorage.setItem(
                        "user",
                        JSON.stringify(currentProfile)
                    );


                    /* -----------------------------------------
                       SUCCESS
                    ----------------------------------------- */

                    showProfileMessage(
                        "✓ Profile updated successfully.",
                        "success"
                    );


                    setTimeout(
                        function () {

                            showProfileMessage(
                                "",
                                ""
                            );

                        },
                        3500
                    );

                } catch (error) {

                    console.error(
                        "Could not save profile:",
                        error
                    );

                    showProfileMessage(
                        "Backend server is not connected.",
                        "error"
                    );

                }

            }
        );


        /* =================================================
           THEME
        ================================================= */

        const savedTheme =
            localStorage.getItem(
                "noetraTheme"
            );


        if (
            savedTheme === "dark"
        ) {

            document.body.classList.add(
                "dark"
            );

        }


        updateThemeButton();


        const themeBtn =
            document.getElementById(
                "themeBtn"
            );


        if (themeBtn) {

            themeBtn.addEventListener(
                "click",
                toggleTheme
            );

        }

    }
);


/* =========================================================
   THEME TOGGLE
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const mode =
        document.body.classList.contains(
            "dark"
        )
            ? "dark"
            : "light";


    localStorage.setItem(
        "noetraTheme",
        mode
    );


    updateThemeButton();

}


/* =========================================================
   UPDATE THEME BUTTON
========================================================= */

function updateThemeButton() {

    const button =
        document.getElementById(
            "themeBtn"
        );


    if (!button) return;


    if (
        document.body.classList.contains(
            "dark"
        )
    ) {

        button.textContent =
            "☀️ Light";

    } else {

        button.textContent =
            "🌙 Dark";

    }

}


/* =========================================================
   PROFILE MESSAGE
========================================================= */

function showProfileMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "profileMessage"
        );


    if (!message) return;


    message.textContent =
        text;


    message.className =
        type || "";

}