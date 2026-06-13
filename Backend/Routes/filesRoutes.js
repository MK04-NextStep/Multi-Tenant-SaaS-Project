const express = require('express');
const authMiddleware = require('../Middleware/authMiddleware');
const { uploadFiles, getProjectFiles, deleteFile } = require('../Controller/fileController')
const upload = require('../Middleware/multer')
const asyncHandler = require('../Utils/asyncHandler')
const {projectId, allProjectRole} = require('../Middleware/idMiddleware')

const route = express.Router();

route.use(authMiddleware);

route.post("/:projectId/files",projectId,allProjectRole, upload.single("file"),asyncHandler(uploadFiles));
route.get("/:projectId/files",projectId,allProjectRole,asyncHandler(getProjectFiles));
route.delete("/:projectId/files/:fileId/delete-file",projectId,allProjectRole,asyncHandler(deleteFile));

module.exports = route;