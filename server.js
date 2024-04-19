const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())

const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage })

app.get('/api/images', (req, res) => {
    fs.readdir('./uploads/', (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err)
            return res.status(500).json({ error: 'Internal server error' })
        }

        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase()
            return (
                ext === '.jpg' ||
                ext === '.jpeg' ||
                ext === '.png' ||
                ext === '.webp'
            )
        })

        res.json(imageFiles)
    })
})

app.post('/api/upload', upload.single('image'), (req, res) => {
    res.send(req.file)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
