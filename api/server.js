require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas");
}).catch((err) => {
    console.error("❌ MongoDB connection error:", err);
});

// Employee Schema matching our data
const employeeSchema = new mongoose.Schema({
    Department: String,
    Gender: String,
    Attrition: String,
    Experience_Group: String,
    Job_Satisfaction: String
}, { collection: 'employees' });

const Employee = mongoose.model('Employee', employeeSchema);

// API Endpoint to get all employees from DB
app.get('/api/data', async (req, res) => {
    try {
        const data = await Employee.find({});
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch data from MongoDB' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server running at http://0.0.0.0:${PORT}`);
    console.log(`Access endpoint at: http://<Your-IP-Address>:${PORT}/api/data`);
});
