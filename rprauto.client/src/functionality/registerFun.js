import Cookies from 'js-cookie';

export async function registerHandle(firstName, email, password, phone, isCompany, companyName, cui) {
    const registerData = {
        firstName: firstName,
        email: email,
        password: password,
        phoneNumber: phone,
        isCompany: isCompany,
        companyName: companyName,
        cui: cui
    };

    try {
        const response = await fetch('https://rprauto.onrender.com/register', {
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
