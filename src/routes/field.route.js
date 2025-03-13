const express = require('express');
const router = express.Router();

const { field } = require('../controllers/index.controller');
const middleware = require('../middleware/authMiddleware');

// POST routes
router.post('/create-field', middleware.verifyToken, middleware.isSeller, field.createField);
router.post('/submit/:id', middleware.verifyToken, field.submitField);
router.post('/filter', field.getFieldOption);


// PUT routes
router.put('/update-field', middleware.verifyToken, middleware.isAdmin, field.updateField);
router.put('/stop-field', middleware.verifyToken, middleware.isSeller, field.stopField);

// DELETE routes
router.delete('/delete-field', middleware.verifyToken, middleware.isAdmin, field.deleteField);

// GET routes
router.get('/all-field', field.getAllField);
router.get('/wait', middleware.verifyToken, field.waitField);
router.get('/all-field/:id', field.getField);

router.get('/owner-field/:id', middleware.verifyToken, middleware.isNotUser, field.FieldsOwner);

module.exports = router;