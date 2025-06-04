import Cookies from 'js-cookie';

export async function registerHandle(firstName, email, password, phone, isCompany, companyName, cui) {
    const registerData = {
        email: email,
        password: password,
        firstName: firstName,
        lastName: '', // Required by server but not used in our form
        phoneNumber: phone || '', // Make sure it's not undefined
        address: '', // Required by server but not used in our form
        city: '', // Required by server but not used in our form
        country: '', // Required by server but not used in our form
        isCompany: isCompany,
        companyCUI: isCompany ? cui : null // Only include CUI if it's a company account
    };

    try {
        const response = await fetch('https://rprauto-ajdq.onrender.com/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        const data = await response.json();

        if (response.ok) {
            return { 
                success: true, 
                token: data.Token,
                userData: {
                    email: data.UserData?.Email,
                    role: data.UserData?.Role,
                    createdAt: data.UserData?.CreatedAt
                }
            }
        } else {
            return { success: false, message: data.message }        
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: 'An error occurred during registration' }
    }  
}

export const validateName = (name) => /^[A-Z][a-zA-Z]*$/.test(name);

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) => /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

export const validatePhone = (phone) => /^(07|02|03)\d{8}$/.test(phone);

export const validateCUI = (cui) => /^\d{1,10}$/.test(cui); // Basic Romanian CUI (1-10 digits)
