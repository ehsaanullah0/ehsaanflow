import React from 'react';
import { Sparkles, TrendingUp, CheckCircle2, Clock, Calendar, AlertTriangle, BookOpen, Activity, ArrowRight, ShieldCheck, Layers, BarChart2 } from 'lucide-react';
import { Task, JournalEntry, ProgressMeter } from '../types';
import { TaskCompletionHeatmap } from './TaskCompletionHeatmap';
import { DigitalMatricesGrid } from './DigitalMatricesGrid';
import { AnalyticInfoButton } from './AnalyticInfoModal';
import { ANALYTIC_EXPLANATIONS } from '../utils/analyticExplanations';

interface InsightsViewProps {
  tasks: Task[];
  journalEntries: JournalEntry[];
  progressMeters: ProgressMeter[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  tasks,
  journalEntries,
  progressMeters,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completionRatio = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && !t.completed);

  // Group tasks by date to detect overloaded days
  const tasksByDate: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.dueDate) {
      tasksByDate[t.dueDate] = (tasksByDate[t.dueDate] || 0) + 1;
    }
  });

  const overloadedDates = Object.entries(tasksByDate).filter(([_, count]) => count >= 4);

  // Calculate Journal Consistency
  const uniqueJournalDates = Array.from(new Set(journalEntries.map((j) => j.date)));
  const journalConsistencyCount = uniqueJournalDates.length;

  // Generate Personalized Insights based on real stored data
  const generatedInsights: { title: string; category: string; description: string; impact: 'positive' | 'warning' | 'suggestion'; reason: string }[] = [];

  // Insight 1: Completion Ratio
  if (completionRatio >= 60) {
    generatedInsights.push({
      category: 'TASK EXECUTION',
      title: `Strong Execution Velocity (${completionRatio}% Completed)`,
      description: `You have completed ${completedTasks.length} out of ${totalTasks} total planned tasks in your workspace.`,
      impact: 'positive',
      reason: 'Your completed task count significantly exceeds pending backlog items.',
    });
  } else {
    generatedInsights.push({
      category: 'BACKLOG MANAGEMENT',
      title: 'Focus on Completing Pending Outcomes',
      description: `You currently have ${pendingTasks.length} pending tasks. Consider breaking down large tasks into smaller subtasks to regain momentum.`,
      impact: 'warning',
      reason: `Task completion ratio stands at ${completionRatio}%.`,
    });
  }

  // Insight 2: Overloaded Days Warning
  if (overloadedDates.length > 0) {
    generatedInsights.push({
      category: 'WORKLOAD DISTRIBUTION',
      title: `Detecting ${overloadedDates.length} Overloaded Day${overloadedDates.length > 1 ? 's' : ''}`,
      description: `Specific dates contain 4 or more scheduled high-priority outcomes. Distributing tasks evenly prevents decision fatigue.`,
      impact: 'warning',
      reason: `Dates like ${overloadedDates[0][0]} have ${overloadedDates[0][1]} scheduled tasks.`,
    });
  } else {
    generatedInsights.push({
      category: 'WORKLOAD DISTRIBUTION',
      title: 'Balanced Daily Capacity',
      description: 'Your scheduled tasks are evenly distributed across dates without exceeding daily cognitive limits.',
      impact: 'positive',
      reason: 'No date exceeds 3 scheduled tasks.',
    });
  }

  // Insight 3: Journal Consistency
  if (journalConsistencyCount >= 3) {
    generatedInsights.push({
      category: 'MINDFULNESS & REFLECTION',
      title: `Consistent Reflective Habit (${journalConsistencyCount} Days Logged)`,
      description: 'Your daily journal entries show consistent reflection, helping connect daily outcomes with personal growth.',
      impact: 'positive',
      reason: `${uniqueJournalDates.length} unique dates contain detailed journal reflections.`,
    });
  } else {
    generatedInsights.push({
      category: 'MINDFULNESS & REFLECTION',
      title: 'Build Journal Consistency',
      description: 'Taking 3 minutes at the end of each day to log thoughts increases spatial clarity and focus.',
      impact: 'suggestion',
      reason: 'Fewer than 3 journal entries recorded this week.',
    });
  }

  // Insight 4: Progress Meter Trends
  const moodMeter = progressMeters.find((m) => m.name.toLowerCase().includes('mood'));
  if (moodMeter) {
    const entries = Object.values(moodMeter.entries);
    const avgMood = entries.length > 0 ? Math.round((entries.reduce((a, b) => a + b, 0) / entries.length) * 10) / 10 : 0;

    generatedInsights.push({
      category: 'WELLBEING METRICS',
      title: `Average Mood Rating: ${avgMood} / 5`,
      description: `Your recorded mood values demonstrate steady emotional balance over recent logged entries.`,
      impact: 'positive',
      reason: `Analyzed ${entries.length} logged entries for the Mood meter.`,
    });
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-[#281b18] text-[#f6e9d7] rounded-3xl p-6 shadow-xl border border-[#422119] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#df734c] bg-[#422119] px-3 py-1 rounded-full border border-[#823b28]/50">
            DATA-DRIVEN INSIGHTS & ANALYTICS
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#f6e9d7] mt-2 font-sans tracking-tight">
            Personal Pattern & Execution Matrix
          </h2>
          <p className="text-xs md:text-sm text-[#eb9d7d] mt-1 font-medium max-w-xl leading-relaxed">
            Analyzed dynamically from your tasks, completion ratios, reflections, and progress meters.
          </p>
        </div>

        {/* Overview Stats Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#422119] border border-[#823b28]/60 rounded-2xl px-4 py-3 text-center min-w-[110px] relative">
            <div className="flex items-center justify-center gap-1">
              <span className="font-mono text-[10px] text-[#eb9d7d] uppercase">Overall Ratio</span>
              <AnalyticInfoButton
                explanation={{
                  ...ANALYTIC_EXPLANATIONS.overallTaskCompletion,
                  currentValue: `${completionRatio}% (${completedTasks.length}/${totalTasks})`,
                }}
                variant="icon"
                iconSize={11}
                className="text-[#eb9d7d] hover:text-[#f6e9d7]"
              />
            </div>
            <div className="text-2xl font-black font-mono text-[#f6e9d7] mt-0.5">
              {completionRatio}%
            </div>
          </div>
          <div className="bg-[#422119] border border-[#823b28]/60 rounded-2xl px-4 py-3 text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1">
              <span className="font-mono text-[10px] text-[#eb9d7d] uppercase">Reflections</span>
              <AnalyticInfoButton
                explanation={{
                  ...ANALYTIC_EXPLANATIONS.journalConsistency,
                  currentValue: `${journalConsistencyCount} Reflected Days`,
                }}
                variant="icon"
                iconSize={11}
                className="text-[#eb9d7d] hover:text-[#f6e9d7]"
              />
            </div>
            <div className="text-2xl font-black font-mono text-[#df734c] mt-0.5">
              {journalConsistencyCount}
            </div>
          </div>
          <div className="bg-[#422119] border border-[#823b28]/60 rounded-2xl px-4 py-3 text-center min-w-[110px]">
            <div className="flex items-center justify-center gap-1">
              <span className="font-mono text-[10px] text-[#eb9d7d] uppercase">Meters</span>
              <AnalyticInfoButton
                explanation={{
                  ...ANALYTIC_EXPLANATIONS.progressMeterPercentage,
                  title: 'Active Progress Meters',
                  description: 'Counts quantitative goal trackers active in your workspace.',
                  currentValue: `${progressMeters.length} Active Meters`,
                }}
                variant="icon"
                iconSize={11}
                className="text-[#eb9d7d] hover:text-[#f6e9d7]"
              />
            </div>
            <div className="text-2xl font-black font-mono text-[#f6e9d7] mt-0.5">
              {progressMeters.length}
            </div>
          </div>
        </div>
      </div>

      {/* Task Completion Heatmap (Monthly & 52-Week Annual Views) */}
      <TaskCompletionHeatmap tasks={tasks} />

      {/* Digital Matrices (Bento Grid: Velocity, Streaks, Subtasks, Priority Tiers & Weekday Histogram) */}
      <DigitalMatricesGrid
        tasks={tasks}
        journalEntries={journalEntries}
        progressMeters={progressMeters}
      />

      {/* Personalized Pattern Detection Cards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#823b28] text-[#f6e9d7] rounded-xl flex items-center justify-center">
            <Sparkles size={16} />
          </span>
          <h3 className="text-lg font-extrabold text-[#281b18] font-sans">
            Cognitive & Behavioral Observations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {generatedInsights.map((insight, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-5 border flex flex-col justify-between shadow-sm transition-all ${
                insight.impact === 'warning'
                  ? 'bg-[#fbf6ef] border-[#df734c]/40'
                  : insight.impact === 'positive'
                  ? 'bg-[#fbf6ef] border-[#823b28]/20'
                  : 'bg-[#f6e9d7] border-[#281b18]/15'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#823b28] bg-[#edd8c2] px-2.5 py-0.5 rounded-full border border-[#d4aa86]">
                    {insight.category}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      insight.impact === 'warning'
                        ? 'bg-[#df734c] text-white'
                        : insight.impact === 'positive'
                        ? 'bg-[#823b28] text-[#f6e9d7]'
                        : 'bg-[#edd8c2] text-[#281b18]'
                    }`}
                  >
                    {insight.impact}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#281b18] font-sans tracking-tight">
                  {insight.title}
                </h3>

                <p className="text-xs text-[#823b28] mt-2 leading-relaxed font-medium">
                  {insight.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#281b18]/10 flex items-center justify-between text-[11px] font-mono text-[#823b28]/80">
                <span className="truncate max-w-[280px]">
                  Why: {insight.reason}
                </span>
                <ShieldCheck size={14} className="text-[#823b28] shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

