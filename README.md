# SVG Restaurant Layout Editor

A web-based SVG editor designed for creating and managing restaurant floor plans. Users can create zones, add tables, draw walls, and interactively edit the restaurant layout.

## Features

### Zone Management
- Create salon, garden, and terrace zones
- Drag and resize zones
- Double-click to enter detailed zone editing
- Independent content management for each zone

### Table and Element Management
- Single table placement
- Multiple table placement (grid layout)
- Wall drawing and editing
- Kitchen and bar area placement
- Drag and rotate elements
- Multiple selection and bulk editing

### View Controls
- Zoom in/out functionality
- Easy navigation with minimap
- Selection mode
- Grid system

### Additional Features
- Undo/Redo system (Ctrl+Z, Ctrl+Y)
- Auto-save functionality
- Layout export
- Keyboard shortcuts

## Keyboard Shortcuts

- `Ctrl + Z`: Undo last action
- `Ctrl + Y` or `Ctrl + Shift + Z`: Redo last undone action
- `Delete`: Delete selected elements
- `Escape`: Clear selection
- `Enter`: Rotate selected element
- `Arrow keys`: Move selected elements
- `Ctrl + Scroll`: Zoom in/out

## Usage

1. **Creating Zones:**
   - Use "Add Salon", "Add Garden", or "Add Terrace" buttons
   - Drag created zones to position them
   - Double-click a zone to enter it

2. **Adding Tables:**
   - Click "Add Table" for single table placement
   - Use "Add Multiple Tables" for grid layout
   - Drag tables to position them
   - Press Enter to rotate

3. **Drawing Walls:**
   - Click "Add Wall" button
   - Click starting point
   - Drag to draw the wall
   - Release mouse to finish

4. **Editing:**
   - Click elements to select them
   - Drag to create selection area for multiple elements
   - Use arrow keys for precise positioning
   - Press Delete to remove selected elements

5. **Saving:**
   - Click "Save" button to save layout
   - Changes are automatically saved to local storage

## Development

The project uses the following technologies:

- HTML5 SVG
- Vanilla JavaScript (Modular structure)
- CSS3 (Modern animations and effects)

### Project Structure

```
svgeditor/
├── src/
│   ├── managers/
│   │   ├── TableManager.js
│   │   ├── WallManager.js
│   │   ├── ZoneManager.js
│   │   ├── KitchenManager.js
│   │   ├── BarManager.js
│   │   ├── SelectionManager.js
│   │   ├── MinimapManager.js
│   │   └── HistoryManager.js
│   ├── utils/
│   │   └── helpers.js
│   ├── editor.js
│   ├── eventListeners.js
│   ├── constants.js
│   └── main.js
├── styles.css
├── index.html
└── README.md
```
