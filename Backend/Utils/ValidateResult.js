const { validationResult } = require('express-validator');
const { NewError } = require('../Middleware/errMiddleware');

const validateResult = (req) => {
    let err = validationResult(req);
    if(!err.isEmpty()){
        throw new NewError(err.array()[0].msg, 400);
    }
}

module.exports = validateResult;