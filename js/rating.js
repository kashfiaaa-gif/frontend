/* =========================================================
   NoEtra - Resource Rating
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


/* =========================
   LOAD TOPICS
========================= */

async function loadTopics() {

    const topicSelect =
        document.getElementById(
            "topicSelect"
        );


    try {

        const response =
            await fetch(
                `${API}/results`
            );


        const topics =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Could not load topics."
            );

        }


        topics.forEach(function (topic) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                topic.result_id;


            option.textContent =
                topic.topic_name;


            topicSelect.appendChild(
                option
            );

        });

    }

    catch (error) {

        console.error(
            "Load Topics Error:",
            error
        );

    }

}


/* =========================
   LOAD RESOURCES FOR A TOPIC
========================= */

async function loadResourcesForTopic(resultId) {

    const resourceSelect =
        document.getElementById(
            "resourceSelect"
        );


    resourceSelect.innerHTML = `
        <option value="">
            -- Loading resources... --
        </option>
    `;


    if (!resultId) {

        resourceSelect.innerHTML = `
            <option value="">
                -- Select a topic first --
            </option>
        `;

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/results/${encodeURIComponent(resultId)}`,
                {
                    headers: authHeaders()
                }
            );


        const data =
            await response.json();


        if (response.status === 401 || response.status === 403) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            alert(
                "Please login again."
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Could not load resources."
            );

        }


        const resources =
            data.resources || [];


        resourceSelect.innerHTML = "";


        if (resources.length === 0) {

            resourceSelect.innerHTML = `
                <option value="">
                    -- No resources for this topic yet --
                </option>
            `;

            return;

        }


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value = "";


        placeholder.textContent =
            "-- Select a resource --";


        resourceSelect.appendChild(
            placeholder
        );


        resources.forEach(function (resource) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                resource.resource_id;


            option.textContent =
                resource.resource_title +
                (
                    resource.resource_type
                        ? ` (${resource.resource_type})`
                        : ""
                );


            resourceSelect.appendChild(
                option
            );

        });

    }

    catch (error) {

        console.error(
            "Load Resources Error:",
            error
        );

        resourceSelect.innerHTML = `
            <option value="">
                -- Could not load resources --
            </option>
        `;

    }

}


/* =========================
   SUBMIT RATING
========================= */

async function submitRating() {

    if (!getToken()) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;

    }


    const resourceId =
        document.getElementById(
            "resourceSelect"
        ).value;


    const rating =
        document.getElementById(
            "rating"
        ).value;


    const message =
        document.getElementById(
            "message"
        );


    if (!resourceId) {

        message.textContent =
            "Please select a resource.";

        return;

    }


    try {

        message.textContent =
            "Submitting rating...";


        const response =
            await fetch(
                `${API}/resources/${encodeURIComponent(resourceId)}/rating`,
                {

                    method: "POST",

                    headers: authHeaders(),

                    body: JSON.stringify({

                        rating:
                            Number(rating)

                    })

                }
            );


        const data =
            await response.json();


        if (response.status === 401 || response.status === 403) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            alert(
                "Please login again."
            );

            window.location.href =
                "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to submit rating."
            );

        }


        message.textContent =
            data.message ||
            "✓ Rating submitted successfully!";


        document.getElementById(
            "review"
        ).value = "";


        loadRatings();

    }

    catch (error) {

        console.error(
            "Rating Error:",
            error
        );


        message.textContent =
            error.message ||
            "Rating API is not connected yet.";

    }

}


/* =========================
   LOAD RATINGS
========================= */

async function loadRatings() {

    const resourceId =
        document.getElementById(
            "resourceSelect"
        ).value;


    const list =
        document.getElementById(
            "ratingList"
        );


    if (!resourceId) {

        list.innerHTML = `

            <p class="rating-error">
                Please select a resource first.
            </p>

        `;

        return;

    }


    try {

        list.innerHTML = `

            <p class="section-text">
                Loading ratings...
            </p>

        `;


        const response =
            await fetch(
                `${API}/resources/${encodeURIComponent(resourceId)}/rating`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Could not load ratings."
            );

        }


        list.innerHTML = "";


        if (!data.total_ratings) {

            list.innerHTML = `

                <div class="rating-empty">

                    <span>⭐</span>

                    <h3>
                        No ratings yet
                    </h3>

                    <p>
                        Be the first person to rate this resource!
                    </p>

                </div>

            `;

            return;

        }


        const averageRating =
            Number(data.average_rating) || 0;


        const stars =
            "⭐".repeat(
                Math.round(
                    Math.min(
                        Math.max(
                            averageRating,
                            0
                        ),
                        5
                    )
                )
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "rating-result-card";


        card.innerHTML = `

            <div class="rating-stars">

                ${stars}

            </div>


            <p class="rating-review">

                Average rating: ${averageRating.toFixed(1)} / 5
                (${data.total_ratings} rating${data.total_ratings === 1 ? "" : "s"})

            </p>

        `;


        list.appendChild(
            card
        );

    }

    catch (error) {

        console.error(
            "Load Rating Error:",
            error
        );


        list.innerHTML = `

            <p class="rating-error">

                Rating API is not connected yet.

            </p>

        `;

    }

}


/* =========================
   DASHBOARD
========================= */

function goDashboard() {

    window.location.href =
        "dashboard.html";

}




/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (!getToken()) {

            window.location.href =
                "login.html";

            return;

        }


        loadTopics();


        document
            .getElementById(
                "topicSelect"
            )
            .addEventListener(
                "change",
                function () {

                    loadResourcesForTopic(
                        this.value
                    );

                }
            );


        document
            .getElementById(
                "resourceSelect"
            )
            .addEventListener(
                "change",
                loadRatings
            );


        document
            .getElementById(
                "submitRatingBtn"
            )
            .addEventListener(
                "click",
                submitRating
            );


        document
            .getElementById(
                "loadRatingsBtn"
            )
            .addEventListener(
                "click",
                loadRatings
            );


        document
            .getElementById(
                "dashboardBtn"
            )
            .addEventListener(
                "click",
                goDashboard
            );


        setupMenu();

    }
);