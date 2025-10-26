'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, FileText, Shield, ArrowRight, Star } from 'lucide-react';
import { animations } from '@/lib/animations';

export default function Home() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-9 sm:pt-13 lg:pt-17 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 lg:mb-20">
              {/* Logo and Badge */}
              <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                <div className="relative group">
                  <div className="relative bg-white p-6 sm:p-8 rounded-full shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ease-out">
                    <Image 
                      src="/logo.svg" 
                      alt="AI Risk Assessment Tool" 
                      width={80} 
                      height={80}
                      className={`h-16 sm:h-20 w-16 sm:w-20 ${animations.logo.hover}`}
                    />
                  </div>
                </div>
                
                {/* Professional Badge */}
                <div className={`inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${animations.card.subtle}`}>
                  <Star className={`h-3 w-3 sm:h-4 sm:w-4 ${animations.icon.pulse}`} />
                  <span className="hidden sm:inline">Professional AI Risk Assessment</span>
                  <span className="sm:hidden">Professional Assessment</span>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent leading-tight">
                  AI Compliance Readiness Check <br/> (EU AI Act + US Healthcare Lens)
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                  In <span className="text-blue-600 font-semibold">7 days</span>: a risk heatmap, prioritized 30-day plan, and client-ready PDF.
                </p>
                {/* <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                      In just <span className="text-blue-600 font-semibold">7 days</span>, receive a tailored risk heatmap, a focused 30-day action plan, and a polished client-ready PDF.
                </p> */}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 sm:pt-6 px-4 sm:px-0">
                <Link href="/questionnaire" prefetch={true} className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className={`w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                  >
                    Start Free Pre-Check
                    <ArrowRight className={`ml-2 h-4 w-4 sm:h-5 sm:w-5 ${animations.icon.scale}`} />
                  </Button>
                </Link>
                <Link href="/checkout" prefetch={true} className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className={`w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-xl shadow-lg group ${animations.button.primary}`}
                  >
                    Book Readiness Check
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 text-xs sm:text-sm text-gray-500 px-4 sm:px-0">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span>No Registration Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span>5 Minutes Assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  <span>Instant Results</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <Card className={`text-center group cursor-pointer border-2 hover:border-blue-200 ${animations.card.hover}`}>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className={`flex justify-center mb-3 sm:mb-4 ${animations.icon.scale}`}>
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">Quick & Easy</h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Complete 10 simple yes/no questions in under 5 minutes
                </p>
              </CardContent>
            </Card>

            <Card className={`text-center group cursor-pointer border-2 hover:border-blue-200 ${animations.card.hover}`}>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className={`flex justify-center mb-3 sm:mb-4 ${animations.icon.scale}`}>
                  <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">Risk Analysis</h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Get instant risk level assessment and detailed recommendations
                </p>
              </CardContent>
            </Card>

            <Card className={`text-center group cursor-pointer border-2 hover:border-blue-200 sm:col-span-2 lg:col-span-1 ${animations.card.hover}`}>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <div className={`flex justify-center mb-3 sm:mb-4 ${animations.icon.scale}`}>
                  <FileText className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-blue-700 transition-colors duration-300">PDF Report</h3>
                <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  Download a comprehensive report for your records
                </p>
              </CardContent>
            </Card>
          </div>

          <div className={`mt-12 sm:mt-16 p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-200 group ${animations.card.subtle}`}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors duration-300">What You'll Learn</h2>
            <ul className="space-y-3 sm:space-y-2 text-sm sm:text-base text-gray-700">
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 ${animations.icon.scale}`} />
                <span className="hover:text-blue-700 transition-colors duration-200">Your organization's current AI risk level</span>
              </li>
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 ${animations.icon.scale}`} />
                <span className="hover:text-blue-700 transition-colors duration-200">Key areas requiring attention or improvement</span>
              </li>
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 ${animations.icon.scale}`} />
                <span className="hover:text-blue-700 transition-colors duration-200">Practical recommendations for better AI governance</span>
              </li>
              <li className="flex items-start hover:translate-x-2 transition-transform duration-200 cursor-pointer">
                <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0 ${animations.icon.scale}`} />
                <span className="hover:text-blue-700 transition-colors duration-200">A detailed report you can share with stakeholders</span>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}