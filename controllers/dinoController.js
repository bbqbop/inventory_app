const Dino = require('../models/dino');
const Category = require('../models/category');
const LifePeriod = require('../models/lifeperiod');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

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
        name, desc, lifePeriod, categories
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
        // Input is valid
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
    await Dino.findByIdAndDelete(req.params.id)
    res.redirect('/catalog/dinos');
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
    await Dino.findByIdAndUpdate(req.params.id, entry)
    res.redirect(entry.url);
}})

