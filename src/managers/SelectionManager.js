import { getCurrentRotation } from '../utils/helpers.js';

export class SelectionManager {
    constructor(editor) {
        this.editor = editor;
        this.selectedElements = new Set();
        this.isDragging = false;
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
    }
    
    startSelection(evt) {
        if (this.editor.mode === 'select') {
            this.isSelecting = true;
            const point = this.editor.getMousePosition(evt);
            this.startX = point.x;
            this.startY = point.y;
            
            // Create selection area
            this.selectionArea = this.editor.createSVGElement("rect");
            this.selectionArea.setAttribute('class', 'selection-area');
            this.selectionArea.setAttribute('x', point.x);
            this.selectionArea.setAttribute('y', point.y);
            this.selectionArea.setAttribute('width', 0);
            this.selectionArea.setAttribute('height', 0);
            this.selectionArea.setAttribute('fill', 'rgba(0, 123, 255, 0.2)');
            this.selectionArea.setAttribute('stroke', 'rgba(0, 123, 255, 0.5)');
            this.selectionArea.setAttribute('stroke-width', '1');
            
            this.editor.svg.appendChild(this.selectionArea);
        }
    }

    updateSelection(evt) {
        if (this.isSelecting && this.selectionArea) {
            const point = this.editor.getMousePosition(evt);
            
            // Calculate selection area dimensions
            const width = point.x - this.startX;
            const height = point.y - this.startY;
            
            // Correction for negative values
            const x = width < 0 ? point.x : this.startX;
            const y = height < 0 ? point.y : this.startY;
            const w = Math.abs(width);
            const h = Math.abs(height);
            
            // Update selection area
            this.selectionArea.setAttribute('x', x);
            this.selectionArea.setAttribute('y', y);
            this.selectionArea.setAttribute('width', w);
            this.selectionArea.setAttribute('height', h);
        }
    }

    finishSelection() {
        if (this.isSelecting && this.selectionArea) {
            // Get selection area coordinates
            const x = parseFloat(this.selectionArea.getAttribute('x'));
            const y = parseFloat(this.selectionArea.getAttribute('y'));
            const width = parseFloat(this.selectionArea.getAttribute('width'));
            const height = parseFloat(this.selectionArea.getAttribute('height'));
            
            // Find all elements inside the selection area
            const elements = this.editor.svg.querySelectorAll('.table, .wall, .kitchen, .bar');
            elements.forEach(element => {
                let isInside = false;
                
                if (element.classList.contains('wall')) {
                    // Special check for walls
                    const x1 = parseFloat(element.getAttribute('x1'));
                    const y1 = parseFloat(element.getAttribute('y1'));
                    const x2 = parseFloat(element.getAttribute('x2'));
                    const y2 = parseFloat(element.getAttribute('y2'));
                    
                    isInside = (
                        x1 >= x && x1 <= x + width &&
                        y1 >= y && y1 <= y + height &&
                        x2 >= x && x2 <= x + width &&
                        y2 >= y && y2 <= y + height
                    );
                } else {
                    // Diğer elementler için transform değerlerini kullan
                    const transform = element.getAttribute('transform');
                    const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
                    if (match) {
                        const elementX = parseFloat(match[1]);
                        const elementY = parseFloat(match[2]);
                        
                        isInside = (
                            elementX >= x && elementX <= x + width &&
                            elementY >= y && elementY <= y + height
                        );
                    }
                }
                
                if (isInside) {
                    this.selectedElements.add(element);
                    element.classList.add('selected');
                }
            });
            
            // Seçim alanını temizle
            this.selectionArea.remove();
            this.selectionArea = null;
            this.isSelecting = false;
        }
    }
    
    startDragging(evt) {
        if (!this.selectedElements.has(evt.currentTarget)) {
            //if (!evt.shiftKey) {
            //    this.deselectAll();
            //}
            this.selectedElements.add(evt.currentTarget);
            evt.currentTarget.classList.add('selected');
        }
        
        this.isDragging = true;
        const point = this.editor.getMousePosition(evt);
        this.startX = point.x;
        this.startY = point.y;
        this.lastX = point.x;
        this.lastY = point.y;
        
        // Bind metodları bir kere oluştur ve sakla
        this._boundHandleDrag = this.handleDrag.bind(this);
        this._boundStopDragging = this.stopDragging.bind(this);
        
        document.addEventListener('mousemove', this._boundHandleDrag);
        document.addEventListener('mouseup', this._boundStopDragging);
    }
    
    handleDrag(evt) {
        if (this.isDragging) {
            const point = this.editor.getMousePosition(evt);
            const dx = point.x - this.lastX;
            const dy = point.y - this.lastY;
            
            this.moveSelected(dx, dy);
            
            this.lastX = point.x;
            this.lastY = point.y;
        }
    }
    
    stopDragging() {
        this.isDragging = false;
        
        // Bound metodları kullanarak event listener'ları kaldır
        document.removeEventListener('mousemove', this._boundHandleDrag);
        document.removeEventListener('mouseup', this._boundStopDragging);
        
        // Seçili elemanları korumak için deselectAll() çağrılmıyor
        this.editor.minimapManager.update();
    }
    
    selectElement(evt) {
        const element = evt.currentTarget;
        //if (!evt.shiftKey) {
        //    this.deselectAll();
        //}
        this.selectedElements.add(element);
        element.classList.add('selected');
    }
    
    deselectAll() {
        this.selectedElements.forEach(element => {
            element.classList.remove('selected');
        });
        this.selectedElements.clear();
    }
    
    hasSelection() {
        return this.selectedElements.size > 0;
    }
    
    moveSelected(dx, dy) {
        // Save state before moving elements
        if (dx !== 0 || dy !== 0) {
            this.editor.saveStateToHistory();
        }

        this.selectedElements.forEach(element => {
            const transform = element.getAttribute('transform');
            const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
            if (match) {
                const x = parseFloat(match[1]);
                const y = parseFloat(match[2]);
                element.setAttribute('transform', `translate(${x + dx},${y + dy})`);
            }
        });
    }
    
    rotateSelected() {
        // Save state before rotating elements
        this.editor.saveStateToHistory();

        this.selectedElements.forEach(element => {
            if (element.classList.contains('wall')) {
                const x1 = parseFloat(element.getAttribute('x1'));
                const y1 = parseFloat(element.getAttribute('y1'));
                const x2 = parseFloat(element.getAttribute('x2'));
                const y2 = parseFloat(element.getAttribute('y2'));
                
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;
                
                // Calculate current angle
                const currentAngle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                
                // Round to nearest 15 degrees and add 15
                const newAngle = (Math.round(currentAngle / 15) * 15 + 15) * Math.PI / 180;
                
                // Calculate length of wall
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const halfLength = length / 2;
                
                // Calculate new endpoints
                element.setAttribute('x1', centerX - Math.cos(newAngle) * halfLength);
                element.setAttribute('y1', centerY - Math.sin(newAngle) * halfLength);
                element.setAttribute('x2', centerX + Math.cos(newAngle) * halfLength);
                element.setAttribute('y2', centerY + Math.sin(newAngle) * halfLength);
            } else {
                const transform = element.getAttribute('transform');
                const currentRotation = getCurrentRotation(element);
                const newRotation = (currentRotation + 15) % 360;
                
                const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
                if (match) {
                    const x = parseFloat(match[1]);
                    const y = parseFloat(match[2]);
                    element.setAttribute('transform', `translate(${x},${y}) rotate(${newRotation})`);
                }
            }
        });
        this.editor.minimapManager.update();
    }
    
    deleteSelected() {
        // Save state before deleting elements
        if (this.selectedElements.size > 0) {
            this.editor.saveStateToHistory();
        }

        this.selectedElements.forEach(element => {
            element.remove();
        });
        this.selectedElements.clear();
        this.editor.minimapManager.update();
    }
} 