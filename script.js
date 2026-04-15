// Language switching functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get current language from URL path or default to 'en'
    const currentPagePath = window.location.pathname + window.location.href;
    let currentLanguage = 'en';
    
    if (currentPagePath.includes('index-ja')) {
        currentLanguage = 'ja';
    } else if (currentPagePath.includes('index-zh')) {
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
});

// Navigate to different language versions
function switchLanguage(lang) {
    // Get the directory of the current file
    const currentPath = window.location.pathname;
    const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    
    let targetFile = 'index.html';
    if (lang === 'ja') {
        targetFile = 'index-ja.html';
    } else if (lang === 'zh') {
        targetFile = 'index-zh.html';
    }
    
    window.location.href = dirPath + targetFile;
}
