export class WallManager {
    constructor(editor) {
        this.editor = editor;
        this.isDrawing = false;
        this.currentWall = null;
        this.startPoint = null;
        this.lengthIndicator = null;
        this.draggedWall = null;
        this.dragStartPoint = null;

        // Add mousemove and mouseup event listeners to SVG
        this.editor.svg.addEventListener('mousemove', (evt) => {
            if (this.isDrawing) {
                this.continueDrawing(evt);
            } else if (this.draggedWall) {
                this.continueDragging(evt);
            }
        });

        this.editor.svg.addEventListener('mouseup', () => {
            if (this.isDrawing) {
                this.finishDrawing();
            } else if (this.draggedWall) {
                this.finishDragging();
            }
        });
    }

    startDrawing(evt) {
        this.isDrawing = true;
        this.startPoint = this.editor.getMousePosition(evt);
        
        this.currentWall = this.editor.createSVGElement('line');
        this.currentWall.setAttribute('class', 'wall');
        this.currentWall.setAttribute('x1', this.startPoint.x);
        this.currentWall.setAttribute('y1', this.startPoint.y);
        this.currentWall.setAttribute('x2', this.startPoint.x);
        this.currentWall.setAttribute('y2', this.startPoint.y);
        
        this.currentWall.onmousedown = (evt) => {
            if (this.editor.mode === 'select') {
                this.editor.selectionManager.startDragging(evt);
            } else if (this.editor.mode === 'wall') {
                this.startDragging(evt);
            }
        };
            
        this.lengthIndicator = this.editor.createSVGElement('text');
        this.lengthIndicator.setAttribute('class', 'wall-length');
        this.lengthIndicator.setAttribute('fill', '#666');
        this.lengthIndicator.setAttribute('font-size', '12px');
        
        this.editor.svg.appendChild(this.currentWall);
        this.editor.svg.appendChild(this.lengthIndicator);
    }

    continueDrawing(evt) {
        if (this.isDrawing && this.currentWall) {
            const point = this.editor.getMousePosition(evt);
            let endX = point.x;
            let endY = point.y;
            
            const dx = endX - this.startPoint.x;
            const dy = endY - this.startPoint.y;
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Always snap to 15 degrees
            const snappedAngle = Math.round(angle / 15) * 15;
            angle = snappedAngle;
            endX = this.startPoint.x + distance * Math.cos(snappedAngle * Math.PI / 180);
            endY = this.startPoint.y + distance * Math.sin(snappedAngle * Math.PI / 180);
            
            // Update wall
            this.currentWall.setAttribute('x2', endX);
            this.currentWall.setAttribute('y2', endY);
            
            // Update length indicator
            const midX = (this.startPoint.x + endX) / 2;
            const midY = (this.startPoint.y + endY) / 2;
            this.lengthIndicator.setAttribute('x', midX);
            this.lengthIndicator.setAttribute('y', midY - 10);
            this.lengthIndicator.textContent = `${Math.round(distance)}px`;
        }
    }
    
    finishDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            
            if (this.currentWall) {
                // Minimum length check
                const x1 = parseFloat(this.currentWall.getAttribute('x1'));
                const y1 = parseFloat(this.currentWall.getAttribute('y1'));
                const x2 = parseFloat(this.currentWall.getAttribute('x2'));
                const y2 = parseFloat(this.currentWall.getAttribute('y2'));
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                
                if (length < 10) {
                    this.currentWall.remove();
                } else {
                    this.currentWall.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
                }
                this.currentWall = null;
            }
            
            // Clear helper elements
            if (this.lengthIndicator) {
                this.lengthIndicator.remove();
                this.lengthIndicator = null;
            }
            
            this.startPoint = null;
            this.editor.minimapManager.update();
        }
    }
    
    getWalls() {
        const walls = [];
        this.editor.svg.querySelectorAll('.wall').forEach(wall => {
            walls.push({
                x1: wall.getAttribute('x1'),
                y1: wall.getAttribute('y1'),
                x2: wall.getAttribute('x2'),
                y2: wall.getAttribute('y2')
            });
        });
        return walls;
    }
    
    loadWalls(walls) {
        walls.forEach(wallData => {
            const wall = this.editor.createSVGElement('line');
            wall.setAttribute('class', 'wall');
            wall.setAttribute('x1', wallData.x1);
            wall.setAttribute('y1', wallData.y1);
            wall.setAttribute('x2', wallData.x2);
            wall.setAttribute('y2', wallData.y2);
            
            wall.onmousedown = (evt) => {
                evt.stopPropagation();
                if (this.editor.mode === 'select') {
                    this.editor.selectionManager.startDragging(evt);
                } else if (this.editor.mode === 'wall') {
                    this.startDragging(evt);
                }
            };
            
            wall.onclick = (evt) => {
                evt.stopPropagation();
                if (this.editor.mode === 'select') {
                    this.editor.selectionManager.selectElement(evt);
                }
            };
            
            this.editor.svg.appendChild(wall);
        });
    }
    
    startDragging(evt) {
        if (evt.target.classList.contains('wall')) {
            const wall = evt.target;
            const x1 = parseFloat(wall.getAttribute('x1'));
            const y1 = parseFloat(wall.getAttribute('y1'));
            const x2 = parseFloat(wall.getAttribute('x2'));
            const y2 = parseFloat(wall.getAttribute('y2'));
            
            this.dragStartPoint = this.editor.getMousePosition(evt);
            this.draggedWall = {
                element: wall,
                startX1: x1,
                startY1: y1,
                startX2: x2,
                startY2: y2
            };
        }
    }
    
    continueDragging(evt) {
        if (this.draggedWall) {
            const currentPoint = this.editor.getMousePosition(evt);
            const dx = currentPoint.x - this.dragStartPoint.x;
            const dy = currentPoint.y - this.dragStartPoint.y;
            
            const newX1 = this.draggedWall.startX1 + dx;
            const newY1 = this.draggedWall.startY1 + dy;
            const newX2 = this.draggedWall.startX2 + dx;
            const newY2 = this.draggedWall.startY2 + dy;
            
            this.draggedWall.element.setAttribute('x1', newX1);
            this.draggedWall.element.setAttribute('y1', newY1);
            this.draggedWall.element.setAttribute('x2', newX2);
            this.draggedWall.element.setAttribute('y2', newY2);
            
            this.editor.minimapManager.update();
        }
    }
    
    finishDragging() {
        if (this.draggedWall) {
            this.draggedWall = null;
            this.dragStartPoint = null;
            this.editor.minimapManager.update();
        }
    }
} 