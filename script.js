document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // DOM ELEMENTS
    // =========================================

    const totalIssuesEl = document.getElementById('totalIssues');
    const pendingIssuesEl = document.getElementById('pendingIssues');
    const progressIssuesEl = document.getElementById('progressIssues');
    const resolvedIssuesEl = document.getElementById('resolvedIssues');

    const resolutionRateEl = document.getElementById('resolutionRate');
    const healthProgressBar = document.getElementById('healthProgressBar');
    const healthMessageEl = document.getElementById('healthMessage');
    const healthCountEl = document.getElementById('healthCount');

    const issueForm = document.getElementById('issueForm');

    const issueTitleInput = document.getElementById('issueTitle');
    const categorySelect = document.getElementById('category');
    const locationInput = document.getElementById('location');
    const prioritySelect = document.getElementById('priority');
    const descriptionInput = document.getElementById('description');

    const prioritySuggestionEl =
        document.getElementById('prioritySuggestion');

    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const issueListContainer = document.getElementById('issueList');


    // =========================================
    // DEFAULT SAMPLE ISSUES
    // =========================================

    const mockIssues = [
        {
            id: 'issue-1',
            title: 'Water leakage in Library Restroom',
            category: 'Water',
            location: 'Central Library - Ground Floor',
            priority: 'High',
            description:
                'Water is leaking continuously from the flush valve, creating a pool of water on the floor. It is a slip hazard.',
            status: 'In Progress',
            date: new Date(
                Date.now() - 24 * 60 * 60 * 1000
            ).toISOString()
        },

        {
            id: 'issue-2',
            title: 'Broken classroom projector screen',
            category: 'Infrastructure',
            location: 'Block A - Room 203',
            priority: 'Low',
            description:
                'The projector pull-down screen is jammed and cannot be pulled down. Needs bracket lubrication or replacement.',
            status: 'Pending',
            date: new Date(
                Date.now() - 2 * 60 * 60 * 1000
            ).toISOString()
        },

        {
            id: 'issue-3',
            title: 'Main lobby ceiling lights blinking',
            category: 'Electrical',
            location: 'Admin Block - Reception Area',
            priority: 'Medium',
            description:
                'Two fluorescent tubes are flickering constantly. It is distracting for students and visitors.',
            status: 'Resolved',
            date: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString()
        }
    ];


    // =========================================
    // LOAD ISSUES
    // =========================================

    let issues = JSON.parse(
        localStorage.getItem('campus_issues')
    );

    if (!issues || issues.length === 0) {
        issues = mockIssues;

        localStorage.setItem(
            'campus_issues',
            JSON.stringify(issues)
        );
    }


    // =========================================
    // MAIN RENDER FUNCTION
    // =========================================

    function render() {
        calculateStats();
        calculateCampusHealth();
        renderIssues();
        renderCategoryInsights();
        renderRecentActivity();
    }


    // =========================================
    // DASHBOARD STATISTICS
    // =========================================

    function calculateStats() {

        const total = issues.length;

        const pending = issues.filter(
            issue => issue.status === 'Pending'
        ).length;

        const progress = issues.filter(
            issue => issue.status === 'In Progress'
        ).length;

        const resolved = issues.filter(
            issue => issue.status === 'Resolved'
        ).length;


        animateCount(totalIssuesEl, total);
        animateCount(pendingIssuesEl, pending);
        animateCount(progressIssuesEl, progress);
        animateCount(resolvedIssuesEl, resolved);
    }


    // =========================================
    // CAMPUS HEALTH
    // =========================================

    function calculateCampusHealth() {

        // Prevent errors if these elements don't exist
        if (
            !resolutionRateEl ||
            !healthProgressBar ||
            !healthMessageEl ||
            !healthCountEl
        ) {
            return;
        }

        const total = issues.length;

        const resolved = issues.filter(
            issue => issue.status === 'Resolved'
        ).length;

        const resolutionRate =
            total === 0
                ? 0
                : Math.round((resolved / total) * 100);


        // Percentage
        resolutionRateEl.textContent =
            `${resolutionRate}%`;


        // Progress bar
        healthProgressBar.style.width =
            `${resolutionRate}%`;


        // Count
        healthCountEl.textContent =
            `${resolved} of ${total} resolved`;


        // Message
        if (total === 0) {

            healthMessageEl.textContent =
                'No issues reported yet.';

        } else if (resolutionRate === 100) {

            healthMessageEl.textContent =
                'Excellent! All reported issues are resolved.';

        } else if (resolutionRate >= 70) {

            healthMessageEl.textContent =
                'Great progress! Most issues are resolved.';

        } else if (resolutionRate >= 40) {

            healthMessageEl.textContent =
                'Good progress. Keep working on open issues.';

        } else {

            healthMessageEl.textContent =
                'Several issues still need attention.';
        }
    }


    // =========================================
    // COUNT ANIMATION
    // =========================================

    function animateCount(element, target) {

        if (!element) return;

        const start =
            parseInt(element.textContent) || 0;

        if (start === target) return;

        let current = start;

        const duration = 400;

        const stepTime =
            Math.abs(
                Math.floor(
                    duration / (target - start || 1)
                )
            );

        const increment =
            target > start ? 1 : -1;


        const timer = setInterval(() => {

            current += increment;

            element.textContent = current;

            if (current === target) {
                clearInterval(timer);
            }

        }, Math.max(stepTime, 20));
    }


    // =========================================
    // CATEGORY INSIGHTS
    // =========================================

    function renderCategoryInsights() {

        const categoryInsights =
            document.getElementById('categoryInsights');

        if (!categoryInsights) return;


        const categoryCounts = {};


        issues.forEach(issue => {

            categoryCounts[issue.category] =
                (categoryCounts[issue.category] || 0) + 1;

        });


        const categories =
            Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1]);


        if (categories.length === 0) {

            categoryInsights.innerHTML = `
                <div class="empty-state">
                    <p>No issue data available yet.</p>
                </div>
            `;

            return;
        }


        const maxCount = categories[0][1];


        categoryInsights.innerHTML =
            categories.map(([category, count]) => {

                const percentage =
                    (count / maxCount) * 100;


                return `
                    <div class="insight-row">

                        <div class="insight-label">

                            <span>
                                ${escapeHTML(category)}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>

                        <div class="insight-bar">

                            <div
                                class="insight-fill"
                                style="width: ${percentage}%"
                            ></div>

                        </div>

                    </div>
                `;

            }).join('');
    }


    // =========================================
    // RECENT CAMPUS ACTIVITY
    // =========================================

    function renderRecentActivity() {

        const activityList =
            document.getElementById('activityList');

        if (!activityList) return;


        const recentIssues =
            [...issues]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )
                .slice(0, 4);


        if (recentIssues.length === 0) {

            activityList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-state-icon">
                        📋
                    </div>

                    <h3>No Recent Activity</h3>

                    <p>
                        Campus activity will appear here
                        when issues are reported.
                    </p>

                </div>
            `;

            return;
        }


        activityList.innerHTML =
            recentIssues.map(issue => {

                let icon = '🔴';

                let activityText =
                    'New issue reported';


                if (issue.status === 'In Progress') {

                    icon = '🟡';

                    activityText =
                        'Issue in progress';

                } else if (issue.status === 'Resolved') {

                    icon = '🟢';

                    activityText =
                        'Issue resolved';
                }


                const time =
                    new Date(issue.date)
                        .toLocaleDateString(
                            'en-US',
                            {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            }
                        );


                return `
                    <div class="activity-item">

                        <div class="activity-icon">
                            ${icon}
                        </div>

                        <div class="activity-content">

                            <strong>
                                ${escapeHTML(activityText)}
                            </strong>

                            <h4>
                                ${escapeHTML(issue.title)}
                            </h4>

                            <p>
                                ${escapeHTML(issue.category)}
                                ·
                                📍
                                ${escapeHTML(issue.location)}
                            </p>

                        </div>

                        <time>
                            ${time}
                        </time>

                    </div>
                `;

            }).join('');
    }


    // =========================================
    // RENDER ISSUES
    // =========================================

    function renderIssues() {

        if (!issueListContainer) return;


        const searchTerm =
            searchInput
                ? searchInput.value.toLowerCase().trim()
                : '';


        const filterVal =
            statusFilter
                ? statusFilter.value
                : 'All';


        // Filter issues
        const filteredIssues =
            issues.filter(issue => {

                const matchesSearch =
                    issue.title
                        .toLowerCase()
                        .includes(searchTerm) ||

                    issue.description
                        .toLowerCase()
                        .includes(searchTerm) ||

                    issue.location
                        .toLowerCase()
                        .includes(searchTerm) ||

                    issue.category
                        .toLowerCase()
                        .includes(searchTerm);


                const matchesStatus =
                    filterVal === 'All' ||
                    issue.status === filterVal;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            });


        // Clear existing cards
        issueListContainer.innerHTML = '';


        // No results
        if (filteredIssues.length === 0) {

            issueListContainer.innerHTML = `
                <div class="empty-state">

                    <div class="empty-state-icon">
                        🔍
                    </div>

                    <h3>
                        No Issues Found
                    </h3>

                    <p>
                        Try refining your search keyword
                        or changing status filters.
                    </p>

                </div>
            `;

            return;
        }


        // Create issue cards
        filteredIssues.forEach(issue => {

            const card =
                document.createElement('div');


            card.className =
                `issue-card priority-${issue.priority.toLowerCase()}`;


            // Format date
            const formattedDate =
                new Date(issue.date)
                    .toLocaleDateString(
                        'en-US',
                        {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }
                    );


            // Classes
            const statusClass =
                issue.status
                    .toLowerCase()
                    .replace(/\s+/g, '-');


            const priorityClass =
                issue.priority.toLowerCase();


            // =========================================
            // ISSUE CARD HTML
            // =========================================

            card.innerHTML = `

                <div class="issue-card-header">

                    <h4>
                        ${escapeHTML(issue.title)}
                    </h4>

                    <div class="badge-group">

                        <span class="badge category">
                            ${escapeHTML(issue.category)}
                        </span>

                        <span class="badge priority-${priorityClass}">
                            ${escapeHTML(issue.priority)}
                        </span>

                        <span class="badge status-${statusClass}">
                            ${escapeHTML(issue.status)}
                        </span>

                    </div>

                </div>


                <p class="issue-desc">
                    ${escapeHTML(issue.description)}
                </p>


                <div class="issue-meta">

                    <div class="issue-meta-item">
                        <span>📍</span>
                        ${escapeHTML(issue.location)}
                    </div>

                    <div class="issue-meta-item">
                        <span>📅</span>
                        ${formattedDate}
                    </div>

                </div>


                <div class="issue-actions">

                    <button
                        type="button"
                        class="status-btn"
                        data-id="${issue.id}"
                    >
                        ${issue.status === 'Pending'
                    ? '<span>🔧</span> Start Progress'
                    : issue.status === 'In Progress'
                        ? '<span>✅</span> Mark Resolved'
                        : '<span>↩️</span> Reopen Issue'
                }
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${issue.id}"
                    >
                        🗑️ Delete
                    </button>

                </div>

            `;


            // =========================================
            // STATUS BUTTON
            // =========================================

            const statusBtn =
                card.querySelector('.status-btn');


            if (statusBtn) {

                statusBtn.addEventListener(
                    'click',
                    (event) => {

                        event.preventDefault();

                        event.stopPropagation();

                        cycleStatus(issue.id);
                    }
                );
            }


            // =========================================
            // DELETE BUTTON
            // =========================================

            const deleteBtn = card.querySelector('.delete-btn');

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    deleteIssue(issue.id);
                });
            }


            // Add card to page
            issueListContainer.appendChild(card);

        });
    }


    // =========================================
    // ADD NEW ISSUE
    // =========================================

    if (issueForm) {

        issueForm.addEventListener(
            'submit',
            (e) => {

                e.preventDefault();


                const newIssue = {

                    id:
                        'issue-' +
                        Date.now(),

                    title:
                        issueTitleInput.value.trim(),

                    category:
                        categorySelect.value,

                    location:
                        locationInput.value.trim(),

                    priority:
                        prioritySelect.value,

                    description:
                        descriptionInput.value.trim(),

                    status:
                        'Pending',

                    date:
                        new Date().toISOString()
                };


                // Add issue to beginning
                issues.unshift(newIssue);


                // Save
                saveIssues();


                // Update UI
                render();


                // Reset form
                issueForm.reset();


                if (prioritySuggestionEl) {

                    prioritySuggestionEl
                        .classList
                        .remove(
                            'active',
                            'high',
                            'medium',
                            'low'
                        );

                    prioritySuggestionEl.innerHTML = '';
                }


                // Success animation
                const submitBtn =
                    issueForm.querySelector(
                        '.primary-btn'
                    );


                if (submitBtn) {

                    const originalText =
                        submitBtn.innerHTML;


                    submitBtn.innerHTML =
                        '✅ Issue Submitted!';


                    submitBtn.style.background =
                        'linear-gradient(135deg, var(--status-resolved) 0%, #059669 100%)';


                    setTimeout(() => {

                        submitBtn.innerHTML =
                            originalText;

                        submitBtn.style.background =
                            '';


                        const issuesSection =
                            document.querySelector(
                                '.issues'
                            );


                        if (issuesSection) {

                            issuesSection.scrollIntoView({
                                behavior: 'smooth'
                            });
                        }

                    }, 1200);
                }
            }
        );
    }


    // =========================================
    // CYCLE STATUS
    // =========================================

    function cycleStatus(id) {

        const issue =
            issues.find(
                issue => issue.id === id
            );


        if (!issue) return;


        if (issue.status === 'Pending') {

            issue.status =
                'In Progress';

        } else if (
            issue.status === 'In Progress'
        ) {

            issue.status =
                'Resolved';

        } else {

            issue.status =
                'Pending';
        }


        saveIssues();

        render();
    }


    // =========================================
    // DELETE ISSUE
    // =========================================

    function deleteIssue(id) {

        console.log("deleteIssue called:", id);

        const issue = issues.find(issue => issue.id === id);

        if (!issue) {
            console.log("Issue not found:", id);
            return;
        }

        // Remove the issue
        issues = issues.filter(issue => issue.id !== id);

        // Save updated issues
        saveIssues();

        // Re-render everything
        render();

        console.log("Issue deleted successfully:", issue.title);
    }

    // =========================================
    // SAVE ISSUES
    // =========================================

    function saveIssues() {

        localStorage.setItem(
            'campus_issues',
            JSON.stringify(issues)
        );
    }


    // =========================================
    // SEARCH
    // =========================================

    if (searchInput) {

        searchInput.addEventListener(
            'input',
            renderIssues
        );
    }


    // =========================================
    // STATUS FILTER
    // =========================================

    if (statusFilter) {

        statusFilter.addEventListener(
            'change',
            renderIssues
        );
    }


    // =========================================
    // SMART PRIORITY SUGGESTION
    // =========================================

    function updatePrioritySuggestion() {

        if (
            !categorySelect ||
            !descriptionInput ||
            !prioritySuggestionEl
        ) {
            return;
        }


        const category =
            categorySelect.value;


        const description =
            descriptionInput.value
                .trim()
                .toLowerCase();


        if (
            !category ||
            description.length < 5
        ) {

            prioritySuggestionEl
                .classList
                .remove(
                    'active',
                    'high',
                    'medium',
                    'low'
                );

            prioritySuggestionEl.innerHTML = '';

            return;
        }


        let suggestedPriority = 'Low';


        // High priority keywords
        const highKeywords = [

            'leak',
            'flood',
            'burst',
            'overflow',
            'water logging',
            'flooding',

            'spark',
            'smoke',
            'fire',
            'shock',
            'exposed',
            'outage',
            'blackout',
            'live wire',
            'power cut',

            'offline',
            'down',
            'no signal',
            'exam',
            'dead',
            'completely off',

            'elevator',
            'stuck',
            'shattered',
            'collapsed',
            'falling',
            'broken glass',

            'toxic',
            'chemical',
            'hazard',
            'glass',
            'vandalism',

            'urgent',
            'emergency',
            'danger',
            'safety',
            'hurt',
            'injury'
        ];


        // Medium priority keywords
        const mediumKeywords = [

            'slow',
            'lagging',
            'disconnecting',
            'intermittent',

            'flicker',
            'blink',
            'fused',
            'not working',

            'rattle',
            'noise',
            'sound',

            'smell',
            'odor',
            'dirty',
            'trash',
            'clog',
            'blocked',

            'squeak',
            'loose',
            'cracked',
            'stuck',
            'jammed',
            'torn',
            'damaged'
        ];


        const hasHighKeyword =
            highKeywords.some(
                keyword =>
                    description.includes(keyword)
            );


        const hasMediumKeyword =
            mediumKeywords.some(
                keyword =>
                    description.includes(keyword)
            );


        if (hasHighKeyword) {

            suggestedPriority =
                'High';

        } else if (hasMediumKeyword) {

            suggestedPriority =
                'Medium';

        } else {

            if (
                category === 'Water' ||
                category === 'Electrical'
            ) {

                suggestedPriority =
                    'Medium';

            } else {

                suggestedPriority =
                    'Low';
            }
        }


        // Display suggestion
        prioritySuggestionEl.className =
            'suggestion-text active ' +
            suggestedPriority.toLowerCase();


        prioritySuggestionEl.innerHTML = `
            💡 Suggested Priority:
            <strong>${suggestedPriority}</strong>.
            <span
                class="suggestion-link"
                id="applySuggestionBtn"
            >
                Click to apply
            </span>
        `;


        const applySuggestionBtn =
            document.getElementById(
                'applySuggestionBtn'
            );


        if (applySuggestionBtn) {

            applySuggestionBtn.addEventListener(
                'click',
                () => {

                    prioritySelect.value =
                        suggestedPriority;
                }
            );
        }
    }


    // Priority listeners
    if (categorySelect) {

        categorySelect.addEventListener(
            'change',
            updatePrioritySuggestion
        );
    }


    if (descriptionInput) {

        descriptionInput.addEventListener(
            'input',
            updatePrioritySuggestion
        );
    }


    // =========================================
    // ESCAPE HTML
    // Prevent HTML injection
    // =========================================

    function escapeHTML(str) {

        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    // =========================================
    // INITIAL RENDER
    // =========================================

    render();

});