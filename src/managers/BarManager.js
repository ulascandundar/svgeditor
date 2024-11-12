import { CONSTANTS } from '../constants.js';

export class BarManager {
    constructor(editor) {
        this.editor = editor;
        this.barCount = 0;
    }
    
    addBar() {
        this.barCount++;
        const bar = this.editor.createSVGElement("g");
        bar.setAttribute('class', 'bar');
        bar.innerHTML = CONSTANTS.SVG_TEMPLATES.BAR;
        
        // Position in viewport center
        const scrollLeft = this.editor.editorContainer.scrollLeft;
        const scrollTop = this.editor.editorContainer.scrollTop;
        const viewportX = scrollLeft + this.editor.editorContainer.clientWidth / 2;
        const viewportY = scrollTop + this.editor.editorContainer.clientHeight / 2;
        
        bar.setAttribute('transform', `translate(${viewportX - 60}, ${viewportY - 20})`);
        
        bar.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
        bar.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
        
        this.editor.svg.appendChild(bar);
        this.editor.minimapManager.update();
    }
    
    getBars() {
        const bars = [];
        this.editor.svg.querySelectorAll('.bar').forEach(bar => {
            bars.push({
                transform: bar.getAttribute('transform')
            });
        });
        return bars;
    }
    
    loadBars(bars) {
        this.barCount = 0;
        bars.forEach(() => {
            this.barCount++;
            const bar = this.editor.createSVGElement("g");
            bar.setAttribute('class', 'bar');
            bar.innerHTML = CONSTANTS.SVG_TEMPLATES.BAR;
            
            bar.setAttribute('transform', 'translate(0,0)');
            bar.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
            bar.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
            
            this.editor.svg.appendChild(bar);
        });
    }
} 