export async function loadCarsHandle(filters, page, pageSize) {
    try {
        const response = await fetch(`https://rprauto.onrender.com/listing?page=${page}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response !== null) {
            const data = await response.json();

            return data;
        } else {
            console.error('Failed to load cars from the server');
            return null;
        }
    } catch (error) {
        console.error('An unexpected error occured: ', error);
    }
};
