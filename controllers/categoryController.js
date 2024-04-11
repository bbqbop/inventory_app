const Category = require('../models/category');
const Dino = require('../models/dino')

const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator');

exports.list = asyncHandler(async (req, res, next) => {
    // Get all details
    const entries = await Category.find().exec();

    res.render('list', {
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

exports.createGET = (req, res, next) => {
    res.render('category_form', {
    title: 'Create new Dino Category',
    })
}
exports.createPOST = asyncHandler( async (req, res, next, err) => {    
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
    ]

    // execute validation
    await Promise.all(validationRules.map(validationRule => validationRule.run(req)));
   
    // Check for validation errors
    const errors = validationResult(req);

    // define new entry
    const { name, desc } = req.body
    const category = new Category({
        name, desc,
    })

    // handle validation errors
    if (!errors.isEmpty()) {
        res.render('category_form', {
        title: 'Create new Dino Category', 
        category,
        errors: errors.array(),
        });
    } else {
        // Input is valid
        await category.save();
        res.redirect(category.url);
    }
})

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