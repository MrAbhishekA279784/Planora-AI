import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  Users,
  Wallet,
  Check,
  ChevronRight,
  Download,
  FileText,
} from 'lucide-react';
import { AppRoute, EventItem, TaskItem, TaskStatus } from '../../types';
import { calculateCompletionPercentage } from '../../utils/calculations';
import { downloadEventSchedulePdf } from '../../utils/pdfGenerator';

interface EventTimelineViewProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onBack: () => void;
  onRouteChange: (route: AppRoute) => void;
}

export const EventTimelineView: React.FC<EventTimelineViewProps> = ({
  event,
  onUpdateEvent,
  onBack,
  onRouteChange,
}) => {
  if (!event) {
    return (
      <div className="max-w-2xl mx-auto pb-24 text-left space-y-6">
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] flex items-center justify-center hover:bg-[#F8F0E4]"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#171412]">Event Timeline</h1>
            <div className="text-xs text-[#6D6A66]">Track tasks, milestones, and deadlines</div>
          </div>
        </div>
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="font-serif font-bold text-xl text-[#171412]">No Event Selected</h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] max-w-sm mx-auto">
            Select or create an event to view its milestone sequence and manage tasks.
          </p>
          <button
            onClick={() => onRouteChange('create-event')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>Create New Event</span>
          </button>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'Timeline' | 'Tasks' | 'Budget' | 'Guests'>('Timeline');
  const [tasks, setTasks] = useState<TaskItem[]>(event.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState(false);

  const completionPercent = calculateCompletionPercentage(tasks);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await downloadEventSchedulePdf({
        ...event,
        tasks,
        completionPercent,
      });
      setDownloadSuccessNotice(true);
      setTimeout(() => setDownloadSuccessNotice(false), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus: TaskStatus =
          t.status === 'completed'
            ? 'in-progress'
            : t.status === 'in-progress'
            ? 'pending'
            : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);
    onUpdateEvent({
      ...event,
      tasks: updated,
      completionPercent: calculateCompletionPercentage(updated),
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      eventId: event.id,
      title: newTaskTitle.trim(),
      status: 'pending',
      dueDate: newTaskDueDate || '15 Feb 2026',
    };

    const updated = [...tasks, newTask];
    setTasks(updated);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTask(false);
    onUpdateEvent({
      ...event,
      tasks: updated,
      completionPercent: calculateCompletionPercentage(updated),
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 text-left space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] flex items-center justify-center hover:bg-[#F8F0E4] cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#171412]">
              Event Timeline
            </h1>
            <div className="text-xs text-[#6D6A66]">
              Milestones, dependencies, and execution schedule
            </div>
          </div>
        </div>

        {/* Download as PDF Action Button */}
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7A3D19] hover:bg-[#5D2E12] text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-60 cursor-pointer"
          aria-label="Download schedule as printable PDF"
        >
          {isDownloading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isDownloading ? 'Preparing PDF...' : 'Download as PDF'}</span>
        </button>
      </div>

      {/* Download Success Notice */}
      {downloadSuccessNotice && (
        <div className="p-3 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Event schedule downloaded as a clean, printable PDF!
            </span>
          </div>
          <span className="text-[10px] text-[#2E7D32] bg-white/70 px-2 py-0.5 rounded-full font-bold">
            Ready to Print
          </span>
        </div>
      )}

      {/* Event Summary Card */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={event.image}
            alt={event.name}
            className="w-14 h-14 rounded-2xl object-cover shrink-0"
          />
          <div>
            <h2 className="font-serif font-bold text-base text-[#171412] leading-snug">
              {event.name}
            </h2>
            <div className="text-xs text-[#6D6A66] flex items-center gap-2 mt-0.5">
              <span>{event.date}</span>
              <span>•</span>
              <span className="text-[#16A66A] font-bold">{completionPercent}% complete</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="self-end sm:self-center px-3 py-1.5 rounded-xl bg-[#F8F0E4] hover:bg-[#F5E7D3] text-[#7A3D19] text-xs font-semibold border border-[#EDE2D3] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#B86B2A]" />
          <span>Printable PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#F8F0E4]/70 p-1.5 rounded-full border border-[#EDE2D3]">
        {(['Timeline', 'Tasks', 'Budget', 'Guests'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              if (tab === 'Budget') {
                onRouteChange('budget-planner');
              } else {
                setActiveTab(tab);
              }
            }}
            className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all text-center ${
              activeTab === tab
                ? 'bg-[#7A3D19] text-white shadow-xs'
                : 'text-[#6D6A66] hover:text-[#171412]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Timeline View */}
      {activeTab === 'Timeline' && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
            <h3 className="font-serif font-bold text-base text-[#171412]">
              Milestone Sequence
            </h3>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <form onSubmit={handleAddTask} className="p-3 bg-[#F8F0E4] rounded-2xl space-y-2 text-xs">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title (e.g. Finalize Tasting Menu)"
                className="w-full p-2 bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl focus:outline-none"
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="Target Date (e.g. 25 Jan 2026)"
                  className="w-full p-2 bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7A3D19] text-white rounded-xl font-semibold shrink-0"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Vertical Timeline Items with Connector Line */}
          {tasks.length === 0 ? (
            <div className="p-8 bg-[#FBF7EF] border border-dashed border-[#EDE2D3] rounded-2xl text-center space-y-2">
              <Calendar className="w-8 h-8 text-[#B86B2A] mx-auto opacity-70" />
              <div className="font-bold text-xs text-[#171412]">No milestones or tasks scheduled yet</div>
              <p className="text-[11px] text-[#6D6A66] max-w-sm mx-auto">
                Click "+ Add Task" above to add your first deadline, tasting appointment, or booking milestone.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EDE2D3]">
              {tasks.map((task) => {
                let dotColor = 'bg-[#16A66A] ring-[#E1F5E9]';
                let badgeBg = 'bg-[#E1F5E9] text-[#16A66A]';
                let badgeLabel = 'Completed';

                if (task.status === 'in-progress') {
                  dotColor = 'bg-[#2674F5] ring-[#E6EFFF]';
                  badgeBg = 'bg-[#E6EFFF] text-[#2674F5]';
                  badgeLabel = 'In Progress';
                } else if (task.status === 'pending') {
                  dotColor = 'bg-[#F08A12] ring-[#FFF0D8]';
                  badgeBg = 'bg-[#FFF0D8] text-[#F08A12]';
                  badgeLabel = 'Pending';
                } else if (task.status === 'upcoming') {
                  dotColor = 'bg-[#7A3D19] ring-[#FBE8D3]';
                  badgeBg = 'bg-[#FBE8D3] text-[#7A3D19]';
                  badgeLabel = 'Upcoming';
                }

                return (
                  <div
                    key={task.id}
                    className="relative flex items-start justify-between gap-4 cursor-pointer group"
                    onClick={() => handleToggleTaskStatus(task.id)}
                  >
                    {/* Timeline Dot Marker */}
                    <span
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ${dotColor} transition-transform group-hover:scale-125`}
                    />

                    {/* Task details */}
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs sm:text-sm text-[#171412] group-hover:text-[#7A3D19] transition-colors">
                        {task.title}
                      </div>
                      {task.vendorName && (
                        <div className="text-[11px] text-[#6D6A66]">
                          {task.vendorName}
                        </div>
                      )}
                    </div>

                    {/* Status Badge & Due Date */}
                    <div className="text-right shrink-0 space-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeBg}`}>
                        {badgeLabel}
                      </span>
                      <div className="text-[10px] text-[#928B83] tabular-nums font-sans">
                        {task.dueDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tasks Checklist */}
      {activeTab === 'Tasks' && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#171412]">
              All Event Tasks ({tasks.length})
            </h3>
            <button
              onClick={() => {
                setActiveTab('Timeline');
                setShowAddTask(true);
              }}
              className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 bg-[#FBF7EF] border border-dashed border-[#EDE2D3] rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#16A66A] mx-auto opacity-70" />
              <div className="font-bold text-xs text-[#171412]">No tasks created yet</div>
              <p className="text-[11px] text-[#6D6A66] max-w-sm mx-auto">
                Add to-dos and action items to ensure your event runs smoothly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDE2D3]/60">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleToggleTaskStatus(t.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#F8F0E4]/60 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        t.status === 'completed'
                          ? 'bg-[#16A66A] border-[#16A66A] text-white'
                          : 'border-[#EDE2D3] bg-[#FFFCF6]'
                      }`}
                    >
                      {t.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-medium ${t.status === 'completed' ? 'line-through text-[#928B83]' : 'text-[#171412]'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#928B83]">{t.dueDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Guests Overview */}
      {activeTab === 'Guests' && (
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#171412]">
              Guest List ({event.guestCount || 0} Expected)
            </h3>
            <span className="text-xs bg-[#FBE8D3] text-[#7A3D19] px-2.5 py-0.5 rounded-full font-bold">
              Target: {event.guestCount || 0} Guests
            </span>
          </div>

          {event.guestCount > 0 ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F8F0E4] rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#171412]">Expected Attendees</span>
                  <div className="text-[11px] text-[#6D6A66] mt-0.5">Estimated guest capacity for this event</div>
                </div>
                <span className="font-bold text-sm text-[#7A3D19]">{event.guestCount}</span>
              </div>
              <div className="p-4 bg-[#FFFCF6] border border-dashed border-[#EDE2D3] rounded-xl text-center text-xs text-[#6D6A66]">
                Invitations & RSVP management can be synced directly with your guest list as RSVPs are received.
              </div>
            </div>
          ) : (
            <div className="p-6 bg-[#FBF7EF] border border-dashed border-[#EDE2D3] rounded-2xl text-center space-y-2">
              <Users className="w-8 h-8 text-[#B86B2A] mx-auto opacity-70" />
              <div className="font-bold text-xs text-[#171412]">No guest count specified</div>
              <p className="text-[11px] text-[#6D6A66]">Edit this event in My Events to specify the planned number of attendees.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
