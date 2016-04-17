const gm = require('gm');

const transform = function(image) {
  console.log(image);
  gm(image.path)
    .resize('200', '200', '^')
    .gravity('Center')
    .crop('200', '200')
    .write('test.jpg', function (err) {
      console.log(err);
      if (!err) console.log(' hooray! ');
    });
  return image;
};

module.exports = {
  transform: transform
};
