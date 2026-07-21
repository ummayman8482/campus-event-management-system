/* ============================================================
   CEMS - Campus Event Management System
   Main JavaScript File
   ============================================================
   Handles: Navigation, Form Validation, Event Filtering,
   Admin Dashboard Tabs, Table Search, Toast Notifications,
   Scroll Animations, and Page-Specific Logic.
   All form submissions and admin data load from Firebase Firestore.
   ============================================================ */

(function () {
    'use strict';

    /* ==========================================================
       UTILITY: Show Toast Notification
       ========================================================== */
    function showToast(message, type) {
        if (type === void 0) { type = 'info'; }
        var container = document.getElementById('toastContainer');
        if (!container) return;

        var icons = { success: '✅', error: '❌', info: 'ℹ️' };
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML =
            '<span class="toast-icon" aria-hidden="true">' + (icons[type] || icons.info) + '</span>' +
            '<span class="toast-message">' + message + '</span>' +
            '<button class="toast-close" aria-label="Dismiss notification">&times;</button>';

        container.appendChild(toast);

        toast.querySelector('.toast-close').addEventListener('click', function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(function () { toast.remove(); }, 300);
        });

        setTimeout(function () {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(function () { toast.remove(); }, 300);
            }
        }, 5000);
    }

    /* Expose globally for other scripts */
    window.CEMS = window.CEMS || {};
    window.CEMS.showToast = showToast;

    /* ==========================================================
       MOBILE NAVIGATION
       ========================================================== */
    var hamburger = document.getElementById('hamburger');
    var navMenu = document.getElementById('navMenu');
    var mobileOverlay = document.getElementById('mobileOverlay');

    function toggleMobileNav() {
        var isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        if (mobileOverlay) mobileOverlay.classList.toggle('show');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMobileNav() {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        if (mobileOverlay) mobileOverlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', toggleMobileNav);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', closeMobileNav);
    });

    /* ==========================================================
       SCROLL ANIMATIONS (Intersection Observer)
       ========================================================== */
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    if ('IntersectionObserver' in window && animatedElements.length) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        animatedElements.forEach(function (el) { observer.observe(el); });
    } else {
        animatedElements.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ==========================================================
       EVENT FILTERING (Events Page)
       ========================================================== */
    var filterBtn = document.getElementById('filterBtn');
    var searchInput = document.getElementById('searchEvents');
    var categorySelect = document.getElementById('filterCategory');
    var statusSelect = document.getElementById('filterStatus');
    var eventsGrid = document.getElementById('eventsGrid');
    var eventsCount = document.getElementById('eventsCount');

    function filterEvents() {
        if (!eventsGrid) return;
        var query = (searchInput ? searchInput.value : '').toLowerCase();
        var category = categorySelect ? categorySelect.value : 'all';
        var status = statusSelect ? statusSelect.value : 'all';
        var cards = eventsGrid.querySelectorAll('.event-card');
        var visibleCount = 0;

        cards.forEach(function (card) {
            var name = (card.getAttribute('data-name') || '').toLowerCase();
            var cardCat = card.getAttribute('data-category') || '';
            var cardStatus = card.getAttribute('data-status') || '';

            var matchSearch = !query || name.indexOf(query) !== -1;
            var matchCategory = category === 'all' || cardCat === category;
            var matchStatus = status === 'all' || cardStatus === status;

            if (matchSearch && matchCategory && matchStatus) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (eventsCount) {
            eventsCount.textContent = 'Showing ' + visibleCount + ' event' + (visibleCount !== 1 ? 's' : '');
        }
    }

    if (filterBtn) filterBtn.addEventListener('click', filterEvents);
    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); filterEvents(); }
        });
    }

    /* ==========================================================
       FORM VALIDATION HELPER
       ========================================================== */
    function validateField(input, errorId, validationFn) {
        var errorEl = document.getElementById(errorId);
        var isValid = validationFn(input.value.trim());
        if (isValid) {
            input.classList.remove('error');
            if (errorEl) errorEl.style.display = 'none';
        } else {
            input.classList.add('error');
            if (errorEl) errorEl.style.display = 'block';
        }
        return isValid;
    }

    /* ==========================================================
       REGISTRATION FORM → Firestore
       ========================================================== */
    var registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var isValid = true;
            isValid = validateField(document.getElementById('regFirstName'), 'regFirstNameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('regLastName'), 'regLastNameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('regEmail'), 'regEmailError', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }) && isValid;
            isValid = validateField(document.getElementById('regPhone'), 'regPhoneError', function (v) { return v.length >= 7; }) && isValid;
            isValid = validateField(document.getElementById('regStudentId'), 'regStudentIdError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('regDepartment'), 'regDepartmentError', function (v) { return v !== ''; }) && isValid;
            isValid = validateField(document.getElementById('regYear'), 'regYearError', function (v) { return v !== ''; }) && isValid;
            isValid = validateField(document.getElementById('regEvent'), 'regEventError', function (v) { return v !== ''; }) && isValid;

            var termsCheckbox = document.getElementById('regTerms');
            var termsError = document.getElementById('regTermsError');
            if (!termsCheckbox.checked) {
                if (termsError) termsError.style.display = 'block';
                isValid = false;
            } else {
                if (termsError) termsError.style.display = 'none';
            }

            if (!isValid) {
                showToast('Please fix the errors in the form.', 'error');
                var firstError = registrationForm.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                return;
            }

            /* Disable submit button during save */
            var submitBtn = document.getElementById('regSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
            }

            try {
                var eventSelect = document.getElementById('regEvent');
                var eventText = eventSelect.options[eventSelect.selectedIndex].text;

                var formData = {
                    firstName: document.getElementById('regFirstName').value,
                    lastName: document.getElementById('regLastName').value,
                    email: document.getElementById('regEmail').value,
                    phone: document.getElementById('regPhone').value,
                    studentId: document.getElementById('regStudentId').value,
                    department: document.getElementById('regDepartment').value,
                    year: document.getElementById('regYear').value,
                    event: eventSelect.value,
                    eventName: eventText,
                    requirements: document.getElementById('regRequirements').value
                };

                /* Save to Firestore */
                var saved = await saveRegistration(formData);
                var displayId = 'REG-' + saved.id.substring(0, 8).toUpperCase();

                /* Show confirmation */
                registrationForm.style.display = 'none';
                var formCard = document.getElementById('registrationFormCard');
                if (formCard) formCard.style.display = 'none';

                var confirmation = document.getElementById('registrationConfirmation');
                if (confirmation) confirmation.style.display = 'block';

                var details = document.getElementById('confirmationDetails');
                if (details) {
                    details.innerHTML =
                        '<div class="detail-row"><span class="detail-label">Registration ID</span><span class="detail-value">' + displayId + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">' + formData.firstName + ' ' + formData.lastName + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">' + formData.email + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">' + eventText + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Department</span><span class="detail-value">' + formData.department + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color: var(--success);">✓ Confirmed</span></div>';
                }

                showToast('Registration saved to Firebase! Check your email for confirmation.', 'success');
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } catch (err) {
                console.error('[CEMS] Registration save error:', err);
                showToast('Error saving to Firebase: ' + err.message, 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Complete Registration';
                }
            }
        });

        /* Real-time validation on blur */
        registrationForm.querySelectorAll('[required]').forEach(function (field) {
            field.addEventListener('blur', function () {
                if (field.type === 'checkbox') {
                    var termsError = document.getElementById('regTermsError');
                    if (!field.checked && termsError) termsError.style.display = 'block';
                    else if (termsError) termsError.style.display = 'none';
                } else if (field.value.trim() !== '') {
                    field.classList.remove('error');
                    var errorEl = document.getElementById(field.id + 'Error');
                    if (errorEl) errorEl.style.display = 'none';
                }
            });
        });

        /* Pre-select event from URL parameter */
        var urlParams = new URLSearchParams(window.location.search);
        var eventParam = urlParams.get('event');
        if (eventParam) {
            var eventSelect = document.getElementById('regEvent');
            if (eventSelect) {
                for (var i = 0; i < eventSelect.options.length; i++) {
                    if (eventSelect.options[i].value === eventParam) {
                        eventSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }

    /* ==========================================================
       CONTACT FORM → Firestore
       ========================================================== */
    var contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            var isValid = true;

            isValid = validateField(document.getElementById('contactName'), 'contactNameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('contactEmail'), 'contactEmailError', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }) && isValid;
            isValid = validateField(document.getElementById('contactSubject'), 'contactSubjectError', function (v) { return v !== ''; }) && isValid;
            isValid = validateField(document.getElementById('contactMessage'), 'contactMessageError', function (v) { return v.length >= 20; }) && isValid;

            if (!isValid) {
                showToast('Please fix the errors in the form.', 'error');
                var firstError = contactForm.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
                return;
            }

            var submitBtn = document.getElementById('contactSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
            }

            try {
                var subjectSelect = document.getElementById('contactSubject');
                var formData = {
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    subject: subjectSelect.value,
                    subjectLabel: subjectSelect.options[subjectSelect.selectedIndex].text,
                    message: document.getElementById('contactMessage').value,
                    newsletter: document.getElementById('contactNewsletter').checked
                };

                await saveMessage(formData);

                contactForm.reset();
                showToast('Message sent to Firebase! We\'ll get back to you within 24 hours.', 'success');

            } catch (err) {
                console.error('[CEMS] Message save error:', err);
                showToast('Error sending message: ' + err.message, 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Send Message';
                }
            }
        });
    }

    /* ==========================================================
       ADMIN DASHBOARD - Tab Switching
       ========================================================== */
    var sidebarLinks = document.querySelectorAll('.sidebar-link[data-tab]');
    var tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabName) {
        sidebarLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
        });
        tabContents.forEach(function (content) {
            content.classList.toggle('active', content.id === 'tab-' + tabName);
        });
        var dashSidebar = document.getElementById('dashboardSidebar');
        if (dashSidebar) dashSidebar.classList.remove('show');

        /* Load data from Firestore when switching tabs */
        if (tabName === 'registrations') loadRegistrationsTable();
        if (tabName === 'messages') loadMessagesTable();
        if (tabName === 'events-manage') loadEventsManageTable();
        if (tabName === 'overview') loadDashboardOverview();
    }

    sidebarLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var tab = link.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
        link.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var tab = link.getAttribute('data-tab');
                if (tab) switchTab(tab);
            }
        });
    });

    /* Sidebar Toggle (tablet) */
    var sidebarToggle = document.getElementById('sidebarToggle');
    var dashSidebar = document.getElementById('dashboardSidebar');

    function checkDashboardLayout() {
        if (sidebarToggle && dashSidebar) {
            sidebarToggle.style.display = window.innerWidth <= 1024 ? 'block' : 'none';
            if (window.innerWidth > 1024) dashSidebar.classList.remove('show');
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            dashSidebar.classList.toggle('show');
        });
    }

    window.addEventListener('resize', checkDashboardLayout);
    checkDashboardLayout();

    /* ==========================================================
       ADMIN DASHBOARD - Load Overview from Firestore
       ========================================================== */
    async function loadDashboardOverview() {
        try {
            var stats = await getDashboardStats();

            /* Update stat cards */
            var statValues = document.querySelectorAll('.dashboard-stat-value');
            if (statValues.length >= 4) {
                statValues[0].textContent = stats.totalEvents;
                statValues[1].textContent = stats.totalRegistrations;
                statValues[2].textContent = stats.totalMessages;
                statValues[3].textContent = stats.totalRegistrations + stats.totalMessages;
            }

            /* Load recent registrations */
            var regs = await getAllRegistrations();
            var recentRegs = regs.slice(0, 5);
            var overviewRegTable = document.querySelector('#tab-overview .dashboard-table-card:first-child tbody');
            if (overviewRegTable && recentRegs.length) {
                overviewRegTable.innerHTML = recentRegs.map(function (r) {
                    var statusClass = r.status === 'Confirmed' ? 'confirmed' : r.status === 'Pending' ? 'pending' : 'cancelled';
                    var statusIcon = r.status === 'Confirmed' ? '✓' : r.status === 'Pending' ? '◷' : '✕';
                    return '<tr>' +
                        '<td><strong>' + (r.firstName || '') + ' ' + (r.lastName || '') + '</strong></td>' +
                        '<td>' + (r.eventName || r.event || '') + '</td>' +
                        '<td>' + (r.department || '') + '</td>' +
                        '<td>' + r.createdAt + '</td>' +
                        '<td><span class="status-badge ' + statusClass + '">' + statusIcon + ' ' + r.status + '</span></td>' +
                        '<td><div class="table-actions"><button class="table-action-btn" aria-label="View" title="View">👁</button><button class="table-action-btn delete" aria-label="Delete" title="Delete" data-id="' + r.id + '" data-type="registration">🗑</button></div></td>' +
                        '</tr>';
                }).join('');
                bindDeleteButtons(overviewRegTable);
                bindViewButtons(overviewRegTable);
            }

            /* Load recent messages */
            var msgs = await getAllMessages();
            var recentMsgs = msgs.slice(0, 3);
            var overviewMsgTable = document.querySelectorAll('#tab-overview .dashboard-table-card')[1];
            if (overviewMsgTable) {
                var tbody = overviewMsgTable.querySelector('tbody');
                if (tbody && recentMsgs.length) {
                    tbody.innerHTML = recentMsgs.map(function (m) {
                        var statusClass = m.status === 'Read' ? 'read' : 'unread';
                        var msgPreview = (m.message || '').substring(0, 60) + ((m.message || '').length > 60 ? '...' : '');
                        return '<tr>' +
                            '<td><strong>' + (m.name || '') + '</strong></td>' +
                            '<td>' + (m.subjectLabel || m.subject || '') + '</td>' +
                            '<td>' + m.createdAt + '</td>' +
                            '<td><span class="status-badge ' + statusClass + '">' + (m.status === 'Read' ? '✓ Read' : '● Unread') + '</span></td>' +
                            '<td><div class="table-actions"><button class="table-action-btn" aria-label="Read" title="Read">👁</button><button class="table-action-btn delete" aria-label="Delete" title="Delete" data-id="' + m.id + '" data-type="message">🗑</button></div></td>' +
                            '</tr>';
                    }).join('');
                    bindDeleteButtons(tbody);
                    bindViewButtons(tbody);
                }
            }

        } catch (err) {
            console.error('[CEMS] Dashboard overview error:', err);
        }
    }

    /* ==========================================================
       ADMIN DASHBOARD - Load Registrations Table from Firestore
       ========================================================== */
    async function loadRegistrationsTable() {
        try {
            var regs = await getAllRegistrations();
            var tbody = document.querySelector('#registrationsTable tbody');
            var countDisplay = document.getElementById('regCountDisplay');
            if (countDisplay) countDisplay.textContent = regs.length;

            if (!tbody) return;

            if (regs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:var(--text-muted);">No registrations yet. Registrations will appear here once users submit the form.</td></tr>';
                return;
            }

            tbody.innerHTML = regs.map(function (r, idx) {
                var displayId = '#REG-' + String(idx + 1).padStart(3, '0');
                var statusClass = r.status === 'Confirmed' ? 'confirmed' : r.status === 'Pending' ? 'pending' : 'cancelled';
                var statusIcon = r.status === 'Confirmed' ? '✓' : r.status === 'Pending' ? '◷' : '✕';
                return '<tr>' +
                    '<td>' + displayId + '</td>' +
                    '<td><strong>' + (r.firstName || '') + ' ' + (r.lastName || '') + '</strong></td>' +
                    '<td>' + (r.email || '') + '</td>' +
                    '<td>' + (r.eventName || r.event || '') + '</td>' +
                    '<td>' + (r.department || '') + '</td>' +
                    '<td>' + (r.year || '') + '</td>' +
                    '<td>' + r.createdAt + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusIcon + ' ' + r.status + '</span></td>' +
                    '<td><div class="table-actions">' +
                    '<button class="table-action-btn" aria-label="View" title="View">👁</button>' +
                    '<button class="table-action-btn" aria-label="Edit" title="Edit">✏️</button>' +
                    '<button class="table-action-btn delete" aria-label="Delete" title="Delete" data-id="' + r.id + '" data-type="registration">🗑</button>' +
                    '</div></td>' +
                    '</tr>';
            }).join('');

            bindDeleteButtons(tbody);
            bindViewButtons(tbody);

        } catch (err) {
            console.error('[CEMS] Load registrations error:', err);
        }
    }

    /* ==========================================================
       ADMIN DASHBOARD - Load Messages Table from Firestore
       ========================================================== */
    async function loadMessagesTable() {
        try {
            var msgs = await getAllMessages();
            var tbody = document.querySelector('#messagesTable tbody');
            var countDisplay = document.getElementById('msgCountDisplay');
            if (countDisplay) countDisplay.textContent = msgs.length;

            if (!tbody) return;

            if (msgs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">No messages yet. Contact form submissions will appear here.</td></tr>';
                return;
            }

            tbody.innerHTML = msgs.map(function (m, idx) {
                var displayId = '#MSG-' + String(idx + 1).padStart(3, '0');
                var statusClass = m.status === 'Read' ? 'read' : 'unread';
                var msgPreview = (m.message || '').substring(0, 60) + ((m.message || '').length > 60 ? '...' : '');
                return '<tr>' +
                    '<td>' + displayId + '</td>' +
                    '<td><strong>' + (m.name || '') + '</strong></td>' +
                    '<td>' + (m.email || '') + '</td>' +
                    '<td>' + (m.subjectLabel || m.subject || '') + '</td>' +
                    '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + msgPreview + '</td>' +
                    '<td>' + m.createdAt + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + (m.status === 'Read' ? '✓ Read' : '● Unread') + '</span></td>' +
                    '<td><div class="table-actions">' +
                    '<button class="table-action-btn" aria-label="Read" title="Read">👁</button>' +
                    '<button class="table-action-btn" aria-label="Reply" title="Reply">↩</button>' +
                    '<button class="table-action-btn delete" aria-label="Delete" title="Delete" data-id="' + m.id + '" data-type="message">🗑</button>' +
                    '</div></td>' +
                    '</tr>';
            }).join('');

            bindDeleteButtons(tbody);
            bindViewButtons(tbody);

        } catch (err) {
            console.error('[CEMS] Load messages error:', err);
        }
    }

    /* ==========================================================
       ADMIN DASHBOARD - Load Events Manage Table from Firestore
       ========================================================== */
    async function loadEventsManageTable() {
        try {
            var events = await getAllEvents();
            var tbody = document.querySelector('#eventsManageTable tbody');
            var countDisplay = document.getElementById('eventCountDisplay');
            if (countDisplay) countDisplay.textContent = events.length;

            if (!tbody) return;

            if (events.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">No events yet.</td></tr>';
                return;
            }

            tbody.innerHTML = events.map(function (evt, idx) {
                var displayId = '#EVT-' + String(idx + 1).padStart(3, '0');
                var statusClass = evt.status === 'Active' ? 'confirmed' : evt.status === 'Ongoing' ? 'pending' : 'cancelled';
                return '<tr>' +
                    '<td>' + displayId + '</td>' +
                    '<td><strong>' + (evt.emoji || '📅') + ' ' + (evt.name || '') + '</strong></td>' +
                    '<td>' + (evt.category || '') + '</td>' +
                    '<td>' + (evt.date || '') + '</td>' +
                    '<td>' + (evt.location || '') + '</td>' +
                    '<td>' + (evt.capacity || 0) + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + evt.status + '</span></td>' +
                    '<td><div class="table-actions">' +
                    '<button class="table-action-btn" aria-label="View" title="View">👁</button>' +
                    '<button class="table-action-btn" aria-label="Edit" title="Edit">✏️</button>' +
                    '<button class="table-action-btn delete" aria-label="Delete" title="Delete" data-id="' + evt.id + '" data-type="event">🗑</button>' +
                    '</div></td>' +
                    '</tr>';
            }).join('');

            bindDeleteButtons(tbody);
            bindViewButtons(tbody);

        } catch (err) {
            console.error('[CEMS] Load events error:', err);
        }
    }

    /* ==========================================================
       ADMIN - Bind Delete Buttons (with Firestore)
       ========================================================== */
    function bindDeleteButtons(container) {
        container.querySelectorAll('.table-action-btn.delete').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                var docId = btn.getAttribute('data-id');
                var type = btn.getAttribute('data-type');
                if (!docId || !confirm('Are you sure you want to delete this item from Firebase?')) return;

                try {
                    if (type === 'registration') await deleteRegistration(docId);
                    else if (type === 'message') await deleteMessage(docId);
                    else if (type === 'event') await deleteEvent(docId);

                    var row = btn.closest('tr');
                    if (row) {
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(20px)';
                        row.style.transition = 'all 0.3s ease';
                        setTimeout(function () { row.remove(); }, 300);
                    }
                    showToast('Item deleted from Firebase.', 'success');
                } catch (err) {
                    showToast('Delete failed: ' + err.message, 'error');
                }
            });
        });
    }

    /* ==========================================================
       ADMIN - Bind View Buttons (Modal)
       ========================================================== */
    function bindViewButtons(container) {
        container.querySelectorAll('.table-action-btn[title="View"], .table-action-btn[title="Read"]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var row = btn.closest('tr');
                if (!row) return;
                var cells = row.querySelectorAll('td');
                var content = '<div style="display: flex; flex-direction: column; gap: var(--space-sm);">';
                cells.forEach(function (cell, i) {
                    var header = document.querySelector('#' + row.closest('table').id + ' th:nth-child(' + (i + 1) + ')');
                    var label = header ? header.textContent : 'Field ' + (i + 1);
                    content += '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color);">' +
                        '<span style="color: var(--text-muted); font-size: var(--font-size-sm);">' + label + '</span>' +
                        '<span style="font-weight: 600; font-size: var(--font-size-sm); text-align: right; max-width: 60%;">' + cell.textContent.trim() + '</span>' +
                        '</div>';
                });
                content += '</div>';
                openModal('Detail View', content);
            });
        });
    }

    /* ==========================================================
       ADMIN DASHBOARD - Table Search
       ========================================================== */
    function setupTableSearch(inputId, tableId, countId) {
        var input = document.getElementById(inputId);
        var table = document.getElementById(tableId);
        var countDisplay = document.getElementById(countId);

        if (!input || !table) return;

        input.addEventListener('input', function () {
            var query = input.value.toLowerCase();
            var rows = table.querySelectorAll('tbody tr');
            var visibleCount = 0;

            rows.forEach(function (row) {
                var text = row.textContent.toLowerCase();
                if (text.indexOf(query) !== -1) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            if (countDisplay) countDisplay.textContent = visibleCount;
        });
    }

    setupTableSearch('regSearchInput', 'registrationsTable', 'regCountDisplay');
    setupTableSearch('msgSearchInput', 'messagesTable', 'msgCountDisplay');
    setupTableSearch('eventSearchInput', 'eventsManageTable', 'eventCountDisplay');

    /* ==========================================================
       ADMIN DASHBOARD - Modal
       ========================================================== */
    var detailModal = document.getElementById('detailModal');
    var modalClose = document.getElementById('modalClose');
    var modalCloseBtn = document.getElementById('modalCloseBtn');
    var modalBody = document.getElementById('modalBody');
    var modalTitle = document.getElementById('modalTitle');

    function openModal(title, content) {
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;
        if (detailModal) {
            detailModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (detailModal) {
            detailModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    window.CEMS.openModal = openModal;
    window.CEMS.closeModal = closeModal;

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (detailModal) {
        detailModal.addEventListener('click', function (e) {
            if (e.target === detailModal) closeModal();
        });
    }

    /* ==========================================================
       ADMIN - Current Date Display
       ========================================================== */
    var dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    /* ==========================================================
       ADMIN - Export CSV
       ========================================================== */
    function exportTableToCSV(tableId, filename) {
        var table = document.getElementById(tableId);
        if (!table) return;

        var rows = [];
        var headers = [];
        table.querySelectorAll('thead th').forEach(function (th) {
            headers.push('"' + th.textContent.replace(/"/g, '""') + '"');
        });
        rows.push(headers.join(','));

        table.querySelectorAll('tbody tr').forEach(function (tr) {
            var cells = [];
            tr.querySelectorAll('td').forEach(function (td) {
                cells.push('"' + td.textContent.trim().replace(/"/g, '""') + '"');
            });
            rows.push(cells.join(','));
        });

        var csv = rows.join('\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('CSV exported successfully!', 'success');
    }

    var exportRegBtn = document.getElementById('exportRegBtn');
    if (exportRegBtn) exportRegBtn.addEventListener('click', function () { exportTableToCSV('registrationsTable', 'cems_registrations.csv'); });

    var exportMsgBtn = document.getElementById('exportMsgBtn');
    if (exportMsgBtn) exportMsgBtn.addEventListener('click', function () { exportTableToCSV('messagesTable', 'cems_messages.csv'); });

    /* ==========================================================
       ADMIN - Add Event → Firestore
       ========================================================== */
    var addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function () {
            openModal('Add New Event',
                '<div class="form-group"><label class="form-label">Event Name *</label><input type="text" class="form-input" id="newEventName" placeholder="Enter event name"></div>' +
                '<div class="form-group"><label class="form-label">Category</label><select class="form-select" id="newEventCategory"><option>Academic</option><option>Cultural</option><option>Sports</option><option>Workshop</option><option>Social</option></select></div>' +
                '<div class="form-group"><label class="form-label">Date & Time</label><input type="text" class="form-input" id="newEventDate" placeholder="e.g., April 15, 2026 • 10:00 AM"></div>' +
                '<div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" id="newEventLocation" placeholder="e.g., Main Auditorium"></div>' +
                '<div class="form-group"><label class="form-label">Capacity</label><input type="number" class="form-input" id="newEventCapacity" placeholder="Max attendees"></div>' +
                '<div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="newEventDesc" placeholder="Brief description..." rows="2"></textarea></div>' +
                '<button class="btn btn-primary" style="width: 100%;" id="saveNewEventBtn">Create Event in Firebase</button>'
            );

            setTimeout(function () {
                var saveBtn = document.getElementById('saveNewEventBtn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', async function () {
                        var name = document.getElementById('newEventName').value.trim();
                        if (!name) { showToast('Event name is required.', 'error'); return; }

                        saveBtn.disabled = true;
                        saveBtn.innerHTML = '<span class="spinner"></span> Creating...';

                        try {
                            await saveEvent({
                                name: name,
                                category: document.getElementById('newEventCategory').value,
                                date: document.getElementById('newEventDate').value,
                                location: document.getElementById('newEventLocation').value,
                                capacity: document.getElementById('newEventCapacity').value,
                                description: document.getElementById('newEventDesc').value,
                                status: 'Active',
                                emoji: '📅'
                            });

                            closeModal();
                            showToast('Event created in Firebase!', 'success');
                            loadEventsManageTable();
                        } catch (err) {
                            showToast('Error: ' + err.message, 'error');
                            saveBtn.disabled = false;
                            saveBtn.textContent = 'Create Event in Firebase';
                        }
                    });
                }
            }, 100);
        });
    }

    /* ==========================================================
       ADMIN LOGIN
       ========================================================== */
    var adminLoginOverlay = document.getElementById('adminLoginOverlay');
    var adminLoginForm = document.getElementById('adminLoginForm');
    var dashboardContent = document.getElementById('main-content') || document.querySelector('.dashboard-layout');

    /* Only run login logic if the login overlay exists (admin page) */
    if (adminLoginOverlay) {
        var LOGIN_SESSION_KEY = 'cems_admin_logged_in';
        var REMEMBER_KEY = 'cems_admin_remember';

        function showDashboard(adminName) {
            adminLoginOverlay.style.display = 'none';
            var mainEl = document.getElementById('main-content');
            if (mainEl) mainEl.style.display = '';
            /* Show admin badge in header */
            var badge = document.getElementById('adminUserBadge');
            if (badge) {
                badge.style.display = 'flex';
                badge.innerHTML = '<span aria-hidden="true">👤</span> Admin: ' + (adminName || 'Ummy');
            }
        }

        function showLogin() {
            adminLoginOverlay.style.display = 'flex';
            var mainEl = document.getElementById('main-content');
            if (mainEl) mainEl.style.display = 'none';
            /* Hide admin badge */
            var badge = document.getElementById('adminUserBadge');
            if (badge) badge.style.display = 'none';
        }

        /* Check if already logged in */
        var isLoggedIn = sessionStorage.getItem(LOGIN_SESSION_KEY) === 'true';
        var isRemembered = localStorage.getItem(REMEMBER_KEY) === 'true';
        var savedAdminName = sessionStorage.getItem('cems_admin_name') || localStorage.getItem('cems_admin_name') || 'Admin';

        if (isLoggedIn || isRemembered) {
            showDashboard(savedAdminName);
        } else {
            showLogin();
        }

        /* Handle login form submission — validates against Firestore */
        adminLoginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            var username = document.getElementById('adminUsername').value.trim();
            var password = document.getElementById('adminPassword').value;
            var remember = document.getElementById('adminRemember').checked;
            var generalError = document.getElementById('adminLoginGeneralError');
            var isValid = true;

            /* Validate inputs not empty */
            isValid = validateField(document.getElementById('adminUsername'), 'adminUsernameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('adminPassword'), 'adminPasswordError', function (v) { return v.length > 0; }) && isValid;

            if (!isValid) return;

            /* Disable button during auth */
            var loginBtn = document.getElementById('adminLoginBtn');
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<span class="spinner"></span> Authenticating...';
            }

            try {
                /* Query Firestore for matching admin credentials */
                var admin = await authenticateAdmin(username, password);

                if (admin) {
                    /* Success */
                    sessionStorage.setItem(LOGIN_SESSION_KEY, 'true');
                    sessionStorage.setItem('cems_admin_name', admin.fullName || admin.username);
                    if (remember) {
                        localStorage.setItem(REMEMBER_KEY, 'true');
                        localStorage.setItem('cems_admin_name', admin.fullName || admin.username);
                    }
                    if (generalError) generalError.style.display = 'none';
                    showDashboard(admin.fullName || admin.username);
                    showToast('Welcome back, ' + (admin.fullName || admin.username) + '! You are now logged in.', 'success');
                    addLogoutButton();
                } else {
                    /* Invalid credentials */
                    if (generalError) generalError.style.display = 'block';
                    document.getElementById('adminPassword').value = '';
                    document.getElementById('adminPassword').focus();
                    showToast('Invalid username or password. Please try again.', 'error');
                }
            } catch (err) {
                console.error('[CEMS] Login error:', err);
                if (generalError) {
                    generalError.style.display = 'block';
                    generalError.querySelector('div').textContent = 'Connection error: ' + err.message;
                }
                showToast('Error connecting to Firebase: ' + err.message, 'error');
            } finally {
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Sign In';
                }
            }
        });

        /* Add logout button to sidebar settings */
        function addLogoutButton() {
            var settingsNav = document.querySelector('.dashboard-sidebar .sidebar-menu:last-child');
            if (!settingsNav || document.getElementById('adminLogoutBtn')) return;

            var logoutItem = document.createElement('a');
            logoutItem.href = '#';
            logoutItem.className = 'sidebar-link';
            logoutItem.id = 'adminLogoutBtn';
            logoutItem.innerHTML = '<span aria-hidden="true">🚪</span> Logout';
            logoutItem.addEventListener('click', function (e) {
                e.preventDefault();
                sessionStorage.removeItem(LOGIN_SESSION_KEY);
                sessionStorage.removeItem('cems_admin_name');
                localStorage.removeItem(REMEMBER_KEY);
                localStorage.removeItem('cems_admin_name');
                showLogin();
                document.getElementById('adminUsername').value = '';
                document.getElementById('adminPassword').value = '';
                showToast('You have been logged out.', 'info');
            });
            settingsNav.appendChild(logoutItem);
        }

        /* If already logged in, add logout button on load */
        if (isLoggedIn || isRemembered) {
            setTimeout(addLogoutButton, 100);
        }
    }

    /* ==========================================================
       ESCAPE KEY - Close Modal
       ========================================================== */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeMobileNav();
        }
    });

    /* ==========================================================
       ADMIN - Auto-load overview on page load
       ========================================================== */
    if (document.getElementById('tab-overview')) {
        loadDashboardOverview();
    }

})();
