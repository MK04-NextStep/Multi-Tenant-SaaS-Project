const logger = require('../Utils/logger')

class NewError extends Error{
    constructor (message, status){
        super(message);
        this.statusCode = status
    }
}

let errorMiddleware = (err, req, res, next) => {

    let message = err.message || "Internal Server Error";
    let status = err.statusCode || 500;

    console.log(err)
    logger.error({
        message: message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.userId
    });

    res.status(status).json({
        success: false,
        message: message
    })
}

module.exports = { NewError, errorMiddleware }