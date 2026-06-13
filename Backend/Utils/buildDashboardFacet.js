const buildDashboardFacet = ({ now, nextWeek, startOfWeek }) => {
    return {
        totalTasks: [
            { $count: "count" }
        ],
        completed: [
            {
                $match: { status: "DONE" }
            },
            { $count: "count" }
        ],
        inProgress: [
            {
                $match: { status: "IN_PROGRESS" }
            },
            {
                $count: "count"
            }
        ],
        overdue: [
            {
                $match: {
                    dueDate: { $lt: now },
                    status: { $ne: "DONE" }
                }
            },
            {
                $count: "count"
            }
        ],
        upcomingDeadlines: [
            {
                $match: {
                    dueDate: {
                        $gte: now,
                        $lte: nextWeek
                    },
                    status: { $ne: "DONE" }
                }
            },
            {
                $project: {
                    title: 1,
                    dueDate: 1,
                    priority: 1,
                    status: 1
                }
            },
            {
                $sort: {
                    dueDate: 1
                }
            },
            {
                $limit: 5
            }
        ],
        statusDistribution: [
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ],
        tasksPerDay: [
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ],
        tasksCreatedThisWeek: [
            {
                $match: {
                    createdAt: {
                        $gte: startOfWeek
                    }
                }
            },
            {
                $count: "count"
            }
        ],
        tasksCompletedThisWeek: [
            {
                $match: {
                    status: "DONE",
                    updatedAt: {
                        $gte: startOfWeek
                    }
                }
            },
            {
                $count: "count"
            }
        ],
        assigneeStats: [
            {
                $group: {

                    _id: "$assignedTo",
                    assignedTasks: {
                        $sum: 1
                    },
                    completedTasks: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "DONE"] },
                                1,
                                0
                            ]
                        }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $lt: [
                                                "$dueDate",
                                                now
                                            ]
                                        },
                                        {
                                            $ne: [
                                                "$status",
                                                "DONE"
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 1,
                    name: "$user.name",
                    assignedTasks: 1,
                    completedTasks: 1,
                    overdueTasks: 1
                }
            }
        ],
        priorityStats: [
            {
                $group: {
                    _id: "$priority",

                    count: {
                        $sum: 1
                    }
                }
            }
        ],
        highPriorityOverdue: [
            {
                $match: {
                    priority: "HIGH",
                    status: { $ne: "DONE" },
                    dueDate: { $lt: now }
                }
            },

            {
                $count: "count"
            }
        ],
        blockedTasks: [
            {
                $match: {
                    dependencies: {
                        $exists: true,
                        $ne: []
                    }
                }
            },

            {
                $count: "count"
            }
        ],
        blockingTasks: [
            {
                $unwind: "$dependencies"
            },

            {
                $group: {
                    _id: "$dependencies",
                    count: { $sum: 1 }
                }
            },

            {
                $count: "count"
            }
        ]
    };
};

module.exports =
    buildDashboardFacet