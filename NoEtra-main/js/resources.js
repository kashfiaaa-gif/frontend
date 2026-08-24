const API =
    "http://localhost/studyhub/backend/api";

const user =
    JSON.parse(localStorage.getItem("user"));


/* =========================
   LOAD RESOURCES
========================= */

async function loadResources() {

    try {

        const response =
            await fetch(
                `${API}/resources.php`
            );

        const resources =
            await response.json();

        displayResources(resources);

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "resourceList"
        ).textContent =
            "Resources API is not connected yet.";

    }

}


/* =========================
   DISPLAY RESOURCES
========================= */

function displayResources(resources) {

    const list =
        document.getElementById(
            "resourceList"
        );

    list.innerHTML = "";


    if (!resources || resources.length === 0) {

        list.textContent =
            "No resources found.";

        return;

    }


    resources.forEach(function(resource) {

        const div =
            document.createElement("div");

        div.classList.add("resource-card");


        const title =
            resource.resource_title ||
            resource.title ||
            "Untitled Resource";


        const topic =
            resource.topic || "";


        const type =
            resource.resource_type || "";


        const url =
            resource.url ||
            resource.resource_url ||
            "#";


        div.innerHTML = `

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                Topic:
                ${escapeHTML(topic)}
            </p>

            <p>
                Type:
                ${escapeHTML(type)}
            </p>

            <a
                href="${escapeHTML(url)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open Resource
            </a>

            <br><br>

            <button
                onclick="bookmarkResource(${resource.resource_id})"
            >
                Bookmark
            </button>

            <hr>

        `;


        list.appendChild(div);

    });

}


/* =========================
   SEARCH RESOURCES
========================= */

async function searchResources() {

    const search =
        document.getElementById(
            "searchInput"
        ).value.trim();


    if (!search) {

        loadResources();

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/resources.php?search=${encodeURIComponent(search)}`
            );


        const resources =
            await response.json();


        displayResources(resources);

    }

    catch (error) {

        console.error(error);

        document.getElementById(
            "resourceList"
        ).textContent =
            "Search failed.";

    }

}


/* =========================
   ADD RESOURCE
========================= */

const resourceForm =
    document.getElementById(
        "resourceForm"
    );


if (resourceForm) {

    resourceForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!user) {

                alert(
                    "Please login first."
                );

                return;

            }


            const resourceTitle =
                document.getElementById(
                    "resourceTitle"
                ).value.trim();


            const topic =
                document.getElementById(
                    "topic"
                ).value.trim();


            const resourceType =
                document.getElementById(
                    "resourceType"
                ).value;


            const resourceUrl =
                document.getElementById(
                    "resourceUrl"
                ).value.trim();


            try {

                const response =
                    await fetch(
                        `${API}/resources.php`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                user_id:
                                    user.user_id,

                                resource_title:
                                    resourceTitle,

                                topic:
                                    topic,

                                resource_type:
                                    resourceType,

                                resource_url:
                                    resourceUrl

                            })

                        }
                    );


                const data =
                    await response.json();


                document.getElementById(
                    "message"
                ).textContent =
                    data.message ||
                    "Resource added successfully.";


                resourceForm.reset();


                loadResources();

            }

            catch (error) {

                console.error(error);

                document.getElementById(
                    "message"
                ).textContent =
                    "Resources API is not connected yet.";

            }

        }
    );

}


/* =========================
   BOOKMARK RESOURCE
========================= */

async function bookmarkResource(resourceId) {

    if (!user) {

        alert(
            "Please login first."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/bookmarks.php`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            user.user_id,

                        resource_id:
                            resourceId

                    })

                }
            );


        const data =
            await response.json();


        alert(
            data.message ||
            "Resource bookmarked."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Bookmark API is not connected yet."
        );

    }

}


/* =========================
   BACK TO DASHBOARD
========================= */

function goDashboard() {

    window.location.href =
        "dashboard.html";

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =========================
   INITIAL LOAD
========================= */

loadResources