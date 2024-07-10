const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Debugging: Print the MongoDB URI to ensure it's loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB Atlas using environment variable
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
}

mongoose.connect(mongoURI, {})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.log('Error connecting to MongoDB Atlas:', err.message));

const commentSchema = new mongoose.Schema({
    movieId: String,
    name: String,
    comment: String,
    timestamp: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// API endpoint to get comments for a movie
app.get('/comments/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try {
        const comments = await Comment.find({ movieId });
        res.json(comments);
    } catch (err) {
        res.status(500).send(err);
    }
});

// API endpoint to add a comment
app.post('/comments', async (req, res) => {
    const { movieId, name, comment } = req.body;
    const newComment = new Comment({ movieId, name, comment });
    try {
        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).send(err);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
