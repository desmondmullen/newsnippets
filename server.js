const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(logger('dev'));

const db = require('./models');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/newsnippets';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get('/scrape', (req, res) => {
    const theArticles = [];
    axios.get('http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml').then(response => {
        const $ = cheerio.load(response.data, {
            xml: {
                normalizeWhitespace: true,
            }
        });
        $('item').each((i, element) => {
            const result = {};
            result.title = $(element).children('title').text();
            result.link = $(element).children('guid').text();
            result.description = $(element).children('description').text();
            db.Article.findOne({ link: result.link })
                .then(dbArticle => {
                    if (dbArticle === null) { // then create the new article
                        db.Article.create(result)
                            .then(dbArticle => {
                                theArticles.push(dbArticle);
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }
                })
        });
        setTimeout(function() {
            res.json(theArticles);
        }, 3000);
    });
});

app.get('/articles', (req, res) => {
    db.Article.find({}).sort({ fetched: -1 })
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get('/articles/saved', (req, res) => {
    db.Article.find({
            saved: true
        }).sort({ fetched: -1 })
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get('/articles/:id', (req, res) => { // finds notes by article id
    db.Note.find({ article: req.params.id }).sort({ modified: -1 })
        .populate('article')
        .then(dbNote => {
            res.json(dbNote);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get('/find/:term', (req, res) => { // finds a note by note id
    db.Article.find({ title: { $regex: `(?i).*${req.params.term}.*` } })
        .then(dbArticle => {
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get('/notes/:id', (req, res) => { // finds a note by note id
    db.Note.find({ _id: req.params.id })
        .populate('article')
        .then(dbNote => {
            res.json(dbNote);
        })
        .catch(err => {
            res.json(err);
        });
});

app.post('/articles/:id', (req, res) => {
    if (req.body.saved) {
        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: req.body.saved }, { new: true })
            .then(dbArticle => {
                // console.log(dbArticle);
            })
    } else { // save note
        req.body.article = req.params.id; //adds the id of the article into the body
        db.Note.create(req.body)
            .then(dbNote => {
                db.Note.find({ article: req.body.article }, { new: true }).sort({ modified: -1 })
                    .then(notesList => {
                        res.json(notesList);
                    })
            })
    }
});

app.post('/update/:id', (req, res) => {
    db.Note.update({
            _id: req.params.id
        }, {
            $set: {
                title: req.body.title,
                body: req.body.body,
                modified: Date.now()
            }
        },
        (error, edited) => {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                res.send(edited);
            }
        }
    );
});

app.get('/delete/:id', (req, res) => {
    db.Note.remove({
            _id: req.params.id
        },
        (error, removed) => {
            if (error) {
                console.log(error);
                res.send(error);
            } else {
                res.send(removed);
            }
        }
    );
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});