        const svg = document.getElementById('editor');
        const editorContainer = document.getElementById('editor-container');
        const minimap = document.getElementById('minimap');
        const minimapViewport = document.getElementById('minimap-viewport');
        let tableCount = 0, wallCount = 0, kitchenCount = 0;
        let mode = 'select';
        let selectedElement = null;
        let offset = null;
        let drawingWall = null;
        let startPoint = null;
        let selectionArea = null;
        let selectedElements = [];
        let isSelecting = false;
        let selectionStartPoint = null;
        let isDraggingMultiple = false;
        let isDraggingMinimap = false;
        let minimapStartX, minimapStartY;
        let barCount = 0;
        let currentScale = 1;
        const MIN_SCALE = 0.5;
        const MAX_SCALE = 2;
        const SCALE_STEP = 0.1;

        function zoomIn() {
            if (currentScale < MAX_SCALE) {
                currentScale = Math.min(currentScale + SCALE_STEP, MAX_SCALE);
                applyZoom();
            }
        }
        
        function zoomOut() {
            if (currentScale > MIN_SCALE) {
                currentScale = Math.max(currentScale - SCALE_STEP, MIN_SCALE);
                applyZoom();
            }
        }
        
        function applyZoom() {
            // Apply zoom to SVG
            svg.style.transform = `scale(${currentScale})`;
            svg.style.transformOrigin = 'top left';
            
            // Update scroll limits of editor container
            const containerRect = editorContainer.getBoundingClientRect();
            const actualWidth = 2000; // Original width of SVG
            const actualHeight = 2000; // Original height of SVG
            
            // Zoomed SVG dimensions
            const zoomedWidth = actualWidth * currentScale;
            const zoomedHeight = actualHeight * currentScale;
            
            // Update SVG dimensions
            svg.style.width = `${zoomedWidth}px`;
            svg.style.height = `${zoomedHeight}px`;
            
            // Calculate current scroll position ratio
            const scrollRatioX = editorContainer.scrollLeft / (editorContainer.scrollWidth - containerRect.width);
            const scrollRatioY = editorContainer.scrollTop / (editorContainer.scrollHeight - containerRect.height);
            
            // Calculate and apply new scroll position
            const newMaxScrollX = zoomedWidth - containerRect.width;
            const newMaxScrollY = zoomedHeight - containerRect.height;
            
            editorContainer.scrollLeft = scrollRatioX * newMaxScrollX;
            editorContainer.scrollTop = scrollRatioY * newMaxScrollY;
            
            updateMinimap();
        }
        editorContainer.addEventListener('wheel', function(event) {
            if (event.ctrlKey || event.metaKey) { // Wheel movement with Ctrl key
                event.preventDefault();
                
                const delta = event.deltaY;
                if (delta < 0) { // Wheel up = zoom in
                    zoomIn();
                } else { // Wheel down = zoom out
                    zoomOut();
                }
            }
        }, { passive: false });
        function startDraggingMinimap(evt) {
            isDraggingMinimap = true;
            minimapStartX = evt.clientX || evt.touches[0].clientX;
            minimapStartY = evt.clientY || evt.touches[0].clientY;
        
            // Add the mousemove event listener directly to improve responsiveness
            minimap.addEventListener('mousemove', handleMinimapDrag);
            minimap.addEventListener('touchmove', handleMinimapDrag, { passive: false });
        }
        function handleMinimapDrag(evt) {
            if (isDraggingMinimap) {
                evt.preventDefault();
                
                const clientX = evt.clientX || evt.touches[0].clientX;
                const clientY = evt.clientY || evt.touches[0].clientY;
                
                const dx = clientX - minimapStartX;
                const dy = clientY - minimapStartY;
                
                // Actual dimensions of SVG
                const actualWidth = 2000;
                const minimapScale = minimap.clientWidth / actualWidth;
                
                // Update scroll position
                editorContainer.scrollLeft += (dx / minimapScale) * currentScale;
                editorContainer.scrollTop += (dy / minimapScale) * currentScale;
                
                minimapStartX = clientX;
                minimapStartY = clientY;
                
                updateMinimapViewport();
            }
        }
        function updateMinimapViewport() {
            const editorRect = svg.getBoundingClientRect();
            const containerRect = editorContainer.getBoundingClientRect();
            const minimapScale = minimap.clientWidth / editorRect.width;
        
            // Update only the viewport position
            minimapViewport.style.left = (editorContainer.scrollLeft * minimapScale) + 'px';
            minimapViewport.style.top = (editorContainer.scrollTop * minimapScale) + 'px';
        }
    function addBar() {
            barCount++;
            const bar = document.createElementNS("http://www.w3.org/2000/svg", "g");
            bar.setAttribute('class', 'bar');
            bar.innerHTML = `
                <!-- Bar Area -->
                <rect x="0" y="0" width="120" height="40" rx="5" ry="5" fill="#8B4513" />
                <rect x="2" y="2" width="116" height="36" rx="3" ry="3" fill="#D2691E" />
                <!-- Bar Top -->
                <rect x="5" y="5" width="110" height="30" fill="#CD853F" />
                <!-- Bar Shelves -->
                <rect x="10" y="10" width="100" height="5" fill="#A0522D" />
                <rect x="10" y="20" width="100" height="5" fill="#A0522D" />
                <!-- Bar Stools -->
                <circle cx="20" cy="45" r="5" fill="#8B4513" />
                <circle cx="40" cy="45" r="5" fill="#8B4513" />
                <circle cx="60" cy="45" r="5" fill="#8B4513" />
                <circle cx="80" cy="45" r="5" fill="#8B4513" />
                <circle cx="100" cy="45" r="5" fill="#8B4513" />
                <!-- Label -->
                <text x="60" y="55" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Bar ${barCount}</text>
            `;
            
            // Get current viewport scroll position
            const scrollLeft = editorContainer.scrollLeft;
            const scrollTop = editorContainer.scrollTop;
            
            // Calculate position relative to viewport center
            const viewportX = scrollLeft + editorContainer.clientWidth / 2;
            const viewportY = scrollTop + editorContainer.clientHeight / 2;
            
            bar.setAttribute('transform', `translate(${viewportX - 60}, ${viewportY - 20}) rotate(0)`);
            
            bar.onmousedown = startDragging;
            bar.onclick = selectElement;

            svg.appendChild(bar);
            setMode('select');
            updateMinimap();
        }


    function dragMinimap(evt) {
        if (isDraggingMinimap) {
            evt.preventDefault(); // Prevent scrolling on mobile
            const clientX = evt.clientX || evt.touches[0].clientX;
            const clientY = evt.clientY || evt.touches[0].clientY;
            const dx = clientX - this.minimapStartX;
            const dy = clientY - this.minimapStartY;
            
           // const editorRect = this.svg.getBoundingClientRect();
            //const minimapScale = this.minimap.clientWidth / this.editorRect.width;
            
            //this.editorContainer.scrollLeft += dx / minimapScale;
            //this.editorContainer.scrollTop += dy / minimapScale;
            
            //this.minimapStartX = clientX;
            //this.minimapStartY = clientY;
            
            //this.updateMinimap();
        }
    }
    function stopDraggingMinimap() {
        if (isDraggingMinimap) {
            isDraggingMinimap = false;
            // Remove the mousemove event listeners
            minimap.removeEventListener('mousemove', handleMinimapDrag);
            minimap.removeEventListener('touchmove', handleMinimapDrag);
            // Do a final full update
            updateMinimap();
        }
    }

    function handleMinimapClick(evt) {
        const minimapRect = minimap.getBoundingClientRect();
        
        const clickX = evt.clientX - minimapRect.left;
        const clickY = evt.clientY - minimapRect.top;
        
        // Actual dimensions of SVG
        const actualWidth = 2000;
        const actualHeight = 2000;
        
        const minimapScale = minimap.clientWidth / actualWidth;
        
        // Convert clicked point to scroll position
        const newScrollLeft = (clickX / minimapScale - editorContainer.clientWidth / (2 * currentScale)) * currentScale;
        const newScrollTop = (clickY / minimapScale - editorContainer.clientHeight / (2 * currentScale)) * currentScale;
        
        editorContainer.scrollLeft = newScrollLeft;
        editorContainer.scrollTop = newScrollTop;
        
        updateMinimap();
    }

    minimap.addEventListener('click', handleMinimapClick);
    minimap.addEventListener('mousedown', startDraggingMinimap);
    minimap.addEventListener('touchstart', startDraggingMinimap);
    document.addEventListener('mousemove', dragMinimap);
    document.addEventListener('touchmove', dragMinimap, { passive: false });
    document.addEventListener('mouseup', stopDraggingMinimap);
    document.addEventListener('touchend', stopDraggingMinimap);


    function updateMinimap() {
        // Clear previous minimap content
        while (minimap.firstChild) {
            minimap.removeChild(minimap.firstChild);
        }
        
        // Get actual dimensions of SVG
        const editorRect = svg.getBoundingClientRect();
        const containerRect = editorContainer.getBoundingClientRect();
        
        // Original dimensions of SVG without zoom
        const actualWidth = 2000; // Original width of SVG
        const actualHeight = 2000; // Original height of SVG
        
        // Calculate scale for minimap
        const minimapScale = minimap.clientWidth / actualWidth;
        
        // Update viewport dimensions
        const viewportWidth = (containerRect.width / currentScale) * minimapScale;
        const viewportHeight = (containerRect.height / currentScale) * minimapScale;
        
        minimapViewport.style.width = viewportWidth + 'px';
        minimapViewport.style.height = viewportHeight + 'px';
        
        // Update viewport position
        const scrollLeftScaled = editorContainer.scrollLeft / currentScale;
        const scrollTopScaled = editorContainer.scrollTop / currentScale;
        
        minimapViewport.style.left = (scrollLeftScaled * minimapScale) + 'px';
        minimapViewport.style.top = (scrollTopScaled * minimapScale) + 'px';
        
        // Clone SVG content
        const svgClone = svg.cloneNode(true);
        svgClone.style.transform = 'none'; // Reset zoom
        svgClone.setAttribute('width', minimap.clientWidth);
        svgClone.setAttribute('height', minimap.clientHeight);
        svgClone.style.transform = `scale(${minimapScale})`;
        svgClone.style.transformOrigin = 'top left';
        
        // Add minimap components
        minimap.appendChild(svgClone);
        minimap.appendChild(minimapViewport);
    }

        editorContainer.addEventListener('scroll', updateMinimap);
        window.addEventListener('resize', updateMinimap);

        function setMode(newMode) {
            mode = newMode;
            deselectAll();
        }

        function generateGUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function addTable() {
            tableCount++;
            const tableId = generateGUID();
            const table = document.createElementNS("http://www.w3.org/2000/svg", "g");
            table.setAttribute('class', 'table');
            table.setAttribute('data-id', tableId);
            table.setAttribute('data-number', tableCount);
            table.innerHTML = `
                <!-- Masa -->
                <rect x="0" y="0" width="60" height="40" rx="5" ry="5" fill="#8B4513" />
                <rect x="2" y="2" width="56" height="36" rx="3" ry="3" fill="#D2691E" />
                <rect x="4" y="4" width="52" height="32" rx="2" ry="2" fill="#A0522D" />
                <rect x="6" y="6" width="48" height="28" fill="#CD853F" />
                <line x1="6" y1="20" x2="54" y2="20" stroke="#8B4513" stroke-width="1" />
                <line x1="30" y1="6" x2="30" y2="34" stroke="#8B4513" stroke-width="1" />
                <!-- Koltuklar -->
                <rect x="-10" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" /> <!-- Sol koltuk -->
                <rect x="50" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" /> <!-- Sağ koltuk -->
                <rect x="20" y="-10" width="20" height="20" rx="3" ry="3" fill="#8B4513" /> <!-- Üst koltuk -->
                <rect x="20" y="30" width="20" height="20" rx="3" ry="3" fill="#8B4513" /> <!-- Alt koltuk -->
                <!-- Gölge ve etiket -->
                <rect x="0" y="37" width="60" height="6" rx="2" ry="2" fill="#8B4513" opacity="0.6" />
                <text x="30" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Masa ${tableCount}</text>
            `;
            
            // Get current viewport scroll position
            const scrollLeft = editorContainer.scrollLeft;
            const scrollTop = editorContainer.scrollTop;
            
            // Calculate position relative to viewport center
            const viewportX = scrollLeft + editorContainer.clientWidth / 2;
            const viewportY = scrollTop + editorContainer.clientHeight / 2;
            
            table.setAttribute('transform', `translate(${viewportX - 30}, ${viewportY - 30}) rotate(0)`);
            
            table.onmousedown = startDragging;
            table.onclick = selectElement;

            svg.appendChild(table);
            setMode('select');
            updateMinimap();
        }

        function addKitchen() {
            kitchenCount++;
            const kitchen = document.createElementNS("http://www.w3.org/2000/svg", "g");
            kitchen.setAttribute('class', 'kitchen');
            kitchen.innerHTML = `
                <!-- Mutfak Alanı -->
                <rect x="0" y="0" width="100" height="80" rx="5" ry="5" fill="#E0E0E0" stroke="#808080" stroke-width="2" />
                <rect x="5" y="5" width="90" height="70" rx="3" ry="3" fill="#F0F0F0" stroke="#A9A9A9" stroke-width="1" />
                <!-- Tezgah -->
                <rect x="10" y="15" width="80" height="20" fill="#D3D3D3" stroke="#A9A9A9" stroke-width="1" />
                <!-- Lavabo -->
                <circle cx="25" cy="25" r="8" fill="#C0C0C0" stroke="#A9A9A9" stroke-width="1" />
                <!-- Ocak -->
                <rect x="60" y="20" width="25" height="10" fill="#696969" stroke="#A9A9A9" stroke-width="1" />
                <!-- Etiket -->
                <text x="50" y="75" text-anchor="middle" fill="black" font-size="10" font-weight="bold">Mutfak ${kitchenCount}</text>
            `;
            
            // Get current viewport scroll position
            const scrollLeft = editorContainer.scrollLeft;
            const scrollTop = editorContainer.scrollTop;
            
            // Calculate position relative to viewport center
            const viewportX = scrollLeft + editorContainer.clientWidth / 2;
            const viewportY = scrollTop + editorContainer.clientHeight / 2;
            
            kitchen.setAttribute('transform', `translate(${viewportX - 50}, ${viewportY - 40}) rotate(0)`);
            
            kitchen.onmousedown = startDragging;
            kitchen.onclick = selectElement;

            svg.appendChild(kitchen);
            setMode('select');
            updateMinimap();
        }

        function startDrawingWall(evt) {
            const coord = getMousePosition(evt);
            startPoint = coord;
            
            // Ana duvar çizgisi
            drawingWall = document.createElementNS("http://www.w3.org/2000/svg", "line");
            drawingWall.setAttribute('class', 'wall');
            drawingWall.setAttribute('x1', coord.x);
            drawingWall.setAttribute('y1', coord.y);
            drawingWall.setAttribute('x2', coord.x);
            drawingWall.setAttribute('y2', coord.y);
            drawingWall.setAttribute('stroke', '#808080');
            drawingWall.setAttribute('stroke-width', '8');
            drawingWall.setAttribute('stroke-linecap', 'square');
            drawingWall.setAttribute('stroke', '#808080');
            drawingWall.setAttribute('stroke-width', '8');
            
            // Kılavuz çizgisi (yatay ve dikey yardımcı çizgiler)
            const guideLines = document.createElementNS("http://www.w3.org/2000/svg", "g");
            guideLines.setAttribute('class', 'guide-lines');
            guideLines.innerHTML = `
                <line class="guide horizontal" x1="0" y1="${coord.y}" x2="${svg.clientWidth}" y2="${coord.y}" 
                      stroke="#666" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
                <line class="guide vertical" x1="${coord.x}" y1="0" x2="${coord.x}" y2="${svg.clientHeight}" 
                      stroke="#666" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
            `;
            
            // Angle indicator
            const angleIndicator = document.createElementNS("http://www.w3.org/2000/svg", "text");
            angleIndicator.setAttribute('class', 'angle-indicator');
            angleIndicator.setAttribute('x', coord.x + 20);
            angleIndicator.setAttribute('y', coord.y - 20);
            angleIndicator.setAttribute('fill', '#666');
            angleIndicator.textContent = '0°';
            
            svg.appendChild(drawingWall);
            svg.appendChild(guideLines);
            svg.appendChild(angleIndicator);
        }
        
        function continueDrawingWall(evt) {
            if (drawingWall) {
                evt.preventDefault();
                const coord = getMousePosition(evt);
                let endX = coord.x;
                let endY = coord.y;
                
                const dx = endX - startPoint.x;
                const dy = endY - startPoint.y;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                const snapAngle = Math.round(angle / 15) * 15;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                endX = startPoint.x + distance * Math.cos(snapAngle * Math.PI / 180);
                endY = startPoint.y + distance * Math.sin(snapAngle * Math.PI / 180);
                
                // Update wall
                drawingWall.setAttribute('x2', endX);
                drawingWall.setAttribute('y2', endY);
                
                // Update guide lines
                const guideLines = svg.querySelector('.guide-lines');
                if (guideLines) {
                    guideLines.innerHTML = `
                        <line class="guide horizontal" x1="0" y1="${endY}" x2="${svg.clientWidth}" y2="${endY}" 
                              stroke="#666" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
                        <line class="guide vertical" x1="${endX}" y1="0" x2="${endX}" y2="${svg.clientHeight}" 
                              stroke="#666" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>
                    `;
                }
                
                // Update angle indicator
                const angleIndicator = svg.querySelector('.angle-indicator');
                if (angleIndicator) {
                    const angle = Math.round(Math.atan2(dy, dx) * 180 / Math.PI);
                    angleIndicator.textContent = `${angle}°`;
                    angleIndicator.setAttribute('x', endX + 20);
                    angleIndicator.setAttribute('y', endY - 20);
                }
                
                // Update length indicator
                const length = Math.sqrt(Math.pow(endX - startPoint.x, 2) + Math.pow(endY - startPoint.y, 2));
                const midX = (startPoint.x + endX) / 2;
                const midY = (startPoint.y + endY) / 2;
                
                let lengthIndicator = svg.querySelector('.length-indicator');
                if (!lengthIndicator) {
                    lengthIndicator = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    lengthIndicator.setAttribute('class', 'length-indicator');
                    lengthIndicator.setAttribute('fill', '#666');
                    svg.appendChild(lengthIndicator);
                }
                
                lengthIndicator.setAttribute('x', midX);
                lengthIndicator.setAttribute('y', midY - 10);
                lengthIndicator.textContent = `${Math.round(length)}px`;
            }
        }

        function finishDrawingWall() {
            if (drawingWall) {
                // Minimum length check
                const x1 = parseFloat(drawingWall.getAttribute('x1'));
                const y1 = parseFloat(drawingWall.getAttribute('y1'));
                const x2 = parseFloat(drawingWall.getAttribute('x2'));
                const y2 = parseFloat(drawingWall.getAttribute('y2'));
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                
                if (length < 10) {
                    // Ignore very short walls
                    drawingWall.remove();
                } else {
                    wallCount++;
                    drawingWall.style.cursor = 'move';
                    drawingWall.onmousedown = startDragging;
                    drawingWall.onclick = selectElement;
                }
                
                // Clear helper elements
                const guideLines = svg.querySelector('.guide-lines');
                if (guideLines) guideLines.remove();
                
                const angleIndicator = svg.querySelector('.angle-indicator');
                if (angleIndicator) angleIndicator.remove();
                
                const lengthIndicator = svg.querySelector('.length-indicator');
                if (lengthIndicator) lengthIndicator.remove();
                
                drawingWall = null;
                startPoint = null;
                setMode('select');
                updateMinimap();
            }
        }

        function selectElement(evt) {
    if (mode === 'select') {
        deselectAll();
        selectedElement = evt.target.closest('.table, .wall, .kitchen, .bar');
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
    }
}

        function deselectAll() {
            document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
            selectedElement = null;
            selectedElements = [];
        }

        function getMousePosition(evt) {
            const CTM = svg.getScreenCTM();
            return {
                x: (evt.clientX - CTM.e) / CTM.a,
                y: (evt.clientY - CTM.f) / CTM.d
            };
        }

        function deleteSelectedElement() {
            if (selectedElement) {
                selectedElement.remove();
                selectedElement = null;
                updateMinimap();
            }
        }

        function startDragging(evt) {
            if (mode === 'select') {
                if (selectedElements.length > 0) {
                    isDraggingMultiple = true;
                    offset = getMousePosition(evt);
                } else {
                    selectedElement = evt.target.closest('.table, .wall, .kitchen, .bar');
                    offset = getMousePosition(evt);
                    
                    if (selectedElement.classList.contains('table') || selectedElement.classList.contains('kitchen') || selectedElement.classList.contains('bar')) {
                        const transform = selectedElement.getAttribute('transform');
                        const translate = transform.match(/translate\(([^)]+)\)/)[1].split(',');
                        offset.x -= parseFloat(translate[0]);
                        offset.y -= parseFloat(translate[1]);
                    } else if (selectedElement.classList.contains('wall')) {
                        offset.x -= parseFloat(selectedElement.getAttribute('x1'));
                        offset.y -= parseFloat(selectedElement.getAttribute('y1'));
                    }
                }

                svg.addEventListener('mousemove', drag);
                svg.addEventListener('mouseup', endDrag);
            }
        }

        function drag(evt) {
    if (isDraggingMultiple) {
        const coord = getMousePosition(evt);
        const dx = coord.x - offset.x;
        const dy = coord.y - offset.y;
        moveSelectedElements(dx, dy);
        offset = coord;
    } else if (selectedElement) {
        evt.preventDefault();
        const coord = getMousePosition(evt);
        if (selectedElement.classList.contains('table') || selectedElement.classList.contains('kitchen') || selectedElement.classList.contains('bar')) {
            const newX = Math.max(0, Math.min(coord.x - offset.x, svg.clientWidth - selectedElement.getBBox().width));
            const newY = Math.max(0, Math.min(coord.y - offset.y, svg.clientHeight - selectedElement.getBBox().height));
            const currentRotation = getCurrentRotation(selectedElement);
            selectedElement.setAttribute('transform', `translate(${newX}, ${newY}) rotate(${currentRotation})`);
        } else if (selectedElement.classList.contains('wall')) {
            const dx = coord.x - offset.x - parseFloat(selectedElement.getAttribute('x1'));
            const dy = coord.y - offset.y - parseFloat(selectedElement.getAttribute('y1'));
            let x1 = parseFloat(selectedElement.getAttribute('x1')) + dx;
            let y1 = parseFloat(selectedElement.getAttribute('y1')) + dy;
            let x2 = parseFloat(selectedElement.getAttribute('x2')) + dx;
            let y2 = parseFloat(selectedElement.getAttribute('y2')) + dy;
            
            // Constrain wall within SVG boundaries
            x1 = Math.max(0, Math.min(x1, svg.clientWidth));
            y1 = Math.max(0, Math.min(y1, svg.clientHeight));
            x2 = Math.max(0, Math.min(x2, svg.clientWidth));
            y2 = Math.max(0, Math.min(y2, svg.clientHeight));
            
            selectedElement.setAttribute('x1', x1);
            selectedElement.setAttribute('y1', y1);
            selectedElement.setAttribute('x2', x2);
            selectedElement.setAttribute('y2', y2);
        }
    }
    updateMinimap();
}

        function endDrag() {
            svg.removeEventListener('mousemove', drag);
            svg.removeEventListener('mouseup', endDrag);
            isDraggingMultiple = false;
            selectedElement = null;
            updateMinimap();
        }

        function startSelectionArea(evt) {
    if (mode === 'select' && !selectedElement && selectedElements.length === 0) {
        const coord = getMousePosition(evt);
        selectionStartPoint = coord;
        selectionArea = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        selectionArea.setAttribute('class', 'selection-area');
        selectionArea.setAttribute('x', coord.x);
        selectionArea.setAttribute('y', coord.y);
        selectionArea.setAttribute('width', 0);
        selectionArea.setAttribute('height', 0);
        svg.appendChild(selectionArea);
        isSelecting = true;
    }
}

        function updateSelectionArea(evt) {
            if (selectionArea && isSelecting) {
                const coord = getMousePosition(evt);
                const x = Math.min(selectionStartPoint.x, coord.x);
                const y = Math.min(selectionStartPoint.y, coord.y);
                const width = Math.abs(coord.x - selectionStartPoint.x);
                const height = Math.abs(coord.y - selectionStartPoint.y);
                
                selectionArea.setAttribute('x', x);
                selectionArea.setAttribute('y', y);
                selectionArea.setAttribute('width', width);
                selectionArea.setAttribute('height', height);
            }
        }

        function finishSelectionArea() {
    if (selectionArea && isSelecting) {
        const x = parseFloat(selectionArea.getAttribute('x'));
        const y = parseFloat(selectionArea.getAttribute('y'));
        const width = parseFloat(selectionArea.getAttribute('width'));
        const height = parseFloat(selectionArea.getAttribute('height'));
        
        selectedElements = [];
        document.querySelectorAll('.table, .wall, .kitchen, .bar').forEach(el => {
            let elBox;
            if (el.classList.contains('wall')) {
                const x1 = parseFloat(el.getAttribute('x1'));
                const y1 = parseFloat(el.getAttribute('y1'));
                const x2 = parseFloat(el.getAttribute('x2'));
                const y2 = parseFloat(el.getAttribute('y2'));
                elBox = {
                    x: Math.min(x1, x2),
                    y: Math.min(y1, y2),
                    width: Math.abs(x2 - x1),
                    height: Math.abs(y2 - y1)
                };
            } else {
                const bbox = el.getBBox();
                const transform = el.getAttribute('transform');
                const translate = transform.match(/translate\(([^)]+)\)/)[1].split(',');
                elBox = {
                    x: parseFloat(translate[0]) + bbox.x,
                    y: parseFloat(translate[1]) + bbox.y,
                    width: bbox.width,
                    height: bbox.height
                };
            }
            
            if (elBox.x < x + width && elBox.x + elBox.width > x &&
                elBox.y < y + height && elBox.y + elBox.height > y) {
                selectedElements.push(el);
                el.classList.add('selected');
            }
        });
        
        selectionArea.remove();
        selectionArea = null;
        isSelecting = false;
        selectionStartPoint = null;
    }
}
        svg.addEventListener('mousedown', function(evt) {
            if (mode === 'wall') {
                startDrawingWall(evt);
            } else if (mode === 'select') {
                startSelectionArea(evt);
            }
        });

        svg.addEventListener('mousemove', function(evt) {
            if (mode === 'wall') {
                continueDrawingWall(evt);
            } else if (mode === 'select' && isSelecting) {
                updateSelectionArea(evt);
            }
        });

        svg.addEventListener('mouseup', function() {
            if (mode === 'wall') {
                finishDrawingWall();
            } else if (mode === 'select') {
                finishSelectionArea();
            }
        });

        document.addEventListener('keydown', function(evt) {
    if (evt.key === 'Escape') {
        deselectAll();
    } else if (selectedElement || selectedElements.length > 0) {
        evt.preventDefault();
        switch (evt.key) {
            case 'ArrowLeft':
                moveSelectedElements(-5, 0);
                break;
            case 'ArrowRight':
                moveSelectedElements(5, 0);
                break;
            case 'ArrowUp':
                moveSelectedElements(0, -5);
                break;
            case 'ArrowDown':
                moveSelectedElements(0, 5);
                break;
            case 'Enter':
                rotateSelectedElement();
                break;
            case 'Delete':
                deleteSelectedElements();
                break;
        }
    }
});

        function moveSelectedElements(dx, dy) {
    const elementsToMove = selectedElements.length > 0 ? selectedElements : (selectedElement ? [selectedElement] : []);
    
    elementsToMove.forEach(el => {
        if (el.classList.contains('table') || el.classList.contains('kitchen') || el.classList.contains('bar')) {
            const transform = el.getAttribute('transform');
            const translate = transform.match(/translate\(([^)]+)\)/)[1].split(',');
            let x = parseFloat(translate[0]) + dx;
            let y = parseFloat(translate[1]) + dy;
            
            // Constrain element within SVG boundaries
            x = Math.max(0, Math.min(x, svg.clientWidth - el.getBBox().width));
            y = Math.max(0, Math.min(y, svg.clientHeight - el.getBBox().height));
            
            const currentRotation = getCurrentRotation(el);
            el.setAttribute('transform', `translate(${x}, ${y}) rotate(${currentRotation})`);
        } else if (el.classList.contains('wall')) {
            let x1 = parseFloat(el.getAttribute('x1')) + dx;
            let y1 = parseFloat(el.getAttribute('y1')) + dy;
            let x2 = parseFloat(el.getAttribute('x2')) + dx;
            let y2 = parseFloat(el.getAttribute('y2')) + dy;
            
            // Constrain wall within SVG boundaries
            x1 = Math.max(0, Math.min(x1, svg.clientWidth));
            y1 = Math.max(0, Math.min(y1, svg.clientHeight));
            x2 = Math.max(0, Math.min(x2, svg.clientWidth));
            y2 = Math.max(0, Math.min(y2, svg.clientHeight));
            
            el.setAttribute('x1', x1);
            el.setAttribute('y1', y1);
            el.setAttribute('x2', x2);
            el.setAttribute('y2', y2);
        }
    });
    updateMinimap();
}

        function deleteSelectedElements() {
            if (selectedElements.length > 0) {
                selectedElements.forEach(el => el.remove());
                selectedElements = [];
            } else if (selectedElement) {
                deleteSelectedElement();
            }
            updateMinimap();
        }

        function getCurrentRotation(element) {
            const transform = element.getAttribute('transform');
            const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
            return rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        }

        function rotateSelectedElement() {
            if (selectedElement) {
                if (selectedElement.classList.contains('table') || selectedElement.classList.contains('kitchen') || selectedElement.classList.contains('bar')) {
                    const currentRotation = getCurrentRotation(selectedElement);
                    const newRotation = (currentRotation + 45) % 360;
                    const transform = selectedElement.getAttribute('transform');
                    const translate = transform.match(/translate\(([^)]+)\)/)[1];
                    selectedElement.setAttribute('transform', `translate(${translate}) rotate(${newRotation})`);
                } else if (selectedElement.classList.contains('wall')) {
                    const x1 = parseFloat(selectedElement.getAttribute('x1'));
                    const y1 = parseFloat(selectedElement.getAttribute('y1'));
                    const x2 = parseFloat(selectedElement.getAttribute('x2'));
                    const y2 = parseFloat(selectedElement.getAttribute('y2'));
                    
                    const centerX = (x1 + x2) / 2;
                    const centerY = (y1 + y2) / 2;
                    
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    
                    const angle = Math.atan2(dy, dx);
                    const length = Math.sqrt(dx * dx + dy * dy);
                    
                    const newAngle = angle + Math.PI / 4;
                    
                    const newX1 = centerX - length / 2 * Math.cos(newAngle);
                    const newY1 = centerY - length / 2 * Math.sin(newAngle);
                    const newX2 = centerX + length / 2 * Math.cos(newAngle);
                    const newY2 = centerY + length / 2 * Math.sin(newAngle);
                    
                    selectedElement.setAttribute('x1', newX1);
                    selectedElement.setAttribute('y1', newY1);
                    selectedElement.setAttribute('x2', newX2);
                    selectedElement.setAttribute('y2', newY2);
                }
            }
            updateMinimap();
        }

        function saveLayout() {
            const layout = {
                tables: [],
                walls: [],
                kitchens: [],
                bars: []
            };

            svg.querySelectorAll('.table').forEach(table => {
                layout.tables.push({
                    id: table.getAttribute('data-id'),
                    number: table.getAttribute('data-number'),
                    transform: table.getAttribute('transform')
                });
            });

            svg.querySelectorAll('.wall').forEach(wall => {
                layout.walls.push({
                    x1: wall.getAttribute('x1'),
                    y1: wall.getAttribute('y1'),
                    x2: wall.getAttribute('x2'),
                    y2: wall.getAttribute('y2')
                });
            });

            svg.querySelectorAll('.kitchen').forEach(kitchen => {
                layout.kitchens.push({
                    transform: kitchen.getAttribute('transform')
                });
            });

            svg.querySelectorAll('.bar').forEach(bar => {
                layout.bars.push({
                    transform: bar.getAttribute('transform')
                });
            });

            localStorage.setItem('restaurantLayout', JSON.stringify(layout));
            alert('Düzen kaydedildi!');
        }
        function loadLayout() {
            const savedLayout = JSON.parse(localStorage.getItem('restaurantLayout'));
            if (savedLayout) {
                svg.innerHTML = '';
                tableCount = 0;
                wallCount = 0;
                kitchenCount = 0;
                barCount = 0;

                savedLayout.tables.forEach(tableData => {
                    const table = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    table.setAttribute('class', 'table');
                    table.setAttribute('data-id', tableData.id);
                    table.setAttribute('data-number', tableData.number);
                    table.innerHTML = `
                        <!-- Masa -->
                        <rect x="0" y="0" width="60" height="40" rx="5" ry="5" fill="#8B4513" />
                        <rect x="2" y="2" width="56" height="36" rx="3" ry="3" fill="#D2691E" />
                        <rect x="4" y="4" width="52" height="32" rx="2" ry="2" fill="#A0522D" />
                        <rect x="6" y="6" width="48" height="28" fill="#CD853F" />
                        <line x1="6" y1="20" x2="54" y2="20" stroke="#8B4513" stroke-width="1" />
                        <line x1="30" y1="6" x2="30" y2="34" stroke="#8B4513" stroke-width="1" />
                        <!-- Koltuklar -->
                        <rect x="-10" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <rect x="50" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <rect x="20" y="-10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <rect x="20" y="30" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <!-- Gölge ve etiket -->
                        <rect x="0" y="37" width="60" height="6" rx="2" ry="2" fill="#8B4513" opacity="0.6" />
                        <text x="30" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Masa ${tableData.number}</text>
                    `;
                    table.setAttribute('transform', tableData.transform);
                    table.onmousedown = startDragging;
                    table.onclick = selectElement;
                    svg.appendChild(table);
                    tableCount++;
                });

                savedLayout.bars.forEach(barData => {
                    const bar = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    bar.setAttribute('class', 'bar');
                    bar.innerHTML = `
                        <!-- Bar Alanı -->
                        <rect x="0" y="0" width="120" height="40" rx="5" ry="5" fill="#8B4513" />
                        <rect x="2" y="2" width="116" height="36" rx="3" ry="3" fill="#D2691E" />
                        <!-- Bar Üstü -->
                        <rect x="5" y="5" width="110" height="30" fill="#CD853F" />
                        <!-- Bar Rafları -->
                        <rect x="10" y="10" width="100" height="5" fill="#A0522D" />
                        <rect x="10" y="20" width="100" height="5" fill="#A0522D" />
                        <!-- Bar Sandalyeleri -->
                        <circle cx="20" cy="45" r="5" fill="#8B4513" />
                        <circle cx="40" cy="45" r="5" fill="#8B4513" />
                        <circle cx="60" cy="45" r="5" fill="#8B4513" />
                        <circle cx="80" cy="45" r="5" fill="#8B4513" />
                        <circle cx="100" cy="45" r="5" fill="#8B4513" />
                        <!-- Etiket -->
                        <text x="60" y="55" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Bar ${barCount + 1}</text>
                    `;
                    bar.setAttribute('transform', barData.transform);
                    bar.onmousedown = startDragging;
                    bar.onclick = selectElement;
                    svg.appendChild(bar);
                    barCount++;
                });

                savedLayout.walls.forEach(wallData => {
                    const wall = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    wall.setAttribute('class', 'wall');
                    wall.setAttribute('x1', wallData.x1);
                    wall.setAttribute('y1', wallData.y1);
                    wall.setAttribute('x2', wallData.x2);
                    wall.setAttribute('y2', wallData.y2);
                    wall.onmousedown = startDragging;
                    wall.onclick = selectElement;
                    svg.appendChild(wall);
                    wallCount++;
                });

                savedLayout.kitchens.forEach(kitchenData => {
                    const kitchen = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    kitchen.setAttribute('class', 'kitchen');
                    kitchen.innerHTML = `
                        <!-- Mutfak Alanı -->
                        <rect x="0" y="0" width="100" height="80" rx="5" ry="5" fill="#E0E0E0" stroke="#808080" stroke-width="2" />
                        <rect x="5" y="5" width="90" height="70" rx="3" ry="3" fill="#F0F0F0" stroke="#A9A9A9" stroke-width="1" />
                        <!-- Tezgah -->
                        <rect x="10" y="15" width="80" height="20" fill="#D3D3D3" stroke="#A9A9A9" stroke-width="1" />
                        <!-- Lavabo -->
                        <circle cx="25" cy="25" r="8" fill="#C0C0C0" stroke="#A9A9A9" stroke-width="1" />
                        <!-- Ocak -->
                        <rect x="60" y="20" width="25" height="10" fill="#696969" stroke="#A9A9A9" stroke-width="1" />
                        <!-- Etiket -->
                        <text x="50" y="75" text-anchor="middle" fill="black" font-size="10" font-weight="bold">Mutfak ${kitchenCount + 1}</text>
                    `;
                    kitchen.setAttribute('transform', kitchenData.transform);
                    kitchen.onmousedown = startDragging;
                    kitchen.onclick = selectElement;
                    svg.appendChild(kitchen);
                    kitchenCount++;
                });

                tableCount = Math.max(...savedLayout.tables.map(t => parseInt(t.number)), 0);
            }
            updateMinimap();
        }

        window.addEventListener('load', loadLayout);
        updateMinimap();

        // Functions for modal operations
        function showBulkTableModal() {
            document.getElementById('bulkTableModal').style.display = 'flex';
        }

        function closeBulkTableModal() {
            document.getElementById('bulkTableModal').style.display = 'none';
        }

        function addBulkTables() {
            const horizontalCount = parseInt(document.getElementById('horizontalTables').value);
            const verticalCount = parseInt(document.getElementById('verticalTables').value);
            
            // Get current viewport scroll position
            const scrollLeft = editorContainer.scrollLeft;
            const scrollTop = editorContainer.scrollTop;
            
            // Calculate starting position relative to top left corner of viewport
            // Leave a little margin
            const startX = scrollLeft + 100;
            const startY = scrollTop + 100;
            
            // Table spacing
            const tableSpacingX = 100; // Horizontal distance
            const tableSpacingY = 80;  // Vertical distance
            
            for (let y = 0; y < verticalCount; y++) {
                for (let x = 0; x < horizontalCount; x++) {
                    tableCount++;
                    const tableId = generateGUID();
                    const table = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    table.setAttribute('class', 'table');
                    table.setAttribute('data-id', tableId);
                    table.setAttribute('data-number', tableCount);
                    table.innerHTML = `
                        <!-- Masa -->
                        <rect x="0" y="0" width="60" height="40" rx="5" ry="5" fill="#8B4513" />
                        <rect x="2" y="2" width="56" height="36" rx="3" ry="3" fill="#D2691E" />
                        <rect x="4" y="4" width="52" height="32" rx="2" ry="2" fill="#A0522D" />
                        <rect x="6" y="6" width="48" height="28" fill="#CD853F" />
                        <line x1="6" y1="20" x2="54" y2="20" stroke="#8B4513" stroke-width="1" />
                        <line x1="30" y1="6" x2="30" y2="34" stroke="#8B4513" stroke-width="1" />
                        <!-- Koltuklar -->
                        <rect x="-10" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <rect x="50" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <rect x="20" y="-10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <rect x="20" y="30" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
                        <!-- Gölge ve etiket -->
                        <rect x="0" y="37" width="60" height="6" rx="2" ry="2" fill="#8B4513" opacity="0.6" />
                        <text x="30" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Masa ${tableCount}</text>
                    `;
                    
                    const posX = startX + (x * tableSpacingX);
                    const posY = startY + (y * tableSpacingY);
                    
                    table.setAttribute('transform', `translate(${posX}, ${posY}) rotate(0)`);
                    
                    table.onmousedown = startDragging;
                    table.onclick = selectElement;
                    
                    svg.appendChild(table);
                }
            }
            
            updateMinimap();
            closeBulkTableModal();
        }