const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ MongoDB Connect
mongoose.connect("mongodb+srv://admin:Sachin%40121@my-first-cluster.83h4vgy.mongodb.net/contactdb?retryWrites=true&w=majority&appName=My-First-Cluster", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// ✅ Contact Schema
const ContactSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    phone: String,
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', ContactSchema);

// ✅ Fetch all contacts
app.get('/api/contacts', async (req, res) => {
    let { sort } = req.query;
    let sortOption = {};

    if (sort === "nameAsc") sortOption = { name: 1 };
    if (sort === "nameDesc") sortOption = { name: -1 };
    if (sort === "recent") sortOption = { createdAt: -1 };

    const contacts = await Contact.find().sort(sortOption);
    res.json(contacts);
});

// ✅ Add contact (with duplicate email check)
app.post('/api/contacts', async (req, res) => {
    const { name, email, phone } = req.body;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: "Invalid email" });

    // Check duplicate email
    const exists = await Contact.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists!" });

    const newContact = new Contact({ name, email, phone });
    await newContact.save();
    res.json({ message: '✅ Contact Added', contact: newContact });
});

// ✅ Edit/Update Contact
app.put('/api/contacts/:id', async (req, res) => {
    const { name, email, phone } = req.body;
    const updated = await Contact.findByIdAndUpdate(req.params.id, { name, email, phone }, { new: true });
    res.json({ message: '✏️ Contact Updated', contact: updated });
});

// ✅ Delete Contact
app.delete('/api/contacts/:id', async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: '🗑️ Contact Deleted' });
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
