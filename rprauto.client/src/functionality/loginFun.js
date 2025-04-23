import Cookies from 'js-cookie';

export async function loginHandle(email, password) {
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('https://rpr-auto.vercel.app/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
       
        if (data.status === 200) {
            Cookies.set("authToken", data.token, { expires: 30, secure: true, sameSite: 'strict' });
            return { success: true }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
