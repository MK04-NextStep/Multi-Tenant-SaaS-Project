const fileModel = require('../Model/fileModel');
const { NewError } = require('../Middleware/errMiddleware');
const cloudinary = require('../Config/cloudinary');
const logger = require('../Utils/logger');
const validateResult = require('../Utils/ValidateResult');
const { getIo } = require('../socket');

let uploadFiles = async (req, res, next) => {
    validateResult(req);
    let id = req.userId;
    let project = req.project;

    let file = req.file;
    if (!file) {
        return next(new NewError("file is required", 400));
    }

    // Upload to cloud storage
    const result = await cloudinary.uploader.upload(file.path, {
        folder: "project-files",
        resource_type: "auto",
        use_filename: true,
        unique_filename: false
    });

    let data = {
        workspaceId: project.workspaceId,
        teamId: project.teamId,
        projectId: project._id,
        uploadedBy: id,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl: result.secure_url,
        publicId: result.public_id
    };

    let newFile = await fileModel.create(data);
    let note = getIo().to(project._id.toString()).emit("file-uploaded", {
        projectId: project._id,
        file: newFile
    });
    return res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: newFile
    });
};

let getProjectFiles = async (req, res, next) => {
    validateResult(req);
    let project = req.project;
    console.log("hello")

    let files = await fileModel.find({ projectId: project._id }).populate("uploadedBy", "name");

    return res.status(200).json({
        success: true,
        count: files.length,
        data: files
    });
};

let deleteFile = async (req, res, next) => {
    validateResult(req);
    let { fileId } = req.params;

    if (!fileId) {
        return next(new NewError("file id required", 400));
    }

    let file = await fileModel.findById(fileId);
    if (!file) {
        return next(new NewError("file not found", 404));
    }

    await fileModel.findByIdAndDelete(fileId);

    if (file.publicId) {
        await cloudinary.uploader.destroy(file.publicId).catch(cloudErr => {
            logger.error(`Cloudinary deletion failed for publicId ${file.publicId}: ${cloudErr.message}`);
        });
    }
    const io = getIo();

    io.to(file.projectId.toString()).emit("file-deleted", {
        projectId: file.projectId.toString(),
        fileId:fileId.toString()
    });

    return res.status(200).json({
        success: true,
        message: "File deleted successfully"
    });
};

module.exports = {
    uploadFiles,
    getProjectFiles,
    deleteFile
};