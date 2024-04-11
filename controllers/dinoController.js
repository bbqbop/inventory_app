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

exports.list = asyncHandler(async (req, res, next) => {
    // Get all dino details
    const entries = await Dino.find().exec();

    res.render('list', {
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

exports.createGET = asyncHandler( async (req, res, next) => {
    const [allCategories, allLifePeriods] = await Promise.all([
        Category.find().sort({name: 1}).exec(),
        LifePeriod.find().sort({ name: 1 }).exec()
    ]);
    res.render('dino_form', {
    title: 'Create new Dino Entry',
    allCategories, allLifePeriods,
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
            .isAlpha()
            .withMessage('Name must contain only letters')
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
    const dino = new Dino({
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
            if (dino.categories.includes(category._id)) {
                category.isChecked = 'true';
            }
        }

        res.render('dino_form', {
        title: 'Create new Dino Entry',
        allCategories, 
        allLifePeriods, 
        dino,
        errors: errors.array(),
        });
    } else {
        // Input is valid
        await dino.save();
        res.redirect(dino.url);
    }
})

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

