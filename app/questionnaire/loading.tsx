import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Loading() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Risk Assessment Questionnaire</h1>
            <p className="text-lg text-gray-600 mb-6">
              Please answer all questions honestly. Your responses will help us evaluate your AI risk exposure.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>Loading...</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </div>

          <div className="mb-8">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 animate-pulse">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pl-11">
                    <Button disabled className="flex-1">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yes
                    </Button>
                    <Button disabled className="flex-1">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      No
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" disabled className="flex items-center">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex space-x-2">
              <Button size="lg" disabled className="px-8 bg-blue-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
