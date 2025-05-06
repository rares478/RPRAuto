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
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.valid === true;
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};
