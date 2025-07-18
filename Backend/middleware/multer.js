// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');

// const uploadPath = path.join(__dirname, '..', 'public');

// if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = Date.now() + '-' + file.originalname;
//         cb(null, uniqueName); // safer unique naming
//     }
// });

// const upload = multer({ storage });

// module.exports = upload;




// const multer = require('multer');

// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public'); // Folder to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname); // Save file with original name
//     }
// });

// const upload = multer({ storage });

// module.exports = upload;





const multer = require('multer');
const path = require('path');

// Store files in memory to upload to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });
module.exports = upload;

// // middleware/multer.js

// const multer = require('multer');
// const path = require('path');

// // Use memoryStorage so files are stored in memory buffer (great for uploading to Cloudinary)
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];

//   if (!allowedTypes.includes(ext)) {
//     return cb(new Error('Only image files are allowed (.jpg, .jpeg, .png, .webp)'), false);
//   }

//   cb(null, true);
// };

// const upload = multer({ storage, fileFilter }); // No limits applied

// module.exports = upload;
