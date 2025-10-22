// API Service for ArtSwipe Application
class ArtSwipeAPI {
    constructor() {
        this.baseURL = 'https://api.example.com'; // Replace with actual API URL
        this.token = localStorage.getItem('artswipe-token');
    }
    
    // Authentication methods
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                localStorage.setItem('artswipe-token', data.token);
                return data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }
    
    // Artwork methods
    async getArtworks(page = 1, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/artworks?page=${page}&limit=${limit}`, {
                headers: this.getAuthHeaders()
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get artworks error:', error);
            throw error;
        }
    }
    
    async rateArtwork(artworkId, rating) {
        try {
            const response = await fetch(`${this.baseURL}/artworks/${artworkId}/rate`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ rating })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Rate artwork error:', error);
            throw error;
        }
    }
    
    async uploadArtwork(artworkData) {
        try {
            const response = await fetch(`${this.baseURL}/artworks`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: artworkData
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Upload artwork error:', error);
            throw error;
        }
    }
    
    // User methods
    async getUserProfile() {
        try {
            const response = await fetch(`${this.baseURL}/user/profile`, {
                headers: this.getAuthHeaders()
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }
    
    async updateUserProfile(profileData) {
        try {
            const response = await fetch(`${this.baseURL}/user/profile`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update user profile error:', error);
            throw error;
        }
    }
    
    // Notifications methods
    async getNotifications() {
        try {
            const response = await fetch(`${this.baseURL}/notifications`, {
                headers: this.getAuthHeaders()
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get notifications error:', error);
            throw error;
        }
    }
    
    async markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: this.getAuthHeaders()
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Mark notification as read error:', error);
            throw error;
        }
    }
    
    // Utility methods
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    logout() {
        this.token = null;
        localStorage.removeItem('artswipe-token');
    }
    
    // Mock data for development
    async getMockArtworks() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: [
                        {
                            id: 1,
                            artist: '@artist123',
                            title: 'Абстрактная композиция',
                            image: 'mock-image-1',
                            likes: 24,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: 2,
                            artist: '@painter_pro',
                            title: 'Городской пейзаж',
                            image: 'mock-image-2',
                            likes: 156,
                            createdAt: new Date(Date.now() - 86400000).toISOString()
                        },
                        {
                            id: 3,
                            artist: '@digital_artist',
                            title: 'Цифровое искусство',
                            image: 'mock-image-3',
                            likes: 89,
                            createdAt: new Date(Date.now() - 172800000).toISOString()
                        }
                    ]
                });
            }, 500);
        });
    }
}

// Export for use in other modules
window.ArtSwipeAPI = ArtSwipeAPI;
