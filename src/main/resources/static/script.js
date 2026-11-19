
const API_URL = "/api/applications";

let applications = [];
let applicationChart = null;

// ===== DOM Elements =====
const tableBody = document.getElementById("applicationsTable");
const jobModal = document.getElementById("jobModal");
const jobForm = document.getElementById("jobForm");

// ===== Load Applications =====
async function loadApplications() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        applications = await response.json();

        displayApplications(applications);
        updateDashboardStats();
        updateApplicationChart();
        updateRecentApplications();

    } catch (error) {
        console.error("Error:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">Unable to load applications.</td>
            </tr>
        `;
    }
}

// ===== Display Applications =====
function displayApplications(data) {

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No applications found.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(job => `
        <tr>
            <td>
                <strong>${escapeHTML(job.companyName)}</strong>
            </td>

            <td>${escapeHTML(job.jobRole)}</td>

            <td>${escapeHTML(job.location || "-")}</td>

            <td>${escapeHTML(job.applicationDate || "-")}</td>

            <td>
                <span class="status-badge status-${escapeHTML(job.status)}">
                    ${formatStatus(job.status)}
                </span>
            </td>

            <td class="action-cell">

                <button
                    class="action-btn edit-btn"
                    data-action="edit"
                    data-id="${job.id}"
                    title="Edit Application"
                    aria-label="Edit application"
                >
                    <i data-lucide="pencil"></i>
                </button>

                <button
                    class="action-btn delete-btn"
                    data-action="delete"
                    data-id="${job.id}"
                    title="Delete Application"
                    aria-label="Delete application"
                >
                    <i data-lucide="trash-2"></i>
                </button>

            </td>
        </tr>
    `).join("");

    // Initialize dynamically created Lucide icons
    if (window.lucide) {
        lucide.createIcons({ root: tableBody });
    }
}

// ===== Safe HTML Display =====
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ===== Format Status =====
function formatStatus(status) {
    if (!status) return "-";

    return status.charAt(0) +
        status.slice(1).toLowerCase();
}

// ===== Dashboard Statistics =====
function updateDashboardStats() {

    const count = status =>
        applications.filter(job => job.status === status).length;

    document.getElementById("totalCount").textContent =
        applications.length;

    document.getElementById("appliedCount").textContent =
        count("APPLIED");

    document.getElementById("shortlistedCount").textContent =
        count("SHORTLISTED");

    document.getElementById("interviewCount").textContent =
        count("INTERVIEW");

    document.getElementById("selectedCount").textContent =
        count("SELECTED");

    document.getElementById("rejectedCount").textContent =
        count("REJECTED");
}

// ===== Application Status Chart =====
function updateApplicationChart() {

    const canvas = document.getElementById("applicationChart");

    if (!canvas || !window.Chart) return;

    const statusCounts = [
        applications.filter(job => job.status === "APPLIED").length,
        applications.filter(job => job.status === "SHORTLISTED").length,
        applications.filter(job => job.status === "INTERVIEW").length,
        applications.filter(job => job.status === "SELECTED").length,
        applications.filter(job => job.status === "REJECTED").length
    ];

    if (applicationChart) {
        applicationChart.destroy();
    }

    applicationChart = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: [
                "Applied",
                "Shortlisted",
                "Interview",
                "Selected",
                "Rejected"
            ],

            datasets: [{
                data: statusCounts,

                backgroundColor: [
                    "#3978e8",
                    "#d69a24",
                    "#805ad5",
                    "#159b72",
                    "#dc5555"
                ],

                borderWidth: 0,
                hoverOffset: 8
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            cutout: "70%",

            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        padding: 18
                    }
                }
            }
        }
    });
}


// ===== Recent Applications =====
function updateRecentApplications() {

    const container = document.getElementById("recentApplications");

    if (!container) return;

    if (applications.length === 0) {
        container.innerHTML = `
            <div class="recent-empty">
                No applications added yet.
            </div>
        `;
        return;
    }

    const recentJobs = [...applications]
        .sort((a, b) =>
            new Date(b.applicationDate) -
            new Date(a.applicationDate)
        )
        .slice(0, 5);

    container.innerHTML = recentJobs.map(job => `
        <div class="recent-item">

            <div class="recent-item-info">
                <h4>${escapeHTML(job.companyName)}</h4>
                <p>${escapeHTML(job.jobRole)}</p>
            </div>

            <span class="recent-status status-${escapeHTML(job.status)}">
                ${escapeHTML(formatStatus(job.status))}
            </span>

        </div>
    `).join("");
}


// ===== Open Add Modal =====
document.getElementById("addJobBtn").addEventListener("click", () => {

    jobForm.reset();

    document.getElementById("jobId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add Application";

    document.getElementById("applicationDate").value =
        new Date().toISOString().split("T")[0];

    jobModal.style.display = "flex";

    if (window.lucide) {
        lucide.createIcons();
    }
});

// ===== Close Modal =====
document.getElementById("closeModalBtn").addEventListener("click", () => {
    jobModal.style.display = "none";
});

// Close modal when clicking outside
jobModal.addEventListener("click", event => {

    if (event.target === jobModal) {
        jobModal.style.display = "none";
    }

});

// ===== Save Application (POST / PUT) =====
jobForm.addEventListener("submit", async event => {

    event.preventDefault();

    const id = document.getElementById("jobId").value;

    const job = {
        companyName: document.getElementById("companyName").value.trim(),

        jobRole: document.getElementById("jobRole").value.trim(),

        location: document.getElementById("location").value.trim(),

        applicationDate:
            document.getElementById("applicationDate").value,

        status: document.getElementById("status").value,

        interviewDate:
            document.getElementById("interviewDate").value || null,

        notes: document.getElementById("notes").value.trim()
    };

    try {

        const response = await fetch(
            id ? `${API_URL}/${id}` : API_URL,
            {
                method: id ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(job)
            }
        );

        if (!response.ok) {
            throw new Error("Unable to save application");
        }

        alert(
            id
                ? "Application updated successfully!"
                : "Application added successfully!"
        );

        jobModal.style.display = "none";

        jobForm.reset();

        await loadApplications();

        applyFilters();

    } catch (error) {

        console.error("Error:", error);

        alert("Failed to save application. Please try again.");

    }
});

// ===== Edit Application =====
function editApplication(id) {

    const job = applications.find(item => item.id === id);

    if (!job) return;

    document.getElementById("jobId").value = job.id;

    document.getElementById("companyName").value =
        job.companyName;

    document.getElementById("jobRole").value =
        job.jobRole;

    document.getElementById("location").value =
        job.location || "";

    document.getElementById("applicationDate").value =
        job.applicationDate;

    document.getElementById("status").value =
        job.status;

    document.getElementById("interviewDate").value =
        job.interviewDate || "";

    document.getElementById("notes").value =
        job.notes || "";

    document.getElementById("modalTitle").textContent =
        "Edit Application";

    jobModal.style.display = "flex";
}

// ===== Delete Application =====
async function deleteApplication(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete application");
        }

        alert("Application deleted successfully!");

        await loadApplications();

        applyFilters();

    } catch (error) {

        console.error("Error:", error);

        alert("Failed to delete application.");

    }
}

// ===== Table Actions =====
tableBody.addEventListener("click", event => {

    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "edit") {

        editApplication(id);

    } else if (button.dataset.action === "delete") {

        deleteApplication(id);

    }

});

// ===== Combined Search and Status Filter =====
function applyFilters() {

    const searchText = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const selectedStatus = document
        .getElementById("statusFilter")
        .value;

    const filteredApplications = applications.filter(job => {

        const matchesCompany = (job.companyName || "")
            .toLowerCase()
            .includes(searchText);

        const matchesStatus =
            selectedStatus === "" ||
            job.status === selectedStatus;

        return matchesCompany && matchesStatus;

    });

    displayApplications(filteredApplications);
}

// ===== Search Event =====
document.getElementById("searchInput")
    .addEventListener("input", applyFilters);

// ===== Status Filter Event =====
document.getElementById("statusFilter")
    .addEventListener("change", applyFilters);

// ===== Initial Load =====
loadApplications();
