import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolService } from '../services/schoolService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Building2,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardBody,
  Badge,
  Button,
  LoadingState,
  ErrorState,
  Alert,
} from '../components/ui';

export const SchoolsPage = () => {
  const { user, activeMembership, switchSchool } = useAuth();
  const toast = useToast();

  const { data: schools, isLoading, error, refetch } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolService.getSchools,
  });

  const handleSwitch = (schoolId, schoolName) => {
    switchSchool(schoolId);
    toast.success(`Switched active school context to ${schoolName}`);
  };

  if (isLoading) return <LoadingState message="Loading registered schools..." />;
  if (error) return <ErrorState message="Could not retrieve schools from the API." onRetry={refetch} />;

  const schoolList = Array.isArray(schools) ? schools : (schools?.results || []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-School & Tenancy Management"
        subtitle="Manage schools and verify tenant isolation across organizations."
        breadcrumbs={[
          { label: 'Dashboard', to: '/app' },
          { label: 'Schools' },
        ]}
      />

      {/* Tenancy Explanation Alert */}
      <Alert type="info" title="Multi-School Tenant Isolation">
        EduKadence is architected so that each school operates with strict database-level query isolation. Users only see and manage entities belonging to the active school context.
      </Alert>

      {/* School Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schoolList.map((school) => {
          const isActive = school.id === activeMembership?.school_id;
          return (
            <Card
              key={school.id}
              className={`p-5 transition-all ${isActive ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md' : 'hover:border-slate-300'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-snug">{school.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{school.code} • {school.slug}</span>
                  </div>
                </div>
                {isActive ? (
                  <Badge variant="brand" size="sm" dot>Active Context</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Independent Tenant</Badge>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {school.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{school.email}</span>
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{school.phone}</span>
                  </div>
                )}
                {school.address && (
                  <div className="flex items-center gap-2 sm:col-span-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{school.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{school.members_count || 4} Members</span>
                </div>
                {!isActive && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSwitch(school.id, school.name)}
                  >
                    Switch to This School
                  </Button>
                )}
                {isActive && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Currently Active
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
