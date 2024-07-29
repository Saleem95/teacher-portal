// controller.js
const Student = require('../models/student');

exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch students' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.addStudent = async (req, res) => {
    const { name, subject, marks } = req.body;
    try {
        let student = await Student.findOne({ name, subject });
        if (student) {
            student.marks += marks;
            await student.save();
        } else {
            student = new Student({ name, subject, marks });
            await student.save();
        }
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add student' });
    }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, subject, marks } = req.body;
    try {
        const student = await Student.findByIdAndUpdate(id, { name, subject, marks }, { new: true, overwrite: true });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update student' });
    }
};

exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await Student.findByIdAndDelete(id);
        res.status(200).json({ message: 'Student deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete student' });
    }
};
