const express = require('express');
const router = new express.Router();
const multer = require('multer');
const imageType = require('image-type');
const memStorage = multer.memoryStorage();
const ExifImage = require('exif').ExifImage;
const Image = require('../models/image').Image;
const upload = multer({
  storage: memStorage,
}).single('image_file');

router.get('/', (req, res) => {
  console.log('respond with images');
  Image.find({}, (err, images) => {
    if (err) return res.send(err.toString());
    res.send(images);
  });
});

router.post('/', upload, (req, res) => {
  try {
    let type;
    let exif;

    if (!(type = imageType(req.file.buffer))) {
      return res.status(415).
          send('Invalid file type. Only images are supported');
    }
    console.log('image type', type.mime);

    new ExifImage({image: req.file.buffer}, (err, exifData) => {
      if (err) {
        console.log(err.message);
      } else {
        exif = exifData;
      }
    });

    const image = new Image({
      title: req.body.image_title,
      file: {
        data: req.file.buffer,
        contentType: type,
      },
      exifData: exif,
    });

    image.save().then((image) => {
      res.status(200).send('saved: ' + image.title);
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).send(err.message);
  }
});

module.exports = router;
