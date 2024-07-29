const Teacher = require('../models/teacher');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const teacher = new Teacher({ username, password });
        await teacher.save();
        const token = jwt.sign({ id: teacher._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(400).json({ error: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received:', { username, password });

    try {
        const teacher = await Teacher.findOne({ username });
        if (!teacher) {
            console.log('Teacher not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await teacher.matchPassword(password);
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: teacher._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(400).json({ error: 'Login failed' });
    }
};
