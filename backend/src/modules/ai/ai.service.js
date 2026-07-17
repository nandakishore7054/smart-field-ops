const dashboardService = require('../dashboard/dashboard.service');
const aiCache = require('./ai.cache');
const { environment } = require('../../config/environment');
const { buildSystemPrompt, buildUserPrompt } = require('./ai.prompt');
const { generateFallbackSummary } = require('./ai.fallback');
const GeminiProvider = require('./providers/gemini.provider');

// Factory to get the active AI provider
function getProvider(name) {
  const providerName = name || environment.aiProvider || 'groq';
  switch (providerName.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider();
    case 'groq':
      const GroqProvider = require('./providers/groq.provider');
      return new GroqProvider();
    default:
      const DefaultProvider = require('./providers/groq.provider');
      return new DefaultProvider();
  }
}

async function getOperationsSummary(forceRefresh = false) {
  const CACHE_KEY = 'operations-summary';

  // 1. Check cache unless forcing refresh
  if (!forceRefresh) {
    const cached = aiCache.get(CACHE_KEY);
    if (cached) {
      return {
        ...cached,
        cached: true,
      };
    }
  }

  // 2. Gather data using existing dashboard service
  // This re-uses existing aggregation logic to prevent business logic duplication
  let kpis, charts;
  try {
    kpis = await dashboardService.getDashboardAnalytics();
    charts = await dashboardService.getDashboardCharts();
  } catch (error) {
    console.error('[AI] Failed to fetch dashboard data:', error);
    throw new Error('Failed to retrieve operational data for summary generation.');
  }

  // Formatting nested KPIs into a flat structure for the prompt/fallback
  const flatKpis = {
    totalTasks: kpis?.workforce?.totalWorkers || 0, // In existing dashboard, this maps to total workers? Wait, let's look at Task model counts
    // The dashboard actually returns worker/attendance/customer/productivity. 
    // It doesn't return task counts. Wait, let's fetch task counts directly if missing, or adjust fallback.
  };

  // Actually, wait, let's fetch task counts directly because the dashboard doesn't provide them!
  const Task = require('../tasks/tasks.model');
  const Geofence = require('../tracking/geofence.model');
  const LeaveRequest = require('../availability/leaveRequest.model');
  const { getStartOfDay, getEndOfDay } = require('../../core/utils/date.util');

  const start = getStartOfDay();
  const end = getEndOfDay();

  try {
    const [
      totalTasks, completedTasks, pendingTasks, verifiedTasks, rejectedTasks,
      totalGeofences, activeGeofences,
      pendingLeaveRequests
    ] = await Promise.all([
      Task.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Task.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'completed' }),
      Task.countDocuments({ createdAt: { $gte: start, $lte: end }, status: { $in: ['assigned', 'in-progress'] } }),
      Task.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'verified' }),
      Task.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'unassigned' }), // treating unassigned as pending/needs attention
      Geofence.countDocuments({}),
      Geofence.countDocuments({ isActive: true }),
      LeaveRequest.countDocuments({ status: 'pending' })
    ]);

    flatKpis.totalTasks = totalTasks;
    flatKpis.completedTasks = completedTasks;
    flatKpis.pendingTasks = pendingTasks + rejectedTasks; // unassigned
    flatKpis.verifiedTasks = verifiedTasks;
    flatKpis.rejectedTasks = 0; // We don't have a rejected status, using unassigned as risk
    flatKpis.completionRate = totalTasks > 0 ? Math.round((completedTasks + verifiedTasks) / totalTasks * 100) : 0;
    
    // Add existing dashboard KPIs
    flatKpis.activeWorkers = kpis?.workforce?.activeWorkers || 0;
    flatKpis.offlineWorkers = kpis?.workforce?.offlineWorkers || 0;
    flatKpis.customerVisitsToday = kpis?.customer?.customerVisitsToday || 0;
    flatKpis.averageVisitDuration = kpis?.customer?.averageVisitDuration || '0m';
    flatKpis.presentToday = kpis?.attendance?.presentToday || 0;
    flatKpis.completedShifts = kpis?.attendance?.completedShifts || 0;
    flatKpis.averageWorkingHours = kpis?.attendance?.averageWorkingHours || '0h';
    flatKpis.totalDistanceToday = kpis?.productivity?.totalDistanceToday || '0 km';
    flatKpis.totalGeofences = totalGeofences;
    flatKpis.activeGeofences = activeGeofences;
    flatKpis.pendingLeaveRequests = pendingLeaveRequests;

  } catch (error) {
    console.error('[AI] Additional data fetch failed:', error);
  }

  const contextData = { kpis: flatKpis, charts };

  // 3. Attempt AI generation
  let aiResult = null;
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(contextData);
  let usedProvider = 'groq';

  try {
    console.log('[AI] Trying Groq...');
    const provider = getProvider('groq');
    const response = await provider.generateSummary(systemPrompt, userPrompt);
    
    aiResult = {
      ...response,
      generatedAt: new Date().toISOString(),
      provider: usedProvider,
      cached: false,
      isFallback: false
    };
    console.log('[AI] Groq succeeded.');
  } catch (error) {
    console.error(`[AI] Groq failed:`, error.message);
    console.log('[AI] Falling back to Gemini...');
    
    try {
      usedProvider = 'gemini';
      const geminiProvider = getProvider('gemini');
      const response = await geminiProvider.generateSummary(systemPrompt, userPrompt);
      console.log('[AI] Gemini succeeded.');

      aiResult = {
        ...response,
        generatedAt: new Date().toISOString(),
        provider: usedProvider,
        cached: false,
        isFallback: false
      };
    } catch (geminiError) {
      console.error(`[AI] Gemini failed:`, geminiError.message);
      // 4. Fallback if AI fails (or no API key)
      aiResult = generateFallbackSummary(contextData);
    }
  }

  // 5. Store in cache (only if not fallback)
  if (!aiResult.isFallback) {
    aiCache.set(CACHE_KEY, aiResult, environment.aiCacheTtlMinutes);
  }

  return aiResult;
}

module.exports = {
  getOperationsSummary
};
