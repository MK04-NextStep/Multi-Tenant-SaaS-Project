const commentModel = require("../Model/commentModel");
const { NewError } = require("./errMiddleware");

let commentMiddleware = async (req, res, next) => {
    try {
        let { commentId } = req.params;
        if (!commentId) {
            return next(new NewError("Invalid comment id", 400));
        }
        let comment = await commentModel.findById(commentId);
        if (!comment || comment.isDeleted) {
            return next(new NewError("Comment not found", 404));
        }
        req.comment = comment;
        return next();
    } catch (e) {
        return next(e);
    }
};

module.exports = commentMiddleware;