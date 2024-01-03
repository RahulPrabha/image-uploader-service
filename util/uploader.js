const { v4: uuidv4 } = require('uuid');

const multer  = require('multer');
const diskStorage = multer.diskStorage({
    destination: (req, file, callBack) => {
      callBack(null, './public/images');
    },
    filename: (req, file, callBack) => {
      let filetype = '';
      
      switch(file.mimetype) {
        case 'image/gif':
          filetype = 'gif';
          break;
        case 'image/png':
          filetype = 'png';
          break;
        case 'image/jpeg':
          filetype = 'jpg';
          break;
        default:
          console.error("Unsupported Media Type uploaded: " + file.mimetype);
          callBack(new Error("Unsupported Media Type"));
        }
      
      callBack(null, uuidv4() + '.' + filetype);
    }
});

const imageFilter = function(req, file, cb) {
  if (!file.mimetype.match(/(image\/gif|image\/png|image\/jpeg)$/)) {
      req.fileMimetypeValidationError = 'Unsupported Media Type.';
      return cb(null, false, new Error(req.fileMimetypeValidationError));
  }

  // Additional validation possible here
  // e.g. Ensuring file extension size is 255 characters or less

  cb(null, true);
};

const uploader = multer({ storage: diskStorage, fileFilter: imageFilter });

module.exports = uploader;
