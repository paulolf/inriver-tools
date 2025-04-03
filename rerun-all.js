'use strict';

// Check if we're on the correct page
function isCorrectPage() {
    return window.location.hash.includes('/connect/extension/manage/');
}

// Function to add the Rerun All button
function addRerunAllButton() {
    if (!isCorrectPage()) return;

    const queuedHeader = document.querySelector('.queued-header');
    if (!queuedHeader) {
        setTimeout(addRerunAllButton, 1000);
        return;
    }

    // Check if button already exists
    if (document.querySelector('#rerunAllBtn')) return;

    // Create the Rerun All button
    const rerunAllBtn = document.createElement('span');
    rerunAllBtn.id = 'rerunAllBtn';
    rerunAllBtn.className = 'content-area-tools extension-tool';
    rerunAllBtn.innerHTML = '<i class="fa fa-undo" title="Rerun All"></i>Rerun All';

    // Add click handler
    rerunAllBtn.addEventListener('click', rerunAllEvents);

    // Insert the button next to other queue buttons
    const buttonRefreshQueued = document.querySelector('#button-refresh-queued');
    if (buttonRefreshQueued) {
        buttonRefreshQueued.parentNode.insertBefore(rerunAllBtn, buttonRefreshQueued);
    }
}

// Function to rerun all events
async function rerunAllEvents() {
    const rerunLinks = Array.from(document.querySelectorAll('#extension-queued-grid .dx-link')).filter(link => link.textContent === 'Rerun');

    if (rerunLinks.length === 0) {
        alert('No queued events found to rerun!');
        return;
    }

    // Show loading state
    const rerunAllBtn = document.querySelector('#rerunAllBtn');
    const originalHtml = rerunAllBtn.innerHTML;
    rerunAllBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i>Rerunning (0/${rerunLinks.length})`;
    rerunAllBtn.style.pointerEvents = 'none';

    try {
        // Click each rerun link with a small delay
        for (let i = 0; i < rerunLinks.length; i++) {
            rerunLinks[i].click();
            rerunAllBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i>Rerunning (${i + 1}/${rerunLinks.length})`;
            await new Promise(resolve => setTimeout(resolve, 250));
        }
    } finally {
        // Restore button state
        rerunAllBtn.innerHTML = originalHtml;
        rerunAllBtn.style.pointerEvents = 'auto';

        // Refresh the grid after all updates
        const refreshQueuedButton = document.querySelector('#button-refresh-queued');
        if (refreshQueuedButton) {
            refreshQueuedButton.click();
        }
    }
}

// Handle hash changes for SPA navigation
window.addEventListener('hashchange', addRerunAllButton);

// Add the button when the page loads and monitor for dynamic content
function init() {
    addRerunAllButton();

    // Watch for dynamic content changes
    const observer = new MutationObserver(() => {
        if (!document.querySelector('#rerunAllBtn') && isCorrectPage()) {
            addRerunAllButton();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
