import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useStudent, StudentData } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskDistributionChart } from '@/components/admin/RiskDistributionChart';
import { AtRiskTable } from '@/components/admin/AtRiskTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const AdminDashboard: React.FC = () => {
  const { getAllStudents } = useStudent();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const totalStudents = students.length;
  const lowRisk = students.filter(s => s.risk_level === 'Low Risk').length;
  const mediumRisk = students.filter(s => s.risk_level === 'Medium Risk').length;
  const highRisk = students.filter(s => s.risk_level === 'High Risk').length;
  const onTrack = students.filter(s => s.prediction === 'On Track').length;
  const needsSupport = students.filter(s => s.prediction === 'Needs Support').length;

  const atRiskStudents = students
    .filter(s => s.risk_level === 'High Risk' || (s.score || 0) < 50)
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 5);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Overview of all students</p>
        </div>
        <Button onClick={() => navigate('/admin/students')} className="gap-2">
          View All Students
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-success/10 border-success/20">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-success">{lowRisk}</p>
            <p className="text-sm text-success/80">Low Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-warning">{mediumRisk}</p>
            <p className="text-sm text-warning/80">Medium Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-danger/10 border-danger/20">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-danger">{highRisk}</p>
            <p className="text-sm text-danger/80">High Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-success/10 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{onTrack}</p>
                <p className="text-sm text-success/80">On Track</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-danger/10 border-danger/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <div>
                <p className="text-2xl font-bold text-danger">{needsSupport}</p>
                <p className="text-sm text-danger/80">Needs Support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionChart
              lowRisk={lowRisk}
              mediumRisk={mediumRisk}
              highRisk={highRisk}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Top 5 At-Risk Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AtRiskTable students={atRiskStudents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
