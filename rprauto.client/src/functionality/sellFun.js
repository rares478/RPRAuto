export async function submitListing(data) {
    try {
        const response = await fetch('https://rprauto.onrender.com/auth/listings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) return false;
        return true;
    } catch (error) {
        console.error('Error submitting listing:', error);
        return false;
    }
}
