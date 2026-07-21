/* ============================================================
   CEMS - Campus Event Management System
   Main JavaScript File
   ============================================================
   Handles: Navigation, Form Validation, Event Filtering,
   Admin Dashboard Tabs, Table Search, Toast Notifications,
   Scroll Animations, and Page-Specific Logic.
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

        /* Close button listener */
        toast.querySelector('.toast-close').addEventListener('click', function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(function () { toast.remove(); }, 300);
        });

        /* Auto-dismiss after 5 seconds */
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

    /* Close mobile nav on link click */
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
        /* Fallback: show everything immediately */
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
       FORM VALIDATION - Registration Form
       ========================================================== */
    var registrationForm = document.getElementById('registrationForm');

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

    if (registrationForm) {
        registrationForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var isValid = true;

            /* Validate each required field */
            isValid = validateField(document.getElementById('regFirstName'), 'regFirstNameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('regLastName'), 'regLastNameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('regEmail'), 'regEmailError', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }) && isValid;
            isValid = validateField(document.getElementById('regPhone'), 'regPhoneError', function (v) { return v.length >= 7; }) && isValid;
            isValid = validateField(document.getElementById('regStudentId'), 'regStudentIdError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('regDepartment'), 'regDepartmentError', function (v) { return v !== ''; }) && isValid;
            isValid = validateField(document.getElementById('regYear'), 'regYearError', function (v) { return v !== ''; }) && isValid;
            isValid = validateField(document.getElementById('regEvent'), 'regEventError', function (v) { return v !== ''; }) && isValid;

            /* Terms checkbox */
            var termsCheckbox = document.getElementById('regTerms');
            var termsError = document.getElementById('regTermsError');
            if (!termsCheckbox.checked) {
                if (termsError) termsError.style.display = 'block';
                isValid = false;
            } else {
                if (termsError) termsError.style.display = 'none';
            }

            if (isValid) {
                /* Collect form data */
                var formData = {
                    firstName: document.getElementById('regFirstName').value,
                    lastName: document.getElementById('regLastName').value,
                    email: document.getElementById('regEmail').value,
                    phone: document.getElementById('regPhone').value,
                    studentId: document.getElementById('regStudentId').value,
                    department: document.getElementById('regDepartment').value,
                    year: document.getElementById('regYear').value,
                    event: document.getElementById('regEvent'),
                    requirements: document.getElementById('regRequirements').value
                };

                var eventSelect = document.getElementById('regEvent');
                var eventText = eventSelect.options[eventSelect.selectedIndex].text;

                /* Save to localStorage */
                var registrations = JSON.parse(localStorage.getItem('cems_registrations') || '[]');
                formData.id = 'REG-' + String(registrations.length + 1).padStart(3, '0');
                formData.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                formData.status = 'Confirmed';
                formData.eventName = eventText;
                registrations.push(formData);
                localStorage.setItem('cems_registrations', JSON.stringify(registrations));

                /* Show confirmation */
                registrationForm.style.display = 'none';
                var formCard = document.getElementById('registrationFormCard');
                if (formCard) formCard.style.display = 'none';

                var confirmation = document.getElementById('registrationConfirmation');
                if (confirmation) confirmation.style.display = 'block';

                var details = document.getElementById('confirmationDetails');
                if (details) {
                    details.innerHTML =
                        '<div class="detail-row"><span class="detail-label">Registration ID</span><span class="detail-value">' + formData.id + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">' + formData.firstName + ' ' + formData.lastName + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">' + formData.email + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Event</span><span class="detail-value">' + eventText + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Department</span><span class="detail-value">' + formData.department + '</span></div>' +
                        '<div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color: var(--success);">✓ Confirmed</span></div>';
                }

                showToast('Registration successful! Check your email for confirmation.', 'success');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showToast('Please fix the errors in the form.', 'error');
                /* Scroll to first error */
                var firstError = registrationForm.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });

        /* Real-time validation on blur */
        var requiredFields = registrationForm.querySelectorAll('[required]');
        requiredFields.forEach(function (field) {
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
       FORM VALIDATION - Contact Form
       ========================================================== */
    var contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var isValid = true;

            isValid = validateField(document.getElementById('contactName'), 'contactNameError', function (v) { return v.length > 0; }) && isValid;
            isValid = validateField(document.getElementById('contactEmail'), 'contactEmailError', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }) && isValid;
            isValid = validateField(document.getElementById('contactSubject'), 'contactSubjectError', function (v) { return v !== ''; }) && isValid;
            isValid = validateField(document.getElementById('contactMessage'), 'contactMessageError', function (v) { return v.length >= 20; }) && isValid;

            if (isValid) {
                var formData = {
                    name: document.getElementById('contactName').value,
                    email: document.getElementById('contactEmail').value,
                    subject: document.getElementById('contactSubject').value,
                    message: document.getElementById('contactMessage').value,
                    newsletter: document.getElementById('contactNewsletter').checked
                };

                /* Save to localStorage */
                var messages = JSON.parse(localStorage.getItem('cems_messages') || '[]');
                formData.id = 'MSG-' + String(messages.length + 1).padStart(3, '0');
                formData.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                formData.status = 'Unread';
                messages.push(formData);
                localStorage.setItem('cems_messages', JSON.stringify(messages));

                /* Show success */
                contactForm.reset();
                showToast('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
            } else {
                showToast('Please fix the errors in the form.', 'error');
                var firstError = contactForm.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
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
        /* Update sidebar active state */
        sidebarLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
        });

        /* Show/hide tab content */
        tabContents.forEach(function (content) {
            var isActive = content.id === 'tab-' + tabName;
            content.classList.toggle('active', isActive);
        });

        /* Close mobile sidebar if open */
        var dashSidebar = document.getElementById('dashboardSidebar');
        if (dashSidebar) dashSidebar.classList.remove('show');
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
            if (window.innerWidth <= 1024) {
                sidebarToggle.style.display = 'block';
            } else {
                sidebarToggle.style.display = 'none';
                dashSidebar.classList.remove('show');
            }
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

            if (countDisplay) {
                countDisplay.textContent = visibleCount;
            }
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

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (detailModal) {
        detailModal.addEventListener('click', function (e) {
            if (e.target === detailModal) closeModal();
        });
    }

    /* View buttons in tables */
    document.querySelectorAll('.table-action-btn[title="View"], .table-action-btn[aria-label*="View"], .table-action-btn[aria-label*="Read"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var row = btn.closest('tr');
            if (!row) return;
            var cells = row.querySelectorAll('td');
            var content = '<div style="display: flex; flex-direction: column; gap: var(--space-sm);">';
            cells.forEach(function (cell, i) {
                var header = document.querySelector('th:nth-child(' + (i + 1) + ')');
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

    /* Delete buttons */
    document.querySelectorAll('.table-action-btn[title="Delete"], .table-action-btn[aria-label*="Delete"]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (confirm('Are you sure you want to delete this item?')) {
                var row = btn.closest('tr');
                if (row) {
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                    row.style.transition = 'all 0.3s ease';
                    setTimeout(function () { row.remove(); }, 300);
                    showToast('Item deleted successfully.', 'success');
                }
            }
        });
    });

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
       ADMIN - Export CSV Functionality
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
    if (exportRegBtn) {
        exportRegBtn.addEventListener('click', function () {
            exportTableToCSV('registrationsTable', 'cems_registrations.csv');
        });
    }

    var exportMsgBtn = document.getElementById('exportMsgBtn');
    if (exportMsgBtn) {
        exportMsgBtn.addEventListener('click', function () {
            exportTableToCSV('messagesTable', 'cems_messages.csv');
        });
    }

    /* ==========================================================
       ADMIN - Add Event Button (placeholder action)
       ========================================================== */
    var addEventBtn = document.getElementById('addEventBtn');
    if (addEventBtn) {
        addEventBtn.addEventListener('click', function () {
            openModal('Add New Event',
                '<div class="form-group"><label class="form-label">Event Name</label><input type="text" class="form-input" placeholder="Enter event name"></div>' +
                '<div class="form-group"><label class="form-label">Category</label><select class="form-select"><option>Academic</option><option>Cultural</option><option>Sports</option><option>Workshop</option></select></div>' +
                '<div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input"></div>' +
                '<div class="form-group"><label class="form-label">Location</label><input type="text" class="form-input" placeholder="Enter location"></div>' +
                '<div class="form-group"><label class="form-label">Capacity</label><input type="number" class="form-input" placeholder="Max attendees"></div>' +
                '<button class="btn btn-primary" style="width: 100%;" onclick="CEMS.showToast(\'Event created successfully!\', \'success\'); document.getElementById(\'detailModal\').classList.remove(\'show\'); document.body.style.overflow=\'\';">Create Event</button>'
            );
        });
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

})();
