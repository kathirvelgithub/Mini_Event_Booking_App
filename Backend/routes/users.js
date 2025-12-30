const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me - Get authenticated user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

module.exports = router;
