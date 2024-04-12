const Category = require('../models/category');
const Dino = require('../models/dino')

const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator');

// LIST & DETAILVIEW
exports.list = asyncHandler(async (req, res, next) => {
    // Get all details
    const entries = await Category.find().exec();

    res.render('entry_list', {
        title: 'All Categories',
        entries
    });
});
exports.detail = asyncHandler(async (req, res, next) => {
    // get details
    const [entry, allDinos] = await Promise.all([
        Category.findById(req.params.id).exec(),
        Dino.find({ categories: req.params.id }).exec()
    ])

    if (!entry){
        const err = new Error('Entry not found');
        err.status = 404;
        next(err);
    };

    res.render('entry_detail', {
        type: 'category',
        entry,
        allDinos,
    })
})

// CREATE ENTRY
exports.createGET = (req, res, next) => {
    res.render('entry_form', {
    title: 'Create new Dino Category',
    type: 'category',
    })
}
exports.createPOST = asyncHandler( async (req, res, next, err) => {    
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
    ]

    // execute validation
    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));
   
    // Check for validation errors
    const errors = validationResult(req);

    // define new entry
    const { name, desc } = req.body
    const entry = new Category({
        name, desc,
    })

    // handle validation errors
    if (!errors.isEmpty()) {
        res.render('entry_form', {
        title: 'Create new Dino Category', 
        type: 'category',
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
exports.deleteGET = asyncHandler( async (req, res) => {
    const [entry, conflicts] = await Promise.all([
        Category.findById(req.params.id),
        Dino.find({ categories: req.params.id }),
    ])
    console.log(conflicts)
    res.render('entry_delete', {
        title: 'Delete Category',
        type: 'category',
        entry, 
        conflicts
    })
})
exports.deletePOST = asyncHandler( async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/catalog/categories');
})

// UPDATE ENTRY //
exports.updateGET = asyncHandler( async (req, res) => {
    const entry = await Category.findById(req.params.id)

    res.render('entry_form', {
        title: 'Update Category',
        type: 'category',
        entry
    })
});
exports.updatePOST = asyncHandler(async (req, res) => {
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
    ]

    // execute validation
    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));
   
    // Check for validation errors
    const errors = validationResult(req);

    // define new entry
    const { name, desc } = req.body
    const entry = new Category({
        name, 
        desc,
        _id: req.params.id
    })

    // handle validation errors
    if (!errors.isEmpty()) {
        res.render('entry_form', {
        title: 'Update Category', 
        entry,
        errors: errors.array(),
        });
    } else {
        // Input is valid
        await Category.findByIdAndUpdate(entry._id, entry)
        res.redirect(entry.url);
    }
})