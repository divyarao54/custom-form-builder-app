const Form = require('../models/Form');

const createForm = async (req, res) => {
    try{ 
        const formData = req.body;
        console.log('Received form data:', JSON.stringify(formData, null, 2));
        const newForm = new Form(formData);
        await newForm.save();
        res.status(201).json(newForm);
    } catch (error){
        console.error('Error creating form: ', error);
        res.status(500).json({ message: 'Failed to create form', error: error.message });
    }
};

const updateForm = async (req, res) => {
    try{
        const { id } = req.params;
        const updateData = req.body;
        console.log('Received update data:', JSON.stringify(updateData, null, 2));

        const updatedForm = await Form.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedForm) {
            return res.status(404).json({ message: 'Form not found' });
        }
        res.status(200).json(updatedForm);
    } catch (error) {
        console.error('Error updating form: ', error);
        res.status(500).json({ message: 'Failed to update form', error: error.message });
    }
};

const readForm = async (req, res) => {
    try {
        const formId = req.params.id;

        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found' });
        }
        res.status(200).json(form);
    } catch (error) {
        console.error('Error, loading form: ', error);
        res.status(500).json({message: 'Failed to fetch form', error: error.message});
    }
}

const deleteForm = async (req, res) => {
    try{
        const formId = req.params.id;
        const deletedForm = await Form.findByIdAndDelete(formId);
        if (!deletedForm) {
            return res.status(404).json({ message: 'Form not found' });
        }
        res.status(200).json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form: ', error);
        res.status(500).json({ message: 'Failed to delete form', error: error.message });
    }
}

const listForms = async (req, res) => {
    try{
        const forms = await Form.find().sort({ createdAt: -1 });
        res.status(200).json(forms);
    } catch(error) {
        console.error('Error listing forms: ', error);
        res.status(500).json({ message: 'Failed to list forms', error: error.message });
    }
}

module.exports = {
    createForm,
    updateForm,
    readForm,
    deleteForm,
    listForms
};