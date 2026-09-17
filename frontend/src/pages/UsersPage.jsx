import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { schoolService } from '../services/schoolService';
import { useAuth } from '../hooks/useAuth';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Mail,
  UserCheck,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  Avatar,
  Input,
  Button,
  Tabs,
  LoadingState,
  ErrorState,
} from '../components/ui';

export const UsersPage = () => {
  const { activeMembership } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoleFilter, setActiveRoleFilter] = useState('ALL');

  const { data: memberships, isLoading, error, refetch } = useQuery({
    queryKey: ['memberships', activeMembership?.school_id],
    queryFn: schoolService.getMemberships,
  });

  const memberList = Array.isArray(memberships) ? memberships : (memberships?.results || []);

  const roleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge variant="brand">Super Admin</Badge>;
      case 'SCHOOL_ADMIN':
        return <Badge variant="brand">School Admin</Badge>;
      case 'TEACHER':
        return <Badge variant="sky">Teacher</Badge>;
      case 'PARENT':
        return <Badge variant="success">Parent / Guardian</Badge>;
      case 'CHILD':
        return <Badge variant="kid">Child (Kid Mode)</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const filteredMembers = memberList.filter((m) => {
    const user = m.user_details || {};
    const matchesSearch =
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = activeRoleFilter === 'ALL' || m.role === activeRoleFilter;
    return matchesSearch && matchesRole;
  });

  const roleTabs = [
    { id: 'ALL', label: 'All Members', count: memberList.length },
    { id: 'SCHOOL_ADMIN', label: 'Admins', count: memberList.filter((m) => m.role === 'SCHOOL_ADMIN').length },
    { id: 'TEACHER', label: 'Teachers', count: memberList.filter((m) => m.role === 'TEACHER').length },
    { id: 'PARENT', label: 'Parents', count: memberList.filter((m) => m.role === 'PARENT').length },
    { id: 'CHILD', label: 'Children', count: memberList.filter((m) => m.role === 'CHILD').length },
  ];

  if (isLoading) return <LoadingState message="Loading school members and roles..." />;
  if (error) return <ErrorState message="Could not load member roster." onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users, Roles & Memberships"
        subtitle={`Managing members for ${activeMembership?.school_name || 'Active School'}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/app' },
          { label: 'Users & Roles' },
        ]}
      />

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs tabs={roleTabs} activeTab={activeRoleFilter} onChange={setActiveRoleFilter} />

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Members Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>User / Member</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Email / Identifier</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Linked School</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                No members match your criteria.
              </TableCell>
            </TableRow>
          ) : (
            filteredMembers.map((m) => {
              const u = m.user_details || {};
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.full_name || u.username} src={u.avatar} size="sm" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{u.full_name || u.username}</span>
                        {u.phone_number && <span className="text-[10px] text-slate-400">{u.phone_number}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{roleBadge(m.role)}</TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-600">
                    {u.email || u.username}
                  </TableCell>
                  <TableCell>
                    {m.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {m.school_name || activeMembership?.school_name}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
