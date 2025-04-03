function shouldRunScript() {
    const currentUrl = window.location.href;
    // Don't run when viewing a specific extension's management page
    if (currentUrl.match(/\/connect\/extension\/manage\/[^/]+$/)) {
        return false;
    }
    return true;
}

function getAreaAndEnv() {
    const currentUrl = window.location.href;
    const match = currentUrl.match(/Area\/([^/]+)\/([^/#]+)/);
    if (!match) {
        throw new Error('Could not find Area/Environment in URL');
    }
    return {
        area: match[1],
        env: match[2]
    };
}

function buildExtensionUrl(extensionName, area, env) {
    if (!extensionName || !area || !env) {
        throw new Error('Missing required parameters for URL construction');
    }
    return `${window.location.origin}/Area/${area}/${env}#/connect/extension/manage/${extensionName}`;
}

function ensureColumnWidth() {
    const tables = document.querySelectorAll('.dx-datagrid-table');
    tables.forEach(table => {
        const colgroup = table.querySelector('colgroup');
        if (colgroup) {
            const existingCol = Array.from(colgroup.children).find(col => 
                col.getAttribute('data-open-column') === 'true'
            );
            
            if (!existingCol) {
                const col = document.createElement('col');
                col.setAttribute('data-open-column', 'true');
                col.style.width = '60px';
                colgroup.appendChild(col);

                // Add header cell if this is a header table
                if (table.closest('.dx-datagrid-headers')) {
                    const headerRow = table.querySelector('.dx-header-row');
                    if (headerRow) {
                        const headerCell = document.createElement('td');
                        headerCell.setAttribute('role', 'columnheader');
                        headerCell.setAttribute('aria-colindex', (headerRow.children.length + 1).toString());
                        headerCell.className = 'dx-cell-focus-disabled dx-datagrid-drag-action';
                        headerCell.style.textAlign = 'left';
                        headerCell.style.width = '60px'; // Ensure consistent width
                        
                        const textContent = document.createElement('div');
                        textContent.className = 'dx-datagrid-text-content';
                        textContent.setAttribute('role', 'presentation');
                        textContent.textContent = 'Open';
                        
                        headerCell.appendChild(textContent);
                        headerRow.appendChild(headerCell);
                    }
                }
            }
        }
    });
}

function addOpenButtons() {
    // Check if we should run the script
    if (!shouldRunScript()) {
        return;
    }

    console.log('Adding open buttons...');
    
    // Only run on extension management page
    if (!window.location.hash.includes('/connect/extension')) {
        console.log('Not on extension page, skipping');
        return;
    }

    const rows = document.querySelectorAll('.dx-data-row');
    if (!rows.length) {
        console.log('No rows found yet');
        return;
    }

    rows.forEach(row => {
        // Skip if we already added a button to this row
        if (row.querySelector('[data-new-open-button]')) {
            return;
        }

        // Get extension name from the first cell's input
        const extensionNameInput = row.querySelector('td:first-child .dx-texteditor-input');
        if (!extensionNameInput || !extensionNameInput.value) {
            console.log('Could not find extension name input or value is empty');
            return;
        }

        const extensionName = extensionNameInput.value.trim();
        if (!extensionName) {
            console.log('Extension name is empty');
            return;
        }

        // Create Open cell
        const openCell = document.createElement('td');
        openCell.className = 'dx-cell-focus-disabled';
        openCell.setAttribute('role', 'gridcell');
        
        const openLink = document.createElement('a');
        openLink.setAttribute('data-new-open-button', 'true');
        openLink.className = 'dx-link';
        openLink.textContent = 'Open';
        openLink.href = '#';
        openLink.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();

            try {
                const { area, env } = getAreaAndEnv();
                const finalUrl = buildExtensionUrl(extensionName, area, env);
                window.open(finalUrl, '_blank');
            } catch (err) {
                console.error('Error opening extension:', err.message);
            }
        };

        openCell.appendChild(openLink);
        row.appendChild(openCell);
    });

    ensureColumnWidth();
}

// Initialize when DOM is ready
function initialize() {
    console.log('Initializing extension...');
    
    // Check if we should run the script
    if (!shouldRunScript()) {
        return;
    }

    // Initial run
    addOpenButtons();

    // Watch for grid changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('dx-datagrid-content') ||
                mutation.target.classList.contains('dx-datagrid-table')) {
                addOpenButtons();
            }
        });
    });

    // Start observing the grid
    const grid = document.querySelector('.dx-datagrid');
    if (grid) {
        observer.observe(grid, {
            childList: true,
            subtree: true
        });
        console.log('Grid observer started');
    } else {
        console.log('Grid not found yet, will retry');
        setTimeout(initialize, 1000);
    }
}

// Start initialization when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Run when URL changes
window.addEventListener('hashchange', () => {
    console.log('URL changed, checking if script should run...');
    if (shouldRunScript()) {
        setTimeout(addOpenButtons, 1000);
    }
});