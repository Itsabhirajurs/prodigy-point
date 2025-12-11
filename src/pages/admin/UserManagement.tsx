import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Trash2, Loader2, Users, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { AppRole } from '@/context/StudentContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  created_at: string;
}

interface Faculty {
  id: string;
  faculty_id: string;
  full_name: string;
  email: string;
  department: string;
  specialization: string | null;
  created_at: string;
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  semester: number;
  created_at: string;
}

interface FacultyFormData {
  email: string;
  password: string;
  full_name: string;
  faculty_id: string;
  department: string;
  specialization: string;
}

interface StudentFormData {
  email: string;
  password: string;
  full_name: string;
  student_id: string;
  department: string;
  semester: string;
}

const UserManagement: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFacultyDialogOpen, setIsFacultyDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [facultyForm, setFacultyForm] = useState<FacultyFormData>({
    email: '',
    password: '',
    full_name: '',
    faculty_id: '',
    department: '',
    specialization: '',
  });

  const [studentForm, setStudentForm] = useState<StudentFormData>({
    email: '',
    password: '',
    full_name: '',
    student_id: '',
    department: '',
    semester: '',
  });

  // Canonical department codes and display names
  const departments = [
    { code: 'CSE', name: 'Computer Science' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'Biotech', name: 'Biotechnology' },
    { code: 'ECE', name: 'Electronics' },
    { code: 'ME', name: 'Mechanical' },
    { code: 'EE', name: 'Electrical' },
  ];

  const canonicalDept = (value: string): string => {
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

  const deptLabel = (code: string): string => {
    const dept = departments.find(d => d.code === code);
    return dept ? dept.name : code;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [facultyData, studentsData] = await Promise.all([
        supabase.from('faculty').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*').order('created_at', { ascending: false }),
      ]);

      if (facultyData.error) throw facultyData.error;
      if (studentsData.error) throw studentsData.error;

      setFaculty(facultyData.data || []);
      setStudents(studentsData.data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFaculty = async () => {
    if (!facultyForm.email || !facultyForm.password || !facultyForm.full_name || !facultyForm.faculty_id) {
      setError('Please fill all required fields');
      return;
    }

    // Validate faculty_id format: must be FAC followed by at least 3 digits
    const facultyIdPattern = /^FAC[0-9]{3,}$/;
    if (!facultyIdPattern.test(facultyForm.faculty_id)) {
      setError('Faculty ID must be in format FAC### (e.g., FAC001, FAC002)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preserve current admin session so signUp doesn't log us out
      const { data: sessionData } = await supabase.auth.getSession();
      const adminSession = sessionData.session;

      if (!adminSession) {
        throw new Error('Missing admin session. Please re-login.');
      }

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: facultyForm.email,
        password: facultyForm.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Restore admin session to keep permissions for inserts
      const { error: restoreError } = await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      if (restoreError) {
        throw new Error(`Failed to restore admin session: ${restoreError.message}`);
      }

      // 2. Create profile using trusted admin function (SECURITY DEFINER bypasses RLS)
      const canonicalDeptCode = canonicalDept(facultyForm.department);
      const { data: profileData, error: profileError } = await supabase
        .rpc('admin_create_profile', {
          p_user_id: authData.user.id,
          p_email: facultyForm.email,
          p_full_name: facultyForm.full_name,
          p_role: 'faculty',
          p_department: canonicalDeptCode,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message || profileError.code}`);
      }
      if (profileData?.status !== 'success') {
        throw new Error(`Profile creation failed: ${profileData?.message || 'Unknown error'}`);
      }

      // 3. Create faculty record
      const { error: facultyError } = await supabase
        .from('faculty')
        .insert({
          user_id: authData.user.id,
          faculty_id: facultyForm.faculty_id,
          full_name: facultyForm.full_name,
          email: facultyForm.email,
          department: canonicalDeptCode,
          specialization: facultyForm.specialization || null,
        });

      if (facultyError) throw facultyError;

      toast.success('Faculty member added successfully!');
      setFacultyForm({
        email: '',
        password: '',
        full_name: '',
        faculty_id: '',
        department: '',
        specialization: '',
      });
      setIsFacultyDialogOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error adding faculty:', err);
      setError(err.message || 'Failed to add faculty member');
      toast.error(err.message || 'Failed to add faculty member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentForm.email || !studentForm.password || !studentForm.full_name || !studentForm.student_id) {
      setError('Please fill all required fields');
      return;
    }

    // Validate student_id format: must be STU followed by at least 3 digits
    const studentIdPattern = /^STU[0-9]{3,}$/;
    if (!studentIdPattern.test(studentForm.student_id)) {
      setError('Student ID must be in format STU### (e.g., STU001, STU002)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preserve current admin session so signUp doesn't log us out
      const { data: sessionData } = await supabase.auth.getSession();
      const adminSession = sessionData.session;

      if (!adminSession) {
        throw new Error('Missing admin session. Please re-login.');
      }

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: studentForm.email,
        password: studentForm.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Restore admin session to keep permissions for inserts
      const { error: restoreError } = await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      });

      if (restoreError) {
        throw new Error(`Failed to restore admin session: ${restoreError.message}`);
      }

      // 2. Create profile using trusted admin function (SECURITY DEFINER bypasses RLS)
      const canonicalDeptCode = canonicalDept(studentForm.department);
      const { data: profileData, error: profileError } = await supabase
        .rpc('admin_create_profile', {
          p_user_id: authData.user.id,
          p_email: studentForm.email,
          p_full_name: studentForm.full_name,
          p_role: 'student',
          p_department: canonicalDeptCode,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message || profileError.code}`);
      }
      if (profileData?.status !== 'success') {
        throw new Error(`Profile creation failed: ${profileData?.message || 'Unknown error'}`);
      }

      // 3. Create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          student_id: studentForm.student_id,
          full_name: studentForm.full_name,
          email: studentForm.email,
          department: canonicalDeptCode,
          semester: parseInt(studentForm.semester),
        });

      if (studentError) throw studentError;

      toast.success('Student added successfully!');
      setStudentForm({
        email: '',
        password: '',
        full_name: '',
        student_id: '',
        department: '',
        semester: '',
      });
      setIsStudentDialogOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error adding student:', err);
      setError(err.message || 'Failed to add student');
      toast.error(err.message || 'Failed to add student');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const { error } = await supabase.from('faculty').delete().eq('id', facultyId);
      if (error) throw error;
      
      toast.success('Faculty member deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete faculty member');
      console.error(err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const { error } = await supabase.from('students').delete().eq('id', studentId);
      if (error) throw error;
      
      toast.success('Student deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete student');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage faculty and student accounts</p>
      </div>

      <Tabs defaultValue="faculty" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        {/* Faculty Tab */}
        <TabsContent value="faculty" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-medium">{faculty.length} Faculty Members</span>
            </div>
            <Dialog open={isFacultyDialogOpen} onOpenChange={setIsFacultyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setError(null)}>
                  <Plus className="w-4 h-4" />
                  Add Faculty
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Faculty Member</DialogTitle>
                  <DialogDescription>Create a new faculty account</DialogDescription>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fac_email">Email *</Label>
                    <Input
                      id="fac_email"
                      type="email"
                      placeholder="faculty@example.com"
                      value={facultyForm.email}
                      onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fac_password">Password *</Label>
                    <Input
                      id="fac_password"
                      type="password"
                      placeholder="••••••••"
                      value={facultyForm.password}
                      onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fac_name">Full Name *</Label>
                    <Input
                      id="fac_name"
                      placeholder="John Doe"
                      value={facultyForm.full_name}
                      onChange={(e) => setFacultyForm({ ...facultyForm, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fac_id">Faculty ID *</Label>
                    <Input
                      id="fac_id"
                      placeholder="FAC001"
                      value={facultyForm.faculty_id}
                      onChange={(e) => setFacultyForm({ ...facultyForm, faculty_id: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground">Format: FAC### (e.g., FAC001, FAC002)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fac_dept">Department *</Label>
                    <Select
                      value={facultyForm.department}
                      onValueChange={(value) => setFacultyForm({ ...facultyForm, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fac_spec">Specialization</Label>
                    <Input
                      id="fac_spec"
                      placeholder="Data Science, AI, etc."
                      value={facultyForm.specialization}
                      onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleAddFaculty} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Faculty Account'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : faculty.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No faculty members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      faculty.map((fac) => (
                        <TableRow key={fac.id}>
                          <TableCell className="font-mono">{fac.faculty_id}</TableCell>
                          <TableCell className="font-medium">{fac.full_name}</TableCell>
                          <TableCell className="font-mono text-sm">{fac.email}</TableCell>
                          <TableCell>{deptLabel(fac.department)}</TableCell>
                          <TableCell>{fac.specialization || '-'}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(fac.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteFaculty(fac.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="font-medium">{students.length} Students</span>
            </div>
            <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setError(null)}>
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Student</DialogTitle>
                  <DialogDescription>Create a new student account</DialogDescription>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stu_email">Email *</Label>
                    <Input
                      id="stu_email"
                      type="email"
                      placeholder="student@example.com"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stu_password">Password *</Label>
                    <Input
                      id="stu_password"
                      type="password"
                      placeholder="••••••••"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stu_name">Full Name *</Label>
                    <Input
                      id="stu_name"
                      placeholder="Jane Smith"
                      value={studentForm.full_name}
                      onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stu_id">Student ID *</Label>
                    <Input
                      id="stu_id"
                      placeholder="STU001"
                      value={studentForm.student_id}
                      onChange={(e) => setStudentForm({ ...studentForm, student_id: e.target.value.toUpperCase() })}
                    />
                    <p className="text-xs text-muted-foreground">Format: STU### (e.g., STU001, STU002)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stu_dept">Department *</Label>
                    <Select
                      value={studentForm.department}
                      onValueChange={(value) => setStudentForm({ ...studentForm, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stu_sem">Semester *</Label>
                    <Select
                      value={studentForm.semester}
                      onValueChange={(value) => setStudentForm({ ...studentForm, semester: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddStudent} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Student Account'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono">{student.student_id}</TableCell>
                          <TableCell className="font-medium">{student.full_name}</TableCell>
                          <TableCell className="font-mono text-sm">{student.email}</TableCell>
                          <TableCell>{deptLabel(student.department)}</TableCell>
                          <TableCell>Sem {student.semester}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(student.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
