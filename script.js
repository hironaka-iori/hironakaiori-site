// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get current language from URL path or default to 'en'
    const currentPagePath = window.location.pathname + window.location.href;
    let currentLanguage = 'en';
    
    if (currentPagePath.includes('-ja')) {
        currentLanguage = 'ja';
    } else if (currentPagePath.includes('-zh')) {
        currentLanguage = 'zh';
    }
    
    // Update active language switcher
    document.querySelectorAll('.language-switcher a').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLangLink = document.querySelector(`[data-lang="${currentLanguage}"]`);
    if (activeLangLink) {
        activeLangLink.classList.add('active');
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navbar = document.querySelector('.navbar');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isOpen = navbar.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.navbar-menu a').forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close mobile menu when clicking on language switcher links
    document.querySelectorAll('.language-switcher a').forEach(link => {
        link.addEventListener('click', function() {
            navbar.classList.remove('open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close mobile menu when pressing Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbar.classList.contains('open')) {
            navbar.classList.remove('open');
            if (menuToggle) {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();
            }
        }
    });
});

// Navigate to different language versions
function switchLanguage(lang) {
    // Get the directory of the current file
    const currentPath = window.location.pathname;
    const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    // Determine current page type  
    let pageType = 'index.html';
    if (currentPath.includes('about-me')) {
        pageType = 'about-me.html';
    } else if (currentPath.includes('projects')) {
        pageType = 'projects.html';
    }
    
    let targetFile = pageType;
    if (lang === 'ja') {
        targetFile = pageType.replace('.html', '-ja.html');
    } else if (lang === 'zh') {
        targetFile = pageType.replace('.html', '-zh.html');
    }
    
    window.location.href = dirPath + targetFile;
}
