// Main application initializer
import { Editor } from './editor.js';
import { initializeEventListeners } from './eventListeners.js';

document.addEventListener('DOMContentLoaded', () => {
    const editor = new Editor();
    initializeEventListeners(editor);
    editor.loadLayout();
    editor.minimapManager.update();
}); 