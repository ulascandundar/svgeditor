export class HistoryManager {
    constructor(editor) {
        this.editor = editor;
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50; // Maksimum kayıt sayısı
    }

    // Yeni bir değişiklik kaydet
    pushState(state) {
        // State'i JSON olarak saklayalım
        const serializedState = JSON.stringify(state);
        
        this.undoStack.push(serializedState);
        // Yeni bir değişiklik yapıldığında redo stack'i temizle
        this.redoStack = [];
        
        // Stack boyutunu kontrol et
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
    }

    // Geri alma işlemi
    undo() {
        if (this.undoStack.length > 0) {
            const currentState = this.editor.getCurrentState();
            this.redoStack.push(JSON.stringify(currentState));
            
            const previousState = JSON.parse(this.undoStack.pop());
            this.editor.setState(previousState);
            return true;
        }
        return false;
    }

    // İleri alma işlemi
    redo() {
        if (this.redoStack.length > 0) {
            const currentState = this.editor.getCurrentState();
            this.undoStack.push(JSON.stringify(currentState));
            
            const nextState = JSON.parse(this.redoStack.pop());
            this.editor.setState(nextState);
            return true;
        }
        return false;
    }

    // Stack'leri temizle
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
} 