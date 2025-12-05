import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Eye, Send } from 'lucide-react';
import { useStudent, StudentData } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';

const AllStudents: React.FC = () => {
  const { getAllStudents } = useStudent();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof StudentData>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      setIsLoading(false);
    };
    fetchStudents();
  }, [getAllStudents]);

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
      s.department,
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
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
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
            {filteredStudents.map((student) => (
              <TableRow 
                key={student.student_id}
                className={(student.score || 0) < 50 ? 'bg-danger/5' : ''}
              >
                <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="hidden md:table-cell">{student.department}</TableCell>
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/student/${student.student_id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {student.risk_level === 'High Risk' && (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllStudents;
