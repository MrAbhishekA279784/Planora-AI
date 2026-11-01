import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Wallet,
  AlertTriangle,
  Plus,
  Edit2,
  Check,
  TrendingDown,
} from 'lucide-react';
import { AppRoute, EventItem, BudgetCategory } from '../../types';
import { calculateBudgetTotals, formatINR } from '../../utils/calculations';

interface BudgetPlannerViewProps {
  event: EventItem | null;
  onUpdateEvent: (updated: EventItem) => void;
  onBack: () => void;
  onRouteChange: (route: AppRoute) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
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
            <h1 className="font-serif text-2xl font-bold text-[#171412]">
              Budget Planner
            </h1>
            <div className="text-xs text-[#6D6A66]">Plan and allocate expenses</div>
          </div>
        </div>

        <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A] mx-auto">
            <Wallet className="w-7 h-7" />
          </div>
          <h2 className="font-serif font-bold text-xl text-[#171412]">No Event Selected</h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] max-w-sm mx-auto">
            Select an existing event or create a new one to manage allocations, expenses, and payments.
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

  const [totalBudget, setTotalBudget] = useState(event.totalBudget || 0);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [categories, setCategories] = useState<BudgetCategory[]>(event.budgetCategories || []);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatAmount, setEditCatAmount] = useState<number>(0);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState<number>(0);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const budgetSummary = calculateBudgetTotals(categories, totalBudget);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const handleSaveCatAmount = (catId: string) => {
    const updated = categories.map((c) =>
      c.id === catId ? { ...c, amount: editCatAmount } : c
    );
    setCategories(updated);
    setEditingCatId(null);
    onUpdateEvent({
      ...event,
      totalBudget,
      budgetCategories: updated,
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const colors = ['#7A3D19', '#B86B2A', '#D7A34B', '#4A2C1B', '#E5989B', '#A36B4F', '#6D6A66'];
    const newCategory: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      amount: newCatAmount,
      percentage: totalBudget > 0 ? Math.round((newCatAmount / totalBudget) * 100) : 0,
      color: colors[categories.length % colors.length],
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    setNewCatName('');
    setNewCatAmount(0);
    setShowAddCategory(false);
    onUpdateEvent({
      ...event,
      totalBudget,
      budgetCategories: updated,
    });
  };

  const handleSaveTotalBudget = () => {
    setIsEditingTotal(false);
    onUpdateEvent({
      ...event,
      totalBudget,
      budgetCategories: categories,
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 text-left space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-[#FFFCF6] border border-[#EDE2D3] flex items-center justify-center hover:bg-[#F8F0E4]"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#171412]">
            Budget Planner
          </h1>
          <div className="text-xs text-[#6D6A66]">
            {event.name} • {event.date}
          </div>
        </div>
      </div>

      {/* Total Budget Card */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-2">
        <div className="flex justify-between items-center text-xs text-[#928B83]">
          <span className="font-bold uppercase tracking-wider">Total Budget</span>
          <button
            onClick={() => setIsEditingTotal(!isEditingTotal)}
            className="text-[#7A3D19] font-semibold hover:underline flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditingTotal ? 'Done' : 'Edit Budget'}</span>
          </button>
        </div>

        {isEditingTotal ? (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#7A3D19]">₹</span>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseInt(e.target.value, 10) || 0)}
              className="font-serif text-3xl font-bold text-[#171412] bg-[#FBF7EF] border border-[#B86B2A] rounded-xl px-3 py-1 focus:outline-none w-full"
            />
            <button
              onClick={handleSaveTotalBudget}
              className="p-2 rounded-xl bg-[#7A3D19] text-white"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="font-serif text-3xl sm:text-4xl font-bold text-[#171412]">
            {formatINR(budgetSummary.totalBudget)}
          </div>
        )}

        {budgetSummary.isOverBudget && (
          <div className="flex items-center gap-2 p-2.5 bg-[#FDE8E6] text-[#E94C45] rounded-xl text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Warning: Allocated expenses exceed target budget by {formatINR(Math.abs(budgetSummary.remainingAmount))}!</span>
          </div>
        )}
      </div>

      {/* Donut Chart & Legend */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          {/* SVG Donut */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#EDE2D3"
                strokeWidth="16"
              />

              {/* Category Segments */}
              {budgetSummary.categoriesWithPercent.map((cat) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += cat.percentage;

                return (
                  <circle
                    key={cat.id}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="16"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-serif text-2xl font-bold text-[#171412]">
                {budgetSummary.allocatedPercent}%
              </span>
              <span className="text-[11px] font-semibold text-[#928B83]">Allocated</span>
            </div>
          </div>

          {/* Categories Legend List */}
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold text-[#6D6A66] uppercase tracking-wider">Categories</span>
              <button
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-xs font-semibold text-[#7A3D19] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {showAddCategory && (
              <form onSubmit={handleAddCategory} className="p-3 bg-[#F8F0E4] rounded-xl space-y-2 text-xs">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category Name (e.g. Venue, Catering, Music)"
                  className="w-full p-2 bg-[#FFFCF6] border border-[#EDE2D3] rounded-lg focus:outline-none"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newCatAmount || ''}
                    onChange={(e) => setNewCatAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="Allocated Amount (₹)"
                    className="w-full p-2 bg-[#FFFCF6] border border-[#EDE2D3] rounded-lg focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#7A3D19] text-white rounded-lg font-semibold shrink-0 hover:bg-[#4A2C1B]"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {categories.length === 0 && !showAddCategory && (
              <div className="p-4 bg-[#FBF7EF] border border-dashed border-[#EDE2D3] rounded-xl text-center text-xs text-[#6D6A66]">
                No budget categories allocated yet. Click "+ Add Category" to allocate funds.
              </div>
            )}

            {budgetSummary.categoriesWithPercent.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F0E4]/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-[#171412]">{cat.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {editingCatId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editCatAmount}
                        onChange={(e) => setEditCatAmount(parseInt(e.target.value, 10) || 0)}
                        className="w-24 p-1 bg-[#FBF7EF] border border-[#B86B2A] rounded text-xs"
                      />
                      <button
                        onClick={() => handleSaveCatAmount(cat.id)}
                        className="p-1 rounded bg-[#7A3D19] text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditCatAmount(cat.amount);
                      }}
                      className="cursor-pointer group flex items-center gap-1.5"
                    >
                      <span className="tabular-nums font-sans font-medium text-[#6D6A66]">
                        {formatINR(cat.amount)}
                      </span>
                      <span className="text-[11px] text-[#928B83]">
                        ({cat.percentage}%)
                      </span>
                      <Edit2 className="w-3 h-3 text-transparent group-hover:text-[#B86B2A]" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Suggestions Card */}
      <div className="bg-[#FFFCF6] border border-[#EDE2D3] rounded-3xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#7A3D19]">
          <div className="w-7 h-7 rounded-lg bg-[#FBE8D3] flex items-center justify-center text-[#B86B2A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>AI Suggestions</span>
        </div>

        <ul className="space-y-2 text-xs text-[#6D6A66] pl-2">
          <li className="flex items-start gap-2">
            <span className="text-[#B86B2A] font-bold">•</span>
            <span>Consider weekday or Friday booking to save 10–15% on venue tariff.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#B86B2A] font-bold">•</span>
            <span>Explore local Panaji & Mapusa florists for better rates over imported blooms.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#B86B2A] font-bold">•</span>
            <span>Opt for seasonal coastal flowers & festoon lighting to reduce decor costs by ₹35,000.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
