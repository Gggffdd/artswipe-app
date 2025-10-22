// Drawing Manager Class
class DrawingManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.brushColor = '#6a11cb';
        this.brushSize = 5;
        this.drawingHistory = [];
        this.historyIndex = -1;
        
        this.initializeCanvas();
        this.setupEventListeners();
    }
    
    initializeCanvas() {
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Set initial canvas style
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.brushColor;
        
        this.saveState();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        // Prevent scrolling when drawing on touch devices
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = this.getCoordinates(e);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const [currentX, currentY] = this.getCoordinates(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        
        [this.lastX, this.lastY] = [currentX, currentY];
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        this.canvas.dispatchEvent(mouseEvent);
    }
    
    getCoordinates(e) {
        let x, y;
        
        if (e.type.includes('touch')) {
            const rect = this.canvas.getBoundingClientRect();
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.offsetX;
            y = e.offsetY;
        }
        
        return [x, y];
    }
    
    setBrushColor(color) {
        this.brushColor = color;
        this.ctx.strokeStyle = color;
    }
    
    setBrushSize(size) {
        this.brushSize = size;
        this.ctx.lineWidth = size;
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }
    
    redo() {
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }
    
    saveState() {
        // Remove any future states if we're not at the end
        if (this.historyIndex < this.drawingHistory.length - 1) {
            this.drawingHistory = this.drawingHistory.slice(0, this.historyIndex + 1);
        }
        
        // Save current state
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.drawingHistory.push(imageData);
        this.historyIndex++;
        
        // Limit history size to prevent memory issues
        if (this.drawingHistory.length > 50) {
            this.drawingHistory.shift();
            this.historyIndex--;
        }
    }
    
    restoreState() {
        if (this.drawingHistory[this.historyIndex]) {
            this.ctx.putImageData(this.drawingHistory[this.historyIndex], 0, 0);
        }
    }
    
    getDrawingData() {
        return this.canvas.toDataURL('image/png');
    }
    
    loadDrawing(dataURL) {
        const img = new Image();
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
            this.saveState();
        };
        img.src = dataURL;
    }
    
    // Utility methods for different brush types
    setEraser() {
        this.ctx.strokeStyle = 'white';
    }
    
    setBrush() {
        this.ctx.strokeStyle = this.brushColor;
    }
    
    // Method to draw predefined shapes (for future enhancements)
    drawRectangle(x, y, width, height) {
        this.ctx.strokeRect(x, y, width, height);
        this.saveState();
    }
    
    drawCircle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.saveState();
    }
}
