export function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getCurrentRotation(element) {
    const transform = element.getAttribute('transform');
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    return rotateMatch ? parseFloat(rotateMatch[1]) : 0;
} 