const Dino = require('../models/dino');
const Category = require('../models/category');
const LifePeriod = require('../models/lifeperiod');

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// // to upload files locally stored in app
// const uploadImage = asyncHandler(async (imagePath) => {
//     const options = {
//         use_filename: true,
//         unique_filename: false,
//         overwrite: true,
//     };

//     const result = await cloudinary.uploader.upload(imagePath, options);
//     console.log(result);
//     return result.url;
// })

// to upload straight to cloudinary as stream
const uploadStream = asyncHandler(async function (bufferImg) {
    return new Promise((resolve, reject) => {
        streamifier.createReadStream(bufferImg).pipe(
            cloudinary.uploader.upload_stream(
                {
                    folder: "dinos",
                    transformation: [
                        { width: 300, crop: "scale" },
                    ]
                },
                function (error, result) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            )
        );
    });
});

async function deleteImg(imgId){
    // delete img from cloudinary
    await cloudinary.uploader.destroy(imgId, (err, result) => {
        if (err){
            console.log(err)
        } else {
            console.log(result)
        }
    })
};

const checkForAndDeleteImg = asyncHandler(async (entryId) => {
    console.log(entryId)
    const entry = await Dino.findById(entryId)
    if (entry.img.url) {
        await deleteImg(entry.img.publicId)
    }
})


exports.index = asyncHandler(async (req, res, next) => {
    // Get all entry counts from DB
    const [dinoCount, categoryCount, lifePeriodCount] = await Promise.all([
        Dino.countDocuments({}).exec(),
        Category.countDocuments({}).exec(),
        LifePeriod.countDocuments({}).exec(),
    ]);

    res.render('index', {
        title: 'Dino Library Home',
        dinoCount, categoryCount, lifePeriodCount
    });
});

// LIST AND DETAIL VIEW
exports.list = asyncHandler(async (req, res, next) => {
    // Get all dino details
    const entries = await Dino.find().exec();

    res.render('entry_list', {
        title: 'All Dinos',
        entries
    });
})
exports.detail = asyncHandler(async (req, res, next) => {
    // get details
    const entry = await Dino.findById(req.params.id).populate('categories').populate('lifePeriod').exec()

    if (!entry){
        const err = new Error('Entry not found');
        err.status = 404;
        next(err);
    };

    res.render('entry_detail', {
        type: 'dino',
        entry,
    })
})

// CREATE ENTRY
exports.createGET = asyncHandler( async (req, res, next) => {
    const [allCategories, allLifePeriods] = await Promise.all([
        Category.find().sort({name: 1}).exec(),
        LifePeriod.find().sort({ name: 1 }).exec()
    ]);
    res.render('entry_form', {
    title: 'Create new Dino Entry',
    type: 'dino',
    allCategories, 
    allLifePeriods,
    })
})
exports.createPOST = asyncHandler( async (req, res, next, err) => {     
    // if no categories are checked, turn into empty array
    if (req.body.categories === undefined)
        req.body.categories = [];

    // define validation rules
    const validationRules = [
        body('name')
            .trim() 
            .isLength({ min: 1 })
            .withMessage('Name must not be empty.')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name must contain only letters and spaces.')
            .escape(),
        body('desc')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Description must not be empty.')
            .escape(),
        body('lifePeriod', 'Dinosaur must have existing life period.')
            .isLength({ min: 1 })
            .escape(),
        body('categories').escape()
    ]

    // execute validation
    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));
   
    // Check for validation errors
    const errors = validationResult(req);

    // define new entry
    const { name, desc, lifePeriod, categories } = req.body
    const entry = new Dino({
        name, desc, lifePeriod, categories,
    })

    // handle validation errors
    if (!errors.isEmpty()) {
        const [allCategories, allLifePeriods] = await Promise.all([
            Category.find().sort({name: 1}).exec(),
            LifePeriod.find().sort({ name: 1 }).exec()
        ]);
        // mark all checked categories for rerender
        for (const category of allCategories) {
            if (entry.categories.includes(category._id)) {
                category.isChecked = 'true';
            }
        }

        res.render('entry_form', {
        title: 'Create new Dino Entry',
        type: 'dino',
        allCategories, 
        allLifePeriods, 
        entry,
        errors: errors.array(),
        });
    } else {
        // input is valid
        // if an image is in the buffer, upload it
        if (req.file.buffer){
            const imgResult = await uploadStream(req.file.buffer)
            entry.img.url = imgResult.url;
            entry.img.publicId = imgResult.public_id
            console.log(entry)
        }
        await entry.save();
        res.redirect(entry.url);
    }
})

// DELETE ENTRY
exports.deleteGET = asyncHandler( async( req, res) => {
    const entry = await Dino.findById(req.params.id);

    res.render('entry_delete', {
        title: 'Delete Dino',
        entry
    })
})
exports.deletePOST = asyncHandler( async (req, res) => {
    const dino = await Dino.findByIdAndDelete(req.params.id)
    if (dino.img){
        await deleteImg(dino.img.publicId)
    }
    res.redirect('/catalog/dinos');
})
exports.deleteImgPOST = asyncHandler( async (req, res) => {
    console.log(req.body)
})

// UPDATE ENTRY
exports.updateGET = asyncHandler(async (req, res) => {
    const [entry, allCategories, allLifePeriods] = await Promise.all([
        Dino.findById(req.params.id),
        Category.find(),
        LifePeriod.find(),
    ])

    // add isChecked property to categories for form checkboxes
    allCategories.forEach(category => category.isChecked = entry.categories.includes(category._id))

    res.render('entry_form', {
        title: 'Update Dino',
        type: 'dino',
        entry,
        allCategories,
        allLifePeriods,
    })
});
exports.updatePOST = asyncHandler(async (req, res) => {
    // if no categories are checked, turn into empty array
    if (req.body.categories === undefined)
    req.body.categories = [];

   
    // define validation rules
    const validationRules = [
    body('name')
        .trim() 
        .isLength({ min: 1 })
        .withMessage('Name must not be empty.')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name must contain only letters and spaces.')
        .escape(),
    body('desc')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Description must not be empty.')
        .escape(),
    body('lifePeriod', 'Dinosaur must have existing life period.')
        .isLength({ min: 1 })
        .escape(),
    body('categories').escape()
    ]

    // execute validation
    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));

    // Check for validation errors
    const errors = validationResult(req);

    // define new entry
    const { name, desc, lifePeriod, categories } = req.body
    const entry = new Dino({
        name, 
        desc, 
        lifePeriod, 
        categories,
        _id: req.params.id
    })

    // handle validation errors
    if (!errors.isEmpty()) {
    const [allCategories, allLifePeriods] = await Promise.all([
        Category.find().sort({name: 1}).exec(),
        LifePeriod.find().sort({ name: 1 }).exec()
    ]);

    // add isChecked property to categories for form checkboxes
    allCategories.forEach(category => category.isChecked = entry.categories.includes(category._id))


    res.render('entry_form', {
    title: 'Update Dino',
    type: 'dino',
    allCategories, 
    allLifePeriods, 
    entry,
    errors: errors.array(),
    });
    } else {
    // Input is valid
    if (req.file || req.body.deleteImg){
        // check if old image has to be deleted
        await checkForAndDeleteImg(req.params.id)
        // upload new image
        const imgResult = req.file ? await uploadStream(req.file.buffer) : false
        entry.img.url = imgResult.url || '';
        entry.img.publicId = imgResult.public_id || '';
        console.log(entry)
    }
    await Dino.findByIdAndUpdate(req.params.id, entry)
    res.redirect(entry.url);
}})



