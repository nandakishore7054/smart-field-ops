/**
 * Generates a deterministic rule-based structured operations summary 
 * when the AI provider is unavailable.
 */
function generateFallbackSummary(context) {
  const { kpis, charts } = context;
  
  // Basic health heuristic
  const completionRate = parseFloat(kpis.completionRate) || 0;
  const offlineRatio = kpis.activeWorkers > 0 
    ? kpis.offlineWorkers / (kpis.activeWorkers + kpis.offlineWorkers)
    : 0;
    
  let health = 'Good';
  if (completionRate < 50 || kpis.pendingTasks > 20) health = 'Needs Attention';
  if (offlineRatio > 0.5 || kpis.rejectedTasks > 5) health = 'Critical';
  if (completionRate > 85 && offlineRatio < 0.1) health = 'Excellent';

  // Rule-based risks
  const risks = [];
  if (kpis.pendingTasks > 10) risks.push(`High number of pending tasks (${kpis.pendingTasks}).`);
  if (kpis.rejectedTasks > 0) risks.push(`${kpis.rejectedTasks} tasks were rejected and need review.`);
  if (kpis.offlineWorkers > kpis.activeWorkers) risks.push('More offline workers than active workers.');

  // Rule-based recommendations
  const recommendations = [];
  if (kpis.pendingTasks > 5) recommendations.push('Review pending tasks and reassign to available workers.');
  if (kpis.offlineWorkers > 0) recommendations.push('Check in with offline workers to ensure their apps are running.');
  if (kpis.rejectedTasks > 0) recommendations.push('Investigate rejected tasks for potential blockers.');
  
  // Default recommendations if everything is fine
  if (recommendations.length === 0) {
    recommendations.push('Operations are running smoothly. Continue monitoring.');
  }

  // Generate markdown summary text
  let summary = `## 📊 Operations Summary\n\n`;
  summary += `**Task Overview**: Today we have ${kpis.totalTasks} total tasks with a ${kpis.completionRate}% completion rate. `;
  summary += `${kpis.completedTasks} tasks are completed, ${kpis.pendingTasks} are pending, and ${kpis.verifiedTasks} are verified.\n\n`;
  
  summary += `**Workforce**: There are ${kpis.activeWorkers} active workers and ${kpis.offlineWorkers} offline workers currently. `;
  if (health === 'Needs Attention' || health === 'Critical') {
    summary += `\n\n⚠️ Please review the risks identified below.`;
  }

  return {
    summary,
    operationalHealth: health,
    recommendations,
    risks,
    generatedAt: new Date().toISOString(),
    provider: 'fallback',
    cached: false,
    isFallback: true
  };
}

module.exports = { generateFallbackSummary };
