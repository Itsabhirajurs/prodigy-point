import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Send, Users } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

interface StudentData {
  id: string;
  student_id: string;
  full_name: string;
  name: string;
  email: string;
  department: string;
  semester: number | string;
  attendance?: number;
  avg_assignment?: number;
  avg_quiz?: number;
  stress_index?: number;
  social_media_hours?: number;
  travel_time?: number;
  class_interaction?: number;
  score?: number;
  risk_level?: string;
  prediction?: string;
  updated_at: string;
}

const getCachedUser = () => {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to parse cached user', err);
    return null;
  }
};

const canonicalDept = (value: string | undefined | null): string => {
  const v = (value || '').trim().toLowerCase();
  if (!v) return '';
  if (['it', 'information technology'].includes(v)) return 'IT';
  if (['cse', 'cs', 'computer science', 'computer science and engineering'].includes(v)) return 'CSE';
  if (['biotech', 'biotechnology'].includes(v)) return 'Biotech';
  if (['ece', 'ec', 'electronics', 'electronics and communication', 'electronics and communication engineering'].includes(v)) return 'ECE';
  if (['me', 'mechanical', 'mechanical engineering'].includes(v)) return 'ME';
  if (['ee', 'eee', 'electrical', 'electrical engineering'].includes(v)) return 'EE';
  return v.toUpperCase();
};

const DEPARTMENT_LABELS: Record<string, string> = {
  IT: 'Information Technology',
  CSE: 'Computer Science',
  Biotech: 'Biotechnology',
  ECE: 'Electronics',
  ME: 'Mechanical',
  EE: 'Electrical',
};

const AllStudents: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof StudentData>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();
  const cachedUser = useMemo(getCachedUser, []);
  const isAdmin = cachedUser?.role === 'admin';
  const facultyDept = canonicalDept(cachedUser?.department);

  const deptLabel = (code: string): string => {
    return DEPARTMENT_LABELS[code] || code;
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Try to fetch from view first, fallback to students table
      let data, error;
      
      // Attempt 1: Try view
      let viewQuery = supabase
        .from('v_student_details')
        .select('*')
        .order('updated_at', { ascending: false });

      const viewResult = await viewQuery;
      
      if (viewResult.error) {
        console.warn('View not accessible, fetching from students table:', viewResult.error);
        // Attempt 2: Fallback to students table
        let tableQuery = supabase
          .from('students')
          .select(`
            *,
            student_performance (
              attendance,
              avg_assignment,
              avg_quiz,
              stress_index,
              social_media_hours,
              travel_time,
              class_interaction,
              score,
              risk_level,
              prediction,
              updated_at
            )
          `)
          .order('created_at', { ascending: false });

        const tableResult = await tableQuery;
        
        data = tableResult.data;
        error = tableResult.error;
        
        if (error) throw error;
        
        // Map the joined data
        const mapped = (data || []).map((s: any) => {
          const perf = s.student_performance?.[0] || {};
          return {
            id: s.id,
            student_id: s.student_id,
            full_name: s.full_name,
            name: s.full_name,
            email: s.email,
            department: s.department,
            semester: String(s.semester),
            attendance: perf.attendance || 0,
            avg_assignment: perf.avg_assignment || 0,
            avg_quiz: perf.avg_quiz || 0,
            stress_index: perf.stress_index || 0,
            social_media_hours: perf.social_media_hours || 0,
            travel_time: perf.travel_time || 0,
            class_interaction: perf.class_interaction || 0,
            score: perf.score || 0,
            risk_level: perf.risk_level || 'Unknown',
            prediction: perf.prediction || 'Unknown',
            updated_at: perf.updated_at || s.created_at,
          };
        });
        setStudents(mapped);
      } else {
        // View worked, use it
        const mapped = (viewResult.data || []).map(s => ({
          ...s,
          name: s.full_name,
          semester: String(s.semester),
        }));
        setStudents(mapped as StudentData[]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStudents, 30000);
    return () => clearInterval(interval);
  }, []);

  const departments = useMemo(() => {
    const depts = [...new Set(students.map(s => s.department))];
    return depts.sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRisk = riskFilter === 'all' || s.risk_level === riskFilter;
        const matchesStatus = statusFilter === 'all' || s.prediction === statusFilter;
        const matchesDept = departmentFilter === 'all' || s.department === departmentFilter;
        return matchesSearch && matchesRisk && matchesStatus && matchesDept;
      })
      .sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
  }, [students, searchQuery, riskFilter, statusFilter, departmentFilter, sortBy, sortOrder]);

  const handleSort = (column: keyof StudentData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Department', 'Semester', 'Attendance', 'Avg Quiz', 'Avg Assignment', 'Stress', 'Score', 'Risk Level', 'Status'];
    const rows = filteredStudents.map(s => [
      s.student_id,
      s.name,
      deptLabel(s.department),
      s.semester,
      s.attendance,
      s.avg_quiz,
      s.avg_assignment,
      s.stress_index,
      (s.score || 0).toFixed(2),
      s.risk_level,
      s.prediction,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const sendMotivation = (studentName: string) => {
    toast.success(`Motivation message sent to ${studentName}!`);
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return 'default';
      case 'Medium Risk': return 'secondary';
      case 'High Risk': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Students</h1>
          <p className="text-muted-foreground">{filteredStudents.length} students found</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="Low Risk">Low Risk</SelectItem>
            <SelectItem value="Medium Risk">Medium Risk</SelectItem>
            <SelectItem value="High Risk">High Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="On Track">On Track</SelectItem>
            <SelectItem value="Needs Support">Needs Support</SelectItem>
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{deptLabel(dept)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table or Empty State */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-gradient-to-br from-card/50 via-card to-primary/5 p-12 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20">
              <Users className="w-12 h-12 text-primary/60" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Students Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || riskFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all'
              ? 'Try adjusting your filters or search terms to find students.'
              : 'No students have been registered yet. Start by adding students to the system.'}
          </p>
          {(searchQuery || riskFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('all');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
              className="gap-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('student_id')}>
                  ID {sortBy === 'student_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden lg:table-cell">Semester</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('attendance')}>
                  Att% {sortBy === 'attendance' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="hidden sm:table-cell">Quiz</TableHead>
                <TableHead className="hidden sm:table-cell">Assign</TableHead>
                <TableHead className="hidden lg:table-cell">Stress</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('score')}>
                  Score {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student, index) => {
                const canView = isAdmin || canonicalDept(student.department) === facultyDept;
                const staggerDelay = `${(index % 5) + 1}`;
                return (
                  <TableRow 
                    key={student.student_id}
                    className={`animate-slide-up stagger-${staggerDelay} transition-all duration-300 hover:bg-primary/5 ${(student.score || 0) < 50 ? 'bg-danger/5' : ''}`}
                  >
                    <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{deptLabel(student.department)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{student.semester}</TableCell>
                    <TableCell>{student.attendance}%</TableCell>
                    <TableCell className="hidden sm:table-cell">{student.avg_quiz}</TableCell>
                    <TableCell className="hidden sm:table-cell">{student.avg_assignment}</TableCell>
                    <TableCell className="hidden lg:table-cell">{student.stress_index}</TableCell>
                    <TableCell className={(student.score || 0) < 50 ? 'text-danger font-semibold' : ''}>
                      {(student.score || 0).toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(student.risk_level)}>
                        {student.risk_level?.replace(' Risk', '')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={student.prediction === 'On Track' ? 'default' : 'secondary'}>
                        {student.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/student/${student.student_id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {canView && student.risk_level === 'High Risk' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary"
                            onClick={() => sendMotivation(student.name)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AllStudents;
