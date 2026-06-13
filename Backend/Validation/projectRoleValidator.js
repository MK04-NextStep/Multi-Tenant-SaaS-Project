const { body } = require('express-validator');

let status = body("status")
            .notEmpty().withMessage("Status should not be empty")
            .isIn(["IDEA", "IN_PROGRESS", "COMPLETED","APPROVED","PENDING", "REJECTED", ])
            .withMessage("Invalid status")

module.exports = status;