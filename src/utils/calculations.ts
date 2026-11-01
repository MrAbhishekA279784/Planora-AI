import { BudgetCategory, EventItem, TaskItem, VendorItem } from '../types';

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN').format(abs);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function formatINRShort(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    const val = amount / 100000;
    return `₹${Number.isInteger(val) ? val : val.toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}k`;
  }
  return `₹${amount}`;
}

export interface BudgetSummary {
  totalBudget: number;
  allocatedAmount: number;
  allocatedPercent: number;
  remainingAmount: number;
  isOverBudget: boolean;
  categoriesWithPercent: BudgetCategory[];
}

export function calculateBudgetTotals(categories: BudgetCategory[], totalBudget: number): BudgetSummary {
  const safeTotal = Math.max(0, totalBudget);
  const allocatedAmount = categories.reduce((sum, cat) => sum + Math.max(0, cat.amount || 0), 0);
  const allocatedPercent = safeTotal > 0 ? Math.round((allocatedAmount / safeTotal) * 100) : 0;
  const remainingAmount = safeTotal - allocatedAmount;
  const isOverBudget = allocatedAmount > safeTotal;

  const categoriesWithPercent = categories.map((cat) => ({
    ...cat,
    percentage: safeTotal > 0 ? Math.round((cat.amount / safeTotal) * 100) : 0,
  }));

  return {
    totalBudget: safeTotal,
    allocatedAmount,
    allocatedPercent,
    remainingAmount,
    isOverBudget,
    categoriesWithPercent,
  };
}

export function calculateCompletionPercentage(tasks: TaskItem[]): number {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

export function filterEvents(events: EventItem[], query: string, statusFilter: string): EventItem[] {
  const q = (query || '').toLowerCase().trim();
  const filter = (statusFilter || 'All Events').toLowerCase();

  return events.filter((ev) => {
    const matchesQuery =
      !q ||
      ev.name.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      ev.subtitle.toLowerCase().includes(q);

    let matchesStatus = true;
    if (filter === 'upcoming') {
      matchesStatus = ev.status === 'upcoming';
    } else if (filter === 'in planning' || filter === 'planning') {
      matchesStatus = ev.status === 'planning';
    } else if (filter === 'completed') {
      matchesStatus = ev.status === 'completed';
    }

    return matchesQuery && matchesStatus;
  });
}

export interface VendorFilterOptions {
  category?: string;
  query?: string;
  maxBudget?: number;
  minRating?: number;
  location?: string;
}

export function filterVendors(vendors: VendorItem[], options: VendorFilterOptions): VendorItem[] {
  const q = (options.query || '').toLowerCase().trim();
  const cat = (options.category || 'All Vendors').trim();
  const maxBudget = options.maxBudget !== undefined ? options.maxBudget : Infinity;
  const minRating = options.minRating !== undefined ? options.minRating : 0;
  const loc = (options.location || '').toLowerCase().trim();

  return vendors.filter((v) => {
    if (cat !== 'All Vendors' && cat !== 'All' && v.category !== cat) {
      return false;
    }
    if (v.rating < minRating) {
      return false;
    }
    if (v.priceMin > maxBudget) {
      return false;
    }
    if (loc && !v.location.toLowerCase().includes(loc) && !loc.includes('goa')) {
      return false;
    }
    if (q) {
      const matchName = v.name.toLowerCase().includes(q);
      const matchCat = v.category.toLowerCase().includes(q);
      const matchLoc = v.location.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchLoc && !matchDesc) {
        return false;
      }
    }
    return true;
  });
}

export function sortVendors(vendors: VendorItem[], sortBy: string): VendorItem[] {
  const copy = [...vendors];
  switch (sortBy) {
    case 'Top Rated':
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'Price: Low to High':
      return copy.sort((a, b) => a.priceMin - b.priceMin);
    case 'Price: High to Low':
      return copy.sort((a, b) => b.priceMax - a.priceMax);
    case 'Distance':
    case 'Nearest':
      return copy.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    case 'Best Match':
    default:
      return copy.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.rating - a.rating);
  }
}

export function calculateBayesianRating(
  rating: number,
  reviewCount: number,
  globalMean = 4.5,
  minConfidenceWeight = 10
): number {
  return Number(((reviewCount * rating + minConfidenceWeight * globalMean) / (reviewCount + minConfidenceWeight)).toFixed(2));
}
