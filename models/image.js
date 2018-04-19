const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  title: String,
  file: {
    data: Buffer, contentType: {
      ext: String,
      mime: String,
    },
  },
  thumbnails: {
    small: Buffer,
    medium: Buffer,
  },
  exifData: {},
});

const Image = mongoose.model('Image', imageSchema);

module.exports = {
  Image: Image,
};
