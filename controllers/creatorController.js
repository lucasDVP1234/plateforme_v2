// controllers/creatorController.js

const Creator = require('../models/Creator'); // Ensure this import is present

exports.getCreators = async (req, res) => {
    try {
        const { categories, videoTypes, ageMin, ageMax, countries, langues, atouts, genres } = req.query;

        // Build query object
        let query = {};

        if (categories) {
            query.category = { $in: categories.split(',') };
        }

        if (videoTypes) {
            query.videoTypes = { $in: videoTypes.split(',') };
        }

        if (ageMin || ageMax) {
            query.age = {};
            if (ageMin) query.age.$gte = parseInt(ageMin);
            if (ageMax) query.age.$lte = parseInt(ageMax);
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

        // Fetch creators based on query
        const creators = await Creator.find(query);

        // Fetch categories and videoTypes for filters
        const categoriesList = await Creator.distinct('category');
        const videoTypesList = await Creator.distinct('videoTypes');
        const countriesList = await Creator.distinct('country');
        const languesList = await Creator.distinct('langue');
        const atoutsList = await Creator.distinct('atout');
        const genresList = await Creator.distinct('genre');

        res.render('creators', {
            creators,
            categories: categoriesList,
            videoTypes: videoTypesList,
            countries: countriesList,
            langues: languesList,
            atouts: atoutsList,
            genres: genresList,
        });
    } catch (err) {
        console.error('Error fetching creators:', err.message);
        res.status(500).send('Server Error');
    }
};
exports.getKreators = async (req, res) => {
    try {
        const { categories, videoTypes, ageMin, ageMax, countries, langues, atouts, genres } = req.query;

        // Build query object
        let query = {};

        if (categories) {
            query.category = { $in: categories.split(',') };
        }

        if (videoTypes) {
            query.videoTypes = { $in: videoTypes.split(',') };
        }

        if (ageMin || ageMax) {
            query.age = {};
            if (ageMin) query.age.$gte = parseInt(ageMin);
            if (ageMax) query.age.$lte = parseInt(ageMax);
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

        // Fetch creators based on query
        const creators = await Creator.find(query);

        // Fetch categories and videoTypes for filters
        const categoriesList = await Creator.distinct('category');
        const videoTypesList = await Creator.distinct('videoTypes');
        const countriesList = await Creator.distinct('country');
        const languesList = await Creator.distinct('langue');
        const atoutsList = await Creator.distinct('atout');
        const genresList = await Creator.distinct('genre');

        res.render('kreators', {
            creators,
            categories: categoriesList,
            videoTypes: videoTypesList,
            countries: countriesList,
            langues: languesList,
            atouts: atoutsList,
            genres: genresList,
        });
    } catch (err) {
        console.error('Error fetching creators:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getCreatorsById = async (req, res) => {
    try {
        const creatorId = req.params.id;
        const creator = await Creator.findById(creatorId);

        if (!creator) {
            return res.status(404).send('Creator not found');
        }

        res.render('creator', { creator });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
exports.getKreatorsById = async (req, res) => {
    try {
        const creatorId = req.params.id;
        const creator = await Creator.findById(creatorId);

        if (!creator) {
            return res.status(404).send('Creator not found');
        }

        res.render('kreator', { creator });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

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
    portfolioImages,
    videoTypes,
    category,
    genre,
    atout,
    videos,
    } = req.body;

    // Create a new Creator instance
    const newCreator = new Creator({
    name,
    age,
    country,
    langue,
    profileImage,
    genre,
    portfolioImages: portfolioImages.split(','), // Assuming comma-separated URLs
    videoTypes: videoTypes.split(','), // Assuming comma-separated types
    category: category.split(','), // Assuming comma-separated types
    atout: atout.split(','), // Assuming comma-separated types
    videos: videos.split(','), // Assuming comma-separated types
    });

    await newCreator.save();

    res.redirect('/creators'); // Redirect to creators list or wherever appropriate
} catch (err) {
    console.error('Error adding creator:', err.message);
    res.status(500).send('Error adding creator.');
}
};

exports.getEditCreator = async (req, res) => {
    try {
        const creators = await Creator.find({}, 'name _id');

        // If a creator ID is provided in the query, fetch that creator
        let creator = null;
        if (req.query.creatorId) {
            creator = await Creator.findById(req.query.creatorId);
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
            portfolioImages,
            videoTypes,
            category,
            genre,
            atout,
            videos,
        } = req.body;

        const updatedData = {
            name,
            age,
            country,
            langue,
            profileImage,
            genre,
            portfolioImages: portfolioImages.split(',').filter(Boolean),
            videoTypes: videoTypes.split(',').filter(Boolean),
            category: category.split(',').filter(Boolean),
            atout: atout.split(',').filter(Boolean),
            videos: videos.split(',').filter(Boolean),
        };

        await Creator.findByIdAndUpdate(creatorId, updatedData);

        res.redirect('/creators'); // Redirect to creators list or wherever appropriate
    } catch (error) {
        console.error('Error updating creator:', error.message);
        res.status(500).send('Error updating creator.');
    }
};