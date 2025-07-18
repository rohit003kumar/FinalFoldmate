



const User = require('../models/user.model');
const WashermanSlot = require('../models/wavailable.model');

// Haversine distance calculator
function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.getNearbyWashermen = async (req, res) => {
  const { lat, lng, date } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Latitude and longitude are required" });
  }

  const customerLocation = [parseFloat(lng), parseFloat(lat)];

  try {
    // Step 1: Find nearby washermen using geospatial query
    const washermen = await User.find({
      role: 'washerman',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: customerLocation },
          $maxDistance: 10000 // 10km max search radius
        }
      }
    }).populate({
      path: 'products',
      select: 'title category image services serviceType price'
    });

    const nearbyProducts = [];

    for (const washerman of washermen) {
      if (!washerman.location?.coordinates) continue;

      // Calculate actual distance between customer and washerman
      const distance = haversineDistance(
        [parseFloat(lat), parseFloat(lng)],
        [washerman.location.coordinates[1], washerman.location.coordinates[0]]
      );

      // Skip if beyond washerman's personal range
      if (distance * 1000 > (washerman.range || 500)) continue;

      for (const product of washerman.products || []) {
        // Derive services list
        const services = Array.isArray(product.services) && product.services.length > 0
          ? product.services
          : (product.serviceType && product.price)
            ? [{ name: product.serviceType, price: product.price }]
            : [];

        // Skip if product has no usable services
        if (services.length === 0) continue;

        // Push product formatted for frontend
        nearbyProducts.push({
          _id: product._id,
          name: product.title,
          category: product.category,
          image: product.image || '',
          options: services.map((srv, index) => ({
            _id: `${product._id}-${index}`, // Unique ID for frontend checkbox
            name: srv.name || 'Unnamed',
            price: srv.price || 0
          })),
          washerman: {
            _id: washerman._id,
            name: washerman.name,
            contact: washerman.contact || 'N/A',
            range: washerman.range || 500,
            location: {
              lat: washerman.location.coordinates[1],
              lng: washerman.location.coordinates[0]
            }
          }
        });
      }
    }

    // Step 3: If booking `date` is provided, attach available time slots
    if (date) {
      const enrichedProducts = await Promise.all(
        nearbyProducts.map(async (product) => {
          try {
            const slot = await WashermanSlot.findOne({
              washerman: product.washerman._id,
              date
            });

            if (slot && slot.isDayOpen) {
              const availableSlots = slot.slots
                .filter(s => s.enabled && s.currentBookings < s.maxCapacity)
                .map(s => ({
                  timeRange: s.timeRange,
                  period: s.period,
                  available: s.maxCapacity - s.currentBookings,
                  maxCapacity: s.maxCapacity
                }));

              return {
                ...product,
                isAvailable: true,
                availableSlots,
                totalAvailableSlots: availableSlots.length
              };
            }

            return {
              ...product,
              isAvailable: false,
              availableSlots: [],
              totalAvailableSlots: 0
            };
          } catch (error) {
            console.error(`❌ Slot check failed for ${product.washerman._id}:`, error);
            return {
              ...product,
              isAvailable: false,
              availableSlots: [],
              totalAvailableSlots: 0
            };
          }
        })
      );

      return res.json(enrichedProducts);
    }

    // Step 4: Return products without slots if no `date`
    return res.json(nearbyProducts);

  } catch (err) {
    console.error('❌ Error fetching nearby washermen:', err);
    res.status(500).json({ message: "Server error while fetching nearby washermen" });
  }
};


// Test endpoint to create sample washermen data
exports.createSampleWashermen = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const sampleWashermen = [
      {
        name: "John's Laundry Service",
        email: "john@laundry.com",
        password: "password123",
        contact: "+91 98765 43210",
        role: "washerman",
        location: {
          type: "Point",
          coordinates: [parseFloat(lng) + 0.001, parseFloat(lat) + 0.001] // 100m away
        },
        range: 500,
        services: ["wash_fold", "iron_only", "eco_friendly"]
      },
      {
        name: "Quick Wash Express",
        email: "quickwash@laundry.com",
        password: "password123",
        contact: "+91 98765 43211",
        role: "washerman",
        location: {
          type: "Point",
          coordinates: [parseFloat(lng) - 0.002, parseFloat(lat) + 0.002] // 200m away
        },
        range: 800,
        services: ["wash_fold", "dry_clean", "stain_removal"]
      },
      {
        name: "Premium Laundry Care",
        email: "premium@laundry.com",
        password: "password123",
        contact: "+91 98765 43212",
        role: "washerman",
        location: {
          type: "Point",
          coordinates: [parseFloat(lng) + 0.003, parseFloat(lat) - 0.001] // 300m away
        },
        range: 1000,
        services: ["wash_fold", "dry_clean", "iron_only", "stain_removal", "eco_friendly"]
      }
    ];

    const createdWashermen = await User.insertMany(sampleWashermen);
    
    res.json({ 
      message: "Sample washermen created successfully", 
      count: createdWashermen.length,
      washermen: createdWashermen.map(w => ({
        name: w.name,
        contact: w.contact,
        location: w.location.coordinates
      }))
    });
  } catch (err) {
    console.error('Error creating sample washermen:', err);
    res.status(500).json({ message: "Server error while creating sample data" });
  }
};

// Haversine distance calculation helper
function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = angle => (angle * Math.PI) / 180;
  const R = 6371; // Radius of Earth in KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Get all washermen locations (for testing/admin purposes)
exports.getAllWashermenLocations = async (req, res) => {
  try {
    const washermen = await User.find({ 
      role: 'washerman',
      'location.coordinates': { $exists: true, $ne: [0, 0] }
    }).select('name contact location range email');

    const formattedWashermen = washermen.map(washerman => ({
      _id: washerman._id,
      name: washerman.name,
      contact: washerman.contact,
      email: washerman.email,
      range: washerman.range || 500,
      location: {
        lat: washerman.location.coordinates[1],
        lng: washerman.location.coordinates[0]
      }
    }));

    res.json(formattedWashermen);
  } catch (err) {
    console.error('Error fetching washermen locations:', err);
    res.status(500).json({ message: "Server error while fetching washermen locations" });
  }
};

// Get customers near a laundryman's location
exports.getCustomersNearLaundryman = async (req, res) => {
  try {
    const { lat, lng, range = 5000 } = req.query; // Default 5km range
    const laundrymanId = req.userId;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Verify the user is a laundryman
    const laundryman = await User.findById(laundrymanId);
    if (!laundryman || laundryman.role !== 'washerman') {
      return res.status(403).json({ message: "Only laundrymen can access this endpoint" });
    }

    const laundrymanLocation = [parseFloat(lng), parseFloat(lat)];

    // Find customers within the specified range
    const customers = await User.find({
      role: 'customer',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: laundrymanLocation
          },
          $maxDistance: parseInt(range) // Convert to meters
        }
      }
    }).select('name contact location address email');

    // Format the results
    const formattedCustomers = customers.map(customer => ({
      _id: customer._id,
      name: customer.name,
      contact: customer.contact || 'Contact not available',
      email: customer.email,
      address: customer.address,
      location: {
        lat: customer.location.coordinates[1],
        lng: customer.location.coordinates[0]
      },
      distance: haversineDistance(
        [parseFloat(lat), parseFloat(lng)],
        [customer.location.coordinates[1], customer.location.coordinates[0]]
      )
    }));

    // Sort by distance
    formattedCustomers.sort((a, b) => a.distance - b.distance);

    res.json({
      laundryman: {
        _id: laundryman._id,
        name: laundryman.name,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        range: laundryman.range || 500
      },
      customers: formattedCustomers,
      totalCustomers: formattedCustomers.length
    });

  } catch (err) {
    console.error('Error fetching customers near laundryman:', err);
    res.status(500).json({ message: "Server error while fetching nearby customers" });
  }
};








exports.updateCustomerLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.userId;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: "Latitude and longitude must be numbers" });
    }

    const location = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { location },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Location updated", location: user.location });
  } catch (err) {
    console.error("Error saving location:", err);
    res.status(500).json({ message: "Server error" });
  }
};
