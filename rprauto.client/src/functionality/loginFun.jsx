import Cookies from 'js-cookie';

async function loginHandle(username, password) {
    const loginData = {
        username: username,
        password: password
    };

    try {
        // change to the host on vercel !!!

        const response = await fetch('https://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Success: ', data);
            Cookies.set("authToken", data.token, { expires: 30, secure: true, sameSite: 'strict' });
        } else {
            console.log('Error: ', data);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    
}
