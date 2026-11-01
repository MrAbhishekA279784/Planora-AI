import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Sparkles,
  MapPin,
  Users,
  Share2,
  Edit3,
  FileText,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { AppRoute, EventItem, EventStatus } from '../../types';
import { filterEvents } from '../../utils/calculations';

interface MyEventsViewProps {
  events: EventItem[];
  onRouteChange: (route: AppRoute) => void;
  onSelectEvent: (event: EventItem) => void;
  onUpdateEvent: (updated: EventItem) => void;
  onDeleteEvent: (id: string) => void;
}

export const MyEventsView: React.FC<MyEventsViewProps> = ({
  events,
  onRouteChange,
  onSelectEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Events');
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0); // 0 = Feb 2026

  // Share Dialog state
  const [shareEvent, setShareEvent] = useState<EventItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Event state
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Overflow menu state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtered event cards
  const displayedEvents = filterEvents(events, searchQuery, statusFilter);

  // Dynamic statistics
  const totalCount = events.length;
  const upcomingCount = events.filter((e) => e.status === 'upcoming').length;
  const planningCount = events.filter((e) => e.status === 'planning').length;
  const completedCount = events.filter((e) => e.status === 'completed').length;

  // Real event-derived activities
  const eventActivities = events.flatMap((ev) => {
    const list = [];
    if (ev.name) {
      list.push({
        id: `act-ev-${ev.id}`,
        title: `Event: ${ev.name}`,
        description: `${ev.location ? `${ev.location} • ` : ''}${ev.date ? `Date: ${ev.date}` : 'Planning in progress'}`,
        timestamp: 'Active Milestone',
      });
    }
    if (Array.isArray(ev.tasks)) {
      ev.tasks.slice(0, 2).forEach((t) => {
        list.push({
          id: `act-task-${t.id}`,
          title: `Task: ${t.title}`,
          description: `Due: ${t.dueDate || 'Flexible'} • Status: ${t.status}`,
          timestamp: 'Action Item',
        });
      });
    }
    return list;
  });

  // Calendar logic for reference month Feb 2026
  const baseDate = new Date(2026, 1 + calendarMonthOffset, 1);
  const monthName = baseDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(2026, 1 + calendarMonthOffset + 1, 0).getDate();
  const firstDayWeekday = new Date(2026, 1 + calendarMonthOffset, 1).getDay();

  const handleShare = (event: EventItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareEvent(event);
    setCopiedLink(false);
  };

  const handleCopyShareLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onUpdateEvent(editingEvent);
      setEditingEvent(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 6.1 Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-left">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#171412] tracking-tight">
            My Events
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
            All your special moments in one place
          </p>
        </div>

        <button
          onClick={() => onRouteChange('create-event')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white font-medium text-xs sm:text-sm shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* 6.2 Summary Statistics and Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {/* Total Events */}
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBE8D3] flex items-center justify-center text-[#7A3D19] shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-[#171412] leading-none">{totalCount}</div>
              <div className="text-[11px] text-[#6D6A66] mt-0.5">Total Events</div>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-[#171412] leading-none">{upcomingCount}</div>
              <div className="text-[11px] text-[#6D6A66] mt-0.5">Upcoming</div>
            </div>
          </div>

          {/* In Planning */}
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E1F5E9] flex items-center justify-center text-[#16A66A] shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-[#171412] leading-none">{planningCount}</div>
              <div className="text-[11px] text-[#6D6A66] mt-0.5">In Planning</div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6EFFF] flex items-center justify-center text-[#2674F5] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-xl text-[#171412] leading-none">{completedCount}</div>
              <div className="text-[11px] text-[#6D6A66] mt-0.5">Completed</div>
            </div>
          </div>
        </div>

        {/* Right Search & Filter dropdown */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#928B83] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl text-xs sm:text-sm text-[#171412] placeholder:text-[#928B83] focus:outline-none focus:border-[#B86B2A]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm text-[#171412] font-medium focus:outline-none focus:border-[#B86B2A] cursor-pointer"
            >
              <option value="All Events">All Events</option>
              <option value="Upcoming">Upcoming</option>
              <option value="In Planning">In Planning</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#6D6A66] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 6.3 Main Event Cards (Desktop Row of 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.length === 0 ? (
          <div className="col-span-full py-12 px-6 bg-[#FFFCF6] border border-dashed border-[#EDE2D3] rounded-3xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] mx-auto">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#171412]">
                {searchQuery || statusFilter !== 'All Events' ? 'No matching events found' : 'No events created yet'}
              </h3>
              <p className="text-xs text-[#6D6A66] max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'All Events'
                  ? 'Try adjusting your search keywords or filter to see more results.'
                  : 'Every new plan starts here. Create your first event to manage your budget, timeline, and vendor team.'}
              </p>
            </div>
            <button
              onClick={() => onRouteChange('create-event')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Event</span>
            </button>
          </div>
        ) : (
          displayedEvents.map((ev) => {
          let badgeBg = 'bg-[#16A66A] text-white';
          let progressColor = 'bg-[#16A66A]';
          let label = 'Upcoming';

          if (ev.status === 'planning') {
            badgeBg = 'bg-[#F08A12] text-white';
            progressColor = 'bg-[#F08A12]';
            label = 'In Planning';
          } else if (ev.status === 'completed') {
            badgeBg = 'bg-[#2674F5] text-white';
            progressColor = 'bg-[#2674F5]';
            label = 'Completed';
          }

          return (
            <div
              key={ev.id}
              className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group relative"
            >
              {/* Image & Status Badge */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden">
                <img
                  src={ev.image}
                  alt={ev.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-xs bg-white/95 text-[#171412]">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ev.status === 'upcoming'
                        ? 'bg-[#16A66A]'
                        : ev.status === 'planning'
                        ? 'bg-[#F08A12]'
                        : 'bg-[#2674F5]'
                    }`}
                  />
                  <span>{label}</span>
                </div>

                {/* Overflow toggle */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                    }}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center transition-colors"
                    aria-label="Event options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === ev.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-[#FFFCF6] border border-[#EDE2D3] rounded-xl shadow-xl p-1.5 z-30 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(ev);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#F8F0E4] rounded-lg text-[#171412]"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(ev, e);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#F8F0E4] rounded-lg text-[#171412]"
                      >
                        Share Event
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(ev);
                          onRouteChange('budget-planner');
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#F8F0E4] rounded-lg text-[#171412]"
                      >
                        View Budget
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete ${ev.name}?`)) {
                            onDeleteEvent(ev.id);
                          }
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#FDE8E6] rounded-lg text-[#E94C45]"
                      >
                        Delete Event
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-[#171412] leading-snug">
                    {ev.name}
                  </h3>
                  <p className="text-xs text-[#6D6A66] line-clamp-1">{ev.subtitle}</p>

                  <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#6D6A66]">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#B86B2A]" />
                      {ev.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B86B2A]" />
                      {ev.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#B86B2A]" />
                      {ev.guestCount} Guests
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-[#EDE2D3] h-2 rounded-full overflow-hidden">
                    <div
                      className={`${progressColor} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${ev.completionPercent}%` }}
                    />
                  </div>
                  <div className="text-right text-[11px] font-semibold text-[#6D6A66]">
                    {ev.completionPercent}% Complete
                  </div>
                </div>

                {/* Card Actions Row */}
                <div className="pt-2 flex items-center gap-2 border-t border-[#EDE2D3]/60">
                  <button
                    onClick={() => {
                      onSelectEvent(ev);
                      onRouteChange('event-timeline');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#7A3D19] hover:bg-[#4A2C1B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {ev.status === 'completed' ? (
                    <button
                      onClick={() => {
                        onSelectEvent(ev);
                        onRouteChange('budget-planner');
                      }}
                      className="py-2 px-3 rounded-xl bg-[#FFFCF6] border border-[#EDE2D3] hover:bg-[#F8F0E4] text-[#171412] text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#B86B2A]" />
                      <span className="hidden sm:inline">View Report</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingEvent(ev)}
                      className="py-2 px-3 rounded-xl bg-[#FFFCF6] border border-[#EDE2D3] hover:bg-[#F8F0E4] text-[#171412] text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#6D6A66]" />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => handleShare(ev, e)}
                    className="py-2 px-3 rounded-xl bg-[#FFFCF6] border border-[#EDE2D3] hover:bg-[#F8F0E4] text-[#171412] text-xs font-medium flex items-center gap-1 transition-colors"
                    aria-label="Share event"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#6D6A66]" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectEvent(ev);
                      onRouteChange('budget-planner');
                    }}
                    className="w-8 h-8 rounded-xl bg-[#FFFCF6] border border-[#EDE2D3] hover:bg-[#F8F0E4] text-[#6D6A66] flex items-center justify-center shrink-0"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* 6.4 Lower Dashboard Row: Upcoming Events, Calendar View, Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Panel A — Upcoming Events */}
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 text-left flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
              <h4 className="font-serif font-bold text-base text-[#171412]">
                Upcoming Events
              </h4>
              <button
                onClick={() => setStatusFilter('All Events')}
                className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6D6A66]">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="divide-y divide-[#EDE2D3]/60 mt-2 space-y-2">
                {events.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectEvent(item);
                      onRouteChange('event-timeline');
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-[#F8F0E4]/60 rounded-xl p-1.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-xs text-[#171412] line-clamp-1">{item.name}</div>
                        <div className="text-[11px] text-[#6D6A66] flex items-center gap-2 mt-0.5">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.completionPercent === 100
                          ? 'bg-[#E6EFFF] text-[#2674F5]'
                          : item.completionPercent > 50
                          ? 'bg-[#E1F5E9] text-[#16A66A]'
                          : 'bg-[#FFF0D8] text-[#F08A12]'
                      }`}
                    >
                      {item.completionPercent}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel B — Calendar View */}
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 text-left flex flex-col shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
            <h4 className="font-serif font-bold text-base text-[#171412]">
              Calendar View
            </h4>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCalendarMonthOffset(0)}
                className="text-xs font-medium px-2 py-1 bg-[#F8F0E4] hover:bg-[#F5E7D3] rounded-lg text-[#7A3D19]"
              >
                Today
              </button>
              <button
                onClick={() => setCalendarMonthOffset((prev) => prev - 1)}
                className="w-7 h-7 rounded-lg border border-[#EDE2D3] flex items-center justify-center hover:bg-[#F8F0E4]"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-[#6D6A66]" />
              </button>
              <button
                onClick={() => setCalendarMonthOffset((prev) => prev + 1)}
                className="w-7 h-7 rounded-lg border border-[#EDE2D3] flex items-center justify-center hover:bg-[#F8F0E4]"
                aria-label="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#6D6A66]" />
              </button>
            </div>
          </div>

          <div className="text-center font-bold text-xs text-[#171412] mt-3">
            {monthName}
          </div>

          {/* Calendar 7-col grid */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-[10px] font-semibold text-[#928B83] py-1">
                {d}
              </div>
            ))}

            {/* Empty offset days */}
            {[...Array(firstDayWeekday)].map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Month days */}
            {[...Array(daysInMonth)].map((_, idx) => {
              const day = idx + 1;
              const hasMatchingEvent = events.some((ev) => {
                if (!ev.rawDate) return false;
                const d = new Date(ev.rawDate);
                return d.getFullYear() === baseDate.getFullYear() && d.getMonth() === baseDate.getMonth() && d.getDate() === day;
              });

              return (
                <div
                  key={day}
                  className={`h-8 flex flex-col items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-colors relative ${
                    hasMatchingEvent
                      ? 'bg-[#4A2C1B] text-white font-bold shadow-xs'
                      : 'hover:bg-[#FBE8D3]/60 text-[#171412]'
                  }`}
                >
                  <span>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel C — Recent Activity */}
        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-5 text-left flex flex-col shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE2D3]">
            <h4 className="font-serif font-bold text-base text-[#171412]">
              Recent Activity
            </h4>
            <span className="text-xs font-semibold text-[#7A3D19] cursor-pointer hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          {eventActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6D6A66] space-y-1">
              <div>No recent activity yet.</div>
              <div className="text-[11px] text-[#928B83]">Activity updates will appear here as you create and manage events.</div>
            </div>
          ) : (
            <div className="divide-y divide-[#EDE2D3]/60 mt-1 max-h-72 overflow-y-auto">
              {eventActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#7A3D19] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-[#171412]">{act.title}</div>
                    <div className="text-[#6D6A66] line-clamp-1 mt-0.5">{act.description}</div>
                    <div className="text-[10px] text-[#928B83] mt-0.5">{act.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {shareEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 max-w-md w-full shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE2D3] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#171412]">
                Share Event
              </h3>
              <button
                onClick={() => setShareEvent(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8F0E4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#171412]">{shareEvent.name}</div>
              <div className="text-xs text-[#6D6A66]">
                Share planning link with co-hosts, family members, or vendors.
              </div>

              <div className="flex items-center gap-2 mt-3 bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5">
                <input
                  type="text"
                  readOnly
                  value={`https://planora.ai/events/${shareEvent.id}`}
                  className="flex-1 bg-transparent text-xs text-[#6D6A66] focus:outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-1.5 rounded-lg bg-[#7A3D19] text-white text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 max-w-lg w-full shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE2D3] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#171412]">
                Edit Event
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F8F0E4]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#171412] block mb-1">Event Name</label>
                <input
                  type="text"
                  value={editingEvent.name}
                  onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                  className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none focus:border-[#B86B2A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171412] block mb-1">Date</label>
                  <input
                    type="text"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none focus:border-[#B86B2A]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171412] block mb-1">Location</label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none focus:border-[#B86B2A]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171412] block mb-1">Guests</label>
                  <input
                    type="number"
                    value={editingEvent.guestCount}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, guestCount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none focus:border-[#B86B2A]"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171412] block mb-1">Status</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })
                    }
                    className="w-full bg-[#FBF7EF] border border-[#EDE2D3] rounded-xl p-2.5 focus:outline-none focus:border-[#B86B2A]"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="planning">In Planning</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#EDE2D3]">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-[#F8F0E4] hover:bg-[#F5E7D3] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7A3D19] text-white font-medium hover:bg-[#4A2C1B]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
