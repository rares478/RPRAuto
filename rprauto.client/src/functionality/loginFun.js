export async function loginHandle(email, password) {
    const loginData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('https://rprauto.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
       
        if (data.status === 200) {
            return { success: true, token: data.token }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
