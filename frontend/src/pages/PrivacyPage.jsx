import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Lock,
  Download,
  FileText,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Info,
  Server,
  RefreshCw,
  Database,
  History,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button, Badge, Card, Alert, LoadingState, Input } from '../components/ui';
import { privacyService } from '../services/privacyService';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

export const PrivacyPage = () => {
  const [activeTab, setActiveTab] = useState('notice');
  const { user, activeRole } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAdmin = ['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(activeRole);

  // 1. Notice
  const { data: notice, isLoading: noticeLoading } = useQuery({
    queryKey: ['privacy-notice-latest'],
    queryFn: privacyService.getLatestNotice,
  });

  // 2. Consent Purposes & My Consents
  const { data: purposes = [], isLoading: purposesLoading } = useQuery({
    queryKey: ['privacy-purposes'],
    queryFn: privacyService.getConsentPurposes,
  });

  const { data: myConsents = [] } = useQuery({
    queryKey: ['privacy-my-consents'],
    queryFn: privacyService.getMyConsents,
  });

  // 3. User Requests, Nominations, Grievances
  const { data: myRequests = [] } = useQuery({
    queryKey: ['privacy-my-requests'],
    queryFn: privacyService.getDataRequests,
    enabled: activeTab === 'rights',
  });

  const { data: myNominations = [] } = useQuery({
    queryKey: ['privacy-my-nominations'],
    queryFn: privacyService.getNominations,
    enabled: activeTab === 'nomination',
  });

  const { data: myGrievances = [] } = useQuery({
    queryKey: ['privacy-my-grievances'],
    queryFn: privacyService.getGrievances,
    enabled: activeTab === 'grievance',
  });

  // Admin Data Queries
  const { data: adminRequests = [], isLoading: adminReqLoading } = useQuery({
    queryKey: ['privacy-admin-requests'],
    queryFn: privacyService.getAdminRequests,
    enabled: isAdmin && activeTab === 'admin-requests',
  });

  const { data: adminGrievances = [], isLoading: adminGrievLoading } = useQuery({
    queryKey: ['privacy-admin-grievances'],
    queryFn: privacyService.getAdminGrievances,
    enabled: isAdmin && activeTab === 'admin-grievances',
  });

  const { data: breachIncidents = [], isLoading: breachLoading } = useQuery({
    queryKey: ['privacy-admin-breaches'],
    queryFn: privacyService.getAdminBreaches,
    enabled: isAdmin && activeTab === 'admin-breaches',
  });

  const { data: retentionPolicies = [] } = useQuery({
    queryKey: ['privacy-retention-policies'],
    queryFn: privacyService.getAdminRetentionPolicies,
    enabled: isAdmin && activeTab === 'admin-retention',
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['privacy-audit-logs'],
    queryFn: privacyService.getAdminAuditLogs,
    enabled: isAdmin && activeTab === 'admin-audit',
  });

  // Mutations
  const consentMutation = useMutation({
    mutationFn: privacyService.updateConsent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-my-consents'] });
      toast.success('Consent preference updated.');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to update consent.');
    },
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: ({ id, status, resolution_notes }) =>
      privacyService.updateAdminRequestStatus(id, { status, resolution_notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-admin-requests'] });
      toast.success('Request status updated.');
    },
  });

  const resolveGrievanceMutation = useMutation({
    mutationFn: ({ id, status, resolution_summary }) =>
      privacyService.resolveAdminGrievance(id, { status, resolution_summary }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-admin-grievances'] });
      toast.success('Grievance updated.');
    },
  });

  const retentionCleanupMutation = useMutation({
    mutationFn: privacyService.runRetentionCleanup,
    onSuccess: (data) => {
      toast.success(`Retention cleanup complete: ${data.purged_items} expired records purged.`);
      queryClient.invalidateQueries({ queryKey: ['privacy-audit-logs'] });
    },
  });

  // Section 11 Instant Export
  const [isExporting, setIsExporting] = useState(false);
  const handleInstantExport = async () => {
    setIsExporting(true);
    try {
      const dataPackage = await privacyService.exportMyData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataPackage, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `edukadence_personal_data_summary_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Personal Data Package downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                DPDP Act, 2023 & DPDP Rules, 2025
              </Badge>
              <span className="text-xs text-blue-200/80">Section 5 • Section 9 • Section 11–14</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Privacy & Data Governance Center
            </h1>
            <p className="text-sm text-blue-200/90 max-w-2xl leading-relaxed">
              Transparent personal data mapping, verifiable parental consent controls, instant data export packages, and statutory grievance redressal for EduKadence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="md"
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              onClick={handleInstantExport}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-1.5" />
              {isExporting ? 'Preparing...' : 'Download My Data (JSON)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl text-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('notice')}
          className={`px-4 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'notice'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Privacy Notice & Map
        </button>
        <button
          onClick={() => setActiveTab('consent')}
          className={`px-4 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'consent'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Consent Preferences
        </button>
        <button
          onClick={() => setActiveTab('rights')}
          className={`px-4 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'rights'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Data Rights (Sec 11/12)
        </button>
        <button
          onClick={() => setActiveTab('nomination')}
          className={`px-4 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'nomination'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Nominate (Sec 14)
        </button>
        <button
          onClick={() => setActiveTab('grievance')}
          className={`px-4 py-2 font-medium rounded-lg transition-all ${
            activeTab === 'grievance'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Grievance Redressal (Sec 13)
        </button>

        {isAdmin && (
          <>
            <div className="w-[1px] h-6 bg-slate-300 my-auto mx-1" />
            <button
              onClick={() => setActiveTab('admin-requests')}
              className={`px-4 py-2 font-medium rounded-lg transition-all ${
                activeTab === 'admin-requests'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-900 hover:bg-blue-50'
              }`}
            >
              Admin: Rights Requests
            </button>
            <button
              onClick={() => setActiveTab('admin-grievances')}
              className={`px-4 py-2 font-medium rounded-lg transition-all ${
                activeTab === 'admin-grievances'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-900 hover:bg-blue-50'
              }`}
            >
              Admin: Grievances
            </button>
            <button
              onClick={() => setActiveTab('admin-breaches')}
              className={`px-4 py-2 font-medium rounded-lg transition-all ${
                activeTab === 'admin-breaches'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-900 hover:bg-blue-50'
              }`}
            >
              Incident Register
            </button>
            <button
              onClick={() => setActiveTab('admin-retention')}
              className={`px-4 py-2 font-medium rounded-lg transition-all ${
                activeTab === 'admin-retention'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-900 hover:bg-blue-50'
              }`}
            >
              Retention Schedules
            </button>
            <button
              onClick={() => setActiveTab('admin-audit')}
              className={`px-4 py-2 font-medium rounded-lg transition-all ${
                activeTab === 'admin-audit'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-blue-900 hover:bg-blue-50'
              }`}
            >
              Audit Trail
            </button>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        {/* TAB: NOTICE */}
        {activeTab === 'notice' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{notice?.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notice Version: {notice?.version} • Effective: {notice?.effective_date}
                </p>
              </div>
              <Badge variant="success">Active Legal Notice</Badge>
            </div>

            <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              {notice?.summary}
            </p>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Section 9 Child Data Protection Guarantee
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {notice?.child_safeguards_statement}
              </p>
            </div>

            {/* Inventory Table */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                Itemized Personal Data Inventory & Processing Purposes
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Processing Purpose</th>
                      <th className="p-3.5">Personal Data Collected</th>
                      <th className="p-3.5">Legal Basis (DPDP Act)</th>
                      <th className="p-3.5">Retention Period</th>
                      <th className="p-3.5">Downstream Processors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {notice?.itemized_purposes?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-3.5 font-medium text-slate-900">
                          <div>{item.purpose_name}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{item.description}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {item.data_fields?.map((f, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600">{item.legal_basis}</td>
                        <td className="p-3.5 text-slate-600">{item.retention_period}</td>
                        <td className="p-3.5 text-slate-600">
                          {item.third_party_processors?.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CONSENT */}
        {activeTab === 'consent' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Consent & Processing Preferences</h2>
            <p className="text-xs text-slate-500">
              Manage your voluntary opt-in and opt-out preferences. Mandatory items are legally necessary to provide enrolled early childhood services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {purposes.map((p) => {
                const rec = myConsents.find((c) => c.purpose === p.id);
                const isGranted = rec ? rec.status === 'GRANTED' : true;

                return (
                  <div key={p.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                        <Badge variant={p.is_mandatory ? 'neutral' : 'success'}>
                          {p.is_mandatory ? 'Mandatory' : 'Optional'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Status: <strong className={isGranted ? 'text-emerald-600' : 'text-amber-600'}>{isGranted ? 'ACTIVE' : 'WITHDRAWN'}</strong>
                      </span>
                      {p.is_mandatory ? (
                        <span className="text-xs text-slate-400 font-medium">Enrolled Requirement</span>
                      ) : (
                        <Button
                          size="sm"
                          variant={isGranted ? 'secondary' : 'primary'}
                          onClick={() => {
                            consentMutation.mutate({
                              purpose_id: p.id,
                              status: isGranted ? 'WITHDRAWN' : 'GRANTED',
                              revocation_reason: isGranted ? 'Withdrawn by user' : '',
                            });
                          }}
                        >
                          {isGranted ? 'Withdraw Consent' : 'Grant Consent'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ADMIN TAB: REQUESTS */}
        {activeTab === 'admin-requests' && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Data Principal Rights Management</h2>
                <p className="text-xs text-slate-500">
                  Review and fulfill Correction, Completion, and Erasure requests within the 90-day DPDP SLA.
                </p>
              </div>
              <Badge variant="primary">{adminRequests.length} Total Requests</Badge>
            </div>

            {adminReqLoading ? (
              <LoadingState message="Loading requests..." />
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Reference No</th>
                      <th className="p-3">Requester</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Deadline</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {adminRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{r.reference_number}</td>
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{r.user_name}</div>
                          <div className="text-slate-500 text-[11px]">{r.user_email}</div>
                        </td>
                        <td className="p-3 font-medium">{r.request_type}</td>
                        <td className="p-3 max-w-xs text-slate-600 truncate">{r.details}</td>
                        <td className="p-3 text-slate-500">{new Date(r.deadline_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          {r.status !== 'COMPLETED' && (
                            <Button
                              size="xs"
                              variant="primary"
                              onClick={() => {
                                const notes = prompt('Enter resolution notes:');
                                if (notes) {
                                  updateRequestStatusMutation.mutate({
                                    id: r.id,
                                    status: 'COMPLETED',
                                    resolution_notes: notes,
                                  });
                                }
                              }}
                            >
                              Complete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB: GRIEVANCES */}
        {activeTab === 'admin-grievances' && isAdmin && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Privacy Grievance Queue</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ticket No</th>
                    <th className="p-3">Complainant</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Resolution Deadline</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {adminGrievances.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-amber-700">{g.grievance_number}</td>
                      <td className="p-3">{g.user_name}</td>
                      <td className="p-3">{g.category}</td>
                      <td className="p-3 font-medium text-slate-900">{g.subject}</td>
                      <td className="p-3">{new Date(g.target_resolution_date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Badge variant={g.status === 'RESOLVED' ? 'success' : 'warning'}>{g.status}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        {g.status !== 'RESOLVED' && (
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => {
                              const summary = prompt('Enter grievance resolution summary:');
                              if (summary) {
                                resolveGrievanceMutation.mutate({
                                  id: g.id,
                                  status: 'RESOLVED',
                                  resolution_summary: summary,
                                });
                              }
                            }}
                          >
                            Resolve Ticket
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN TAB: BREACH REGISTER */}
        {activeTab === 'admin-breaches' && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Personal Data Breach Register (Section 8(6))</h2>
                <p className="text-xs text-slate-500">
                  Document security incidents, containment steps, and DPBI / Principal notification statuses.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {breachIncidents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No security incidents logged. Clean record.</p>
              ) : (
                breachIncidents.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-700">{b.incident_number}</span>
                      <Badge variant={b.severity === 'LOW' ? 'neutral' : 'danger'}>{b.severity}</Badge>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{b.title}</h3>
                    <p className="text-slate-600">{b.description}</p>
                    <p className="text-slate-500">Containment: {b.containment_measures}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ADMIN TAB: RETENTION */}
        {activeTab === 'admin-retention' && isAdmin && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Data Retention & Safe Deletion Matrix</h2>
                <p className="text-xs text-slate-500">Statutory retention limits and automated cleanup policies.</p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => retentionCleanupMutation.mutate()}
                disabled={retentionCleanupMutation.isPending}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                {retentionCleanupMutation.isPending ? 'Purging...' : 'Run Retention Cleanup'}
              </Button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Data Category</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Retention Limit</th>
                    <th className="p-3">Statutory Basis</th>
                    <th className="p-3">Deletion Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {retentionPolicies.map((pol) => (
                    <tr key={pol.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">{pol.category_name}</td>
                      <td className="p-3 text-slate-600">{pol.purpose}</td>
                      <td className="p-3 font-bold text-blue-700">{pol.retention_period_days} days</td>
                      <td className="p-3 text-slate-600">{pol.statutory_justification}</td>
                      <td className="p-3">
                        <Badge variant="neutral">{pol.deletion_method}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ADMIN TAB: AUDIT LOGS */}
        {activeTab === 'admin-audit' && isAdmin && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Privacy & Consent Audit Trail</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Resource</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 text-[11px]">
                      <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3 text-slate-900 font-sans font-medium">{log.actor_name || 'System'}</td>
                      <td className="p-3 font-semibold text-blue-700">{log.action}</td>
                      <td className="p-3 text-slate-600">{log.target_resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
