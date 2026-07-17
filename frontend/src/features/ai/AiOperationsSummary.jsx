import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, AlertCircle, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Badge } from '../../common/components/ui/Badge';
import { Button } from '../../common/components/ui/Button';
import { Skeleton } from '../../common/components/ui/Skeleton';

export default function AiOperationsSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const response = await api.get(`/ai/operations-summary${forceRefresh ? '?refresh=true' : ''}`);
      setData(response.data.data);
    } catch (err) {
      console.error('Failed to load AI summary', err);
      setError('Unable to generate AI summary at this time. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchSummary();
    }
  }, []);

  const getHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent': return 'text-success bg-success/10 border-success/20';
      case 'good': return 'text-info bg-info/10 border-info/20';
      case 'needs attention': return 'text-warning bg-warning/10 border-warning/20';
      case 'critical': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getHealthIcon = (health) => {
    switch (health?.toLowerCase()) {
      case 'excellent':
      case 'good': return <CheckCircle2 className="w-5 h-5" />;
      case 'needs attention': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <ShieldAlert className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };



  return (
    <Card className="relative overflow-hidden border-border/50 shadow-sm flex flex-col h-full">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-info/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-info text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              AI Operations Summary
              {data?.isFallback && (
                <Badge variant="warning" outline className="text-[10px] h-5 px-1.5 ml-2">Fallback Mode</Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <BrainCircuit className="w-3.5 h-3.5" />
              Powered by {data?.provider === 'gemini' ? 'Google Gemini' : data?.provider || 'Smart Field Ops AI'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {data?.generatedAt && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground bg-surface px-2.5 py-1.5 rounded-md border border-border">
              <Clock className="w-3.5 h-3.5" />
              {new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchSummary(true)} 
            disabled={loading || refreshing}
            className="h-8 text-xs gap-1.5 bg-background"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {loading && !data ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center text-center py-8 h-full"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-foreground font-medium mb-1">Analysis Unavailable</p>
              <p className="text-sm text-muted-foreground max-w-md mb-4">{error}</p>
              <Button onClick={() => fetchSummary(false)} variant="secondary" size="sm">Try Again</Button>
            </motion.div>
          ) : data ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 flex-1"
            >
              {/* Health Indicator */}
              {data.operationalHealth && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Status:</span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${getHealthColor(data.operationalHealth)}`}>
                    {getHealthIcon(data.operationalHealth)}
                    {data.operationalHealth}
                  </div>
                </div>
              )}

              {/* Main Summary */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown>{data.summary || ''}</ReactMarkdown>
              </div>

              {/* Grid for Recommendations & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto pt-4 border-t border-border/50">
                
                {/* Recommendations */}
                {data.recommendations && data.recommendations.length > 0 && (
                  <div className="bg-success/5 border border-success/10 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-success flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4" /> Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {data.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-success/50 mt-1.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risks */}
                {data.risks && data.risks.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4" /> Identified Risks
                    </h4>
                    <ul className="space-y-2">
                      {data.risks.map((risk, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive/50 mt-1.5 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Card>
  );
}
