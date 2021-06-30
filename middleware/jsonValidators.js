const jsonschema = require('jsonschema');
const newBookSchema = require('../schemas/newBookSchema.json');
const updateBookSchema = require('../schemas/updateBookSchema.json');
const ExpressError = require('../expressError');

function validateNewBookData(req, res, next) {
    try {
        const result  = jsonschema.validate(req.body, newBookSchema);
        if(!result.valid) {
            const listOfErrors = result.errors.map(e => e.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        return next();
    } catch(e) {
        return next(e);
    }
}

function validateUpdateBookData(req, res, next) {
    try{
        const result = jsonschema.validate(req.body, updateBookSchema)
        if(!result.valid) {
            const listOfErrors = result.errors.map(e => e.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        return next();
    } catch(e) {
        return next(e);
    }
}

module.exports = {validateNewBookData, validateUpdateBookData};