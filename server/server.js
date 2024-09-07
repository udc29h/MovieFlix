const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

const app = express();

app.use(cors(
    {
        origin:'http://localhost:5500',
        methods:['GET','POST'],
        credentials: true
    }
));
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

const userSchema=new mongoose.Schema({
    username:{type:String, unique: true , required:true},
    password:{type:String, required:true},
    wishlist:[String]
})

const User=mongoose.model('User',userSchema);

const verifyToken=(req,res,next)=>{
    const token=req.header('Authorization');
    if(!token) return res.status(401).json({error:'Acces denied'});

    try{
        const verified=jwt.verify(token,process.env.JWT_SECRET);
        req.user=verified;
        next();
    }catch(err){
        res.status(400).json({error:'Invalid token'});
    }
}

app.post('/register', async(req,res)=>{
    try{
    
        const {username, password}=req.body;
        console.log(username, password)
        const hashedPassword=await bcrypt.hash(password,10);
        const user=new User({username,password:hashedPassword});
        await user.save();
        res.status(201).json({message:'User created successfully'});
    }catch(error){
        console.error('Error during registration:', error);
        res.status(500).json({error:'Error registering user'});
    }
});

app.post('/login', async(req,res)=>{
    try{
        const {username, password}=req.body;
        const user=await User.findOne({username});
        if(!user) return res.status(400).json({error:'User not found'})

        const validPassword=await bcrypt.compare(password,user.password);
        if(!validPassword) return res.status(400).json({error:'Invalid password'});
        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET);
        res.json({token});
    }catch(error){
        res.status(500).json({error:'Error loggin in'});
    }
})

app.post('/wishlist/add', verifyToken, async (req, res) => {
    try {
        const { movieId } = req.body;
        const user = await User.findById(req.user._id);
        if (!user.wishlist.includes(movieId)) {
            user.wishlist.push(movieId);
            await user.save();
        }
        res.json({ message: 'Movie added to wishlist' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding movie to wishlist' });
    }
});

// Remove movie from wishlist
app.post('/wishlist/remove', verifyToken, async (req, res) => {
    try {
        const { movieId } = req.body;
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(id => id !== movieId);
        await user.save();
        res.json({ message: 'Movie removed from wishlist' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing movie from wishlist' });
    }
});

// Get user's wishlist
app.get('/wishlist', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching wishlist' });
    }
});


app.post('/wishlist/remove', verifyToken, async (req, res) => {
    try {
        const { movieId } = req.body;
        const user = await User.findById(req.user._id);
        user.wishlist = user.wishlist.filter(movie => movie.id !== movieId);
        await user.save();
        res.json({ message: 'Movie removed from wishlist' });
    } catch (error) {
        console.error('Error removing movie from wishlist:', error);
        res.status(500).json({ error: 'Error removing movie from wishlist' });
    }
});

const Comment = mongoose.model('Comment', commentSchema);


const ratingSchema = new mongoose.Schema({
    movieId: String,
    ratings: [Number],
});

const Rating = mongoose.model('Rating', ratingSchema);

// API endpoint to get the average rating for a movie
app.get('/ratings/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try {
        const rating = await Rating.findOne({ movieId });
        const averageRating = rating ? (rating.ratings.reduce((a, b) => a + b, 0) / rating.ratings.length).toFixed(1) : null;
        res.json({ averageRating });
    } catch (err) {
        res.status(500).send(err);
    }
});

// API endpoint to add a rating for a movie
app.post('/ratings', async (req, res) => {
    const { movieId, rating } = req.body;
    try {
        let movieRating = await Rating.findOne({ movieId });
        if (!movieRating) {
            movieRating = new Rating({ movieId, ratings: [rating] });
        } else {
            movieRating.ratings.push(rating);
        }
        await movieRating.save();
        const averageRating = (movieRating.ratings.reduce((a, b) => a + b, 0) / movieRating.ratings.length).toFixed(1);
        res.status(201).json({ averageRating });
    } catch (err) {
        res.status(500).send(err);
    }
});


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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
