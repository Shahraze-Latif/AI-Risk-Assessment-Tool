'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DebugPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testGoogleAccess = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/test-google-access');
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.details || data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            Google API Debug Tool
          </CardTitle>
          <CardDescription>
            Test Google API access and permissions for report generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              onClick={testGoogleAccess} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Test Google API Access
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {results && (
            <div className="space-y-4">
              <Alert variant={results.success ? "default" : "destructive"}>
                {getStatusIcon(results.success)}
                <AlertDescription>
                  <strong>Test Result:</strong> {results.success ? 'All tests passed!' : 'Some tests failed'}
                </AlertDescription>
              </Alert>

              {results.results && (
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(!!results.results.environmentVariables.templateDocId)}
                          <span>Template Doc ID: {results.results.environmentVariables.templateDocId || 'Missing'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(!!results.results.environmentVariables.driveFolderId)}
                          <span>Drive Folder ID: {results.results.environmentVariables.driveFolderId || 'Missing'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(results.results.environmentVariables.serviceAccountKey === 'Set')}
                          <span>Service Account Key: {results.results.environmentVariables.serviceAccountKey}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Folder Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><strong>ID:</strong> {results.results.folderAccess.id}</div>
                        <div><strong>Name:</strong> {results.results.folderAccess.name}</div>
                        <div><strong>Type:</strong> {results.results.folderAccess.mimeType}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Document Access</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><strong>ID:</strong> {results.results.documentAccess.id}</div>
                        <div><strong>Name:</strong> {results.results.documentAccess.name}</div>
                        <div><strong>Type:</strong> {results.results.documentAccess.mimeType}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🔧 Troubleshooting Steps</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Share your Google Drive folder with: <code className="bg-blue-100 px-1 rounded">ai-compliance-readiness-check@polar-scarab-475321-g9.iam.gserviceaccount.com</code></li>
              <li>Share your template document with the same service account</li>
              <li>Set permissions to <strong>Editor</strong> for both</li>
              <li>Ensure Google APIs are enabled in Google Cloud Console</li>
              <li>Redeploy your Vercel application after making changes</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
