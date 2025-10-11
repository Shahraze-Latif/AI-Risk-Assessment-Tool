import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, CheckCircle, FileText, Shield } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-16">
            <div className="flex justify-center group">
              <Brain className="h-20 w-20 text-blue-600 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 hover:text-blue-700 transition-colors duration-300">
              AI Risk Assessment Tool
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto hover:text-gray-700 transition-colors duration-300">
              Evaluate your organization's AI risk exposure with our comprehensive assessment.
              Get instant insights and actionable recommendations in minutes.
            </p>
            <div className="pt-4">
              <Link href="/questionnaire" prefetch={true}>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-200"
                >
                  Start Assessment
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center group hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-12 w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">Quick & Easy</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Complete 10 simple yes/no questions in under 5 minutes
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-12 w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">Risk Analysis</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Get instant risk level assessment and detailed recommendations
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-blue-200">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-12 w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">PDF Report</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Download a comprehensive report for your records
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 hover:shadow-lg transition-all duration-300 group">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors duration-300">What You'll Learn</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                <span className="hover:text-blue-700 transition-colors duration-200">Your organization's current AI risk level</span>
              </li>
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                <span className="hover:text-blue-700 transition-colors duration-200">Key areas requiring attention or improvement</span>
              </li>
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                <span className="hover:text-blue-700 transition-colors duration-200">Practical recommendations for better AI governance</span>
              </li>
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 hover:scale-110 transition-transform duration-200" />
                <span className="hover:text-blue-700 transition-colors duration-200">A detailed report you can share with stakeholders</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}