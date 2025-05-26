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
       
        if (response.ok) {
            Cookies.set("authToken", data.token, { 
                expires: 60, 
                secure: true, 
                sameSite: 'none' 
            });
            return { success: true }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'An error occurred during login' }
    }
}
