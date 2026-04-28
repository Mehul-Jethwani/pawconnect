const express = require("express");
const cors = require("cors");
const path = require("path");

// Import Routes
const petRoutes = require('./routes/petRoutes');
const storeRoutes = require('./routes/storeRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cityRoutes = require('./routes/cityRoutes');
const serviceProviderRoutes = require('./routes/serviceProviderRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const userPetRoutes = require('./routes/userPetRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const boardingRoutes = require('./routes/boardingRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/pet', petRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/service-provider', serviceProviderRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/user-pet', userPetRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/boarding', boardingRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => {
  res.send("PawConnect Backend Running");
});

app.get("/api/test", (req, res) => {
  res.json("API working");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});