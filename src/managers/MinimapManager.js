import { CONSTANTS } from '../constants.js';

export class MinimapManager {
    constructor(editor) {
        this.editor = editor;
        this.minimap = document.getElementById('minimap');
        this.minimapViewport = document.getElementById('minimap-viewport');
        this.isVisible = true;
        
        // Toggle butonu için event listener
        const toggleButton = document.getElementById('toggleMinimap');
        if (toggleButton) {
            toggleButton.classList.add('active');
            toggleButton.addEventListener('click', () => this.toggleMinimap());
        }

        this.initializeEventListeners();
    }

    toggleMinimap() {
        this.isVisible = !this.isVisible;
        this.updateVisibility();
    }

    updateVisibility() {
        const toggleButton = document.getElementById('toggleMinimap');
        
        if (this.isVisible) {
            this.minimap.classList.remove('hidden');
            toggleButton?.classList.add('active');
        } else {
            this.minimap.classList.add('hidden');
            toggleButton?.classList.remove('active');
        }
    }

    initializeEventListeners() {
        this.minimap.addEventListener('click', this.handleClick.bind(this));
        this.minimap.addEventListener('mousedown', this.startDragging.bind(this));
        this.minimap.addEventListener('touchstart', this.startDragging.bind(this));
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('touchmove', this.handleDrag.bind(this), { passive: false });
        document.addEventListener('mouseup', this.stopDragging.bind(this));
        document.addEventListener('touchend', this.stopDragging.bind(this));
    }

    update() {
        // Clear previous minimap content
        while (this.minimap.firstChild) {
            this.minimap.removeChild(this.minimap.firstChild);
        }
        
        // Get dimensions
        const editorRect = this.editor.svg.getBoundingClientRect();
        const containerRect = this.editor.editorContainer.getBoundingClientRect();
        
        // Calculate scale for minimap
        const minimapScale = this.minimap.clientWidth / CONSTANTS.SVG_WIDTH;
        
        // Update viewport dimensions
        const viewportWidth = (containerRect.width / this.editor.currentScale) * minimapScale;
        const viewportHeight = (containerRect.height / this.editor.currentScale) * minimapScale;
        
        this.minimapViewport.style.width = viewportWidth + 'px';
        this.minimapViewport.style.height = viewportHeight + 'px';
        
        // Update viewport position
        const scrollLeftScaled = this.editor.editorContainer.scrollLeft / this.editor.currentScale;
        const scrollTopScaled = this.editor.editorContainer.scrollTop / this.editor.currentScale;
        
        this.minimapViewport.style.left = (scrollLeftScaled * minimapScale) + 'px';
        this.minimapViewport.style.top = (scrollTopScaled * minimapScale) + 'px';
        
        // Clone SVG content
        const svgClone = this.editor.svg.cloneNode(true);
        svgClone.style.transform = 'none';
        svgClone.setAttribute('width', this.minimap.clientWidth);
        svgClone.setAttribute('height', this.minimap.clientHeight);
        svgClone.style.transform = `scale(${minimapScale})`;
        svgClone.style.transformOrigin = 'top left';
        
        // Add minimap components
        this.minimap.appendChild(svgClone);
        this.minimap.appendChild(this.minimapViewport);
    }

    startDragging(evt) {
        this.isDragging = true;
        this.minimapStartX = evt.clientX || evt.touches[0].clientX;
        this.minimapStartY = evt.clientY || evt.touches[0].clientY;
    }

    handleDrag(evt) {
        if (this.isDragging) {
            evt.preventDefault();
            const clientX = evt.clientX || evt.touches[0].clientX;
            const clientY = evt.clientY || evt.touches[0].clientY;
            
            const minimapRect = this.minimap.getBoundingClientRect();
            const editorRect = this.editor.svg.getBoundingClientRect();
            const minimapScale = this.minimap.clientWidth / CONSTANTS.SVG_WIDTH;
            
            // Sınırları kontrol et
            let newScrollLeft = this.editor.editorContainer.scrollLeft + 
                (clientX - this.dragStartX) / minimapScale;
            let newScrollTop = this.editor.editorContainer.scrollTop + 
                (clientY - this.dragStartY) / minimapScale;
            
            // Minimum ve maximum scroll değerlerini hesapla
            const maxScrollX = this.editor.editorContainer.scrollWidth - 
                this.editor.editorContainer.clientWidth;
            const maxScrollY = this.editor.editorContainer.scrollHeight - 
                this.editor.editorContainer.clientHeight;
            
            // Sınırları uygula
            newScrollLeft = Math.max(0, Math.min(newScrollLeft, maxScrollX));
            newScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollY));
            
            // Smooth scroll efekti
            requestAnimationFrame(() => {
                this.editor.editorContainer.scrollLeft = newScrollLeft;
                this.editor.editorContainer.scrollTop = newScrollTop;
                
                this.dragStartX = clientX;
                this.dragStartY = clientY;
                
                this.update();
            });
        }
    }

    stopDragging() {
        if (this.isDragging) {
            this.isDragging = false;
            this.update();
        }
    }

    handleClick(evt) {
        const minimapRect = this.minimap.getBoundingClientRect();
        
        const clickX = evt.clientX - minimapRect.left;
        const clickY = evt.clientY - minimapRect.top;
        
        const minimapScale = this.minimap.clientWidth / CONSTANTS.SVG_WIDTH;
        
        const newScrollLeft = (clickX / minimapScale - this.editor.editorContainer.clientWidth / 
            (2 * this.editor.currentScale)) * this.editor.currentScale;
        const newScrollTop = (clickY / minimapScale - this.editor.editorContainer.clientHeight / 
            (2 * this.editor.currentScale)) * this.editor.currentScale;
        
        this.editor.editorContainer.scrollLeft = newScrollLeft;
        this.editor.editorContainer.scrollTop = newScrollTop;
        
        this.update();
    }

    updateViewport() {
        const minimapScale = this.minimap.clientWidth / CONSTANTS.SVG_WIDTH;
        const scrollLeftScaled = this.editor.editorContainer.scrollLeft / this.editor.currentScale;
        const scrollTopScaled = this.editor.editorContainer.scrollTop / this.editor.currentScale;
        
        this.minimapViewport.style.left = (scrollLeftScaled * minimapScale) + 'px';
        this.minimapViewport.style.top = (scrollTopScaled * minimapScale) + 'px';
    }
} 