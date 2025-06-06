import Cookies from 'js-cookie';

export async function loginHandle(email, password) {
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('https://rprauto-ajdq.onrender.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
       
        if (response.ok) {
            return { 
                success: true, 
                token: data.Token,
                userData: data.UserData // Include user data in the response
            }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'An error occurred during login' }
    }
}
