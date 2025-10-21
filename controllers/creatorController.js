// controllers/creatorController.js

const path = require('path');
const bcrypt = require('bcrypt');
const Creator = require('../models/Creator');
const User = require('../models/User');
const {
    languages: languageOptions,
    videoTypes: videoTypeOptions,
    strengths: strengthOptions,
    equipments: equipmentOptions,
    countries: countryOptions,
    genres: genreOptions,
    MAX_VIDEO_UPLOADS,
} = require('../config/creatorOptions');

const ensureArray = (value) => {
    if (!value) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
};

const normalizeArray = (value) => {
    return ensureArray(value)
        .map((item) => (typeof item === 'string' ? item.split(',') : item))
        .flat()
        .map((item) => (typeof item === 'string' ? item.trim() : item))
        .filter(Boolean);
};

const toPublicUrl = (file) => {
    if (!file || !file.filename) {
        return null;
    }
    return path.posix.join('/uploads/creators', file.filename);
};

const getFormOptions = () => ({
    languageOptions,
    videoTypeOptions,
    strengthOptions,
    equipmentOptions,
    countryOptions,
    genreOptions,
    maxVideos: MAX_VIDEO_UPLOADS,
});

const prepareCreatorForForm = (creator) => {
    if (!creator) {
        return null;
    }
    const creatorObject = creator.toObject ? creator.toObject() : { ...creator };

    creatorObject.langue = normalizeArray(creatorObject.langue);
    creatorObject.atout = normalizeArray(creatorObject.atout);
    creatorObject.category = normalizeArray(creatorObject.category);
    creatorObject.videoTypes = normalizeArray(creatorObject.videoTypes);
    creatorObject.portfolioImages = normalizeArray(creatorObject.portfolioImages);
    creatorObject.videos = normalizeArray(creatorObject.videos);

    return creatorObject;
};

const combineVideos = ({ existing = [], removed = [], uploads = [] }) => {
    const existingVideos = normalizeArray(existing);
    const removedSet = new Set(normalizeArray(removed));
    const retainedVideos = existingVideos.filter((video) => !removedSet.has(video));
    const uploadedVideos = uploads
        .map(toPublicUrl)
        .filter(Boolean);

    if (retainedVideos.length + uploadedVideos.length > MAX_VIDEO_UPLOADS) {
        throw new Error(`Vous pouvez téléverser au maximum ${MAX_VIDEO_UPLOADS} vidéos.`);
    }

    return [...retainedVideos, ...uploadedVideos];
};

const renderKreatorList = async (req, res) => {
    try {
        const { categories, videoTypes, ageMin, ageMax, countries, langues, atouts, genres } = req.query;

        const query = { isActive: true };

        if (categories) {
            query.category = { $in: categories.split(',') };
        }

        if (videoTypes) {
            query.videoTypes = { $in: videoTypes.split(',') };
        }

        if (ageMin || ageMax) {
            query.age = {};
            if (ageMin) query.age.$gte = parseInt(ageMin, 10);
            if (ageMax) query.age.$lte = parseInt(ageMax, 10);
        }

        if (countries) {
            query.country = { $in: countries.split(',') };
        }
        if (langues) {
            query.langue = { $in: langues.split(',') };
        }
        if (atouts) {
            query.atout = { $in: atouts.split(',') };
        }
        if (genres) {
            query.genre = { $in: genres.split(',') };
        }

        const kreators = await Creator.find(query);

        const filtersQuery = { isActive: true };

        const categoriesList = await Creator.distinct('category', filtersQuery);
        const videoTypesList = await Creator.distinct('videoTypes', filtersQuery);
        const countriesList = await Creator.distinct('country', filtersQuery);
        const languesList = await Creator.distinct('langue', filtersQuery);
        const atoutsList = await Creator.distinct('atout', filtersQuery);
        const genresList = await Creator.distinct('genre', filtersQuery);

        res.render('kreators', {
            kreators,
            categories: categoriesList,
            videoTypes: videoTypesList,
            countries: countriesList,
            langues: languesList,
            atouts: atoutsList,
            genres: genresList,
        });
    } catch (err) {
        console.error('Error fetching kreators:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getKreators = renderKreatorList;
exports.getCreators = renderKreatorList;

const getKreatorById = async (req, res, template) => {
    try {
        const creatorId = req.params.id;
        const creator = await Creator.findById(creatorId);

        if (!creator) {
            return res.status(404).send('Creator not found');
        }

        const preparedCreator = prepareCreatorForForm(creator);

        res.render(template, { creator: preparedCreator });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getCreatorsById = (req, res) => getKreatorById(req, res, 'creator');
exports.getKreatorsById = (req, res) => getKreatorById(req, res, 'kreator');

exports.getAddCreator = async (req, res) => {
    try {
        res.render('addCreator');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.postAddCreator = async (req, res) => {
    try {
        const {
            name,
            age,
            country,
            langue,
            profileImage,
            coverImage,
            portfolioImages,
            videoTypes,
            category,
            genre,
            atout,
            videos,
            isActive,
        } = req.body;

        const newCreator = new Creator({
            name,
            age: age ? Number(age) : undefined,
            country,
            langue: normalizeArray(langue),
            profileImage,
            coverImage,
            genre,
            portfolioImages: normalizeArray(portfolioImages),
            videoTypes: normalizeArray(videoTypes),
            category: normalizeArray(category),
            atout: normalizeArray(atout),
            videos: normalizeArray(videos).slice(0, MAX_VIDEO_UPLOADS),
            isActive: typeof isActive === 'string' ? isActive === 'true' : true,
        });

        await newCreator.save();

        req.flash('success', 'Créateur ajouté avec succès.');
        res.redirect('/kreators');
    } catch (err) {
        console.error('Error adding creator:', err.message);
        res.status(500).send('Error adding creator.');
    }
};

exports.getEditCreator = async (req, res) => {
    try {
        const creators = await Creator.find({}, 'name _id');

        let creator = null;
        if (req.query.creatorId) {
            const foundCreator = await Creator.findById(req.query.creatorId);
            creator = prepareCreatorForForm(foundCreator);
        }

        res.render('editCreator', {
            creators,
            creator,
        });
    } catch (error) {
        console.error('Error fetching creator for edit:', error.message);
        res.status(500).send('Server Error');
    }
};

exports.postEditCreator = async (req, res) => {
    try {
        const creatorId = req.body.creatorId;
        const {
            name,
            age,
            country,
            langue,
            profileImage,
            coverImage,
            portfolioImages,
            videoTypes,
            category,
            genre,
            atout,
            videos,
            isActive,
        } = req.body;

        const updatedData = {
            name,
            age: age ? Number(age) : undefined,
            country,
            langue: normalizeArray(langue),
            profileImage,
            coverImage,
            genre,
            portfolioImages: normalizeArray(portfolioImages),
            videoTypes: normalizeArray(videoTypes),
            category: normalizeArray(category),
            atout: normalizeArray(atout),
            videos: normalizeArray(videos).slice(0, MAX_VIDEO_UPLOADS),
            isActive: typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive),
        };

        await Creator.findByIdAndUpdate(creatorId, updatedData, { omitUndefined: true });

        res.redirect('/kreators');
    } catch (error) {
        console.error('Error updating creator:', error.message);
        res.status(500).send('Error updating creator.');
    }
};

exports.getCreatorRegistration = (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.role === 'creator') {
            return res.redirect('/kreators/me/edit');
        }
        return res.redirect('/account');
    }

    res.render('creatorRegister', {
        errors: [],
        formData: {},
        options: getFormOptions(),
    });
};

exports.postCreatorRegistration = async (req, res) => {
    const {
        email,
        password,
        confirmPassword,
        name,
        age,
        country,
        langue,
        videoTypes,
        category,
        genre,
        atout,
    } = req.body;

    const errors = [];

    const normalizedLanguages = normalizeArray(langue);
    const normalizedVideoTypes = normalizeArray(videoTypes);
    const normalizedCategory = normalizeArray(category);
    const normalizedAtouts = normalizeArray(atout);

    if (!email) errors.push("L'e-mail est requis.");
    if (!password) errors.push('Le mot de passe est requis.');
    if (password !== confirmPassword) errors.push('Les mots de passe ne correspondent pas.');
    if (!name) errors.push('Le nom est requis.');
    if (!age) errors.push("L'âge est requis.");
    if (!country) errors.push('Le pays est requis.');
    if (!normalizedLanguages.length) errors.push('Sélectionnez au moins une langue.');
    if (!normalizedAtouts.length) errors.push('Sélectionnez au moins un atout.');
    if (!normalizedCategory.length) errors.push('Sélectionnez au moins un équipement.');
    if (!normalizedVideoTypes.length) errors.push('Sélectionnez au moins un type de vidéo.');

    const profileImageUpload = req.files?.profileImageFile?.[0];
    const coverImageUpload = req.files?.coverImageFile?.[0];
    const videoUploads = req.files?.videoFiles || [];

    const profileImage = toPublicUrl(profileImageUpload);
    const coverImage = toPublicUrl(coverImageUpload);

    if (!profileImage) errors.push("La photo de profil est requise.");
    if (!coverImage) errors.push("La photo de couverture est requise.");

    try {
        if (errors.length > 0) {
            return res.render('creatorRegister', {
                errors,
                formData: { ...req.body },
                options: getFormOptions(),
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.render('creatorRegister', {
                errors: ['Un compte existe déjà avec cet e-mail.'],
                formData: { ...req.body },
                options: getFormOptions(),
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email: email.toLowerCase().trim(),
            name,
            password: hashedPassword,
            role: 'creator',
        });

        try {
            const videos = combineVideos({ uploads: videoUploads });

            await Creator.create({
                name,
                age: age ? Number(age) : undefined,
                country,
                langue: normalizedLanguages,
                profileImage,
                coverImage,
                genre,
                portfolioImages: [],
                videoTypes: normalizedVideoTypes,
                category: normalizedCategory,
                atout: normalizedAtouts,
                videos,
                user: user._id,
                isActive: true,
            });
        } catch (error) {
            await User.findByIdAndDelete(user._id);
            throw error;
        }

        await new Promise((resolve, reject) => {
            req.logIn(user, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });

        req.flash('success', 'Votre profil créateur a été créé avec succès !');
        return res.redirect('/kreators/me/edit');
    } catch (error) {
        console.error('Error registering creator:', error.message);
        const message = error.message && error.message.includes('Vous pouvez')
            ? error.message
            : "Une erreur est survenue lors de votre inscription. Veuillez réessayer.";
        req.flash('error', message);
        return res.redirect('/kreators/register');
    }
};

exports.getMyCreatorProfile = async (req, res) => {
    try {
        const creator = await Creator.findOne({ user: req.user._id });

        if (!creator) {
            return res.redirect('/kreators/register');
        }

        const creatorData = prepareCreatorForForm(creator);

        res.render('creatorSelfEdit', {
            creator: creatorData,
            options: getFormOptions(),
        });
    } catch (error) {
        console.error('Error fetching creator profile:', error.message);
        res.status(500).send('Server Error');
    }
};

exports.postMyCreatorProfile = async (req, res) => {
    try {
        const {
            name,
            age,
            country,
            langue,
            videoTypes,
            category,
            genre,
            atout,
            existingProfileImage,
            existingCoverImage,
            existingVideos,
            removedVideos,
            isActive,
        } = req.body;

        let creator = await Creator.findOne({ user: req.user._id });

        if (!creator) {
            creator = new Creator({ user: req.user._id });
        }

        const normalizedLanguages = normalizeArray(langue);
        const normalizedVideoTypes = normalizeArray(videoTypes);
        const normalizedCategory = normalizeArray(category);
        const normalizedAtouts = normalizeArray(atout);

        if (!normalizedLanguages.length || !normalizedVideoTypes.length || !normalizedCategory.length || !normalizedAtouts.length) {
            req.flash('error', 'Merci de sélectionner au moins une langue, un atout, un équipement et un type de vidéo.');
            return res.redirect('/kreators/me/edit');
        }

        const profileImageUpload = req.files?.profileImageFile?.[0];
        const coverImageUpload = req.files?.coverImageFile?.[0];
        const videoUploads = req.files?.videoFiles || [];

        let videos;
        try {
            videos = combineVideos({
                existing: existingVideos,
                removed: removedVideos,
                uploads: videoUploads,
            });
        } catch (error) {
            req.flash('error', error.message);
            return res.redirect('/kreators/me/edit');
        }

        creator.name = name;
        creator.age = age ? Number(age) : undefined;
        creator.country = country;
        creator.langue = normalizedLanguages;
        creator.profileImage = toPublicUrl(profileImageUpload) || existingProfileImage || creator.profileImage;
        creator.coverImage = toPublicUrl(coverImageUpload) || existingCoverImage || creator.coverImage;
        creator.genre = genre;
        creator.videoTypes = normalizedVideoTypes;
        creator.category = normalizedCategory;
        creator.atout = normalizedAtouts;
        creator.videos = videos;
        creator.isActive = isActive === 'on';

        await creator.save();

        await User.findByIdAndUpdate(req.user._id, { name });
        req.user.name = name;

        req.flash('success', 'Votre profil créateur a été mis à jour.');
        res.redirect('/kreators/me/edit');
    } catch (error) {
        console.error('Error updating creator profile:', error.message);
        req.flash('error', 'Une erreur est survenue lors de la mise à jour de votre profil.');
        res.redirect('/kreators/me/edit');
    }
};
