import { TableManager } from './managers/TableManager.js';
import { WallManager } from './managers/WallManager.js';
import { KitchenManager } from './managers/KitchenManager.js';
import { BarManager } from './managers/BarManager.js';
import { MinimapManager } from './managers/MinimapManager.js';
import { SelectionManager } from './managers/SelectionManager.js';
import { CONSTANTS } from './constants.js';

export class Editor {
    constructor() {
        // DOM Elements
        this.svg = document.getElementById('editor');
        this.editorContainer = document.getElementById('editor-container');
        
        // Editor state
        this.mode = 'select';
        this.currentScale = 1;
        
        // Initialize managers
        this.tableManager = new TableManager(this);
        this.wallManager = new WallManager(this);
        this.kitchenManager = new KitchenManager(this);
        this.barManager = new BarManager(this);
        this.minimapManager = new MinimapManager(this);
        this.selectionManager = new SelectionManager(this);

        // Initialize zoom event listener
        this.initializeZoom();
    }

    setMode(newMode) {
        this.mode = newMode;
        this.selectionManager.deselectAll();
    }

    // Zoom methods
    zoomIn() {
        if (this.currentScale < CONSTANTS.MAX_SCALE) {
            this.currentScale = Math.min(this.currentScale + CONSTANTS.SCALE_STEP, CONSTANTS.MAX_SCALE);
            this.applyZoom();
        }
    }

    zoomOut() {
        if (this.currentScale > CONSTANTS.MIN_SCALE) {
            this.currentScale = Math.max(this.currentScale - CONSTANTS.SCALE_STEP, CONSTANTS.MIN_SCALE);
            this.applyZoom();
        }
    }

    applyZoom() {
        this.updateSvgTransform();
        this.updateSvgDimensions();
        this.updateScrollPosition();
        this.minimapManager.update();
    }

    updateSvgTransform() {
        this.svg.style.transform = `scale(${this.currentScale})`;
        this.svg.style.transformOrigin = 'top left';
    }

    updateSvgDimensions() {
        const zoomedWidth = CONSTANTS.SVG_WIDTH * this.currentScale;
        const zoomedHeight = CONSTANTS.SVG_HEIGHT * this.currentScale;
        
        this.svg.style.width = `${zoomedWidth}px`;
        this.svg.style.height = `${zoomedHeight}px`;
    }

    updateScrollPosition() {
        const containerRect = this.editorContainer.getBoundingClientRect();
        const scrollRatios = this.calculateScrollRatios(containerRect);
        const newScrollPositions = this.calculateNewScrollPositions(containerRect, scrollRatios);
        
        this.applyNewScrollPositions(newScrollPositions);
    }

    calculateScrollRatios(containerRect) {
        return {
            x: this.editorContainer.scrollLeft / 
               (this.editorContainer.scrollWidth - containerRect.width),
            y: this.editorContainer.scrollTop / 
               (this.editorContainer.scrollHeight - containerRect.height)
        };
    }

    calculateNewScrollPositions(containerRect, ratios) {
        const maxScrollX = this.editorContainer.scrollWidth - containerRect.width;
        const maxScrollY = this.editorContainer.scrollHeight - containerRect.height;
        
        return {
            x: maxScrollX * ratios.x,
            y: maxScrollY * ratios.y
        };
    }

    applyNewScrollPositions(positions) {
        this.editorContainer.scrollLeft = positions.x;
        this.editorContainer.scrollTop = positions.y;
    }

    initializeZoom() {
        this.editorContainer.addEventListener('wheel', (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                
                if (event.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        }, { passive: false });
    }

    // Layout methods
    saveLayout() {
        const layout = {
            tables: this.tableManager.getTables(),
            walls: this.wallManager.getWalls(),
            kitchens: this.kitchenManager.getKitchens(),
            bars: this.barManager.getBars()
        };

        localStorage.setItem('restaurantLayout', JSON.stringify(layout));
        alert('Layout saved!');
    }

    loadLayout() {
        const savedLayout = localStorage.getItem('restaurantLayout');
        if (savedLayout) {
            const layout = JSON.parse(savedLayout);
            
            // Clear current layout
            this.svg.innerHTML = '';
            
            // Load each element type
            this.tableManager.loadTables(layout.tables);
            this.wallManager.loadWalls(layout.walls);
            this.kitchenManager.loadKitchens(layout.kitchens);
            this.barManager.loadBars(layout.bars);
            
            // Update minimap
            this.minimapManager.update();
        }
    }

    // Mouse position helper
    getMousePosition(evt) {
        const CTM = this.svg.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    // Element creation helper
    createSVGElement(type) {
        return document.createElementNS("http://www.w3.org/2000/svg", type);
    }
} 