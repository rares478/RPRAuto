import Cookies from 'js-cookie';

export async function verifyUserHandle() {
    try {
        const token = Cookies.get('authToken');

        if (!token) {
            console.log("No auth token found in cookies.");
            return false;
        }

        const response = await fetch('https://rprauto.onrender.com/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(token),
        });

        if (response.ok) {
            return true;
        } else {
            Cookies.remove('authToken');
            console.log(response.message);

            return false;
        }
    } catch (error) {
        Cookies.remove('authToken');
        console.error('Token validation failed: ', error);

        return false;
    }
};
