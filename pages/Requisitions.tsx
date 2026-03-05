import React, { useEffect, useMemo, useState } from 'react';
import { requisitionService, Requisition } from '../src/services/requisitionService';
import { Search, Filter, Plus, Edit2, Eye, ChevronRight, FileCheck, Loader, Printer, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatePicker from '../components/DatePicker';

type RequisitionFilters = {
  status: 'all' | '-1' | '0' | '1';
  requesterId: string;
  authorizerMode: 'all' | 'assigned' | 'unassigned';
  dateFrom: string;
  dateTo: string;
};

const defaultRequisitionFilters: RequisitionFilters = {
  status: 'all',
  requesterId: 'all',
  authorizerMode: 'all',
  dateFrom: '',
  dateTo: '',
};

const Requisitions: React.FC = () => {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<RequisitionFilters>(defaultRequisitionFilters);
  const [draftFilters, setDraftFilters] = useState<RequisitionFilters>(defaultRequisitionFilters);

  useEffect(() => {
    const fetchRequisitions = async () => {
      setLoading(true);
      try {
        const response = await requisitionService.getRequisitions();
        setRequisitions(response.data);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || 'Failed to fetch requisitions');
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, []);

  const parseStatus = (status: string | number) => {
    const numericStatus = Number(status);
    if (numericStatus === 1 || numericStatus === 0 || numericStatus === -1) return numericStatus;
    return 0;
  };

  const getStatusInfo = (status: string | number) => {
    switch (parseStatus(status)) {
      case 1:
        return { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case -1:
        return { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 0:
      default:
        return { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    }
  };

  const requesterOptions = useMemo(() => {
    const map = new Map<number, string>();

    requisitions.forEach((req) => {
      if (!req.owner?.id) return;
      if (!map.has(req.owner.id)) {
        map.set(req.owner.id, req.owner.fullname || `User #${req.owner.id}`);
      }
    });

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [requisitions]);

  const filteredRequisitions = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const fromTimestamp = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`).getTime() : null;
    const toTimestamp = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`).getTime() : null;

    return requisitions.filter((req) => {
      if (normalizedSearch) {
        const searchText = [
          req.ref_no,
          req.subject,
          req.description,
          req.purpose,
          req.owner?.fullname,
          req.creator?.fullname,
          req.authorizer?.fullname,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchText.includes(normalizedSearch)) return false;
      }

      if (filters.status !== 'all') {
        if (String(parseStatus(req.status)) !== filters.status) return false;
      }

      if (filters.requesterId !== 'all') {
        if (String(req.owner?.id ?? '') !== filters.requesterId) return false;
      }

      if (filters.authorizerMode === 'assigned' && !req.authorizer?.id) return false;
      if (filters.authorizerMode === 'unassigned' && req.authorizer?.id) return false;

      if (fromTimestamp !== null || toTimestamp !== null) {
        const dateSource = req.form_date || req.created_at;
        const requisitionTimestamp = dateSource ? new Date(dateSource).getTime() : NaN;

        if (fromTimestamp !== null && (!Number.isFinite(requisitionTimestamp) || requisitionTimestamp < fromTimestamp)) {
          return false;
        }
        if (toTimestamp !== null && (!Number.isFinite(requisitionTimestamp) || requisitionTimestamp > toTimestamp)) {
          return false;
        }
      }

      return true;
    });
  }, [filters, requisitions, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count += 1;
    if (filters.requesterId !== 'all') count += 1;
    if (filters.authorizerMode !== 'all') count += 1;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    return count;
  }, [filters]);

  const openFilterModal = () => {
    setDraftFilters(filters);
    setIsFilterModalOpen(true);
  };

  const clearAllFilters = () => {
    setFilters(defaultRequisitionFilters);
    setDraftFilters(defaultRequisitionFilters);
  };

  const applyFilters = () => {
    const nextFilters = { ...draftFilters };
    if (nextFilters.dateFrom && nextFilters.dateTo && nextFilters.dateFrom > nextFilters.dateTo) {
      const fromDate = nextFilters.dateFrom;
      nextFilters.dateFrom = nextFilters.dateTo;
      nextFilters.dateTo = fromDate;
    }
    setFilters(nextFilters);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-10 flex items-center justify-center bg-primary/20 rounded-lg text-primary ring-1 ring-primary/20">
            <FileCheck size={24} />
          </div>
          <h2 className="text-white text-2xl font-bold leading-tight tracking-tight">Material Requisition Forms</h2>
        </div>
        <Link to="/requisitions/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all font-semibold">
          <Plus size={20} />
          <span>New Requisition</span>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-dark-surface p-4 rounded-xl border border-dark-border shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-dark-border text-white text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10 h-10 placeholder:text-dark-muted transition-all" 
            placeholder="Search by Ref No, Subject, or Requester" 
          />
        </div>
        <button
          type="button"
          onClick={openFilterModal}
          className="flex items-center gap-2 px-4 h-10 bg-slate-900 border border-dark-border rounded-lg text-sm text-dark-muted hover:text-white transition-colors"
        >
          <Filter size={18} />
          <span>{activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}</span>
        </button>
        {(activeFilterCount > 0 || searchQuery.trim()) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              clearAllFilters();
            }}
            className="flex items-center gap-2 px-4 h-10 bg-slate-900 border border-dark-border rounded-lg text-sm text-dark-muted hover:text-white transition-colors"
          >
            <X size={16} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="bg-dark-surface rounded-xl border border-dark-border shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-primary" size={40} /></div>
          ) : error ? (
            <div className="text-red-500 p-6">Error: {error}</div>
          ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/50 border-b border-dark-border">
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider w-32">Ref No</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider max-w-xs">Subject</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Date Created</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Requester</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Authorizer</th>
                <th className="px-6 py-4 text-dark-muted text-xs font-semibold uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-center text-dark-muted text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-dark-muted text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-dark-muted">
                    No requisitions match your current search/filter.
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => {
                  const status = getStatusInfo(req.status);
                  return (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors group text-nowrap">
                    <td className="px-6 py-4 text-white text-sm font-medium tracking-wide font-mono">{req.ref_no}</td>
                    <td className="px-6 py-4 text-white text-sm font-medium truncate max-w-xs">{req.subject}</td>
                    <td className="px-6 py-4 text-dark-muted text-sm">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-dark-muted text-sm">
                      <div className="flex flex-col">   
                        <span className="text-white">{req.owner.fullname}</span>
                        <span className="text-xs opacity-70">{req.owner.position}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-dark-muted text-sm ${req.authorizer?.fullname ? '' : 'text-red-400 text-opacity-60'}`}>
                      {req.authorizer?.fullname || '<Unassigned>'}
                      </td>
                    <td className="px-6 py-4 text-dark-muted text-sm">{req.mr_form_materials?.length || 0} items</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link to={`/requisitions/view/${req.id}`} className="text-dark-muted hover:text-blue-400 p-1.5 rounded-md"><Eye size={16} /></Link>
                        <Link to={`/requisitions/slip/${req.id}`} className="text-dark-muted hover:text-emerald-400 p-1.5 rounded-md"><Printer size={16} /></Link>
                        <Link to={`/requisitions/edit/${req.id}`} className="text-dark-muted hover:text-white p-1.5 rounded-md"><Edit2 size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                );})
              )}
            </tbody>
          </table>
          )}
        </div>
        <div className="border-t border-dark-border px-6 py-4 flex items-center justify-between bg-dark-bg/30">
          <p className="text-sm text-dark-muted">
            Showing <span className="text-white font-medium">{filteredRequisitions.length}</span> of <span className="text-white font-medium">{requisitions.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded border border-dark-border text-dark-muted hover:text-white disabled:opacity-50 transition-colors" disabled>
              <ChevronRight className="rotate-180" size={16} />
            </button>
            <button className="px-3 py-1.5 rounded bg-primary text-white text-sm font-bold">1</button>
            <button className="p-2 rounded border border-dark-border text-dark-muted hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-xl bg-dark-surface border border-dark-border shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <h3 className="text-white text-lg font-semibold">Requisition Filters</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-md text-dark-muted hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close filter modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-dark-muted">Status</label>
                <select
                  value={draftFilters.status}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, status: e.target.value as RequisitionFilters['status'] }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="-1">Rejected</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-dark-muted">Requester</label>
                <select
                  value={draftFilters.requesterId}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, requesterId: e.target.value }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All Requesters</option>
                  {requesterOptions.map((option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-dark-muted">Authorizer</label>
                <select
                  value={draftFilters.authorizerMode}
                  onChange={(e) => setDraftFilters((prev) => ({ ...prev, authorizerMode: e.target.value as RequisitionFilters['authorizerMode'] }))}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                >
                  <option value="all">All</option>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm text-dark-muted">From Date</label>
                  <DatePicker
                    value={draftFilters.dateFrom}
                    onChange={(nextValue) => setDraftFilters((prev) => ({ ...prev, dateFrom: nextValue }))}
                    ariaLabel="Filter from date"
                    inputClassName="border-dark-border"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-dark-muted">To Date</label>
                  <DatePicker
                    value={draftFilters.dateTo}
                    onChange={(nextValue) => setDraftFilters((prev) => ({ ...prev, dateTo: nextValue }))}
                    ariaLabel="Filter to date"
                    inputClassName="border-dark-border"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-dark-border bg-dark-bg/40 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDraftFilters(defaultRequisitionFilters)}
                className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-white hover:bg-slate-800 transition-colors text-sm"
              >
                Clear
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-dark-border text-dark-muted hover:text-white hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requisitions;
