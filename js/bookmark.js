document.addEventListener("DOMContentLoaded", function () {

    const bookmarkList = document.getElementById("bookmarkList");

    const API_URL = "http://localhost:5000/api";

    const token = localStorage.getItem("token");


    /* =====================================================
       CHECK BOOKMARK CONTAINER
    ===================================================== */

    if (!bookmarkList) {
        console.error("bookmarkList element not found.");
        return;
    }


    /* =====================================================
       CHECK LOGIN
    ===================================================== */

    if (!token) {

        bookmarkList.innerHTML = `

            <div class="bookmark-empty">

                <span>🔖</span>

                <h2>Please Login First</h2>

                <p>
                    You need to login to see your bookmarks.
                </p>

                <a
                    href="login.html"
                    class="view-resource-btn">
                    Go to Login
                </a>

            </div>

        `;

        return;
    }


    /* =====================================================
       LOAD BOOKMARKS
    ===================================================== */

    loadBookmarks();


    async function loadBookmarks() {

        bookmarkList.innerHTML = `

            <div class="bookmark-empty">

                <span>🔖</span>

                <h2>Loading Bookmarks...</h2>

                <p>
                    Please wait while we load your saved resources.
                </p>

            </div>

        `;


        try {

            const response = await fetch(
                `${API_URL}/bookmarks`,
                {
                    method: "GET",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            console.log(
                "Bookmark response status:",
                response.status
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Backend error:",
                    errorText
                );

                throw new Error(
                    `Unable to load bookmarks (${response.status})`
                );
            }


            const data =
                await response.json();


            console.log(
                "Bookmark data:",
                data
            );


            /*
                Backend may return:

                [
                    {...},
                    {...}
                ]

                OR

                {
                    bookmarks: [...]
                }
            */

            const bookmarks =
                Array.isArray(data)
                    ? data
                    : data.bookmarks || [];


            displayBookmarks(bookmarks);


        } catch (error) {

            console.error(
                "Bookmark loading error:",
                error
            );


            bookmarkList.innerHTML = `

                <div class="bookmark-error">

                    <h2>
                        Unable to Load Bookmarks
                    </h2>

                    <p>
                        Backend is not connected yet.
                    </p>

                    <button
                        type="button"
                        onclick="location.reload()">
                        Try Again
                    </button>

                </div>

            `;

        }

    }


    /* =====================================================
       DISPLAY BOOKMARKS
    ===================================================== */

    function displayBookmarks(bookmarks) {


        /* No bookmarks */

        if (
            !Array.isArray(bookmarks) ||
            bookmarks.length === 0
        ) {

            bookmarkList.innerHTML = `

                <div class="bookmark-empty">

                    <span>🔖</span>

                    <h2>
                        No Bookmarks Yet
                    </h2>

                    <p>
                        You haven't bookmarked any
                        resources yet.
                    </p>

                    <br>

                    <a
                        href="resources.html"
                        class="view-resource-btn">
                        Explore Resources
                    </a>

                </div>

            `;

            return;
        }


        /* Clear old content */

        bookmarkList.innerHTML = "";


        /* Create cards */

        bookmarks.forEach(function (bookmark) {


            const card =
                document.createElement("article");


            card.className =
                "bookmark-card";


            /* =========================
               BACKEND DATA
            ========================= */

            const bookmarkId =
                bookmark.bookmark_id ||
                bookmark.id;


            const title =
                bookmark.resource_title ||
                bookmark.title ||
                "Untitled Resource";


            const type =
                bookmark.resource_type ||
                bookmark.type ||
                "Resource";


            const link =
                bookmark.resource_link ||
                bookmark.resource_url ||
                bookmark.url ||
                "#";


            const description =
                bookmark.description ||
                "Saved learning resource.";


            const level =
                bookmark.level ||
                bookmark.difficulty ||
                "Learning Resource";


            /* =========================
               CARD HTML
            ========================= */

            card.innerHTML = `

                <div class="bookmark-card-top">

                    <span class="bookmark-type">
                        ${escapeHTML(type)}
                    </span>


                    <button
                        type="button"
                        class="remove-bookmark-btn"
                        title="Remove Bookmark">

                        ★

                    </button>

                </div>


                <h2>
                    ${escapeHTML(title)}
                </h2>


                <p>
                    ${escapeHTML(description)}
                </p>


                <div class="bookmark-card-bottom">

                    <span class="bookmark-level">
                        ${escapeHTML(level)}
                    </span>


                    <a
                        href="${escapeAttribute(link)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="view-resource-btn">

                        View Resource

                    </a>

                </div>

            `;


            /* =========================
               REMOVE BUTTON
            ========================= */

            const removeButton =
                card.querySelector(
                    ".remove-bookmark-btn"
                );


            removeButton.addEventListener(
                "click",
                function () {

                    removeBookmark(bookmarkId);

                }
            );


            bookmarkList.appendChild(card);

        });

    }


    /* =====================================================
       REMOVE BOOKMARK
    ===================================================== */

    async function removeBookmark(bookmarkId) {


        if (!bookmarkId) {

            alert(
                "Bookmark ID not found."
            );

            return;
        }


        const confirmRemove =
            confirm(
                "Are you sure you want to remove this bookmark?"
            );


        if (!confirmRemove) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/bookmarks/${bookmarkId}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to remove bookmark."
                );

            }


            alert(
                "Bookmark removed successfully!"
            );


            /* Reload bookmarks */

            loadBookmarks();


        } catch (error) {

            console.error(
                "Remove bookmark error:",
                error
            );


            alert(
                error.message
            );

        }

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        const div =
            document.createElement("div");


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }


    /* =====================================================
       ESCAPE URL ATTRIBUTE
    ===================================================== */

    function escapeAttribute(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }

});