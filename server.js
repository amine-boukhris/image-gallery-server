require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Image = require('./Image')
const path = require('path')
const fs = require('fs')
const cors = require('cors')
app.use(cors())

mongoose.connect('mongodb://localhost:27017/galleryDB')
mongoose.connection.on('open', () => {
    console.log('Connected to MongoDB.')
})

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    },
})
const upload = multer({ storage })

app.use('/api/images', express.static('uploads'))

app.post('/api/upload', upload.single('image'), async (req, res) => {
    const { title, description } = req.body
    try {
        const newImage = new Image({
            title,
            description,
            name: req.file.filename,
        })
        await newImage.save()
        res.status(201).json(newImage)
    } catch (error) {
        console.error('Error uploading file:', error)
        res.status(500).json({ message: 'Failed to upload file.' })
    }
})

app.get('/api/image/:id', async (req, res) => {
    const { id } = req.params
    try {
        const image = await Image.findById(id)
        if (image) {
            res.json(image)
        } else {
            res.status(404).json({ message: 'Image not found.' })
        }
    } catch (error) {
        console.error('Error fetching image:', error.message)
        if (error.name === 'CastError')
            return res.status(400).json({ message: 'Bad image request.' })
        res.status(500).json({ message: 'Failed to fetch images.' })
    }
})

app.delete('/api/image/:id', async (req, res) => {
    const { id } = req.params
    try {
        const image = await Image.findByIdAndDelete(id)
        if (image) {
            res.json(image)
        } else {
            res.status(404).json({ message: 'Image not found.' })
        }
    } catch (error) {
        console.error('Error deleting image:', error.message)
        if (error.name === 'CastError')
            return res.status(400).json({ message: 'Bad image request.' })
        res.status(500).json({ message: 'Failed to delete image.' })
    }
})

app.use(express.json())
app.put('/api/image/:id', async (req, res) => {
    const { id } = req.params
    const { title, description } = req.body
    try {
        const image = await Image.findByIdAndUpdate(
            id,
            { title, description },
            { new: true }
        )
        if (image) {
            res.json(image)
        } else {
            res.status(404).json({ message: 'Image not found.' })
        }
    } catch (error) {
        console.error('Error updating image:', error.message)
        if (error.name === 'CastError')
            return res.status(400).json({ message: 'Bad image request.' })
        res.status(500).json({ message: 'Failed to delete image.' })
    }
})

app.get('/api/images/search/:query', async (req, res) => {
    const { query } = req.params
    const limit = 10
    const { page } = req.query
    const pageNumber = parseInt(page) || 1
    try {
        const images = await Image.find({
            title: { $regex: query, $options: 'i' },
        })
            .skip((pageNumber - 1) * limit)
            .limit(limit)
            .exec()
        res.json(images)
    } catch (error) {
        console.error('Error fetching images:', error)
        res.status(500).json({ message: 'Failed to fetch images.' })
    }
})

app.get('/api/images', async (req, res) => {
    const limit = 10
    const { page } = req.query
    const pageNumber = parseInt(page) || 1
    try {
        const images = await Image.find()
            .skip((pageNumber - 1) * limit)
            .limit(limit)
            .exec()
        res.json(images)
    } catch (error) {
        console.error('Error fetching images:', error)
        res.status(500).json({ message: 'Failed to fetch images.' })
    }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
