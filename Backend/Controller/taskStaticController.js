const { NewError } = require('../Middleware/errMiddleware');
const { getProjectTaskStatsService } = require('../Services/taskStaticService');
const logger = require('../Utils/logger')


let getProjectTaskStatus = async(req,res,next) => {
    const { projectId } = req.params;
    const stats = await getProjectTaskStatsService(projectId);
    res.json({
        success: true,
        data: stats
    });
}

module.exports = getProjectTaskStatus;