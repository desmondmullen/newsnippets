const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const PORT = 3000;

const app = express();
app.use(logger("dev"));

const db = require("./models");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsnippets";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/scrape", (req, res) => {
    const theArticles = [];
    axios.get("http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml").then(response => {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(response.data, {
            xml: {
                normalizeWhitespace: true,
            }
        });
        // Now, we grab every h2 within an article tag, and do the following:
        $("item").each((i, element) => {
            const result = {};
            result.title = $(element).children("title").text();
            result.link = $(element).children("guid").text();
            result.description = $(element).children("description").text();
            db.Article.findOne({ link: result.link })
                .then(dbArticle => {
                    if (dbArticle === null) { // then create the new article
                        db.Article.create(result)
                            .then(dbArticle => {
                                theArticles.push(dbArticle);
                                console.log('created');
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    }
                })
        });
        setTimeout(function () {
            console.log(theArticles);
            res.json(theArticles);
        }, 3000);

        // res.send("Scrape Complete");
    });
});

app.get("/articles", (req, res) => {
    db.Article.find({})
        .then(dbArticle => {
            console.log(dbArticle);
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get("/articles/saved", (req, res) => {
    db.Article.find({
        saved: true
    })
        .then(dbArticle => {
            console.log(dbArticle);
            res.json(dbArticle);
        })
        .catch(err => {
            res.json(err);
        });
});

app.get("/articles/:id", (req, res) => {
    db.Note.find({ article: req.params.id })
        // .populate("article")
        .then(dbNote => {
            console.log(dbNote);
            res.json(dbNote);
        })
        .catch(err => {
            res.json(err);
        });
});

app.post("/articles/:id", (req, res) => {
    console.log(req.body.saved);
    if (req.body.saved) {
        console.log('req.body.saved is true');
        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }, { new: true })
            .then(dbArticle => {
                console.log(dbArticle);
            })
    } else {
        req.body.article = req.params.id; //add the id of the article into the body
        db.Note.create(req.body)
            .then(dbNote => {
                return db.Note.find({ article: req.body.article }, { new: true });
            })
    }
});
// app.post("/articles/:id", (req, res) => {
//     console.log(req.body.saved);
//     if (req.body.saved) {
//         console.log('req.body.saved is true');
//         db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }, { new: true })
//             .then(dbArticle => {
//                 console.log(dbArticle);
//             })
//     } else {
//         req.body.article = req.params.id; //add the id of the article into the body
//         db.Note.create(req.body)
//             .then(dbNote => {
//                 // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//                 // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//                 // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//                 return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//             })
//             .then(dbArticle => {
//                 res.json(dbArticle);
//             })
//             .catch(err => {
//                 res.json(err);
//             });
//     }
// });

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});