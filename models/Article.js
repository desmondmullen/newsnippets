const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fetched: {
        type: Date,
        default: Date.now()
    },
    saved: {
        type: Boolean,
        default: false
    },
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;