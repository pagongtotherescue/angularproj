const crypto = require('crypto');
const express = require('express');
const app = express();
const router = express.Router(); // Instantiate router
const bodyParser = require('body-parser');
const cors = require('cors');
const Post = require('./models/post.js');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.js');
const jwt = require('jsonwebtoken');
const Comment = require('./models/comment.js');

// Generate dynamic secret key
const secretKey = crypto.randomBytes(32).toString('hex');

console.log('Generated Secret Key:', secretKey); // Output the generated secret key for reference

//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cors middleware
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://mildangelee:mildangelee@cluster0.udqsxgk.mongodb.net/meanstack?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(() => {
    console.log('connection failed');
  });

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, x-Requested-with, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1]; // Extract token from Authorization header
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Middleware to check post ownership
const checkPostOwnership = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (!post.creator || post.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' }); // User does not own the post
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add router to the app
app.use(router);

// Add post
router.post('/api/posts', verifyToken, (req, res) => {
  const { title, content, imageUrl } = req.body;
  const userId = req.userId; // Get the user ID from the token

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: userId // Associate the post with the authenticated user
  });

  post.save()
    .then(savedPost => {
      res.status(201).json(savedPost);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Error saving post' });
    });
});

// DELETE route for deleting 
router.delete('/api/posts/:id', verifyToken, checkPostOwnership, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// update route for updating 
router.put('/api/posts/:id', verifyToken, checkPostOwnership, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch posts with pagination
router.get('/api/posts', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5; // Set limit to 5 posts per page
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find().skip(skip).limit(limit).populate('creator'); // Populate the creator field
    const totalPosts = await Post.countDocuments();

    res.status(200).json({
      message: 'Posts fetched successfully',
      posts: posts,
      totalPosts: totalPosts,
      page: page,
      limit: limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Like a post
router.post('/api/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;
    const post = await Post.findById(postId);

    // Check if the user has already liked the post
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      post.dislikes.pull(userId);
      await post.save();
    } else {
      // If the user has already liked the post, remove their like
      post.likes.pull(userId);
      await post.save();
    }

    // Return the updated post with the new likes and dislikes count
    res.status(200).json({ message: 'Post liked successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Dislike a post
router.post('/api/posts/:postId/dislike', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;
    const post = await Post.findById(postId);

    // Check if the user has already disliked the post
    if (!post.dislikes.includes(userId)) {
      // Add the user's ID to the dislikes array
      post.dislikes.push(userId);
      // Remove the user's ID from the likes array if present
      post.likes.pull(userId);
      await post.save();
    } else {
      // If the user has already disliked the post, remove their dislike
      post.dislikes.pull(userId);
      await post.save();
    }

    // Return the updated post with the new dislikes and likes count
    res.status(200).json({ message: 'Post disliked successfully', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a comment to a post
router.post('/api/posts/:postId/comments', verifyToken, (req, res) => {
  const { content, parentCommentId } = req.body;
  const userId = req.userId;
  const postId = req.params.postId;

  const comment = new Comment({
    content,
    postId,
    creator: userId,
    parentCommentId: parentCommentId || null
  });

  comment.save()
    .then(savedComment => {
      res.status(201).json(savedComment);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Error saving comment' });
    });
});

// Fetch comments for a post
router.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId }).populate('creator').populate('parentCommentId');
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout Route (optional if you want to invalidate tokens)
app.post('/api/logout', (req, res) => {
  // Implement logout functionality, e.g., blacklist token
  res.status(200).json({ message: 'Logged out successfully' });
});

// Middleware to protect routes
app.use('/api/posts', verifyToken);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error Failed!');
});

module.exports = app;