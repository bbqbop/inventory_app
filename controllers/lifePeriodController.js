const LifePeriod = require('../models/lifeperiod');
const Dino = require('../models/dino');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// LIST AND DETAIL VIEW
exports.list = asyncHandler(async (req, res, next) => {
    // Get all entry details
    const entries = await LifePeriod.find().exec();

    res.render('entry_list', {
        title: 'All Life Periods',
        entries
    });
})
exports.detail = asyncHandler(async (req, res, next) => {
    // get details
    const [entry, allDinos] = await Promise.all ([
        LifePeriod.findById(req.params.id).exec(),
        Dino.find({ lifePeriod: req.params.id })
    ])

    if (!entry){
        const err = new Error('Entry not found');
        err.status = 404;
        next(err);
    };

    res.render('entry_detail', {
        type: 'lifeperiod',
        entry, 
        allDinos,
    })
})

// CREATE ENTRY
exports.createGET = (req, res, next) => {
    res.render('entry_form', {
        title: 'Create new Life Period',
        type: 'lifeperiod',
    })
}
exports.createPOST = asyncHandler(async (req, res, next) => {
    const validationRules = [
        body('name')
            .trim()
            .isLength({min: 1})
            .withMessage('Name must not be empty')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name must contain only letters and spaces.')
            .escape(),
        body('span')
            .trim()
            .isLength({min: 1})
            .withMessage('Time span must not be empty')
            .escape(),
        body('desc')
            .trim()
            .isLength({min: 1})
            .withMessage('Description must not be empty')
            .escape(),
    ]

    await Promise.all(
        validationRules.map(validationRule => validationRule.run(req))
    )
    const errors = validationResult(req);

    const { name, span, desc } = req.body;

    const entry = new LifePeriod({
        name, span, desc
    })

    if (!errors.isEmpty()) {
        res.render('entry_form', {
            title: 'Create new Life Period',
            type: 'lifeperiod',
            entry, 
            errors: errors.array()
        })
    } else {
        await entry.save();
        res.redirect(entry.url)
    }
})

// DELETE ENTRY
exports.deleteGET = asyncHandler(async (req, res) => {
    const [entry, conflicts] = await Promise.all([
        LifePeriod.findById(req.params.id),
        Dino.find({ lifePeriod: req.params.id }),
    ])
    
    res.render('entry_delete', {
        title: 'Delete Life Period',
        type: 'lifeperiod',
        entry,
        conflicts
    })
})
exports.deletePOST = asyncHandler(async (req, res) => {
    await LifePeriod.findByIdAndDelete(req.params.id);
    res.redirect('/catalog/lifeperiods');
})

// UPDATE ENTRY
exports.updateGET = asyncHandler(async (req, res, next) => {
    const entry = await LifePeriod.findById(req.params.id);

    res.render('entry_form', {
        title: 'Update Life Period',
        type: 'lifeperiod',
        entry
    })
})
exports.updatePOST = asyncHandler(async (req, res, next) => {
    const validationRules = [
        body('name')
            .trim()
            .isLength({min: 1})
            .withMessage('Name must not be empty')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name must contain only letters and spaces.')
            .escape(),
        body('span')
            .trim()
            .isLength({min: 1})
            .withMessage('Time span must not be empty')
            .escape(),
        body('desc')
            .trim()
            .isLength({min: 1})
            .withMessage('Description must not be empty')
            .escape(),
    ]

    await Promise.all(
        validationRules.map(validationRule => validationRule.run(req))
    )
    const errors = validationResult(req);

    const { name, span, desc } = req.body;

    const entry = new LifePeriod({
        name, 
        span, 
        desc,
        _id: req.params.id
    })

    if (!errors.isEmpty()) {
        res.render('entry_form', {
            title: 'Update Life Period',
            type: 'lifeperiod',
            entry, 
            errors: errors.array()
        })
    } else {
        await LifePeriod.findByIdAndUpdate(entry._id, entry)
        res.redirect(entry.url)
    }
})