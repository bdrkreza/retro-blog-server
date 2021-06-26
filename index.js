const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');

const cors = require('cors');
require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload());

const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.9akcg.mongodb.net/${process.env.BD_NAME}?retryWrites=true&w=majority`;


app.get('/', (req, res) => {
    res.send('Server is working  200!')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log('connection error:', err)
    const blogsCollection = client.db("blogs").collection("posts");

    app.post("/addBlogs", (req, res) => {
        const name = req.body.name;
        const title = req.body.title;
        const description = req.body.description;
        const file = req.files.file;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        blogsCollection.insertOne({ name, title, image, description })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });


    app.get('/blogs', (req, res) => {
        blogsCollection.find({})
            .toArray((err, item) => {
                res.send(item)
            })
    });

    app.patch('/editPost/:id', (req, res) => {
        const id = ObjectID(req.params.id);

        const file = req.files.file;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        blogsCollection.updateOne({ _id: id },
            {
                $set: { name: req.body.name, price: req.body.title, description: req.body.description, image: image }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    });

    app.delete('/postsDelete/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        blogsCollection.findOneAndDelete({ _id: id })
            .then(data => {
                res.json({ success: !!data.value })
            })
    });



    console.log('database connection successfully')
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})