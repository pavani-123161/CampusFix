document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const totalIssuesEl = document.getElementById('totalIssues');
    const pendingIssuesEl = document.getElementById('pendingIssues');
    const progressIssuesEl = document.getElementById('progressIssues');
    const resolvedIssuesEl = document.getElementById('resolvedIssues');
    
    const issueForm = document.getElementById('issueForm');
    const issueTitleInput = document.getElementById('issueTitle');
    const categorySelect = document.getElementById('category');
    const locationInput = document.getElementById('location');
    const prioritySelect = document.getElementById('priority');
    const descriptionInput = document.getElementById('description');
    
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const issueListContainer = document.getElementById('issueList');

    // Default Initial Data to Populate if empty
    const mockIssues = [
        {
            id: 'issue-1',
            title: 'Water leakage in Library Restroom',
            category: 'Water',
            location: 'Central Library - Ground Floor',
            priority: 'High',
            description: 'Water is leaking continuously from the flush valve, creating a pool of water on the floor. It is a slip hazard.',
            status: 'In Progress',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
            id: 'issue-2',
            title: 'Broken classroom projector screen',
            category: 'Infrastructure',
            location: 'Block A - Room 203',
            priority: 'Low',
            description: 'The projector pull-down screen is jammed and cannot be pulled down. Needs bracket lubrication or replacement.',
            status: 'Pending',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
            id: 'issue-3',
            title: 'Main lobby ceiling lights blinking',
            category: 'Electrical',
            location: 'Admin Block - Reception Area',
            priority: 'Medium',
            description: 'Two fluorescent tubes are flickering constantly. It is distracting for students and visitors.',
            status: 'Resolved',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        }
    ];

    // Load issues from localStorage or use mock issues
    let issues = JSON.parse(localStorage.getItem('campus_issues'));
    if (!issues || issues.length === 0) {
        issues = mockIssues;
        localStorage.setItem('campus_issues', JSON.stringify(issues));
    }

    // Render App State
    function render() {
        calculateStats();
        renderIssues();
    }

    // Calculate Dashboard Statistics
    function calculateStats() {
        const total = issues.length;
        const pending = issues.filter(issue => issue.status === 'Pending').length;
        const progress = issues.filter(issue => issue.status === 'In Progress').length;
        const resolved = issues.filter(issue => issue.status === 'Resolved').length;

        // Update DOM with simple count animations
        animateCount(totalIssuesEl, total);
        animateCount(pendingIssuesEl, pending);
        animateCount(progressIssuesEl, progress);
        animateCount(resolvedIssuesEl, resolved);
    }

    // Smooth count animation
    function animateCount(element, target) {
        const start = parseInt(element.textContent) || 0;
        if (start === target) return;
        
        let current = start;
        const duration = 400; // ms
        const stepTime = Math.abs(Math.floor(duration / (target - start || 1)));
        const increment = target > start ? 1 : -1;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            if (current === target) {
                clearInterval(timer);
            }
        }, Math.max(stepTime, 20));
    }

    // Render Issues List with Filter and Search
    function renderIssues() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterVal = statusFilter.value;

        // Filter logic
        const filteredIssues = issues.filter(issue => {
            const matchesSearch = 
                issue.title.toLowerCase().includes(searchTerm) || 
                issue.description.toLowerCase().includes(searchTerm) ||
                issue.location.toLowerCase().includes(searchTerm) ||
                issue.category.toLowerCase().includes(searchTerm);
            
            const matchesStatus = filterVal === 'All' || issue.status === filterVal;
            
            return matchesSearch && matchesStatus;
        });

        // Clear container
        issueListContainer.innerHTML = '';

        if (filteredIssues.length === 0) {
            issueListContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No Issues Found</h3>
                    <p>Try refining your search keyword or changing status filters.</p>
                </div>
            `;
            return;
        }

        // Render Issue Cards
        filteredIssues.forEach(issue => {
            const card = document.createElement('div');
            card.className = `issue-card priority-${issue.priority.toLowerCase()}`;
            
            // Format Date
            const formattedDate = new Date(issue.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Badge Classes
            const statusClass = issue.status.toLowerCase().replace(/\s+/g, '-');
            const priorityClass = issue.priority.toLowerCase();

            card.innerHTML = `
                <div class="issue-card-header">
                    <h4>${escapeHTML(issue.title)}</h4>
                    <div class="badge-group">
                        <span class="badge category">${escapeHTML(issue.category)}</span>
                        <span class="badge priority-${priorityClass}">${issue.priority}</span>
                        <span class="badge status-${statusClass}">${issue.status}</span>
                    </div>
                </div>
                
                <p class="issue-desc">${escapeHTML(issue.description)}</p>
                
                <div class="issue-meta">
                    <div class="issue-meta-item">
                        <span>📍</span> ${escapeHTML(issue.location)}
                    </div>
                    <div class="issue-meta-item">
                        <span>📅</span> ${formattedDate}
                    </div>
                </div>

                <div class="issue-actions">
                    <button class="status-btn" data-id="${issue.id}">
                        <span>⚙️</span> Cycle Status
                    </button>
                    <button class="delete-btn" data-id="${issue.id}">
                        Delete
                    </button>
                </div>
            `;

            // Event Listeners for action buttons inside Card
            card.querySelector('.status-btn').addEventListener('click', () => {
                cycleStatus(issue.id);
            });

            card.querySelector('.delete-btn').addEventListener('click', () => {
                deleteIssue(issue.id);
            });

            issueListContainer.appendChild(card);
        });
    }

    // Add Issue Form Submission
    issueForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newIssue = {
            id: 'issue-' + Date.now(),
            title: issueTitleInput.value.trim(),
            category: categorySelect.value,
            location: locationInput.value.trim(),
            priority: prioritySelect.value,
            description: descriptionInput.value.trim(),
            status: 'Pending',
            date: new Date().toISOString()
        };

        issues.unshift(newIssue); // add to top
        saveIssues();
        render();

        // Reset form and scroll to issues list
        issueForm.reset();
        
        // Custom visual cue for submit success
        const submitBtn = issueForm.querySelector('.primary-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '✅ Issue Submitted!';
        submitBtn.style.background = 'linear-gradient(135deg, var(--status-resolved) 0%, #059669 100%)';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            
            // Smooth scroll to issues dashboard
            document.querySelector('.issues').scrollIntoView({ behavior: 'smooth' });
        }, 1200);
    });

    // Cycle Status through Pending -> In Progress -> Resolved -> Pending
    function cycleStatus(id) {
        const issue = issues.find(i => i.id === id);
        if (!issue) return;

        if (issue.status === 'Pending') {
            issue.status = 'In Progress';
        } else if (issue.status === 'In Progress') {
            issue.status = 'Resolved';
        } else {
            issue.status = 'Pending';
        }

        saveIssues();
        render();
    }

    // Delete Issue
    function deleteIssue(id) {
        if (confirm('Are you sure you want to delete this issue?')) {
            issues = issues.filter(i => i.id !== id);
            saveIssues();
            render();
        }
    }

    // Save Issues to local storage
    function saveIssues() {
        localStorage.setItem('campus_issues', JSON.stringify(issues));
    }

    // Search and Filter Event Listeners
    searchInput.addEventListener('input', renderIssues);
    statusFilter.addEventListener('change', renderIssues);

    // Escape helper for HTML insertion
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Run Initial Render
    render();
});
