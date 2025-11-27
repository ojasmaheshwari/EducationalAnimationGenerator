const express = require('express')
const render = require('./controllers/render.controller')
const app = express()
const cors = require('cors')
const path = require('path');
const fs = require('fs')

require('dotenv').config()

app.use(express.static(path.join(__dirname, '..', 'media')));
app.use(express.json())

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);


app.get('/', (req, res) => {
    res.json({message : "OK"});
})

app.post('/render', async (req, res) => {
    const {description} = req.body;

    if (!description || typeof(description) !== 'string') {
        return res.status(400).json({
            error : "Bad request"
        })
    }

    const result = await render(description);

    return res.status(200).json(result);
})

app.get('/video/:videoId', (req, res) => {
  const { videoId } = req.params;
  // Scene name uses underscores instead of hyphens for valid Python class names
  const sceneSuffix = videoId.replace(/-/g, '_');

  const basePath = path.join(
    process.cwd(),
    'media',
    'videos',
    `code_MyBeautifulScene_${sceneSuffix}`,
    '480p15',
    `MyBeautifulScene_${sceneSuffix}.mp4`
  );

  fs.access(basePath, fs.constants.F_OK, err => {
    if (err) {
      return res.status(404).send('Video not found');
    }

    res.sendFile(basePath);
  });
});


app.listen(process.env.PORT, () => {
    console.log(`Listening at port ${process.env.PORT}`)
})