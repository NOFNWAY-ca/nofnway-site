// Bookmark tip — shared across all tool pages
function showBookmarkTip(btn) {
    var isMac = navigator.platform.toUpperCase().includes('MAC');
    var key = isMac ? '⌘D' : 'Ctrl+D';
    var orig = btn.textContent;
    btn.textContent = 'Press ' + key;
    setTimeout(function() { btn.textContent = orig; }, 3000);
}

// Privacy panel toggle — shared across all tool pages
function togglePrivacy() {
    var p = document.getElementById('privacy-panel');
    if (p) p.hidden = !p.hidden;
}

document.addEventListener('click', function(e) {
    var p = document.getElementById('privacy-panel');
    if (!p || p.hidden) return;
    if (!e.target.closest('.privacy-btn') && !e.target.closest('#privacy-panel')) {
        p.hidden = true;
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var p = document.getElementById('privacy-panel');
        if (p) p.hidden = true;
    }
});
