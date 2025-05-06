import Cookies from 'js-cookie';

export async function loginHandle(email, password) {
    try {
        const token = Cookies.get('authToken');

        if (!token) return false;

        const response = await fetch('/login/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(token),
        });

        if (response.status === 200) {
            return true;
        } else if (response.status === 401) {
            Cookies.remove('authToken');

            const data = await response.json();
            console.warn('Unauthorized:', data.message || 'Invalid token');
            
            return false;
        } else {
            console.error('Unexpected response:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};
