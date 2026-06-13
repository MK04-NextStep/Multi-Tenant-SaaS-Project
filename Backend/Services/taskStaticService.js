const mongoose = require("mongoose");
const taskModel = require("../Model/TaskModel");
const logger = require('../Utils/logger')
const buildDashboardFacet = require('../Utils/buildDashboardFacet')

let getProjectTaskStatsService = async (projectId) => {

    const objectId =
        new mongoose.Types.ObjectId(projectId);

    const now = new Date();

    const nextWeek = new Date();
    nextWeek.setDate(
        nextWeek.getDate() + 7
    );

    const startOfWeek = new Date();
    startOfWeek.setDate(
        startOfWeek.getDate() - 7
    );

    const facet =
        buildDashboardFacet({
            now,
            nextWeek,
            startOfWeek
        });

    const stats = await taskModel.aggregate([

        {
            $match: {
                projectId: objectId
            }
        },

        {
            $facet: facet
        }
    ]);

    const data = stats[0];

    const totalTasks =
        data.totalTasks[0]?.count || 0;

    const completed =
        data.completed[0]?.count || 0;

    const inProgress =
        data.inProgress[0]?.count || 0;

    const overdue =
        data.overdue[0]?.count || 0;

    const tasksCreatedThisWeek =
        data.tasksCreatedThisWeek[0]?.count || 0;

    const tasksCompletedThisWeek =
        data.tasksCompletedThisWeek[0]?.count || 0;

    return {

        overview: {
            totalTasks,
            completed,
            inProgress,
            overdue
        },

        progress: {
            completionRate:
                totalTasks === 0
                    ? 0
                    : Math.round(
                        (completed / totalTasks) * 100
                    )
        },

        deadlines: {
            upcoming:
                data.upcomingDeadlines
        },

        productivity: {

            tasksCreatedThisWeek,

            tasksCompletedThisWeek,

            netFlow:
                tasksCompletedThisWeek -
                tasksCreatedThisWeek
        },

        assignees:
            data.assigneeStats,

        priority: {

            distribution:
                data.priorityStats,

            highPriorityOverdue:
                data.highPriorityOverdue[0]
                    ?.count || 0
        },

        dependencies: {

            blockedTasks:
                data.blockedTasks[0]
                    ?.count || 0,

            blockingTasks:
                data.blockingTasks[0]
                    ?.count || 0
        },

        analytics: {

            tasksPerDay:
                data.tasksPerDay,

            statusDistribution:
                data.statusDistribution
        }
    };
};

module.exports = {
    getProjectTaskStatsService
};