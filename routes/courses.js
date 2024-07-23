const Joi = require('joi');
const express = require('express');
const router = express.Router();
const Course = require('../models/course');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get a specific course
router.get('/:id', async (req, res) => {
    try {
        const course = await getSingleCourse(req.params.id);
        if (course) {
            res.json(course);
        } else {
            res.status(404).send('The course with the given ID was not found');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Create a new course
router.post('/add', async (req, res) => {
    const { error } = validateCourse(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const course = new Course({
        name: req.body.name,
        description: req.body.description
    });

    try {
        const savedCourse = await course.save();
        res.json(savedCourse);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Update a course
router.put('/:id', async (req, res) => {
    try {
        const course = await getSingleCourse(req.params.id);
        if (!course) {
            return res.status(404).send('The course with the given ID was not found');
        }

        const { error } = validateCourse(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    description: req.body.description
                }
            },
            { new: true }
        );
        res.json(updatedCourse);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const course = await getSingleCourse(req.params.id);
        if (!course) {
            return res.status(404).send('The course with the given ID was not found');
        }

        const removedCourse = await Course.findByIdAndDelete(req.params.id);
        res.json(removedCourse);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Helper function to get a single course
async function getSingleCourse(id) {
    return await Course.findById(id);
}

// Helper function to validate a course
function validateCourse(course) {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        description: Joi.string()
    });
    return schema.validate(course);
}

module.exports = router;
