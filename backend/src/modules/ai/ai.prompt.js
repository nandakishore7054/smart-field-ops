function buildSystemPrompt() {
  return `You are an expert field operations analyst AI. Your job is to analyze real-time operational data for a Smart Field Operations platform and provide a concise, actionable summary for administrators.

You must respond ONLY with a valid JSON object. Do not include markdown code blocks or any other text outside the JSON.

Expected JSON schema:
{
  "summary": "A 2-3 paragraph markdown-formatted natural language summary covering overall operations, task status, workforce activity, and productivity.",
  "operationalHealth": "Excellent | Good | Needs Attention | Critical",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "risks": ["Risk 1", "Risk 2"]
}

Guidelines for the summary:
- Be concise, direct, and data-driven.
- Highlight any anomalies, delays, or high-performing areas.
- Do not repeat the raw numbers identically; synthesize them into insights.

Guidelines for health, recommendations, and risks:
- Health must be one of the four exact strings.
- Provide 1-3 specific recommendations based on the data.
- List any risks (e.g. low completion rate, high offline workers). Empty array if none.`;
}

function buildUserPrompt(context) {
  const { kpis, charts } = context;
  
  return `Here is the current operational data snippet:
  
[KPIs]
- Tasks: ${kpis.totalTasks} total, ${kpis.completedTasks} completed, ${kpis.pendingTasks} pending, ${kpis.verifiedTasks} verified, ${kpis.rejectedTasks} rejected. Completion Rate: ${kpis.completionRate}%
- Workforce: ${kpis.activeWorkers} active, ${kpis.offlineWorkers} offline.
- Customer Visits (Today): ${kpis.customerVisitsToday}. Avg Duration: ${kpis.averageVisitDuration} mins.
- Attendance: ${kpis.presentToday} present today, ${kpis.completedShifts} shifts completed. Avg Hours: ${kpis.averageWorkingHours}.
- Total Distance Travelled Today: ${kpis.totalDistanceToday} km.

[Charts Data]
- Attendance Distribution: ${JSON.stringify(charts?.attendanceDistribution || [])}
- Distance Trend (Last 7 days): ${JSON.stringify(charts?.distanceTrend || [])}
- Top Worker Distances: ${JSON.stringify(charts?.workerDistanceTravelled || [])}

Based on this data, generate the structured JSON response.`;
}

module.exports = {
  buildSystemPrompt,
  buildUserPrompt
};
