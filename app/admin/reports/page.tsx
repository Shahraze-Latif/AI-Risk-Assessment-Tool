'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, Loader2, RefreshCw, Eye } from 'lucide-react';
import { animations } from '@/lib/animations';

interface ReadinessCheck {
  id: string;
  created_at: string;
  status: string;
  client_name: string;
  client_email: string;
  report_url?: string;
  assessment_data?: {
    weighted_score: number;
    overall_label: string;
    area_scores: Record<string, { score: number; label: string }>;
    plan: string[];
  };
}

export default function AdminReportsPage() {
  const [readinessChecks, setReadinessChecks] = useState<ReadinessCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchReadinessChecks();
  }, []);

  const fetchReadinessChecks = async () => {
    try {
      const response = await fetch('/api/admin/readiness-checks');
      if (response.ok) {
        const data = await response.json();
        setReadinessChecks(data);
      }
    } catch (error) {
      console.error('Error fetching readiness checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (clientId: string) => {
    setGenerating(clientId);
    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Report generated successfully! URL: ${result.reportUrl}`);
        fetchReadinessChecks(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Error generating report: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      payment_pending: { label: 'Payment Pending', variant: 'outline' as const },
      paid: { label: 'Paid', variant: 'default' as const },
      processing: { label: 'Processing', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'default' as const },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <p className="text-lg text-gray-700">Loading reports...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Admin Reports
                </h1>
                <p className="text-lg text-gray-700 mt-2">
                  Manage AI Compliance Readiness Check reports
                </p>
              </div>
              <Button
                onClick={fetchReadinessChecks}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className={`${animations.card.hover}`}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {readinessChecks.filter(r => r.status === 'completed').length}
                  </div>
                  <p className="text-sm text-gray-600">Completed Reports</p>
                </CardContent>
              </Card>
              <Card className={`${animations.card.hover}`}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {readinessChecks.filter(r => r.status === 'paid').length}
                  </div>
                  <p className="text-sm text-gray-600">Ready for Processing</p>
                </CardContent>
              </Card>
              <Card className={`${animations.card.hover}`}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {readinessChecks.filter(r => r.status === 'processing').length}
                  </div>
                  <p className="text-sm text-gray-600">In Progress</p>
                </CardContent>
              </Card>
              <Card className={`${animations.card.hover}`}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-600">
                    {readinessChecks.length}
                  </div>
                  <p className="text-sm text-gray-600">Total Assessments</p>
                </CardContent>
              </Card>
            </div>

            {/* Reports Table */}
            <Card className={`${animations.card.hover}`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Readiness Checks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readinessChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell className="font-medium">
                          {check.client_name || 'N/A'}
                        </TableCell>
                        <TableCell>{check.client_email || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(check.status)}</TableCell>
                        <TableCell>
                          {check.assessment_data ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {check.assessment_data.weighted_score}
                              </span>
                              <Badge variant="outline">
                                {check.assessment_data.overall_label}
                              </Badge>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(check.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {check.status === 'paid' && (
                              <Button
                                size="sm"
                                onClick={() => generateReport(check.id)}
                                disabled={generating === check.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {generating === check.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                                <span className="ml-1">Generate</span>
                              </Button>
                            )}
                            {check.report_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(check.report_url, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                                <span className="ml-1">Download</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Template Management */}
            <Card className={`mt-8 ${animations.card.hover}`}>
              <CardHeader>
                <CardTitle>Template Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => window.open('/templates/model-inventory.docx', '_blank')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Model Inventory</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => window.open('/templates/data-map.docx', '_blank')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Data Map</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => window.open('/templates/vendor-register.docx', '_blank')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Vendor Register</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => window.open('/templates/dpia-lite.docx', '_blank')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">DPIA Lite</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => window.open('/templates/policy-brief.docx', '_blank')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Policy Brief</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

