// routes/blogRoutes.js

const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

// Get all blogs
router.get('/', getAllBlogs);

// Get a single blog by ID
router.get('/:id', getBlogById);

// Create a new blog
router.post('/', createBlog);

// Update a blog by ID
router.put('/:id', updateBlog);

// Delete a blog by ID
router.delete('/:id', deleteBlog);

module.exports = router;
