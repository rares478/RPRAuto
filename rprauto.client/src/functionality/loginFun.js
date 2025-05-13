import Cookies from 'js-cookie';

export async function loginHandle(email, password) {
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
       
        if (data.status === 200) {
            Cookies.set("authToken", data.token, { expires: 60, secure: true, sameSite: 'strict' });
            return { success: true, token: data.token }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
