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
  ExternalLink,
  ChevronRight,
  Info,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Modal, Button, Badge, Card, Alert, LoadingState, Input } from '../ui';
import { privacyService } from '../../services/privacyService';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

export const PrivacyCenterModal = ({ isOpen, onClose, defaultTab = 'notice' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // 1. Fetch Notice
  const { data: notice, isLoading: noticeLoading } = useQuery({
    queryKey: ['privacy-notice-latest'],
    queryFn: privacyService.getLatestNotice,
    enabled: isOpen,
  });

  // 2. Fetch Consent Purposes & My Consents
  const { data: purposes = [], isLoading: purposesLoading } = useQuery({
    queryKey: ['privacy-purposes'],
    queryFn: privacyService.getConsentPurposes,
    enabled: isOpen,
  });

  const { data: myConsents = [], isLoading: consentsLoading } = useQuery({
    queryKey: ['privacy-my-consents'],
    queryFn: privacyService.getMyConsents,
    enabled: isOpen,
  });

  // 3. Fetch My Data Requests
  const { data: myRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['privacy-my-requests'],
    queryFn: privacyService.getDataRequests,
    enabled: isOpen && activeTab === 'rights',
  });

  // 4. Fetch My Nominations
  const { data: myNominations = [], isLoading: nominationsLoading } = useQuery({
    queryKey: ['privacy-my-nominations'],
    queryFn: privacyService.getNominations,
    enabled: isOpen && activeTab === 'nomination',
  });

  // 5. Fetch My Grievances
  const { data: myGrievances = [], isLoading: grievancesLoading } = useQuery({
    queryKey: ['privacy-my-grievances'],
    queryFn: privacyService.getGrievances,
    enabled: isOpen && activeTab === 'grievance',
  });

  // Consent Toggle Mutation
  const consentMutation = useMutation({
    mutationFn: privacyService.updateConsent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['privacy-my-consents'] });
      toast.success(
        data.status === 'GRANTED'
          ? 'Consent preferences recorded successfully.'
          : 'Consent withdrawn. Processing preferences updated.'
      );
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to update consent.');
    },
  });

  // Rights Request Mutation
  const [requestType, setRequestType] = useState('CORRECTION');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestDetails.trim()) {
      toast.error('Please provide specific details for your request.');
      return;
    }
    setIsSubmittingRequest(true);
    try {
      const res = await privacyService.submitDataRequest({
        request_type: requestType,
        details: requestDetails.trim(),
      });
      toast.success(`Request submitted! Reference: ${res.reference_number}`);
      setRequestDetails('');
      queryClient.invalidateQueries({ queryKey: ['privacy-my-requests'] });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to submit request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Instant Data Export (Section 11)
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
        `edukadence_data_export_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Section 11 Data Summary Package exported successfully.');
    } catch (err) {
      toast.error('Failed to generate export package.');
    } finally {
      setIsExporting(false);
    }
  };

  // Nomination Submission
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRel, setNomineeRel] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [isSubmittingNominee, setIsSubmittingNominee] = useState(false);

  const handleNominationSubmit = async (e) => {
    e.preventDefault();
    if (!nomineeName || !nomineeRel || !nomineePhone || !nomineeEmail) {
      toast.error('Please fill in all nominee details.');
      return;
    }
    setIsSubmittingNominee(true);
    try {
      await privacyService.createNomination({
        nominee_name: nomineeName,
        nominee_relationship: nomineeRel,
        nominee_phone: nomineePhone,
        nominee_email: nomineeEmail,
      });
      toast.success('Nominee designated successfully under Section 14 DPDP Act.');
      setNomineeName('');
      setNomineeRel('');
      setNomineePhone('');
      setNomineeEmail('');
      queryClient.invalidateQueries({ queryKey: ['privacy-my-nominations'] });
    } catch (err) {
      toast.error('Failed to record nomination.');
    } finally {
      setIsSubmittingNominee(false);
    }
  };

  // Grievance Submission
  const [grievanceCat, setGrievanceCat] = useState('CHILD_DATA_PROTECTION');
  const [grievanceSubject, setGrievanceSubject] = useState('');
  const [grievanceDesc, setGrievanceDesc] = useState('');
  const [isSubmittingGrievance, setIsSubmittingGrievance] = useState(false);

  const handleGrievanceSubmit = async (e) => {
    e.preventDefault();
    if (!grievanceSubject || !grievanceDesc) {
      toast.error('Please enter a subject and detailed description.');
      return;
    }
    setIsSubmittingGrievance(true);
    try {
      const res = await privacyService.submitGrievance({
        category: grievanceCat,
        subject: grievanceSubject,
        description: grievanceDesc,
      });
      toast.success(`Grievance registered under Section 13! Ref: ${res.grievance_number}`);
      setGrievanceSubject('');
      setGrievanceDesc('');
      queryClient.invalidateQueries({ queryKey: ['privacy-my-grievances'] });
    } catch (err) {
      toast.error('Failed to submit grievance.');
    } finally {
      setIsSubmittingGrievance(false);
    }
  };

  const getConsentStatus = (purposeId) => {
    const rec = myConsents.find((c) => c.purpose === purposeId);
    if (!rec) return 'GRANTED'; // Default standard opt-in
    return rec.status;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy & Data Governance Center"
      size="xl"
    >
      <div className="flex flex-col h-[75vh] max-h-[800px]">
        {/* Top DPDP Act Compliance Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-xl mb-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  DPDP Act, 2023 & DPDP Rules, 2025 Compliant
                </span>
                <Badge variant="success" className="text-xs py-0.5 px-2 bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                  Active Charter
                </Badge>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Multi-Tenant Early Childhood Data Governance & Child Protection Safeguards (Ages 2–10)
              </p>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-blue-200">
            <span>Jurisdiction: <strong>India</strong></span>
            <span className="text-emerald-400 font-medium">100% Ad-Free & Zero Tracking</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 mb-4 overflow-x-auto pb-1 text-sm">
          <button
            onClick={() => setActiveTab('notice')}
            className={`px-3.5 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notice'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Privacy Notice & Data Map
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`px-3.5 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'consent'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            Consent Preferences
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`px-3.5 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rights'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            My Data Rights (Sec 11 & 12)
          </button>
          <button
            onClick={() => setActiveTab('nomination')}
            className={`px-3.5 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nomination'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Nominate (Sec 14)
          </button>
          <button
            onClick={() => setActiveTab('grievance')}
            className={`px-3.5 py-2 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'grievance'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Grievance Redressal (Sec 13)
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: NOTICE & DATA MAP */}
          {activeTab === 'notice' && (
            <div className="space-y-4 text-slate-700 text-sm">
              {noticeLoading ? (
                <LoadingState message="Loading legal charter..." />
              ) : (
                <>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h3 className="font-bold text-base text-slate-900 mb-1">
                      {notice?.title || 'EduKadence Privacy Notice'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Notice Version: <strong>{notice?.version}</strong> • Effective: {notice?.effective_date}
                    </p>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      {notice?.summary}
                    </p>
                  </div>

                  {/* Section 9 Child Data Protection Box */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold mb-1">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Section 9 Child Personal Data Protection Commitment
                    </div>
                    <p className="text-emerald-800 text-xs leading-relaxed">
                      {notice?.child_safeguards_statement}
                    </p>
                  </div>

                  {/* Itemized Processing Purposes Table */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-600" />
                      Itemized Personal Data Inventory & Processing Purposes
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Purpose & Scope</th>
                            <th className="p-3">Data Fields Collected</th>
                            <th className="p-3">Legal Basis</th>
                            <th className="p-3">Retention Schedule</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {notice?.itemized_purposes?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="p-3 font-medium text-slate-900">
                                <div>{item.purpose_name}</div>
                                <div className="text-[11px] text-slate-500 font-normal">{item.description}</div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {item.data_fields?.map((f, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-slate-600">{item.legal_basis}</td>
                              <td className="p-3 text-slate-600">{item.retention_period}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grievance & DPO Contacts */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Grievance Redressal Officer</h5>
                      <p className="text-xs text-slate-600">{notice?.grievance_officer_name}</p>
                      <p className="text-xs text-slate-600">Email: <a href={`mailto:${notice?.grievance_officer_email}`} className="text-blue-600 underline">{notice?.grievance_officer_email}</a></p>
                      <p className="text-xs text-slate-600">Phone: {notice?.grievance_officer_phone}</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">Data Storage & Processor Details</h5>
                      <p className="text-xs text-slate-600">Primary Cloud Hosting: <strong>India Data Center</strong></p>
                      <p className="text-xs text-slate-600">Cross-Border Transfers: <strong>Strictly Localized in India</strong></p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: CONSENT PREFERENCES */}
          {activeTab === 'consent' && (
            <div className="space-y-4">
              <Alert variant="info" className="text-xs">
                Under the DPDP Act, 2023, you have the right to provide voluntary, informed consent and to withdraw consent at any time. Withdrawing optional consent will not affect your child&apos;s core enrollment or campus safety.
              </Alert>

              {purposesLoading ? (
                <LoadingState message="Loading consent settings..." />
              ) : (
                <div className="space-y-3">
                  {purposes.map((p) => {
                    const status = getConsentStatus(p.id);
                    const isGranted = status === 'GRANTED';

                    return (
                      <div
                        key={p.id}
                        className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                            {p.is_mandatory ? (
                              <Badge variant="neutral" className="text-[10px] py-0.5">
                                Mandatory for Service
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] py-0.5">
                                Optional Preference
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>Data elements:</span>
                            {p.data_fields_collected?.map((f, i) => (
                              <span key={i} className="text-slate-600 font-mono bg-slate-50 px-1 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {p.is_mandatory ? (
                            <div className="text-xs text-slate-400 font-medium px-3 py-1 bg-slate-100 rounded-lg">
                              Always Active
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant={isGranted ? 'primary' : 'secondary'}
                              onClick={() => {
                                consentMutation.mutate({
                                  purpose_id: p.id,
                                  status: isGranted ? 'WITHDRAWN' : 'GRANTED',
                                  revocation_reason: isGranted ? 'Withdrawn from Privacy Center' : '',
                                });
                              }}
                              disabled={consentMutation.isPending}
                            >
                              {isGranted ? 'Consent Active (Revoke)' : 'Grant Consent'}
                            </Button>
                          )}
                          <span className="text-[10px] text-slate-400">
                            Status: <strong className={isGranted ? 'text-emerald-600' : 'text-amber-600'}>{status}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATA PRINCIPAL RIGHTS (SEC 11 & 12) */}
          {activeTab === 'rights' && (
            <div className="space-y-5 text-sm">
              {/* 1-Click Instant Data Summary Download */}
              <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    Section 11 Right to Access Summary (Instant Data Package)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Instantly download an itemized, structured JSON copy of all personal records, attendance logs, and learning progress held for your family.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleInstantExport}
                  disabled={isExporting}
                >
                  {isExporting ? 'Generating...' : 'Download JSON Data'}
                </Button>
              </div>

              {/* Submit Rights Request Form */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Submit Formal Rights Request (Correction / Completion / Erasure)
                </h4>
                <form onSubmit={handleRequestSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Request Category
                      </label>
                      <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      >
                        <option value="CORRECTION">Right to Correction of Inaccurate Data</option>
                        <option value="COMPLETION">Right to Completion of Incomplete Records</option>
                        <option value="UPDATING">Right to Updating Out-of-Date Data</option>
                        <option value="ERASURE">Right to Erasure / Account Deletion</option>
                        <option value="PROCESSING_INQUIRY">Inquiry on Processors & Sharing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Request Description & Exact Information to Update/Erase
                    </label>
                    <textarea
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      placeholder="e.g. Please update our primary emergency contact phone number or delete archived records."
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Statutory Turnaround: Maximum 90 days (standard fulfillment within 15 days)
                    </span>
                    <Button type="submit" size="sm" variant="primary" disabled={isSubmittingRequest}>
                      <Send className="w-3.5 h-3.5 mr-1" />
                      {isSubmittingRequest ? 'Submitting...' : 'Submit Rights Request'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* My Previous Requests */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">My Rights Requests History</h4>
                {requestsLoading ? (
                  <LoadingState message="Loading requests..." />
                ) : myRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No previous rights requests submitted.</p>
                ) : (
                  <div className="space-y-2">
                    {myRequests.map((req) => (
                      <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{req.reference_number}</span>
                          <Badge variant={req.status === 'COMPLETED' ? 'success' : 'neutral'}>
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-slate-800 font-medium">{req.request_type}</p>
                        <p className="text-slate-600">{req.details}</p>
                        {req.resolution_notes && (
                          <p className="text-emerald-700 bg-emerald-50 p-1.5 rounded text-[11px] mt-1">
                            Resolution: {req.resolution_notes}
                          </p>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Submitted: {new Date(req.submitted_at).toLocaleDateString()} • Deadline: {new Date(req.deadline_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NOMINATION (SEC 14) */}
          {activeTab === 'nomination' && (
            <div className="space-y-4 text-sm">
              <Alert variant="info" className="text-xs">
                Under Section 14 of the DPDP Act, you have the right to nominate an individual who shall, in the event of your death or incapacity, exercise your rights as a Data Principal regarding your child&apos;s records.
              </Alert>

              {/* Nomination Form */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Designate a Trusted Nominee
                </h4>
                <form onSubmit={handleNominationSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nominee Full Name</label>
                      <Input
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                      <Input
                        value={nomineeRel}
                        onChange={(e) => setNomineeRel(e.target.value)}
                        placeholder="e.g. Grandparent / Sibling / Legal Counsel"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nominee Phone Number</label>
                      <Input
                        value={nomineePhone}
                        onChange={(e) => setNomineePhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nominee Email Address</label>
                      <Input
                        type="email"
                        value={nomineeEmail}
                        onChange={(e) => setNomineeEmail(e.target.value)}
                        placeholder="nominee@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" size="sm" variant="primary" disabled={isSubmittingNominee}>
                      {isSubmittingNominee ? 'Saving Nominee...' : 'Save Nominee Designation'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Existing Nominations */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Current Nominee Designations</h4>
                {nominationsLoading ? (
                  <LoadingState message="Loading nominees..." />
                ) : myNominations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No nominees currently designated.</p>
                ) : (
                  <div className="space-y-2">
                    {myNominations.map((nom) => (
                      <div key={nom.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{nom.nominee_name} ({nom.nominee_relationship})</p>
                          <p className="text-slate-600">Phone: {nom.nominee_phone} • Email: {nom.nominee_email}</p>
                        </div>
                        <Badge variant="success">Active Nominee</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GRIEVANCE REDRESSAL (SEC 13) */}
          {activeTab === 'grievance' && (
            <div className="space-y-4 text-sm">
              <Alert variant="warning" className="text-xs">
                Under Section 13 of the DPDP Act & DPDP Rules 2025, you have the right to readily available grievance redressal. Our Grievance Officer will investigate and respond within the statutory deadline (max 90 days).
              </Alert>

              {/* Grievance Form */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Submit a Privacy Grievance
                </h4>
                <form onSubmit={handleGrievanceSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Grievance Category</label>
                      <select
                        value={grievanceCat}
                        onChange={(e) => setGrievanceCat(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                      >
                        <option value="CHILD_DATA_PROTECTION">Child Safety & Protection Concern</option>
                        <option value="UNAUTHORIZED_PROCESSING">Unauthorized or Excessive Processing</option>
                        <option value="CONSENT_VIOLATION">Consent Not Respected / Withdrawal Ignored</option>
                        <option value="RIGHTS_NON_COMPLIANCE">Failure to Fulfill Data Request</option>
                        <option value="SECURITY_BREACH_SUSPICION">Suspected Data Incident</option>
                        <option value="OTHER">General Privacy Concern</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Subject</label>
                      <Input
                        value={grievanceSubject}
                        onChange={(e) => setGrievanceSubject(e.target.value)}
                        placeholder="e.g. Photo visibility restriction concern"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description of Concern</label>
                    <textarea
                      value={grievanceDesc}
                      onChange={(e) => setGrievanceDesc(e.target.value)}
                      placeholder="Please provide full details so the Grievance Officer can investigate and take remedial action."
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button type="submit" size="sm" variant="danger" disabled={isSubmittingGrievance}>
                      {isSubmittingGrievance ? 'Registering Grievance...' : 'Submit Grievance to Officer'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* My Grievances History */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Registered Grievance Tickets</h4>
                {grievancesLoading ? (
                  <LoadingState message="Loading tickets..." />
                ) : myGrievances.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No grievances submitted.</p>
                ) : (
                  <div className="space-y-2">
                    {myGrievances.map((g) => (
                      <div key={g.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-700">{g.grievance_number}</span>
                          <Badge variant={g.status === 'RESOLVED' ? 'success' : 'warning'}>
                            {g.status}
                          </Badge>
                        </div>
                        <p className="font-bold text-slate-900">{g.subject}</p>
                        <p className="text-slate-600">{g.description}</p>
                        {g.resolution_summary && (
                          <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[11px] mt-1 border border-emerald-200">
                            <strong>Officer Resolution:</strong> {g.resolution_summary}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          Submitted: {new Date(g.submitted_at).toLocaleDateString()} • Resolution Deadline: {new Date(g.target_resolution_date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>EduKadence Privacy Engineering • Verified DPDP Act 2023 Architecture</span>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close Privacy Center
          </Button>
        </div>
      </div>
    </Modal>
  );
};
