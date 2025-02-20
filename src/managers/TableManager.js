import { generateGUID } from '../utils/helpers.js';
import { CONSTANTS } from '../constants.js';

export class TableManager {
    constructor(editor) {
        this.editor = editor;
        this.tableCount = 0;
    }

    addTable() {
        // Save current state before making changes
        this.editor.saveStateToHistory();

        this.tableCount++;
        const tableId = generateGUID();
        const table = this.editor.createSVGElement("g");
        
        table.setAttribute('class', 'table');
        table.setAttribute('data-id', tableId);
        table.setAttribute('data-number', this.tableCount);
        table.innerHTML = CONSTANTS.SVG_TEMPLATES.TABLE.replace('{{number}}', this.tableCount);
        
        // Get current viewport scroll position and account for zoom level
        const scrollLeft = this.editor.editorContainer.scrollLeft;
        const scrollTop = this.editor.editorContainer.scrollTop;
        
        // Calculate position relative to viewport center
        const viewportX = scrollLeft + this.editor.editorContainer.clientWidth / 2;
        const viewportY = scrollTop + this.editor.editorContainer.clientHeight / 2;
        
        table.setAttribute('transform', `translate(${viewportX - 30}, ${viewportY - 30}) rotate(0)`);
        
        // Add event listeners
        table.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
        table.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);

        this.editor.svg.appendChild(table);
        this.editor.setMode('select');
        this.editor.minimapManager.update();
    }

    addBulkTables(horizontalCount, verticalCount) {
        // Save current state before making changes
        this.editor.saveStateToHistory();

        // Get current viewport scroll position
        const scrollLeft = this.editor.editorContainer.scrollLeft;
        const scrollTop = this.editor.editorContainer.scrollTop;
        
        // Calculate starting position
        const startX = scrollLeft + 100;
        const startY = scrollTop + 100;
        
        for (let y = 0; y < verticalCount; y++) {
            for (let x = 0; x < horizontalCount; x++) {
                this.tableCount++;
                const tableId = generateGUID();
                const table = this.editor.createSVGElement("g");
                
                table.setAttribute('class', 'table');
                table.setAttribute('data-id', tableId);
                table.setAttribute('data-number', this.tableCount);
                table.innerHTML = CONSTANTS.SVG_TEMPLATES.TABLE.replace('{{number}}', this.tableCount);
                
                const posX = startX + (x * CONSTANTS.TABLE_SPACING.X);
                const posY = startY + (y * CONSTANTS.TABLE_SPACING.Y);
                
                table.setAttribute('transform', `translate(${posX}, ${posY}) rotate(0)`);
                
                table.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
                table.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
                
                this.editor.svg.appendChild(table);
            }
        }
        
        this.editor.minimapManager.update();
    }

    getTables() {
        const tables = [];
        this.editor.svg.querySelectorAll('.table').forEach(table => {
            tables.push({
                id: table.getAttribute('data-id'),
                number: table.getAttribute('data-number'),
                transform: table.getAttribute('transform')
            });
        });
        return tables;
    }

    loadTables(tables) {
        this.tableCount = 0;
        tables.forEach(tableData => {
            const table = this.editor.createSVGElement("g");
            table.setAttribute('class', 'table');
            table.setAttribute('data-id', tableData.id);
            table.setAttribute('data-number', tableData.number);
            table.innerHTML = CONSTANTS.SVG_TEMPLATES.TABLE.replace('{{number}}', tableData.number);
            
            table.setAttribute('transform', tableData.transform);
            table.onmousedown = this.editor.selectionManager.startDragging.bind(this.editor.selectionManager);
            table.onclick = this.editor.selectionManager.selectElement.bind(this.editor.selectionManager);
            
            this.editor.svg.appendChild(table);
            this.tableCount = Math.max(this.tableCount, parseInt(tableData.number));
        });
    }
} 