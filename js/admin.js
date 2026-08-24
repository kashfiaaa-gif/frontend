console.log("NoEtra Admin JS Loaded");

/* =========================================================
   SHOW ONLY THE RELEVANT SECTION WHEN ARRIVING VIA HASH
   e.g. admin.html#section-users only shows the users card
========================================================= */

(function () {

    const hash = window.location.hash.replace("#", "");

    if (!hash) {
        return; // no hash — show the full panel (all sections)
    }

    const allSections = document.querySelectorAll(
        "#section-resources, #section-users, #section-community, #section-create"
    );

    allSections.forEach(function (section) {
        section.style.display = section.id === hash ? "block" : "none";
    });

    // auto-load the relevant data so the admin doesn't have to click "View" again
    if (hash === "section-resources") {
        document.getElementById("loadResourcesBtn")?.click();
    } else if (hash === "section-users") {
        document.getElementById("loadUsersBtn")?.click();
    } else if (hash === "section-community") {
        document.getElementById("loadDiscussionsBtn")?.click();
    }

})();

/* =========================================================
   GUARD — extra safety even though script.js already
   redirects non-admins away from admin.html
========================================================= */

(function () {

    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }

    const user = getUser();

    if (!user || user.role !== "admin") {
        window.location.href = "dashboard.html";
    }

})();


/* =========================================================
   MANAGE RESOURCES
========================================================= */

const loadResourcesBtn = document.getElementById("loadResourcesBtn");
const resourceList = document.getElementById("resourceList");

if (loadResourcesBtn) {

    loadResourcesBtn.addEventListener("click", loadAllResources);

}

async function loadAllResources() {

    if (!resourceList) {
        return;
    }

    resourceList.innerHTML = "<p>Loading resources...</p>";

    try {

        const response = await fetch(`${API}/resources`, {
            method: "GET",
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        const resources = await response.json();

        if (!response.ok) {
            resourceList.innerHTML = `<p>${escapeHTML(resources.error || "Could not load resources.")}</p>`;
            return;
        }

        if (!resources.length) {
            resourceList.innerHTML = "<p>No resources have been added yet.</p>";
            return;
        }

        resourceList.innerHTML = resources.map(function (resource) {

            return `
                <div class="admin-list-item">
                    <h4>${escapeHTML(resource.resource_title)}</h4>
                    <p><strong>Topic:</strong> ${escapeHTML(resource.topic_name)}</p>
                    <p><strong>Type:</strong> ${escapeHTML(resource.resource_type)}</p>
                    <p><a href="${escapeHTML(resource.resource_link)}" target="_blank">${escapeHTML(resource.resource_link)}</a></p>
                    <button onclick="editResource(${resource.resource_id}, '${escapeHTML(resource.resource_type)}', '${escapeHTML(resource.resource_title)}', '${escapeHTML(resource.resource_link)}')">Edit</button>
                    <button onclick="deleteResourceAdmin(${resource.resource_id})">Delete</button>
                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);
        resourceList.innerHTML = "<p>Could not connect to backend.</p>";

    }

}

async function editResource(resourceId, currentType, currentTitle, currentLink) {

    const newTitle = prompt("Resource title:", currentTitle);
    if (newTitle === null) return;

    const newType = prompt("Resource type (YouTube, Google, PDF Book, Lecture Notes, Documentation, GitHub Repo, Article, Practice Website):", currentType);
    if (newType === null) return;

    const newLink = prompt("Resource link:", currentLink);
    if (newLink === null) return;

    try {

        const response = await fetch(`${API}/resources/${resourceId}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
                resource_type: newType,
                resource_title: newTitle,
                resource_link: newLink
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Could not update resource.");
            return;
        }

        loadAllResources();

    } catch (error) {

        console.error(error);
        alert("Could not connect to backend.");

    }

}

async function deleteResourceAdmin(resourceId) {

    if (!confirm("Delete this resource? This cannot be undone.")) {
        return;
    }

    try {

        const response = await fetch(`${API}/resources/${resourceId}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Could not delete resource.");
            return;
        }

        loadAllResources();

    } catch (error) {

        console.error(error);
        alert("Could not connect to backend.");

    }

}


/* =========================================================
   MANAGE USERS (read-only)
========================================================= */

const loadUsersBtn = document.getElementById("loadUsersBtn");
const userList = document.getElementById("userList");

if (loadUsersBtn) {

    loadUsersBtn.addEventListener("click", loadAllUsers);

}

async function loadAllUsers() {

    if (!userList) {
        return;
    }

    userList.innerHTML = "<p>Loading users...</p>";

    try {

        const response = await fetch(`${API}/users`, {
            method: "GET",
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        const users = await response.json();

        if (!response.ok) {
            userList.innerHTML = `<p>${escapeHTML(users.error || "Could not load users.")}</p>`;
            return;
        }

        if (!users.length) {
            userList.innerHTML = "<p>No users registered yet.</p>";
            return;
        }

        userList.innerHTML = users.map(function (user) {

            return `
                <div class="admin-list-item">
                    <h4>${escapeHTML(user.full_name)} (${escapeHTML(user.role)})</h4>
                    <p><strong>Username:</strong> ${escapeHTML(user.username)}</p>
                    <p><strong>Email:</strong> ${escapeHTML(user.email)}</p>
                    <p><strong>Joined:</strong> ${formatDate(user.created_at)}</p>
                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);
        userList.innerHTML = "<p>Could not connect to backend.</p>";

    }

}


/* =========================================================
   MANAGE COMMUNITY DISCUSSIONS
========================================================= */

const loadDiscussionsBtn = document.getElementById("loadDiscussionsBtn");
const discussionList = document.getElementById("adminDiscussionList");

if (loadDiscussionsBtn) {

    loadDiscussionsBtn.addEventListener("click", loadAllDiscussions);

}

async function loadAllDiscussions() {

    if (!discussionList) {
        return;
    }

    discussionList.innerHTML = "<p>Loading discussions...</p>";

    try {

        const response = await fetch(`${API}/discussions`, {
            method: "GET",
            headers: authHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        const discussions = await response.json();

        if (!response.ok) {
            discussionList.innerHTML = `<p>${escapeHTML(discussions.error || "Could not load discussions.")}</p>`;
            return;
        }

        if (!discussions.length) {
            discussionList.innerHTML = "<p>No discussions posted yet.</p>";
            return;
        }

        discussionList.innerHTML = discussions.map(function (post) {

            return `
                <div class="admin-list-item">
                    <p><strong>Topic:</strong> ${escapeHTML(post.topic_name)}</p>
                    <p><strong>${escapeHTML(post.username)}:</strong> ${escapeHTML(post.message)}</p>
                    <p><small>${formatDate(post.created_at)}</small></p>
                    <button onclick="deleteDiscussionAdmin(${post.post_id})">Delete</button>
                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(error);
        discussionList.innerHTML = "<p>Could not connect to backend.</p>";

    }

}

async function deleteDiscussionAdmin(postId) {

    if (!confirm("Delete this discussion post?")) {
        return;
    }

    try {

        const response = await fetch(`${API}/discussions/${postId}`, {
            method: "DELETE",
            headers: authHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Could not delete post.");
            return;
        }

        loadAllDiscussions();

    } catch (error) {

        console.error(error);
        alert("Could not connect to backend.");

    }

}

/* =========================================================
   CREATE TOPIC / ROADMAP
========================================================= */

const createTopicBtn = document.getElementById("createTopicBtn");

if (createTopicBtn) {

    createTopicBtn.addEventListener("click", async function () {

        const topic_name = document.getElementById("newTopicName").value.trim();
        const roadmap = document.getElementById("newTopicRoadmap").value.trim();
        const ai_notes = document.getElementById("newTopicNotes").value.trim();
        const difficulty = document.getElementById("newTopicDifficulty").value;

        const message = document.getElementById("createTopicMessage");

        if (!topic_name || !roadmap) {
            message.textContent = "Topic name and roadmap are required.";
            return;
        }

        try {

            const response = await fetch(`${API}/results`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ topic_name, roadmap, ai_notes, difficulty })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.error || "Could not create topic.";
                return;
            }

            message.textContent = "Topic created successfully!";
            document.getElementById("newTopicName").value = "";
            document.getElementById("newTopicRoadmap").value = "";
            document.getElementById("newTopicNotes").value = "";

            loadTopicOptions();

        } catch (error) {

            console.error(error);
            message.textContent = "Could not connect to backend.";

        }

    });

}


/* =========================================================
   LOAD TOPICS INTO THE RESOURCE DROPDOWN
========================================================= */

async function loadTopicOptions() {

    const select = document.getElementById("resourceTopicSelect");

    if (!select) {
        return;
    }

    try {

        const response = await fetch(`${API}/results`);
        const topics = await response.json();

        if (!response.ok || !topics.length) {
            select.innerHTML = `<option value="">No topics yet — create one first</option>`;
            return;
        }

        select.innerHTML = topics.map(function (topic) {
            return `<option value="${topic.result_id}">${escapeHTML(topic.topic_name)}</option>`;
        }).join("");

    } catch (error) {

        console.error(error);
        select.innerHTML = `<option value="">Could not load topics</option>`;

    }

}

loadTopicOptions();


/* =========================================================
   ADD RESOURCE TO A TOPIC
========================================================= */

const addResourceBtn = document.getElementById("addResourceBtn");

if (addResourceBtn) {

    addResourceBtn.addEventListener("click", async function () {

        const resultId = document.getElementById("resourceTopicSelect").value;
        const resource_type = document.getElementById("newResourceType").value;
        const resource_title = document.getElementById("newResourceTitle").value.trim();
        const resource_link = document.getElementById("newResourceLink").value.trim();

        const message = document.getElementById("addResourceMessage");

        if (!resultId) {
            message.textContent = "Please select a topic first.";
            return;
        }

        if (!resource_title || !resource_link) {
            message.textContent = "Title and link are required.";
            return;
        }

        try {

            const response = await fetch(`${API}/results/${resultId}/resources`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ resource_type, resource_title, resource_link })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.error || "Could not add resource.";
                return;
            }

            message.textContent = "Resource added successfully!";
            document.getElementById("newResourceTitle").value = "";
            document.getElementById("newResourceLink").value = "";

        } catch (error) {

            console.error(error);
            message.textContent = "Could not connect to backend.";

        }

    });

}


/* =========================================================
   CREATE QUIZ
========================================================= */

const createQuizBtn = document.getElementById("createQuizBtn");

if (createQuizBtn) {

    createQuizBtn.addEventListener("click", async function () {

        const topic_name = document.getElementById("newQuizTopic").value.trim();
        const quiz_title = document.getElementById("newQuizTitle").value.trim();
        const description = document.getElementById("newQuizDescription").value.trim();

        const message = document.getElementById("createQuizMessage");

        if (!topic_name || !quiz_title) {
            message.textContent = "Topic name and quiz title are required.";
            return;
        }

        try {

            const response = await fetch(`${API}/quizzes`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ topic_name, quiz_title, description })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.error || "Could not create quiz.";
                return;
            }

            message.textContent = "Quiz created successfully!";
            document.getElementById("newQuizTopic").value = "";
            document.getElementById("newQuizTitle").value = "";
            document.getElementById("newQuizDescription").value = "";

            loadQuizOptions();

        } catch (error) {

            console.error(error);
            message.textContent = "Could not connect to backend.";

        }

    });

}


/* =========================================================
   LOAD QUIZZES INTO THE QUESTION DROPDOWN
========================================================= */

async function loadQuizOptions() {

    const select = document.getElementById("questionQuizSelect");

    if (!select) {
        return;
    }

    try {

        const response = await fetch(`${API}/quizzes`);
        const quizzes = await response.json();

        if (!response.ok || !quizzes.length) {
            select.innerHTML = `<option value="">No quizzes yet — create one first</option>`;
            return;
        }

        select.innerHTML = quizzes.map(function (quiz) {
            return `<option value="${quiz.quiz_id}">${escapeHTML(quiz.quiz_title)}</option>`;
        }).join("");

    } catch (error) {

        console.error(error);
        select.innerHTML = `<option value="">Could not load quizzes</option>`;

    }

}

loadQuizOptions();


/* =========================================================
   ADD QUESTION TO A QUIZ
========================================================= */

const addQuestionBtn = document.getElementById("addQuestionBtn");

if (addQuestionBtn) {

    addQuestionBtn.addEventListener("click", async function () {

        const quizId = document.getElementById("questionQuizSelect").value;
        const question_text = document.getElementById("newQuestionText").value.trim();
        const option_a = document.getElementById("optionA").value.trim();
        const option_b = document.getElementById("optionB").value.trim();
        const option_c = document.getElementById("optionC").value.trim();
        const option_d = document.getElementById("optionD").value.trim();
        const correct_option = document.getElementById("correctOption").value;

        const message = document.getElementById("addQuestionMessage");

        if (!quizId) {
            message.textContent = "Please select a quiz first.";
            return;
        }

        if (!question_text || !option_a || !option_b || !option_c || !option_d) {
            message.textContent = "Question text and all four options are required.";
            return;
        }

        try {

            const response = await fetch(`${API}/quizzes/${quizId}/questions`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    question_text,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_option
                })
            });

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.error || "Could not add question.";
                return;
            }

            message.textContent = "Question added successfully!";
            document.getElementById("newQuestionText").value = "";
            document.getElementById("optionA").value = "";
            document.getElementById("optionB").value = "";
            document.getElementById("optionC").value = "";
            document.getElementById("optionD").value = "";

        } catch (error) {

            console.error(error);
            message.textContent = "Could not connect to backend.";

        }

    });

}

/* =========================================================
   BACK TO DASHBOARD
========================================================= */

const dashboardBtn = document.getElementById("dashboardBtn");

if (dashboardBtn) {

    dashboardBtn.addEventListener("click", function () {
        window.location.href = "dashboard.html";
    });

}


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO INLINE HTML ATTRIBUTES
========================================================= */

window.editResource = editResource;
window.deleteResourceAdmin = deleteResourceAdmin;
window.deleteDiscussionAdmin = deleteDiscussionAdmin;