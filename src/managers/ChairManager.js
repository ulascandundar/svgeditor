import { CONSTANTS } from '../constants.js';
import { generateGUID } from '../utils/helpers.js';

export class ChairManager {
    constructor(editor) {
        this.editor = editor;
        this.chairCount = 0;
        this.initializeShadowFilter();
    }
    
    initializeShadowFilter() {
        const defs = this.editor.svg.querySelector('defs') || this.editor.createSVGElement('defs');
        if (!defs.querySelector('#chairShadow')) {
            const filter = `
                <filter id="chairShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="1" dy="1"/>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            `;
            defs.innerHTML += filter;
            this.editor.svg.appendChild(defs);
        }
    }
    
    addChair() {
        this.chairCount++;
        const chair = this.editor.createSVGElement("g");
        const chairId = generateGUID();
        
        chair.setAttribute('class', 'event-chair');
        chair.setAttribute('data-id', chairId);
        chair.setAttribute('data-number', this.chairCount);
        
        // Koltuk şablonunu doldur
        chair.innerHTML = CONSTANTS.SVG_TEMPLATES.EVENT_CHAIR.replace('{{number}}', this.chairCount);
        
        // Viewport merkezine yerleştir
        const scrollLeft = this.editor.editorContainer.scrollLeft;
        const scrollTop = this.editor.editorContainer.scrollTop;
        const viewportX = scrollLeft + this.editor.editorContainer.clientWidth / 2;
        const viewportY = scrollTop + this.editor.editorContainer.clientHeight / 2;
        
        chair.setAttribute('transform', `translate(${viewportX - 20}, ${viewportY - 20})`);
        
        // Event listeners
        chair.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
        chair.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
        
        this.editor.svg.appendChild(chair);
        this.editor.minimapManager.update();
    }
    
    getChairs() {
        const chairs = [];
        this.editor.svg.querySelectorAll('.event-chair').forEach(chair => {
            chairs.push({
                id: chair.getAttribute('data-id'),
                number: chair.getAttribute('data-number'),
                transform: chair.getAttribute('transform')
            });
        });
        return chairs;
    }
    
    loadChairs(chairs) {
        this.chairCount = 0;
        chairs.forEach(chairData => {
            this.chairCount++;
            const chair = this.editor.createSVGElement("g");
            chair.setAttribute('class', 'event-chair');
            chair.setAttribute('data-id', chairData.id);
            chair.setAttribute('data-number', chairData.number);
            chair.innerHTML = CONSTANTS.SVG_TEMPLATES.EVENT_CHAIR.replace('{{number}}', chairData.number);
            
            chair.setAttribute('transform', chairData.transform);
            chair.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
            chair.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
            
            this.editor.svg.appendChild(chair);
        });
    }
} 