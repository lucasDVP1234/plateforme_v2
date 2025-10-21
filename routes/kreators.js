const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const creatorController = require('../controllers/creatorController');
const { ensureCreator, isAdmin } = require('../middlewares/auth');

const router = express.Router();

const uploadDirectory = path.join(__dirname, '..', 'public', 'uploads', 'creators');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(uploadDirectory, { recursive: true });
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        const safeField = file.fieldname.replace(/[^a-zA-Z0-9]/g, '');
        const ext = path.extname(file.originalname) || '';
        cb(null, `${safeField}-${Date.now()}${ext}`);
    },
});

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const allowedVideoTypes = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file to support high-quality videos
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profileImageFile' || file.fieldname === 'coverImageFile') {
            if (!allowedImageTypes.has(file.mimetype)) {
                return cb(new Error('Merci de téléverser une image au format JPEG, PNG, WEBP ou GIF.'));
            }
        } else if (file.fieldname === 'videoFiles') {
            if (!allowedVideoTypes.has(file.mimetype)) {
                return cb(new Error('Merci de téléverser des vidéos au format MP4, QuickTime ou WebM.'));
            }
        }

        cb(null, true);
    },
});

const mediaFields = [
    { name: 'profileImageFile', maxCount: 1 },
    { name: 'coverImageFile', maxCount: 1 },
    { name: 'videoFiles', maxCount: 4 },
];

const handleMediaUpload = (req, res, next) => {
    upload.fields(mediaFields)(req, res, (err) => {
        if (err) {
            req.flash('error', err.message);
            if (req.originalUrl.includes('/register')) {
                return res.redirect('/kreators/register');
            }
            if (req.originalUrl.includes('/me/edit')) {
                return res.redirect('/kreators/me/edit');
            }
            return res.redirect('back');
        }
        next();
    });
};

router.get('/add', isAdmin, creatorController.getAddCreator);
router.post('/add', isAdmin, creatorController.postAddCreator);

router.get('/register', creatorController.getCreatorRegistration);
router.post('/register', handleMediaUpload, creatorController.postCreatorRegistration);

router.get('/me/edit', ensureCreator, creatorController.getMyCreatorProfile);
router.post('/me/edit', ensureCreator, handleMediaUpload, creatorController.postMyCreatorProfile);

router.get('/edit', creatorController.getEditCreator);
router.post('/edit', creatorController.postEditCreator);

router.get('/', creatorController.getKreators);
router.get('/:id', creatorController.getKreatorsById);

module.exports = router;
