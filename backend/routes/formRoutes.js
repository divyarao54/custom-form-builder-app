const express = require('express');
const router = express.Router();
const { createForm, updateForm, readForm, deleteForm, listForms } = require('../controllers/formController');

router.post('/', createForm);
router.get('/', listForms);
router.get('/:id', readForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

module.exports = router;