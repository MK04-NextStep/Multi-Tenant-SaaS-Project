const { param } = require('express-validator');
const mongoose = require('mongoose')
const { NewError } = require("../Middleware/errMiddleware")

let idValidator = (...ids) => {
  return ids.map((id) =>
    param(id).custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`${id} is not a valid ObjectId`);
      }
      return true;
    })
  );
};

module.exports = idValidator;