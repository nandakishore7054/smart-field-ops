const mongoose = require('mongoose');
const Task = require('../tasks/tasks.model');
const User = require('../auth/auth.model');
const ApiError = require('../../core/utils/apiError');

async function getSummary() {
  const now = new Date();
  
  // Tasks overall stats
  const taskStatsPipeline = [
    { $match: { isDeleted: false } },
    {
      $facet: {
        total: [{ $count: "count" }],
        completed: [{ $match: { status: "completed" } }, { $count: "count" }],
        pending: [{ $match: { status: { $in: ["unassigned", "assigned", "in-progress"] } } }, { $count: "count" }],
        verified: [{ $match: { status: "verified" } }, { $count: "count" }],
        rejected: [{ $match: { status: "rejected" } }, { $count: "count" }],
        overdue: [{ $match: { deadline: { $lt: now }, status: { $in: ["unassigned", "assigned", "in-progress"] } } }, { $count: "count" }],
        distribution: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ];

  // Weekly completion trend (last 7 days)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyTrendPipeline = [
    {
      $match: {
        isDeleted: false,
        status: { $in: ["completed", "verified"] },
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        completedTasks: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  // Active workers count
  const activeWorkersPipeline = [
    { $match: { role: "worker", status: "active" } },
    { $count: "count" }
  ];

  const [taskStats, weeklyTrend, workerStats] = await Promise.all([
    Task.aggregate(taskStatsPipeline),
    Task.aggregate(weeklyTrendPipeline),
    User.aggregate(activeWorkersPipeline)
  ]);

  const stats = taskStats[0];
  const totalTasks = stats.total[0]?.count || 0;
  const completedTasks = stats.completed[0]?.count || 0;
  const pendingTasks = stats.pending[0]?.count || 0;
  const verifiedTasks = stats.verified[0]?.count || 0;
  const rejectedTasks = stats.rejected[0]?.count || 0;
  const overdueTasks = stats.overdue[0]?.count || 0;

  // Completion rate considers completed + verified
  const totalCompletedOrVerified = completedTasks + verifiedTasks;
  const completionRate = totalTasks > 0 ? ((totalCompletedOrVerified / totalTasks) * 100).toFixed(2) : 0;

  const statusDistribution = stats.distribution.map(d => ({
    status: d._id,
    count: d.count
  }));

  const activeWorkers = workerStats[0]?.count || 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    verifiedTasks,
    rejectedTasks,
    completionRate: Number(completionRate),
    activeWorkers,
    statusDistribution,
    weeklyCompletionTrend: weeklyTrend.map(d => ({ date: d._id, completed: d.completedTasks }))
  };
}

async function getWorkerStats(workerId) {
  const workerObjId = new mongoose.Types.ObjectId(workerId);
  const worker = await User.findOne({ _id: workerObjId, role: "worker" }).lean();
  if (!worker) {
    throw new ApiError(404, "Worker not found");
  }

  const pipeline = [
    { $match: { assignedTo: workerObjId, isDeleted: false } },
    {
      $facet: {
        total: [{ $count: "count" }],
        assigned: [{ $match: { status: { $in: ["assigned", "in-progress"] } } }, { $count: "count" }],
        completed: [{ $match: { status: "completed" } }, { $count: "count" }],
        verified: [{ $match: { status: "verified" } }, { $count: "count" }],
        rejected: [{ $match: { status: "rejected" } }, { $count: "count" }],
        completionTimes: [
          { $match: { status: { $in: ["completed", "verified"] }, createdAt: { $exists: true }, updatedAt: { $exists: true } } },
          {
            $project: {
              durationMs: { $subtract: ["$updatedAt", "$createdAt"] }
            }
          },
          {
            $group: {
              _id: null,
              avgDurationMs: { $avg: "$durationMs" }
            }
          }
        ]
      }
    }
  ];

  const results = await Task.aggregate(pipeline);
  const stats = results[0];

  const totalAssigned = stats.total[0]?.count || 0;
  const assignedTasks = stats.assigned[0]?.count || 0;
  const completedTasks = stats.completed[0]?.count || 0;
  const verifiedTasks = stats.verified[0]?.count || 0;
  const rejectedTasks = stats.rejected[0]?.count || 0;

  const totalSubmitted = completedTasks + verifiedTasks + rejectedTasks;
  const verificationRate = totalSubmitted > 0 ? ((verifiedTasks / totalSubmitted) * 100).toFixed(2) : 0;
  
  const avgDurationMs = stats.completionTimes[0]?.avgDurationMs || 0;
  // Convert ms to hours
  const avgCompletionTimeHours = avgDurationMs > 0 ? (avgDurationMs / (1000 * 60 * 60)).toFixed(2) : 0;

  return {
    workerId: worker._id,
    name: worker.name,
    email: worker.email,
    totalAssigned,
    assignedTasks,
    completedTasks,
    verifiedTasks,
    rejectedTasks,
    verificationRate: Number(verificationRate),
    avgCompletionTimeHours: Number(avgCompletionTimeHours)
  };
}

module.exports = {
  getSummary,
  getWorkerStats
};
