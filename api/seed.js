require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("✅ Connected to MongoDB Atlas");
    
    // Employee Schema
    const employeeSchema = new mongoose.Schema({
        Department: String,
        Gender: String,
        Attrition: String,
        Experience_Group: String,
        Job_Satisfaction: String
    }, { collection: 'employees' });

    const Employee = mongoose.model('Employee', employeeSchema);

    // Read local data.json
    const dataPath = path.join(__dirname, '..', 'hr-dashboard-app', 'data.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log(`Found ${rawData.length} records in data.json. Clearing old DB data...`);
    
    // Clear old data
    await Employee.deleteMany({});
    console.log("Old data cleared.");

    // Insert new data
    console.log("Uploading data to MongoDB...");
    await Employee.insertMany(rawData);
    
    console.log("🎉 Data uploaded successfully!");
    process.exit();

}).catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});
