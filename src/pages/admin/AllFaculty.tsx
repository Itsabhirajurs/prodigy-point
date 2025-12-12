import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface FacultyRow {
  id: string;
  faculty_id: string;
  full_name: string;
  email: string;
  department: string;
  specialization: string | null;
  created_at: string;
}

const AllFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<FacultyRow[]>([]);
  const [filtered, setFiltered] = useState<FacultyRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const deptLabel = (code: string): string => {
    const map: Record<string, string> = {
      'IT': 'Information Technology',
      'CSE': 'Computer Science',
      'Biotech': 'Biotechnology',
      'ECE': 'Electronics',
      'ME': 'Mechanical',
      'EE': 'Electrical',
    };
    return map[code] || code;
  };

  const fetchFaculty = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFaculty(data || []);
      setFiltered(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load faculty');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();

    // Refresh every 30 seconds
    const interval = setInterval(fetchFaculty, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      faculty.filter((f) =>
        f.full_name.toLowerCase().includes(term) ||
        f.faculty_id.toLowerCase().includes(term) ||
        f.email.toLowerCase().includes(term)
      )
    );
  }, [search, faculty]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Faculty</h1>
          <p className="text-muted-foreground">{filtered.length} faculty members</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border bg-gradient-to-br from-card/50 via-card to-primary/5 p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/20">
                  <Users className="w-12 h-12 text-primary/60" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Faculty Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {search
                  ? 'No faculty members match your search. Try a different name or ID.'
                  : 'No faculty members have been added yet. Start by adding faculty to the system.'}
              </p>
              {search && (
                <Button
                  variant="outline"
                  onClick={() => setSearch('')}
                  className="gap-2"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((f, index) => {
                    const staggerDelay = `${(index % 5) + 1}`;
                    return (
                      <TableRow key={f.id} className={`animate-slide-up stagger-${staggerDelay}`}>
                        <TableCell className="font-mono">{f.faculty_id}</TableCell>
                        <TableCell className="font-medium">{f.full_name}</TableCell>
                        <TableCell className="font-mono text-sm">{f.email}</TableCell>
                        <TableCell>{deptLabel(f.department)}</TableCell>
                        <TableCell>{f.specialization || '—'}</TableCell>
                        <TableCell className="text-sm">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllFaculty;
