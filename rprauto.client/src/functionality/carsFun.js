export const fetchCars = async () => {
    try {
        const response = await fetch('https://rprauto.onrender.com/listing?page=1&pageSize=3');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const cars = (data.Listings || []).map(listing => ({
            id: listing._id,
            make: listing.make || "N/A",
            model: listing.model || "N/A",
            year: listing.year || "N/A",
            price: listing.price || "N/A",
            gearbox: listing.gearbox || "N/A",
            body: listing.body || "N/A",
            color: listing.color || "N/A",
            doors: listing.doors || "N/A",
            fuel: listing.fuel || "N/A",
            engine: listing.engine || "N/A",
            power: listing.power || "N/A",
            mileage: listing.mileage || "N/A",
            description: listing.description || "No description available",
            images: listing.images || [],
            phoneNumber: listing.user?.personal?.phoneNumber || "N/A",
            isFlipped: false,
            showPhone: false
        }));

        return cars;
    } catch (error) {
        console.error('Error fetching cars:', error);
        return [];
    }
};