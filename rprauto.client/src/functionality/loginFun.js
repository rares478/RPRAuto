import Cookies from 'js-cookie';

export async function loginHandle(email, password) {
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('https://rprauto.onrender.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug log
       
        if (response.ok) {
            console.log('Token from server:', data.Token); // Debug log
            return { success: true, token: data.Token }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'An error occurred during login' }
    }
}
