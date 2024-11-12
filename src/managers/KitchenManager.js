import { CONSTANTS } from '../constants.js';

export class KitchenManager {
    constructor(editor) {
        this.editor = editor;
        this.kitchenCount = 0;
    }
    
    addKitchen() {
        this.kitchenCount++;
        const kitchen = this.editor.createSVGElement("g");
        kitchen.setAttribute('class', 'kitchen');
        kitchen.innerHTML = CONSTANTS.SVG_TEMPLATES.KITCHEN;
        
        // Position in viewport center
        const scrollLeft = this.editor.editorContainer.scrollLeft;
        const scrollTop = this.editor.editorContainer.scrollTop;
        const viewportX = scrollLeft + this.editor.editorContainer.clientWidth / 2;
        const viewportY = scrollTop + this.editor.editorContainer.clientHeight / 2;
        
        kitchen.setAttribute('transform', `translate(${viewportX - 50}, ${viewportY - 40})`);
        
        kitchen.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
        kitchen.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
        
        this.editor.svg.appendChild(kitchen);
        this.editor.minimapManager.update();
    }
    
    getKitchens() {
        const kitchens = [];
        this.editor.svg.querySelectorAll('.kitchen').forEach(kitchen => {
            kitchens.push({
                transform: kitchen.getAttribute('transform')
            });
        });
        return kitchens;
    }
    
    loadKitchens(kitchens) {
        this.kitchenCount = 0;
        kitchens.forEach(() => {
            this.kitchenCount++;
            const kitchen = this.editor.createSVGElement("g");
            kitchen.setAttribute('class', 'kitchen');
            kitchen.innerHTML = CONSTANTS.SVG_TEMPLATES.KITCHEN;
            
            kitchen.setAttribute('transform', 'translate(0,0)');
            kitchen.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
            kitchen.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
            
            this.editor.svg.appendChild(kitchen);
        });
    }
} 