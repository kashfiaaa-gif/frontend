document.addEventListener("DOMContentLoaded", function () {

    const roadmapForm = document.getElementById("roadmapForm");
    const roadmapTopic = document.getElementById("roadmapTopic");
    const roadmapLevel = document.getElementById("roadmapLevel");

    const roadmapMessage =
        document.getElementById("roadmapMessage");

    const roadmapResult =
        document.getElementById("roadmapResult");


    // Backend API URL
    const API_URL = "http://localhost:5000/api";


    // =========================
    // FORM SUBMIT
    // =========================

    if (roadmapForm) {

        roadmapForm.addEventListener("submit", async function (event) {

            event.preventDefault();


            const topic =
                roadmapTopic.value.trim();

            const level =
                roadmapLevel.value;


            // Check input
            if (!topic || !level) {

                roadmapMessage.textContent =
                    "Please enter a topic and select a level.";

                roadmapMessage.className = "error";

                return;
            }


            // Loading message
            roadmapMessage.textContent =
                "Generating roadmap...";

            roadmapMessage.className = "";


            roadmapResult.innerHTML = "";


            try {

                // Get login token
                const token =
                    localStorage.getItem("token");


                // Backend request
                const response = await fetch(
                    `${API_URL}/roadmap`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

                            ...(token
                                ? {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                                : {})
                        },

                        body: JSON.stringify({
                            topic: topic,
                            level: level
                        })
                    }
                );


                // Backend response
                const data =
                    await response.json();


                console.log(
                    "Roadmap response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        "Failed to generate roadmap."
                    );
                }


                // Success
                roadmapMessage.textContent =
                    "Roadmap generated successfully!";

                roadmapMessage.className =
                    "success";


                // Display roadmap
                displayRoadmap(data);


            } catch (error) {

                console.error(
                    "Roadmap error:",
                    error
                );


                roadmapMessage.textContent =
                    "Backend is not connected yet.";

                roadmapMessage.className =
                    "error";


                roadmapResult.innerHTML = "";
            }

        });

    }


    // =========================
    // DISPLAY ROADMAP
    // =========================

    function displayRoadmap(data) {

        /*
            Backend response different format
            holeo handle korar try korbe.
        */

        const roadmap =
            data.roadmap ||
            data.data ||
            data;


        if (!roadmap) {

            roadmapResult.innerHTML = "";

            return;
        }


        // If roadmap is an array
        if (Array.isArray(roadmap)) {

            roadmapResult.innerHTML = "";


            roadmap.forEach(function (step, index) {

                const card =
                    document.createElement("div");

                card.className =
                    "roadmap-result-card";


                card.innerHTML = `

                    <h3>
                        Step ${index + 1}
                    </h3>

                    <p>
                        ${escapeHTML(
                            typeof step === "string"
                                ? step
                                : step.title ||
                                  step.name ||
                                  JSON.stringify(step)
                        )}
                    </p>

                `;


                roadmapResult.appendChild(card);

            });


            return;
        }


        // If roadmap contains steps
        if (roadmap.steps &&
            Array.isArray(roadmap.steps)) {

            roadmapResult.innerHTML = "";


            roadmap.steps.forEach(function (step, index) {

                const card =
                    document.createElement("div");

                card.className =
                    "roadmap-result-card";


                card.innerHTML = `

                    <h3>
                        Step ${index + 1}
                    </h3>

                    <h2>
                        ${escapeHTML(
                            step.title ||
                            step.name ||
                            "Learning Step"
                        )}
                    </h2>

                    ${
                        step.description
                        ? `
                            <p>
                                ${escapeHTML(
                                    step.description
                                )}
                            </p>
                          `
                        : ""
                    }

                `;


                roadmapResult.appendChild(card);

            });


            return;
        }


        // If backend sends title + description
        roadmapResult.innerHTML = `

            <div class="roadmap-result-card">

                ${
                    roadmap.title
                    ? `
                        <h2>
                            ${escapeHTML(
                                roadmap.title
                            )}
                        </h2>
                      `
                    : ""
                }

                ${
                    roadmap.description
                    ? `
                        <p>
                            ${escapeHTML(
                                roadmap.description
                            )}
                        </p>
                      `
                    : ""
                }

            </div>

        `;

    }


    // =========================
    // SECURITY
    // =========================

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;

    }

});