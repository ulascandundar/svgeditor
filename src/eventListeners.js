export function initializeEventListeners(editor) {
    // Keyboard events
    document.addEventListener('keydown', (evt) => {
        if (evt.key === 'Escape') {
            editor.selectionManager.deselectAll();
        } else if (editor.selectionManager.hasSelection()) {
            handleKeyboardShortcuts(evt, editor);
        }
    });

    // Mouse events for SVG editor
    editor.svg.addEventListener('mousedown', (evt) => {
        if (editor.mode === 'wall') {
            if (evt.target.classList.contains('wall')) {
                editor.wallManager.startDragging(evt);
            } else {
                editor.wallManager.startDrawing(evt);
            }
        } else if (editor.mode === 'select') {
            if (evt.target === editor.svg) {
                editor.selectionManager.startSelection(evt);
            }
        }
    });

    editor.svg.addEventListener('mousemove', (evt) => {
        if (editor.mode === 'wall') {
            if (editor.wallManager.draggedWall) {
                editor.wallManager.continueDragging(evt);
            } else if (editor.wallManager.isDrawing) {
                editor.wallManager.continueDrawing(evt);
            }
        } else if (editor.mode === 'select' && editor.selectionManager.isSelecting) {
            editor.selectionManager.updateSelection(evt);
        }
    });

    editor.svg.addEventListener('mouseup', () => {
        if (editor.mode === 'wall') {
            if (editor.wallManager.draggedWall) {
                editor.wallManager.finishDragging();
            } else {
                editor.wallManager.finishDrawing();
                editor.setMode('select');
            }
        } else if (editor.mode === 'select') {
            editor.selectionManager.finishSelection();
        }
    });

    // Editor container scroll event
    editor.editorContainer.addEventListener('scroll', () => {
        editor.minimapManager.update();
    });

    // Window resize event
    window.addEventListener('resize', () => {
        editor.minimapManager.update();
    });

    // Zoom with mouse wheel
    editor.editorContainer.addEventListener('wheel', (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.deltaY < 0) {
                editor.zoomIn();
            } else {
                editor.zoomOut();
            }
        }
    }, { passive: false });

    // Button click handlers
    const buttonHandlers = {
        'addTable': () => editor.tableManager.addTable(),
        'bulkTableBtn': () => showBulkTableModal(),
        'addWall': () => {
            editor.setMode('wall');
            editor.selectionManager.deselectAll();
        },
        'addKitchen': () => editor.kitchenManager.addKitchen(),
        'addBar': () => editor.barManager.addBar(),
        'deleteSelected': () => editor.selectionManager.deleteSelected(),
        'saveLayout': () => editor.saveLayout(),
        'select': () => editor.setMode('select'),
        'zoomIn': () => editor.zoomIn(),
        'zoomOut': () => editor.zoomOut(),
        'cancelBulkTable': () => closeBulkTableModal(),
        'confirmBulkTable': () => addBulkTables(editor)
    };

    // Attach event listeners to buttons
    Object.entries(buttonHandlers).forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        } else {
            console.warn(`Button with id '${id}' not found`);
        }
    });
}

function handleKeyboardShortcuts(evt, editor) {
    evt.preventDefault();
    
    switch (evt.key) {
        case 'ArrowLeft':
            editor.selectionManager.moveSelected(-5, 0);
            break;
        case 'ArrowRight':
            editor.selectionManager.moveSelected(5, 0);
            break;
        case 'ArrowUp':
            editor.selectionManager.moveSelected(0, -5);
            break;
        case 'ArrowDown':
            editor.selectionManager.moveSelected(0, 5);
            break;
        case 'Enter':
            editor.selectionManager.rotateSelected();
            break;
        case 'Delete':
        case 'Backspace':
            editor.selectionManager.deleteSelected();
            break;
        case '+':
            if (evt.ctrlKey || evt.metaKey) {
                editor.zoomIn();
            }
            break;
        case '-':
            if (evt.ctrlKey || evt.metaKey) {
                editor.zoomOut();
            }
            break;
    }
}

// Modal related functions
function showBulkTableModal() {
    document.getElementById('bulkTableModal').style.display = 'flex';
}

export function closeBulkTableModal() {
    document.getElementById('bulkTableModal').style.display = 'none';
}

export function addBulkTables(editor) {
    const horizontalCount = parseInt(document.getElementById('horizontalTables').value);
    const verticalCount = parseInt(document.getElementById('verticalTables').value);
    
    editor.tableManager.addBulkTables(horizontalCount, verticalCount);
    closeBulkTableModal();
} 