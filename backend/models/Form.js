const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    text: {type: String, default: ''},
    isCorrect: {type: Boolean, default: false},
    order: {type: Number, default: 0}
});

const QuestionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['categorize', 'cloze', 'comprehension', 'mcq', 'mca', 'shorttext'],
        required: true
    },
    questionText: {type: String},
    questionImageUrl: {type: String, default: ''},

    clozeSentence: {type: String},
    clozeOptions: [OptionSchema],
    clozeFeedback: {type: String},
    clozePoints: {type: Number, default: 0},

    categories: [{
        name: {type: String, default: ''},
        id: {type: String, default: ''}
    }],
    itemsToCategorize: [{
        text: {type: String, default: ''},
        id: {type: String, default: ''}
    }],
    categorizationAnswers: [{
        itemId: String,
        categoryId: String
    }],

    comprehensionPassage: {type: String},
    comprehensionImageUrl: { type: String },
    linkedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],

    options: [OptionSchema],
    multipleAnswersAllowed: {type: Boolean, default: false},
    feedback: {type: String},
    points: {type: Number, default: 0},
    order: {type: Number, default: 0}
});

const FormSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, default: ''},
    headerImageUrl: {type: String, default: ''},
    questions: [QuestionSchema],
}, {timestamps: true});

module.exports = mongoose.model('Form', FormSchema);