import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import {
  TbBrain,
  TbChartBar,
  TbCode,
  TbStar,
  TbTrendingUp,
  TbAlertTriangle,
  TbCheck,
  TbRefresh,
  TbGitBranch,
  TbFileText,
  TbUsers,
  TbClock,
  TbShield,
  TbRocket,
  TbTarget,
  TbBulb,
  TbSettings,
  TbEye,
  TbDownload,
  TbX
} from "react-icons/tb";

const AIProjectAnalysis = ({ 
  project, 
  hackathon, 
  isOpen, 
  onClose, 
  userRole = "judge" // "judge" or "organizer"
}) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isOpen && project) {
      fetchAnalysis();
    }
  }, [isOpen, project]);

  const fetchAnalysis = async (forceRefresh = false) => {
    if (!project?.links?.github) {
      toast.error("Project must have a GitHub repository for AI analysis");
      return;
    }

    setLoading(true);
    try {
      const idToken = await user.getIdToken();
      const url = `${import.meta.env.VITE_API_URL}/projects/${project._id}/ai-analyze${forceRefresh ? '?refresh=true' : ''}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Fetching AI analysis from:', url);
      console.log('response', response);

      const data = await response.json();
      console.log('AI analysis response:', data);
      
      if (data.success) {
        setAnalysis(data.data);
        setCached(data.cached || false);
        toast.success(data.cached ? 'Loaded cached analysis' : 'AI analysis completed!');
      } else {
        toast.error(data.error || 'Failed to analyze project');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze project');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-400";
    if (percentage >= 60) return "text-yellow-400";
    if (percentage >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBadgeColor = (score, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "bg-green-600";
    if (percentage >= 60) return "bg-yellow-600";
    if (percentage >= 40) return "bg-orange-600";
    return "bg-red-600";
  };

  const downloadReport = () => {
    if (!analysis) return;

    const report = {
      project: {
        title: project.title,
        team: project.team?.name,
        repository: analysis.repository?.name,
        analyzedAt: analysis.analyzedAt
      },
      scores: {
        overall: analysis.overallScore,
        criteria: analysis.criteriaScores,
        confidence: analysis.confidenceLevel
      },
      codeQuality: analysis.codeQualityMetrics,
      feedback: {
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        recommendation: analysis.recommendation
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-${project.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                  <TbBrain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Project Analysis</h2>
                  <p className="text-zinc-400">
                    {project.title} • {project.team?.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {analysis && (
                  <>
                    <Button
                      onClick={downloadReport}
                      variant="outline"
                      size="sm"
                      className="border-zinc-700"
                    >
                      <TbDownload className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => fetchAnalysis(true)}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="border-zinc-700"
                    >
                      <TbRefresh className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white"
                >
                  <TbX className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-600/30 rounded-full animate-spin border-t-purple-600"></div>
                  <TbBrain className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-white font-medium mt-4">Analyzing repository...</p>
                <p className="text-zinc-400 text-sm">This may take 30-60 seconds</p>
              </div>
            ) : !analysis ? (
              <div className="text-center py-12">
                <TbBrain className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Ready for AI Analysis</h3>
                <p className="text-zinc-400 mb-6">
                  Get detailed insights about code quality, innovation, and technical implementation
                </p>
                <Button
                  onClick={() => fetchAnalysis()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <TbBrain className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-4 bg-zinc-900 border border-zinc-800">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                    <TbChartBar className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="scores" className="data-[state=active]:bg-purple-600">
                    <TbTarget className="w-4 h-4 mr-2" />
                    Detailed Scores
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
                    <TbBulb className="w-4 h-4 mr-2" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="data-[state=active]:bg-purple-600">
                    <TbCode className="w-4 h-4 mr-2" />
                    Technical
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Overall Score Card */}
                  <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-600/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Overall AI Score</h3>
                          <div className="flex items-center gap-3">
                            <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                              {analysis.overallScore}
                            </span>
                            <span className="text-2xl text-zinc-400">/100</span>
                            <Badge className={`${getScoreBadgeColor(analysis.overallScore)} text-white`}>
                              {analysis.overallScore >= 80 ? 'Excellent' : 
                               analysis.overallScore >= 60 ? 'Good' : 
                               analysis.overallScore >= 40 ? 'Average' : 'Needs Improvement'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <TbShield className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm text-zinc-400">
                              Confidence: {analysis.confidenceLevel}%
                            </span>
                            {cached && (
                              <>
                                <TbClock className="w-4 h-4 text-yellow-400 ml-2" />
                                <span className="text-sm text-yellow-400">Cached Result</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-zinc-800"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="50"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(analysis.overallScore / 100) * 314} 314`}
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{analysis.overallScore}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Repository Info */}
                  {analysis.repository && (
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TbGitBranch className="w-5 h-5" />
                          Repository Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-zinc-400">Repository</p>
                            <p className="font-medium text-white">{analysis.repository.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Language</p>
                            <p className="font-medium text-white">{analysis.repository.language || 'Multiple'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Stars</p>
                            <p className="font-medium text-white">{analysis.repository.stars || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Forks</p>
                            <p className="font-medium text-white">{analysis.repository.forks || 0}</p>
                          </div>
                        </div>
                        {analysis.repository.description && (
                          <div>
                            <p className="text-sm text-zinc-400">Description</p>
                            <p className="text-white">{analysis.repository.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(analysis.codeQualityMetrics).map(([key, value]) => (
                      <Card key={key} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-zinc-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`font-bold ${getScoreColor(value, 10)}`}>
                              {value}/10
                            </span>
                          </div>
                          <Progress 
                            value={(value / 10) * 100} 
                            className="h-2"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="scores" className="space-y-6">
                  <div className="grid gap-4">
                    {analysis.criteriaScores.map((criteria, index) => (
                      <Card key={index} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">{criteria.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-bold ${getScoreColor(criteria.score, criteria.maxScore)}`}>
                                {criteria.score}
                              </span>
                              <span className="text-zinc-400">/{criteria.maxScore}</span>
                              <Badge className={getScoreBadgeColor(criteria.score, criteria.maxScore)}>
                                {Math.round((criteria.score / criteria.maxScore) * 100)}%
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={(criteria.score / criteria.maxScore) * 100} 
                            className="h-3 mb-4"
                          />
                          <p className="text-zinc-300 leading-relaxed">{criteria.feedback}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TbCheck className="w-5 h-5 text-green-400" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <TbCheck className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <p className="text-zinc-300">{strength}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Improvements */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TbTrendingUp className="w-5 h-5 text-orange-400" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <TbTrendingUp className="w-4 h-4 text-orange-400 mt-1 flex-shrink-0" />
                            <p className="text-zinc-300">{improvement}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Technical Highlights */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TbCode className="w-5 h-5 text-blue-400" />
                          Technical Highlights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.technicalHighlights.map((highlight, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <TbCode className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                            <p className="text-zinc-300">{highlight}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Innovation Factors */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TbRocket className="w-5 h-5 text-purple-400" />
                          Innovation Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.innovationFactors.map((factor, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <TbRocket className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                            <p className="text-zinc-300">{factor}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Recommendation */}
                  <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-600/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TbBrain className="w-5 h-5" />
                        AI Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 leading-relaxed text-lg">
                        {analysis.recommendation}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="technical" className="space-y-6">
                  {/* Code Quality Breakdown */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TbSettings className="w-5 h-5" />
                        Code Quality Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(analysis.codeQualityMetrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`font-bold ${getScoreColor(value, 10)}`}>
                              {value}/10
                            </span>
                          </div>
                          <Progress value={(value / 10) * 100} className="h-3" />
                          <p className="text-sm text-zinc-400 mt-1">
                            {key === 'structureQuality' && 'Project organization and code architecture'}
                            {key === 'documentationQuality' && 'README and code documentation quality'}
                            {key === 'testingCoverage' && 'Testing framework and coverage implementation'}
                            {key === 'architectureDesign' && 'Overall system design and patterns'}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Analysis Details */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TbFileText className="w-5 h-5" />
                        Analysis Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Analysis Date</p>
                          <p className="text-white">
                            {new Date(analysis.analyzedAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">Confidence Level</p>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.confidenceLevel} className="h-2 flex-1" />
                            <span className="text-white font-medium">{analysis.confidenceLevel}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-sm text-zinc-400 mb-2">Analysis powered by</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <TbBrain className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-medium">Groq AI + GitHub Analysis</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIProjectAnalysis;