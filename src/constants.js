export const CONSTANTS = {
    MIN_SCALE: 0.5,
    MAX_SCALE: 2,
    SCALE_STEP: 0.1,
    SVG_WIDTH: 2000,
    SVG_HEIGHT: 2000,
    TABLE_SPACING: {
        X: 100,
        Y: 80
    },
    SVG_TEMPLATES: {
        TABLE: `
            <!-- Table -->
            <rect x="0" y="0" width="60" height="40" rx="5" ry="5" fill="#8B4513" />
            <rect x="2" y="2" width="56" height="36" rx="3" ry="3" fill="#D2691E" />
            <rect x="4" y="4" width="52" height="32" rx="2" ry="2" fill="#A0522D" />
            <rect x="6" y="6" width="48" height="28" fill="#CD853F" />
            <line x1="6" y1="20" x2="54" y2="20" stroke="#8B4513" stroke-width="1" />
            <line x1="30" y1="6" x2="30" y2="34" stroke="#8B4513" stroke-width="1" />
            <!-- Chairs -->
            <rect x="-10" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
            <rect x="50" y="10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
            <rect x="20" y="-10" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
            <rect x="20" y="30" width="20" height="20" rx="3" ry="3" fill="#8B4513" />
            <!-- Shadow and label -->
            <rect x="0" y="37" width="60" height="6" rx="2" ry="2" fill="#8B4513" opacity="0.6" />
            <text x="30" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Masa {{number}}</text>
        `,
        BAR: `
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
                <text x="60" y="55" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Bar</text>
            `,
        KITCHEN: `
        <!-- Kitchen Area -->
        <rect x="0" y="0" width="100" height="80" rx="5" ry="5" fill="#E0E0E0" stroke="#808080" stroke-width="2" />
        <rect x="5" y="5" width="90" height="70" rx="3" ry="3" fill="#F0F0F0" stroke="#A9A9A9" stroke-width="1" />
        <!-- Table -->
        <rect x="10" y="15" width="80" height="20" fill="#D3D3D3" stroke="#A9A9A9" stroke-width="1" />
        <!-- Sink -->
        <circle cx="25" cy="25" r="8" fill="#C0C0C0" stroke="#A9A9A9" stroke-width="1" />
        <!-- Oven -->
        <rect x="60" y="20" width="25" height="10" fill="#696969" stroke="#A9A9A9" stroke-width="1" />
            <!-- Label -->
            <text x="50" y="75" text-anchor="middle" fill="black" font-size="10" font-weight="bold">Kitchen</text>
        `
    },
    DOM_IDS: {
        EDITOR: 'editor',
        EDITOR_CONTAINER: 'editor-container',
        BULK_TABLE_MODAL: 'bulkTableModal',
        HORIZONTAL_TABLES: 'horizontalTables',
        VERTICAL_TABLES: 'verticalTables'
    },
    MODES: {
        SELECT: 'select',
        WALL: 'wall'
    },
    STORAGE_KEYS: {
        LAYOUT: 'restaurantLayout'
    },
    TRANSFORM_PATTERNS: {
        TRANSLATE: /translate\(([^,]+),([^)]+)\)/,
        ROTATE: /rotate\(([^)]+)\)/
    }
}; 