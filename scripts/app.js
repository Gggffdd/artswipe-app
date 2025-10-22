// Main Application Controller
class ArtSwipeApp {
    constructor() {
        this.currentTab = 'rating';
        this.currentArtIndex = 0;
        this.userDrawings = [];
        this.notifications = [];
        this.userStats = {
            ratedToday: 24,
            totalRated: 156,
            drawingsCount: 12
        };
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupEventListeners();
        this.updateTime();
        this.loadDemoData();
        this.setupServiceWorker();
        
        // Update stats display
        this.updateStats();
        
        // Start time updates
        setInterval(() => this.updateTime(), 60000);
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Navigation icons
        document.getElementById('notificationsBtn').addEventListener('click', () => {
            this.showNotificationsPanel();
        });
        
        document.getElementById('profileBtn').addEventListener('click', () => {
            this.showProfilePanel();
        });
        
        // Panel close buttons
        document.getElementById('closeNotifications').addEventListener('click', () => {
            this.hideNotificationsPanel();
        });
        
        document.getElementById('closeProfile').addEventListener('click', () => {
            this.hideProfilePanel();
        });
        
        // Back to rating from drawing
        document.getElementById('backToRating').addEventListener('click', () => {
            this.switchTab('rating');
        });
        
        // Save drawing
        document.getElementById('saveDrawing').addEventListener('click', () => {
            this.saveCurrentDrawing();
        });
        
        // Clear canvas
        document.getElementById('clearCanvas').addEventListener('click', () => {
            if (window.drawingManager) {
                window.drawingManager.clearCanvas();
            }
        });
        
        // Brush size change
        document.getElementById('brushSize').addEventListener('input', (e) => {
            const sizeValue = document.getElementById('sizeValue');
            sizeValue.textContent = `${e.target.value}px`;
            
            if (window.drawingManager) {
                window.drawingManager.setBrushSize(parseInt(e.target.value));
            }
        });
        
        // Color pickers
        document.querySelectorAll('.color-picker').forEach(picker => {
            picker.addEventListener('click', (e) => {
                document.querySelectorAll('.color-picker').forEach(p => {
                    p.classList.remove('active');
                });
                e.target.classList.add('active');
                
                if (window.drawingManager) {
                    window.drawingManager.setBrushColor(e.target.dataset.color);
                }
            });
        });
        
        // Click outside panels to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notifications-panel') && 
                !e.target.closest('#notificationsBtn')) {
                this.hideNotificationsPanel();
            }
            
            if (!e.target.closest('.profile-panel') && 
                !e.target.closest('#profileBtn')) {
                this.hideProfilePanel();
            }
        });
    }
    
    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabName}Tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Initialize tab-specific functionality
        if (tabName === 'drawing') {
            this.initializeDrawingTab();
        } else if (tabName === 'gallery') {
            this.loadGallery();
        } else if (tabName === 'rating') {
            this.loadNextArtwork();
        }
    }
    
    initializeDrawingTab() {
        if (!window.drawingManager) {
            window.drawingManager = new DrawingManager('drawingCanvas');
        }
        
        // Set initial brush settings
        const activeColor = document.querySelector('.color-picker.active');
        if (activeColor && window.drawingManager) {
            window.drawingManager.setBrushColor(activeColor.dataset.color);
        }
        
        const brushSize = document.getElementById('brushSize');
        if (brushSize && window.drawingManager) {
            window.drawingManager.setBrushSize(parseInt(brushSize.value));
        }
    }
    
    saveCurrentDrawing() {
        if (window.drawingManager) {
            const drawingData = window.drawingManager.getDrawingData();
            
            // Create new drawing object
            const newDrawing = {
                id: Date.now(),
                title: `Рисунок ${this.userDrawings.length + 1}`,
                data: drawingData,
                createdAt: new Date().toISOString(),
                likes: 0,
                views: 0
            };
            
            this.userDrawings.push(newDrawing);
            this.userStats.drawingsCount++;
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Show success message
            this.showNotification('Рисунок сохранен и отправлен на оценку!');
            
            // Clear canvas
            window.drawingManager.clearCanvas();
            
            // Update stats
            this.updateStats();
            
            // Switch to rating tab to see the drawing in the feed
            setTimeout(() => {
                this.switchTab('rating');
            }, 1500);
        }
    }
    
    loadNextArtwork() {
        // In a real app, this would fetch from an API
        const artworks = this.getDemoArtworks();
        const artwork = artworks[this.currentArtIndex % artworks.length];
        
        this.displayArtwork(artwork);
        this.currentArtIndex++;
    }
    
    displayArtwork(artwork) {
        const canvas = document.getElementById('artCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw artwork
        if (artwork.type === 'gradient') {
            this.drawGradientArtwork(ctx, canvas, artwork);
        } else if (artwork.type === 'demo') {
            this.drawDemoArtwork(ctx, canvas, artwork);
        }
        
        // Update artist info
        const artistName = document.querySelector('.artist-name');
        const artTitle = document.querySelector('.art-title');
        
        if (artistName) artistName.textContent = artwork.artist;
        if (artTitle) artTitle.textContent = artwork.title;
    }
    
    drawGradientArtwork(ctx, canvas, artwork) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, artwork.colors[0]);
        gradient.addColorStop(1, artwork.colors[1]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some abstract shapes
        artwork.shapes.forEach(shape => {
            ctx.fillStyle = shape.color;
            
            if (shape.type === 'circle') {
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                ctx.fill();
            } else if (shape.type === 'rectangle') {
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            }
        });
        
        // Add title
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(artwork.title, canvas.width / 2, canvas.height - 30);
    }
    
    drawDemoArtwork(ctx, canvas, artwork) {
        // Implement different demo artwork styles
        // This is a simplified version - extend as needed
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(1, '#fad0c4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add artistic elements based on artwork style
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(150, 150, 60, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(106, 17, 203, 0.5)';
        ctx.beginPath();
        ctx.ellipse(100, 250, 40, 70, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    loadGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        galleryGrid.innerHTML = '';
        
        this.userDrawings.forEach(drawing => {
            const galleryItem = this.createGalleryItem(drawing);
            galleryGrid.appendChild(galleryItem);
        });
        
        // Update gallery stats
        const galleryStats = document.querySelector('.gallery-stats span');
        if (galleryStats) {
            galleryStats.textContent = `${this.userDrawings.length} рисунков`;
        }
    }
    
    createGalleryItem(drawing) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <div class="gallery-item-image" style="background: linear-gradient(45deg, #667eea, #764ba2); height: 120px;"></div>
            <div class="gallery-item-info">
                <div class="gallery-item-title">${drawing.title}</div>
                <div class="gallery-item-stats">
                    <span>❤️ ${drawing.likes}</span>
                    <span>👁️ ${drawing.views}</span>
                </div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.viewDrawing(drawing);
        });
        
        return item;
    }
    
    viewDrawing(drawing) {
        // In a full implementation, this would show the drawing in a modal
        this.showNotification(`Просмотр: ${drawing.title}`);
    }
    
    showNotificationsPanel() {
        document.getElementById('notificationsPanel').style.right = '0';
        this.loadNotifications();
    }
    
    hideNotificationsPanel() {
        document.getElementById('notificationsPanel').style.right = '-400px';
    }
    
    showProfilePanel() {
        document.getElementById('profilePanel').style.right = '0';
        this.loadProfile();
    }
    
    hideProfilePanel() {
        document.getElementById('profilePanel').style.right = '-400px';
    }
    
    loadNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        notificationsList.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.innerHTML = `
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            `;
            
            notificationItem.addEventListener('click', () => {
                this.markNotificationAsRead(notification.id);
            });
            
            notificationsList.appendChild(notificationItem);
        });
    }
    
    loadProfile() {
        const profileContent = document.querySelector('.profile-content');
        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar" style="width: 80px; height: 80px; background: var(--primary-color); border-radius: 50%; margin: 0 auto 20px;"></div>
                <h3 style="text-align: center; margin-bottom: 10px;">@artlover</h3>
                <p style="text-align: center; color: #666; margin-bottom: 30px;">Любитель искусства</p>
            </div>
            
            <div class="profile-stats">
                <div class="stat-item">
                    <span class="stat-number">${this.userStats.totalRated}</span>
                    <span class="stat-label">Оценено работ</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.userStats.drawingsCount}</span>
                    <span class="stat-label">Мои рисунки</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.getTotalLikes()}</span>
                    <span class="stat-label">Всего лайков</span>
                </div>
            </div>
            
            <div class="profile-actions">
                <button class="profile-btn" onclick="app.showNotification('Настройки пока недоступны')">Настройки</button>
                <button class="profile-btn" onclick="app.showNotification('Справка пока недоступна')">Справка</button>
                <button class="profile-btn logout" onclick="app.showNotification('Выход выполнен')">Выйти</button>
            </div>
        `;
    }
    
    getTotalLikes() {
        return this.userDrawings.reduce((total, drawing) => total + drawing.likes, 0);
    }
    
    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveToLocalStorage();
            this.loadNotifications();
        }
    }
    
    showNotification(message) {
        const toast = document.getElementById('notificationToast');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'flex';
    }
    
    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
    
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        document.getElementById('currentTime').textContent = timeString;
    }
    
    updateStats() {
        document.querySelectorAll('.stat .count').forEach(stat => {
            const label = stat.nextElementSibling.textContent;
            if (label.includes('Оценено сегодня')) {
                stat.textContent = this.userStats.ratedToday;
            } else if (label.includes('Всего оценок')) {
                stat.textContent = this.userStats.totalRated;
            }
        });
    }
    
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'только что';
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)} мин назад`;
        } else if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)} ч назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }
    
    loadDemoData() {
        // Load demo artworks
        this.currentArtIndex = 0;
        
        // Load user data from localStorage
        this.loadFromLocalStorage();
        
        // Generate demo notifications
        this.generateDemoNotifications();
    }
    
    getDemoArtworks() {
        return [
            {
                id: 1,
                artist: '@artist123',
                title: 'Абстрактная композиция',
                type: 'gradient',
                colors: ['#ff9a9e', '#fad0c4'],
                shapes: [
                    { type: 'circle', x: 150, y: 150, radius: 60, color: 'rgba(255, 255, 255, 0.7)' },
                    { type: 'ellipse', x: 100, y: 250, radiusX: 40, radiusY: 70, color: 'rgba(106, 17, 203, 0.5)' }
                ]
            },
            {
                id: 2,
                artist: '@painter_pro',
                title: 'Городской пейзаж',
                type: 'demo',
                colors: ['#667eea', '#764ba2']
            },
            {
                id: 3,
                artist: '@digital_artist',
                title: 'Цифровое искусство',
                type: 'gradient',
                colors: ['#f093fb', '#f5576c'],
                shapes: [
                    { type: 'rectangle', x: 50, y: 100, width: 200, height: 80, color: 'rgba(255, 255, 255, 0.6)' },
                    { type: 'circle', x: 250, y: 300, radius: 40, color: 'rgba(46, 213, 115, 0.5)' }
                ]
            }
        ];
    }
    
    generateDemoNotifications() {
        if (this.notifications.length === 0) {
            this.notifications = [
                {
                    id: 1,
                    title: 'Новый лайк!',
                    message: 'Ваш рисунок "Городской пейзаж" понравился пользователю @art_lover',
                    timestamp: Date.now() - 300000, // 5 minutes ago
                    read: false
                },
                {
                    id: 2,
                    message: 'Ваш рисунок набрал 10 лайков!',
                    timestamp: Date.now() - 3600000, // 1 hour ago
                    read: true
                },
                {
                    id: 3,
                    title: 'Новый комментарий',
                    message: '@creative_soul оставил комментарий к вашему рисунку',
                    timestamp: Date.now() - 86400000, // 1 day ago
                    read: true
                }
            ];
        }
    }
    
    saveToLocalStorage() {
        const appData = {
            userDrawings: this.userDrawings,
            notifications: this.notifications,
            userStats: this.userStats
        };
        
        localStorage.setItem('artswipe-app-data', JSON.stringify(appData));
    }
    
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('artswipe-app-data');
        
        if (savedData) {
            const appData = JSON.parse(savedData);
            this.userDrawings = appData.userDrawings || [];
            this.notifications = appData.notifications || [];
            this.userStats = appData.userStats || this.userStats;
        }
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.log('Ошибка регистрации Service Worker:', error);
                });
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ArtSwipeApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app) {
        window.app.updateTime();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.app) {
        window.app.showNotification('Соединение восстановлено');
    }
});

window.addEventListener('offline', () => {
    if (window.app) {
        window.app.showNotification('Отсутствует соединение');
    }
});
