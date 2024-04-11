const LifePeriod = require('../models/lifeperiod');
const Dino = require('../models/dino');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.list = asyncHandler(async (req, res, next) => {
    // Get all entry details
    const entries = await LifePeriod.find().exec();

    res.render('list', {
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

exports.createGET = (req, res, next) => {
    res.render('lifeperiod_form', {
        title: 'Create new Life Period'
    })
}

exports.createPOST = asyncHandler(async (req, res, next) => {
    const validationRules = [
        body('name')
            .trim()
            .isLength({min: 1})
            .withMessage('Name must not be empty')
            .isAlpha()
            .withMessage('Name must be letters only')
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

    const lifePeriod = new LifePeriod({
        name, span, desc
    })

    if (!errors.isEmpty()) {
        res.render('lifeperiod_form', {
            title: 'Create new life period',
            lifePeriod, 
            errors: errors.array()
        })
    } else {
        await lifePeriod.save();
        res.redirect(lifePeriod.url)
    }
})

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