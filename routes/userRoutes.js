const express = require('express');
const { create } = require('../models/userModel');
const router = express.Router();

const User = require('../models/userModel');

// Get All Users
router.get('/', async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// Get User by ID
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
});

// Create User
router.post('/', async (req, res) => {
    const createdUser = await User.create(req.body);
    const user = await User.findById(createdUser._id).select('-password');
    res.json(user);
});

// UserLogin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(email);
    if (user && (await user.comparePassword(password))) {
        const userProfile = await User.findById(user.id).select('-password');
        res.json(userProfile);
    } else {
        res.json({ msg: 'Username or Password is incorrect' });
    }
});

// Update User
router.put('/update/:id', async (req, res) => {
    console.log('ID', req.params.id), console.log('Body', req.body);
    const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
    }).select('-password');
    res.json(user);
});

// Delete User by ID
router.delete('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    user.remove();
    res.json(user);
});

router.get('/email/:email', async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
        res.json(user);
    } else {
        const createdUser = await User.create({
            email: req.params.email,
        });
        res.json(createdUser);
    }
});

// Check Auth0 for user and create user if doesn't exist
router.post('/info', async (req, res) => {
    console.log(req.body);
    const { email, given_name, family_name } = req.body;
    const data = {
        firstName: given_name,
        lastName: family_name,
        email: email,
        parentForm: {
            parentOne: {
                firstName: given_name,
                lastName: family_name,
            },
        },
    };
    const user = await User.findOne({ email });
    if (user && email === user.email) {
        res.json(user);
    } else {
        const createdUser = await User.create(data);
        res.json(createdUser);
    }
});

module.exports = router;
