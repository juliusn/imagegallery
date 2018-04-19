const express = require('express');
const router = new express.Router();
const multer = require('multer');
const imageType = require('image-type');
const sharp = require('sharp');
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

router.post('/', upload, (req, res, next) => {
  let type;
  if (!(type = imageType(req.file.buffer))) {
    return res.status(415).
        send('Invalid file type. Only images are supported');
  }
  req.body.type = type;
  next();
});

router.post('/', upload, (req, res, next) => {
  new ExifImage({image: req.file.buffer}, (err, data) => {
    if (err) console.log(err);
    req.body.exif = data;
    next();
  });
});

router.post('/', upload, (req, res, next) => {
  sharp(req.file.buffer).resize(200, 200).toBuffer().then((buffer, error) => {
    req.body.small = buffer;
  });
  next();
});

router.post('/', upload, (req, res, next) => {
  sharp(req.file.buffer).resize(400, 400).toBuffer().then((buffer, error) => {
    if (error) throw error;
    req.body.medium = buffer;
  });
  next();
});

router.post('/', upload, (req, res) => {
  try {
    const image = new Image({
      title: req.body.image_title,
      file: {
        data: req.file.buffer,
        contentType: req.body.type,
      },
      thumbnail: {
        small: req.body.small,
        medium: req.body.medium,
      },
      exifData: req.body.exif,
    });

    image.save().then((image) => {
      res.status(200).send('saved: ' + image.title);
    });
  } catch (err) {
    console.log('ERROR', err.message);
    res.status(400).send(err.message);
  }
});

module.exports = router;
