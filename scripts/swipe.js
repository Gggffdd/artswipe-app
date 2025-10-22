// Swipe Gesture Manager
class SwipeManager {
    constructor(cardElement, likeCallback, dislikeCallback) {
        this.card = cardElement;
        this.startX = 0;
        this.currentX = 0;
        this.startY = 0;
        this.isDragging = false;
        this.likeCallback = likeCallback;
        this.dislikeCallback = dislikeCallback;
        
        this.likeIndicator = document.querySelector('.like-indicator');
        this.dislikeIndicator = document.querySelector('.dislike-indicator');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Touch events
        this.card.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.card.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.card.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Mouse events for desktop
        this.card.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.card.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.card.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.card.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        // Prevent image drag on desktop
        this.card.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    handleTouchStart(e) {
        this.startDragging(e.touches[0].clientX, e.touches[0].clientY);
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        this.updateDragging(e.touches[0].clientX);
        e.preventDefault();
    }
    
    handleTouchEnd() {
        this.endDragging();
    }
    
    handleMouseDown(e) {
        this.startDragging(e.clientX, e.clientY);
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.updateDragging(e.clientX);
    }
    
    handleMouseUp() {
        this.endDragging();
    }
    
    startDragging(clientX, clientY) {
        this.isDragging = true;
        this.startX = clientX;
        this.startY = clientY;
        this.currentX = clientX;
        
        this.card.style.transition = 'none';
        this.card.style.cursor = 'grabbing';
        
        // Hide indicators initially
        this.likeIndicator.style.opacity = '0';
        this.dislikeIndicator.style.opacity = '0';
    }
    
    updateDragging(clientX) {
        if (!this.isDragging) return;
        
        this.currentX = clientX;
        const diff = this.currentX - this.startX;
        
        // Apply movement with resistance
        const resistance = 0.5;
        const moveX = diff * resistance;
        
        // Calculate rotation based on movement
        const rotation = moveX * 0.1;
        
        this.card.style.transform = `translateX(${moveX}px) rotate(${rotation}deg)`;
        
        // Show/hide indicators based on direction and distance
        if (moveX > 50) {
            this.likeIndicator.style.opacity = '1';
            this.dislikeIndicator.style.opacity = '0';
        } else if (moveX < -50) {
            this.likeIndicator.style.opacity = '0';
            this.dislikeIndicator.style.opacity = '1';
        } else {
            this.likeIndicator.style.opacity = '0';
            this.dislikeIndicator.style.opacity = '0';
        }
        
        // Add opacity effect when swiping far
        const opacity = 1 - Math.min(Math.abs(moveX) / 200, 0.3);
        this.card.style.opacity = opacity;
    }
    
    endDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        this.card.style.cursor = 'grab';
        
        const diff = this.currentX - this.startX;
        const moveX = diff * 0.5; // Apply resistance
        
        // Determine if swipe threshold was reached
        const swipeThreshold = 100;
        
        if (moveX > swipeThreshold) {
            // Swipe right - Like
            this.swipeRight();
        } else if (moveX < -swipeThreshold) {
            // Swipe left - Dislike
            this.swipeLeft();
        } else {
            // Return to original position
            this.resetPosition();
        }
    }
    
    swipeRight() {
        this.card.style.transform = 'translateX(500px) rotate(30deg)';
        this.likeIndicator.style.opacity = '0';
        
        setTimeout(() => {
            if (this.likeCallback) {
                this.likeCallback();
            }
            this.resetCard();
        }, 500);
    }
    
    swipeLeft() {
        this.card.style.transform = 'translateX(-500px) rotate(-30deg)';
        this.dislikeIndicator.style.opacity = '0';
        
        setTimeout(() => {
            if (this.dislikeCallback) {
                this.dislikeCallback();
            }
            this.resetCard();
        }, 500);
    }
    
    resetPosition() {
        this.card.style.transform = 'translateX(0) rotate(0)';
        this.card.style.opacity = '1';
        this.likeIndicator.style.opacity = '0';
        this.dislikeIndicator.style.opacity = '0';
    }
    
    resetCard() {
        this.card.style.transition = 'none';
        this.card.style.transform = 'translateX(0) rotate(0)';
        this.card.style.opacity = '1';
        
        // Force reflow
        void this.card.offsetWidth;
        
        this.card.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    }
    
    // Programmatic swipe methods
    like() {
        this.swipeRight();
    }
    
    dislike() {
        this.swipeLeft();
    }
}

// Initialize swipe functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const artCard = document.getElementById('artCard');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    
    if (artCard) {
        const swipeManager = new SwipeManager(
            artCard,
            () => {
                // Like callback
                if (window.app) {
                    window.app.userStats.ratedToday++;
                    window.app.userStats.totalRated++;
                    window.app.updateStats();
                    window.app.showNotification('Лайк! Загружаем следующий рисунок...');
                    setTimeout(() => window.app.loadNextArtwork(), 600);
                }
            },
            () => {
                // Dislike callback
                if (window.app) {
                    window.app.userStats.ratedToday++;
                    window.app.userStats.totalRated++;
                    window.app.updateStats();
                    window.app.showNotification('Дизлайк! Загружаем следующий рисунок...');
                    setTimeout(() => window.app.loadNextArtwork(), 600);
                }
            }
        );
        
        // Add button event listeners
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                swipeManager.like();
            });
        }
        
        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', () => {
                swipeManager.dislike();
            });
        }
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                swipeManager.like();
            } else if (e.key === 'ArrowLeft') {
                swipeManager.dislike();
            }
        });
    }
});
