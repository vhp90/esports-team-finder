import axios from 'axios';

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post('/api/auth/refresh', null, {
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });

        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
        return access_token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        clearTokens();
        window.location.href = '/login';
        throw error;
    }
};
