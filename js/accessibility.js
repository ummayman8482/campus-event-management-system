/* ============================================================
   CEMS - Campus Event Management System
   Accessibility JavaScript File
   ============================================================
   Handles: Dark/Light Theme Toggle, Font Size Adjustment (A+/A-),
   Voice Reader (Text-to-Speech), and Google Translate init.
   All preferences are saved to localStorage for persistence.
   ============================================================ */

(function () {
    'use strict';

    /* ==========================================================
       STORAGE KEYS
       ========================================================== */
    var THEME_KEY = 'cems_theme';
    var FONT_SIZE_KEY = 'cems_font_size';

    /* Default values */
    var DEFAULT_FONT_SIZE = 16;
    var MIN_FONT_SIZE = 12;
    var MAX_FONT_SIZE = 24;
    var FONT_STEP = 2;

    /* ==========================================================
       DARK / LIGHT THEME TOGGLE
       ========================================================== */
    var themeToggle = document.getElementById('themeToggle');
    var themeIcon = themeToggle ? themeToggle.querySelector('.theme-toggle-icon') : null;

    /**
     * Apply the given theme to the document
     * @param {string} theme - 'light' or 'dark'
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        /* Update button state */
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
            themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }

        /* Update icon */
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }

        /* Save preference */
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {
            /* localStorage not available */
        }
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    }

    /* Bind toggle button */
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    /* Load saved theme on page load */
    (function initTheme() {
        var saved = null;
        try {
            saved = localStorage.getItem(THEME_KEY);
        } catch (e) { /* ignore */ }

        /* If no saved preference, check system preference */
        if (!saved) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                saved = 'dark';
            } else {
                saved = 'light';
            }
        }

        applyTheme(saved);
    })();

    /* Listen for system theme changes */
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            /* Only auto-switch if user hasn't manually set a preference */
            var saved = null;
            try { saved = localStorage.getItem(THEME_KEY); } catch (ex) { /* ignore */ }
            if (!saved) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /* ==========================================================
       FONT SIZE ADJUSTMENT (A+ / A-)
       ========================================================== */
    var fontIncrease = document.getElementById('fontIncrease');
    var fontDecrease = document.getElementById('fontDecrease');

    /**
     * Set the document font size
     * @param {number} size - Font size in pixels
     */
    function setFontSize(size) {
        /* Clamp to min/max */
        size = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size));
        document.documentElement.style.fontSize = size + 'px';

        /* Update ARIA labels to reflect current size */
        if (fontIncrease) {
            fontIncrease.setAttribute('aria-label', 'Increase font size (currently ' + size + 'px)');
        }
        if (fontDecrease) {
            fontDecrease.setAttribute('aria-label', 'Decrease font size (currently ' + size + 'px)');
        }

        /* Save preference */
        try {
            localStorage.setItem(FONT_SIZE_KEY, String(size));
        } catch (e) { /* ignore */ }
    }

    /**
     * Increase font size by one step
     */
    function increaseFontSize() {
        var current = parseInt(document.documentElement.style.fontSize) || DEFAULT_FONT_SIZE;
        setFontSize(current + FONT_STEP);

        /* Show feedback toast */
        if (window.CEMS && window.CEMS.showToast) {
            var newSize = Math.min(MAX_FONT_SIZE, current + FONT_STEP);
            window.CEMS.showToast('Font size: ' + newSize + 'px', 'info');
        }
    }

    /**
     * Decrease font size by one step
     */
    function decreaseFontSize() {
        var current = parseInt(document.documentElement.style.fontSize) || DEFAULT_FONT_SIZE;
        setFontSize(current - FONT_STEP);

        if (window.CEMS && window.CEMS.showToast) {
            var newSize = Math.max(MIN_FONT_SIZE, current - FONT_STEP);
            window.CEMS.showToast('Font size: ' + newSize + 'px', 'info');
        }
    }

    /* Bind font size buttons */
    if (fontIncrease) fontIncrease.addEventListener('click', increaseFontSize);
    if (fontDecrease) fontDecrease.addEventListener('click', decreaseFontSize);

    /* Load saved font size */
    (function initFontSize() {
        var saved = null;
        try {
            saved = localStorage.getItem(FONT_SIZE_KEY);
        } catch (e) { /* ignore */ }

        if (saved) {
            setFontSize(parseInt(saved));
        }
    })();

    /* ==========================================================
       VOICE READER (Web Speech API - Text-to-Speech)
       ========================================================== */
    var voiceToggle = document.getElementById('voiceToggle');
    var voiceDropdown = document.getElementById('voiceDropdown');
    var voiceRead = document.getElementById('voiceRead');
    var voicePause = document.getElementById('voicePause');
    var voiceResume = document.getElementById('voiceResume');
    var voiceStop = document.getElementById('voiceStop');

    var synth = window.speechSynthesis || null;
    var currentUtterance = null;
    var isSpeaking = false;

    /**
     * Toggle the voice reader dropdown menu
     */
    function toggleVoiceDropdown() {
        var isExpanded = voiceToggle.getAttribute('aria-expanded') === 'true';
        voiceToggle.setAttribute('aria-expanded', String(!isExpanded));
        voiceDropdown.classList.toggle('show');
    }

    /**
     * Get the text content of the main content area
     * Strips out script, style, nav, and footer elements
     * @returns {string}
     */
    function getPageText() {
        var main = document.getElementById('main-content');
        if (!main) return document.body.innerText;

        /* Clone the main element to avoid modifying the DOM */
        var clone = main.cloneNode(true);

        /* Remove non-content elements */
        var removeSelectors = 'script, style, nav, .skip-link, .sr-only, .header-actions, .hamburger, .mobile-overlay';
        clone.querySelectorAll(removeSelectors).forEach(function (el) { el.remove(); });

        return clone.innerText || clone.textContent || '';
    }

    /**
     * Start reading the page content aloud
     */
    function startReading() {
        if (!synth) {
            if (window.CEMS && window.CEMS.showToast) {
                window.CEMS.showToast('Speech synthesis is not supported in this browser.', 'error');
            }
            return;
        }

        /* Cancel any ongoing speech */
        synth.cancel();

        var text = getPageText();
        if (!text || text.trim().length === 0) {
            if (window.CEMS && window.CEMS.showToast) {
                window.CEMS.showToast('No content to read.', 'info');
            }
            return;
        }

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 1.0;
        currentUtterance.pitch = 1.0;
        currentUtterance.volume = 1.0;
        currentUtterance.lang = 'en-US';

        /* Try to use a natural-sounding voice */
        var voices = synth.getVoices();
        var preferred = voices.find(function (v) {
            return v.lang.startsWith('en') && v.name.indexOf('Natural') !== -1;
        }) || voices.find(function (v) {
            return v.lang.startsWith('en');
        });
        if (preferred) currentUtterance.voice = preferred;

        currentUtterance.onstart = function () {
            isSpeaking = true;
            if (window.CEMS && window.CEMS.showToast) {
                window.CEMS.showToast('Reading page content...', 'info');
            }
        };

        currentUtterance.onend = function () {
            isSpeaking = false;
        };

        currentUtterance.onerror = function () {
            isSpeaking = false;
        };

        synth.speak(currentUtterance);
    }

    /**
     * Pause the speech
     */
    function pauseReading() {
        if (synth && synth.speaking && !synth.paused) {
            synth.pause();
            if (window.CEMS && window.CEMS.showToast) {
                window.CEMS.showToast('Reading paused.', 'info');
            }
        }
    }

    /**
     * Resume the speech
     */
    function resumeReading() {
        if (synth && synth.paused) {
            synth.resume();
            if (window.CEMS && window.CEMS.showToast) {
                window.CEMS.showToast('Reading resumed.', 'info');
            }
        }
    }

    /**
     * Stop the speech completely
     */
    function stopReading() {
        if (synth) {
            synth.cancel();
            isSpeaking = false;
            if (window.CEMS && window.CEMS.showToast) {
                window.CEMS.showToast('Reading stopped.', 'info');
            }
        }
    }

    /* Bind voice reader buttons */
    if (voiceToggle) voiceToggle.addEventListener('click', toggleVoiceDropdown);
    if (voiceRead) voiceRead.addEventListener('click', function () { startReading(); voiceDropdown.classList.remove('show'); });
    if (voicePause) voicePause.addEventListener('click', function () { pauseReading(); voiceDropdown.classList.remove('show'); });
    if (voiceResume) voiceResume.addEventListener('click', function () { resumeReading(); voiceDropdown.classList.remove('show'); });
    if (voiceStop) voiceStop.addEventListener('click', function () { stopReading(); voiceDropdown.classList.remove('show'); });

    /* Close voice dropdown when clicking outside */
    document.addEventListener('click', function (e) {
        if (voiceDropdown && voiceDropdown.classList.contains('show')) {
            var wrapper = document.querySelector('.voice-reader-wrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                voiceDropdown.classList.remove('show');
                voiceToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    /* Load voices (some browsers need this) */
    if (synth) {
        /* Chrome loads voices asynchronously */
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = function () { /* voices loaded */ };
        }
    }

    /* ==========================================================
       GOOGLE TRANSLATE INITIALIZATION
       ========================================================== */
    /* This function is called by the Google Translate script on load.
       It creates the widget in a hidden container so it reads the
       googtrans cookie and translates the page automatically. */
    window.googleTranslateElementInit = function () {
        if (typeof google !== 'undefined' && google.translate) {
            try {
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,es,fr,de,zh,ar,hi,ja,ko,pt,ru,it,nl,sv,pl,tr,vi,th,id,ms,sw,bn,ur',
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false
                }, 'google_translate_element');
            } catch (e) {
                /* Google Translate failed to initialize */
            }
        }
    };

    /* ==========================================================
       CUSTOM LANGUAGE SELECTOR
       ========================================================== */
    var LANG_KEY = 'cems_lang';
    var langToggle = document.getElementById('langToggle');
    var langDropdown = document.getElementById('langDropdown');

    /**
     * Toggle the language dropdown open/closed
     */
    function toggleLangDropdown() {
        var isExpanded = langToggle.getAttribute('aria-expanded') === 'true';
        langToggle.setAttribute('aria-expanded', String(!isExpanded));
        langDropdown.classList.toggle('show');
    }

    /**
     * Set a cookie
     * @param {string} name
     * @param {string} value
     * @param {number} days - Days until expiry (negative to delete)
     */
    function setCookie(name, value, days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
        document.cookie = cookie;
    }

    /**
     * Read a cookie by name
     * @param {string} name
     * @returns {string|null}
     */
    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    /**
     * Translate the page to the given language using Google Translate cookie
     * @param {string} lang - Target language code (e.g. 'en', 'fr', 'ar')
     */
    function translatePage(lang) {
        if (lang === 'en') {
            /* Going back to English - delete the googtrans cookie */
            setCookie('googtrans', '', -1);
            try {
                localStorage.removeItem(LANG_KEY);
            } catch (e) { /* ignore */ }
        } else {
            /* Set the Google Translate cookie: /source_lang/target_lang */
            setCookie('googtrans', '/en/' + lang, 365);
            /* Save preference */
            try {
                localStorage.setItem(LANG_KEY, lang);
            } catch (e) { /* ignore */ }
        }

        /* Full page navigation so Google Translate re-reads the cookie */
        window.location.href = window.location.pathname + window.location.search;
    }

    /**
     * Update the active state of language buttons
     * @param {string} activeLang
     */
    function setActiveLang(activeLang) {
        var buttons = langDropdown.querySelectorAll('[data-lang]');
        buttons.forEach(function (btn) {
            if (btn.getAttribute('data-lang') === activeLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /* Bind language toggle button */
    if (langToggle) {
        langToggle.addEventListener('click', toggleLangDropdown);
    }

    /* Bind language dropdown button clicks */
    if (langDropdown) {
        langDropdown.querySelectorAll('[data-lang]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var lang = btn.getAttribute('data-lang');
                translatePage(lang);
            });
        });
    }

    /* Close language dropdown when clicking outside */
    document.addEventListener('click', function (e) {
        if (langDropdown && langDropdown.classList.contains('show')) {
            var wrapper = document.querySelector('.language-selector');
            if (wrapper && !wrapper.contains(e.target)) {
                langDropdown.classList.remove('show');
                langToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    /* Escape key closes language dropdown */
    (function () {
        var existingHandler = document.addEventListener;
        /* We add language close to the existing Escape handler below */
    })();

    /* Load saved language on page load */
    (function initLanguage() {
        var savedLang = null;
        try {
            savedLang = localStorage.getItem(LANG_KEY);
        } catch (e) { /* ignore */ }

        /* Check the Google Translate cookie too */
        var googTrans = getCookie('googtrans');
        if (googTrans) {
            var parts = googTrans.split('/');
            if (parts.length === 3) {
                savedLang = parts[2];
            }
        }

        if (savedLang && langDropdown) {
            setActiveLang(savedLang);
        }
    })();

    /* ==========================================================
       KEYBOARD ACCESSIBILITY ENHANCEMENTS
       ========================================================== */

    /* Allow Enter/Space to activate nav links with role="button" */
    document.querySelectorAll('.sidebar-link[role="button"]').forEach(function (link) {
        link.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click();
            }
        });
    });

    /* Escape key closes dropdowns and modals */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            /* Close voice dropdown */
            if (voiceDropdown && voiceDropdown.classList.contains('show')) {
                voiceDropdown.classList.remove('show');
                voiceToggle.setAttribute('aria-expanded', 'false');
                voiceToggle.focus();
            }
            /* Close language dropdown */
            if (langDropdown && langDropdown.classList.contains('show')) {
                langDropdown.classList.remove('show');
                langToggle.setAttribute('aria-expanded', 'false');
                langToggle.focus();
            }
        }
    });

    /* ==========================================================
       PREFERS-REDUCED-MOTION SUPPORT
       ========================================================== */
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        /* User prefers reduced motion - disable animations */
        document.documentElement.style.setProperty('--transition-fast', '0ms');
        document.documentElement.style.setProperty('--transition-base', '0ms');
        document.documentElement.style.setProperty('--transition-slow', '0ms');

        /* Show all scroll-animated elements immediately */
        document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
            el.classList.add('visible');
        });
    }

})();
