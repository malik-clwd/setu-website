/* =========================================================
   GLOBAL STATE
========================================================= */

let currentLanguage = "EN";

let grievances = [];

const PROFILE_STORAGE_KEY = "startupsetu_profile";
const SETTINGS_STORAGE_KEY = "startupsetu_settings";

/* Default profile — used only the very first time the app runs,
   before the user has saved anything on the Profile page. */
let profileData = {
    founder: "Lucifer",
    startup: "",
    industry: "Technology"
};


/* =========================================================
   SECTION NAVIGATION
========================================================= */

function showSection(sectionId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    const selectedPage = document.getElementById(sectionId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.remove("active");

        if (item.dataset.section === sectionId) {
            item.classList.add("active");
        }

    });

    closeSearchResults();

    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* =========================================================
   MODAL DATA
========================================================= */

const modalData = {

    discover: {
        title: "Discover Opportunities",
        body: `
            <p>StartupSETU helps you discover government schemes, funding opportunities, recognition programs and startup support services.</p>
            <div class="modal-action">
                <button class="primary-btn" onclick="showSection('schemes'); closeModal();">Explore schemes →</button>
            </div>
        `
    },

    register: {
        title: "Register Your Startup",
        body: `
            <p>Startup registration assistance is available through the Startup Services section.</p>
            <div class="modal-action">
                <button class="primary-btn" onclick="showSection('services'); closeModal();">Open services →</button>
            </div>
        `
    },

    track: {
        title: "Track Application",
        body: `
            <p>You currently have active applications on StartupSETU.</p>
            <div class="modal-action">
                <button class="primary-btn" onclick="showSection('applications'); closeModal();">View applications →</button>
            </div>
        `
    },

    funding: {
        title: "Find Funding",
        body: `
            <p>Explore funding opportunities available through startup support schemes.</p>
            <div class="modal-action">
                <button class="primary-btn" onclick="showSection('schemes'); closeModal();">Find funding →</button>
            </div>
        `
    }

};


/* =========================================================
   OPEN / CLOSE MODAL
========================================================= */

function openModal(type) {

    const modal = document.getElementById("modal");
    const title = document.getElementById("modalTitle");
    const body = document.getElementById("modalBody");

    const data = modalData[type];

    if (!data || !modal || !title || !body) return;

    title.textContent = data.title;
    body.innerHTML = data.body;

    modal.classList.add("show");
}

function closeModal() {

    const modal = document.getElementById("modal");

    if (modal) {
        modal.classList.remove("show");
    }
}

function openCustomModal(title, body) {

    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modal = document.getElementById("modal");

    if (!modalTitle || !modalBody || !modal) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = body;

    modal.classList.add("show");
}


/* =========================================================
   MODAL BACKDROP + ESCAPE KEY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("modal");

    if (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                closeModal();
            }

        });

    }

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeModal();
        closeSearchResults();
    }

});


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function globalSearch() {

    const searchBox = document.getElementById("searchInput");

    if (!searchBox) return;

    const input = searchBox.value.toLowerCase().trim();

    const clearButton = document.getElementById("clearSearch");

    if (clearButton) {
        clearButton.style.display = input ? "block" : "none";
    }

    if (!input) {
        closeSearchResults();
        return;
    }

    const results = [];

    const sources = [
        { selector: ".opportunity", type: "Startup Scheme", section: "schemes" },
        { selector: ".scheme-card", type: "Opportunity", section: "dashboard" },
        { selector: ".service-card", type: "Service", section: "services" },
        { selector: ".ecosystem-card", type: "Ecosystem", section: "ecosystem" }
    ];

    sources.forEach(source => {

        document.querySelectorAll(source.selector).forEach(item => {

            const text = (item.dataset.search || item.innerText).toLowerCase();

            if (text.includes(input)) {

                const title = item.querySelector("h3")?.innerText || source.type;

                results.push({ title, type: source.type, section: source.section });
            }

        });

    });

    document.querySelectorAll("#applicationTable tr").forEach(item => {

        const text = item.innerText.toLowerCase();

        if (text.includes(input)) {

            results.push({
                title: item.children[1]?.innerText || "Application",
                type: "Application",
                section: "applications"
            });

        }

    });

    document.querySelectorAll(".notification-card").forEach(item => {

        const text = item.innerText.toLowerCase();

        if (text.includes(input)) {

            results.push({
                title: item.querySelector("strong")?.innerText || "Notification",
                type: "Notification",
                section: "notifications"
            });

        }

    });

    displaySearchResults(results, input);
}


/* =========================================================
   DISPLAY SEARCH RESULTS
========================================================= */

function displaySearchResults(results, input) {

    const container = document.getElementById("globalSearchResults");
    const list = document.getElementById("searchResultList");
    const title = document.getElementById("searchResultTitle");

    if (!container || !list || !title) return;

    title.textContent = `${results.length} result${results.length !== 1 ? "s" : ""} for "${input}"`;

    list.innerHTML = "";

    if (results.length === 0) {

        list.innerHTML = `
            <div class="search-result">
                <strong>No results found</strong>
                <small>Try searching another scheme, service, application or notification.</small>
            </div>
        `;

        container.classList.add("show");

        return;
    }

    const uniqueResults = [];
    const seen = new Set();

    results.forEach(result => {

        const key = result.title + result.type;

        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(result);
        }

    });

    uniqueResults.forEach(result => {

        const item = document.createElement("div");

        item.className = "search-result";

        item.innerHTML = `
            <strong>${escapeHtml(result.title)}</strong>
            <small>${escapeHtml(result.type)}</small>
        `;

        item.onclick = function () {
            showSection(result.section);
            clearSearch();
        };

        list.appendChild(item);

    });

    container.classList.add("show");
}


/* =========================================================
   SEARCH HELPERS
========================================================= */

function closeSearchResults() {

    const results = document.getElementById("globalSearchResults");

    if (results) {
        results.classList.remove("show");
    }

}

function clearSearch() {

    const input = document.getElementById("searchInput");
    const clearButton = document.getElementById("clearSearch");

    if (input) {
        input.value = "";
    }

    if (clearButton) {
        clearButton.style.display = "none";
    }

    closeSearchResults();
}

document.addEventListener("click", function (event) {

    const search = document.querySelector(".search-box");
    const results = document.getElementById("globalSearchResults");

    if (results && search && !search.contains(event.target) && !results.contains(event.target)) {
        closeSearchResults();
    }

});


/* =========================================================
   SCHEME FILTER
========================================================= */

function filterSchemes() {

    const category = document.getElementById("categoryFilter").value;
    const stage = document.getElementById("stageFilter").value;

    const schemes = document.querySelectorAll(".opportunity");

    let visibleCount = 0;

    schemes.forEach(scheme => {

        const schemeCategory = scheme.dataset.category;
        const schemeStage = scheme.dataset.stage;

        const categoryMatch = category === "All Categories" || schemeCategory === category;

        const stageMatch =
            stage === "All Startup Stages" ||
            schemeStage === stage ||
            schemeStage === "All";

        if (categoryMatch && stageMatch) {
            scheme.style.display = "block";
            visibleCount++;
        } else {
            scheme.style.display = "none";
        }

    });

    const emptyState = document.getElementById("schemesEmptyState");

    if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
    }

    showToast(
        visibleCount === 0
            ? "No schemes match your selected filters."
            : `${visibleCount} scheme(s) found.`
    );

}

function resetFilters() {

    document.getElementById("categoryFilter").value = "All Categories";
    document.getElementById("stageFilter").value = "All Startup Stages";

    document.querySelectorAll(".opportunity").forEach(item => {
        item.style.display = "block";
    });

    const emptyState = document.getElementById("schemesEmptyState");

    if (emptyState) {
        emptyState.hidden = true;
    }

    showToast("Filters reset.");
}


/* =========================================================
   SCHEME DETAILS
========================================================= */

const schemeInfo = {

    "Startup India Seed Fund":
        "Funding support for proof of concept, prototype development and market entry.",

    "DPIIT Startup Recognition":
        "Recognition can help eligible startups access ecosystem benefits.",

    "Credit Guarantee Scheme":
        "Designed to improve access to institutional credit for eligible startups.",

    "Startup Incubation Support":
        "Support through incubation, mentoring and startup ecosystem programs.",

    "Startup Tax Benefits":
        "Explore potentially applicable tax-related startup benefits."

};

function viewScheme(name) {

    openCustomModal(
        name,
        `
            <p>${escapeHtml(schemeInfo[name] || "Scheme information available.")}</p>
            <div class="modal-action">
                <button class="primary-btn" onclick="applyForScheme('${escapeHtml(name)}')">Start application</button>
            </div>
        `
    );

}

function applyForScheme(name) {

    closeModal();

    showToast(`Application started for ${name}`);

    showSection("applications");
}


/* =========================================================
   SERVICES / ECOSYSTEM
========================================================= */

const serviceDescriptions = {

    "Startup Registration":
        "Get guidance on startup registration and required documentation.",

    "Funding Discovery":
        "Explore funding options based on your startup stage and requirements.",

    "Document Assistance":
        "Organize and verify important startup documents.",

    "Mentorship":
        "Connect with mentors and ecosystem support.",

    "Government":
        "Explore government departments and startup support programs.",

    "Incubators":
        "Find incubation and acceleration opportunities.",

    "Investors":
        "Explore potential investment ecosystem connections.",

    "Mentors":
        "Connect with experienced startup mentors."

};

function openService(serviceName) {

    openCustomModal(

        serviceName,

        `
            <p>${escapeHtml(serviceDescriptions[serviceName] || "StartupSETU service information.")}</p>
            <div class="modal-action">
                <button class="primary-btn" onclick="showToast('Service request created'); closeModal();">Continue →</button>
            </div>
        `

    );

}


/* =========================================================
   APPLICATIONS
========================================================= */

function searchApplications() {

    const input = document.getElementById("applicationSearch").value.toLowerCase().trim();

    const rows = document.querySelectorAll("#applicationTable tr");

    let visibleCount = 0;

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();
        const isMatch = text.includes(input);

        row.style.display = isMatch ? "" : "none";

        if (isMatch) visibleCount++;

    });

    const emptyState = document.getElementById("applicationsEmptyState");

    if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
    }

}

function resetApplicationSearch() {

    document.getElementById("applicationSearch").value = "";

    searchApplications();
}

function trackApplication(id) {

    openCustomModal(

        "Application Tracking",

        `
            <p><strong>Application ID:</strong> ${escapeHtml(id)}</p>
            <br>
            <p>Application received ✓</p>
            <p>Documents verified ✓</p>
            <p>Department review →</p>
            <p>Final decision pending</p>
        `

    );

}


/* =========================================================
   GRIEVANCE
========================================================= */

function submitGrievance(event) {

    event.preventDefault();

    const subject = document.getElementById("grievanceSubject").value.trim();
    const applicationId = document.getElementById("applicationId").value.trim();
    const description = document.getElementById("grievanceDescription").value.trim();

    if (!subject || !description) {
        showToast("Please fill all required fields.");
        return;
    }

    const grievanceId = "GRV-" + Date.now().toString().slice(-6);

    grievances.push({
        id: grievanceId,
        subject: subject,
        applicationId: applicationId || "Not provided",
        description: description,
        date: new Date().toLocaleDateString()
    });

    document.getElementById("grievanceForm").reset();

    renderGrievances();

    showToast(`Grievance submitted: ${grievanceId}`);

}

function renderGrievances() {

    const history = document.getElementById("grievanceHistory");
    const list = document.getElementById("grievanceList");

    if (!history || !list) return;

    if (!grievances.length) {
        history.style.display = "none";
        return;
    }

    history.style.display = "block";

    list.innerHTML = "";

    grievances.forEach(item => {

        const div = document.createElement("div");

        div.className = "grievance-item";

        div.innerHTML = `
            <strong>${escapeHtml(item.id)} — ${escapeHtml(item.subject)}</strong>
            <p>Application: ${escapeHtml(item.applicationId)}</p>
            <p>${escapeHtml(item.description)}</p>
            <small>Submitted: ${escapeHtml(item.date)}</small>
        `;

        list.appendChild(div);

    });

}


/* =========================================================
   PROFILE — single source of truth for the topbar greeting
   ("Hi, <name>") and avatar shown throughout the app.
========================================================= */

function loadProfile() {

    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (saved) {

        try {
            profileData = { ...profileData, ...JSON.parse(saved) };
        } catch (error) {
            console.log("Could not load saved profile.");
        }

    }

    applyProfileToUI();
}

function applyProfileToUI() {

    const founderField = document.getElementById("founderName");
    const startupField = document.getElementById("startupName");
    const industryField = document.getElementById("industry");

    if (founderField) founderField.value = profileData.founder || "";
    if (startupField) startupField.value = profileData.startup || "";
    if (industryField && profileData.industry) industryField.value = profileData.industry;

    const topUserName = document.getElementById("topUserName");
    const topAvatar = document.getElementById("topAvatar");

    const displayName = profileData.founder && profileData.founder.trim()
        ? profileData.founder.trim()
        : "there";

    if (topUserName) {
        topUserName.textContent = `Hi, ${displayName}`;
    }

    if (topAvatar) {
        topAvatar.textContent = getInitials(displayName);
    }

}

function saveProfile() {

    const founder = document.getElementById("founderName").value.trim();
    const startup = document.getElementById("startupName").value.trim();
    const industry = document.getElementById("industry").value;

    if (!founder) {
        showToast("Please enter your founder name.");
        return;
    }

    profileData = { founder, startup, industry };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));

    applyProfileToUI();

    showToast("Profile saved successfully!");

}

function getInitials(name) {

    if (!name) return "U";

    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join("");

}


/* =========================================================
   SETTINGS
========================================================= */

function saveSettings() {

    const email = document.getElementById("emailNotifications").checked;
    const schemes = document.getElementById("schemeRecommendations").checked;
    const sms = document.getElementById("smsNotifications").checked;

    localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ email, schemes, sms })
    );

    showToast("Settings saved successfully!");

}

function loadSettings() {

    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!saved) return;

    try {

        const settings = JSON.parse(saved);

        const emailField = document.getElementById("emailNotifications");
        const schemesField = document.getElementById("schemeRecommendations");
        const smsField = document.getElementById("smsNotifications");

        if (emailField) emailField.checked = settings.email;
        if (schemesField) schemesField.checked = settings.schemes;
        if (smsField) smsField.checked = settings.sms;

    } catch (error) {
        console.log("Could not load settings.");
    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function markNotificationRead(button) {

    const card = button.closest(".notification-card");

    if (!card) return;

    card.classList.remove("unread");

    button.style.display = "none";

    updateNotificationCount();

    showToast("Notification marked as read.");

}

function markAllNotificationsRead() {

    document.querySelectorAll(".notification-card").forEach(card => {

        card.classList.remove("unread");

        const button = card.querySelector("button");

        if (button) {
            button.style.display = "none";
        }

    });

    updateNotificationCount();

    showToast("All notifications marked as read.");

}

function updateNotificationCount() {

    const count = document.querySelectorAll(".notification-card.unread").length;

    const top = document.getElementById("topNotificationCount");
    const nav = document.getElementById("navNotificationCount");

    [top, nav].forEach(badge => {

        if (!badge) return;

        badge.textContent = count;
        badge.style.display = count > 0 ? "flex" : "none";

    });

}


/* =========================================================
   LANGUAGE
========================================================= */

function toggleLanguage() {

    const text = document.getElementById("languageText");

    if (!text) return;

    if (currentLanguage === "EN") {
        currentLanguage = "HI";
        text.textContent = "HI";
        showToast("Hindi mode selected.");
    } else {
        currentLanguage = "EN";
        text.textContent = "EN";
        showToast("English mode selected.");
    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

    const toast = document.getElementById("toast");
    const messageBox = document.getElementById("toastMessage");

    if (!toast || !messageBox) return;

    messageBox.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 3000);

}


/* =========================================================
   SMALL UTILS
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    showSection("dashboard");

    loadProfile();
    loadSettings();

    updateNotificationCount();
    renderGrievances();

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", globalSearch);
    }

});