import Cookies from 'js-cookie';

export async function registerHandle(firstName, email, password, phone, individual, companyName, cui) {
    const registerData = {
        firstName: firstName,
        email: email,
        password: password,
        phone: phone,
        individual: individual,
        companyName: companyName,
        cui: cui
    };

    try {
        // change to the host on vercel !!!

        const response = await fetch('https://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
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
