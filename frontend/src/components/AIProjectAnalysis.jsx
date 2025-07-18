import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  TbX,
} from "react-icons/tb";

const AIProjectAnalysis = ({
  project,
  hackathon,
  isOpen,
  onClose,
  userRole = "judge",
}) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
      const url = `${import.meta.env.VITE_API_URL}/projects/${
        project._id
      }/ai-analyze${forceRefresh ? "?refresh=true" : ""}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
        setCached(data.cached || false);
        toast.success(
          data.cached ? "Loaded cached analysis" : "AI analysis completed!"
        );
      } else {
        toast.error(data.error || "Failed to analyze project");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze project");
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

  const generatePDFReport = async () => {
    if (!analysis) return;

    setGeneratingPDF(true);

    try {
      // Create PDF using jsPDF's text methods instead of html2canvas
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with wrapping
      const addText = (text, x, y, options = {}) => {
        const fontSize = options.fontSize || 12;
        const fontWeight = options.fontWeight || "normal";
        const color = options.color || "#000000";
        const maxWidth = options.maxWidth || contentWidth;

        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", fontWeight);
        pdf.setTextColor(color);

        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + lines.length * (fontSize * 0.35);
      };

      // Helper function to add a new page if needed
      const checkPageBreak = (neededHeight) => {
        if (yPosition + neededHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      // Header
      pdf.setFillColor(30, 30, 30);
      pdf.rect(0, 0, pageWidth, 60, "F");

      // Title
      yPosition = addText("AI Project Analysis Report", margin, 35, {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
      });

      yPosition = addText(
        `${project.title} • ${project.team?.name || "Solo Project"}`,
        margin,
        yPosition + 5,
        { fontSize: 14, color: "#CCCCCC" }
      );

      yPosition = 80;

      // Overall Score Section
      checkPageBreak(60);
      pdf.setFillColor(45, 45, 45);
      pdf.rect(margin, yPosition, contentWidth, 50, "F");

      yPosition = addText("Overall Score", margin + 10, yPosition + 20, {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
      });

      yPosition = addText(
        `${analysis.overallScore}/100`,
        margin + 10,
        yPosition + 5,
        {
          fontSize: 32,
          fontWeight: "bold",
          color:
            analysis.overallScore >= 80
              ? "#10B981"
              : analysis.overallScore >= 60
              ? "#EAB308"
              : "#F97316",
        }
      );

      const scoreLabel =
        analysis.overallScore >= 80
          ? "Excellent"
          : analysis.overallScore >= 60
          ? "Good"
          : analysis.overallScore >= 40
          ? "Average"
          : "Needs Improvement";
      yPosition = addText(scoreLabel, margin + 10, yPosition + 5, {
        fontSize: 12,
        color: "#CCCCCC",
      });

      yPosition = addText(
        `Confidence: ${analysis.confidenceLevel}% • Analyzed: ${new Date(
          analysis.analyzedAt
        ).toLocaleDateString()}`,
        margin + 10,
        yPosition + 5,
        { fontSize: 10, color: "#999999" }
      );

      yPosition += 30;

      // Strengths Section
      checkPageBreak(80);
      yPosition = addText("Strengths", margin, yPosition, {
        fontSize: 16,
        fontWeight: "bold",
        color: "#10B981",
      });
      yPosition += 10;

      analysis.strengths.forEach((strength, index) => {
        checkPageBreak(20);
        yPosition = addText(`• ${strength}`, margin + 5, yPosition, {
          fontSize: 11,
          color: "#333333",
        });
        yPosition += 5;
      });

      yPosition += 10;

      // Improvements Section
      checkPageBreak(80);
      yPosition = addText("Areas for Improvement", margin, yPosition, {
        fontSize: 16,
        fontWeight: "bold",
        color: "#F97316",
      });
      yPosition += 10;

      analysis.improvements.forEach((improvement, index) => {
        checkPageBreak(20);
        yPosition = addText(`• ${improvement}`, margin + 5, yPosition, {
          fontSize: 11,
          color: "#333333",
        });
        yPosition += 5;
      });

      yPosition += 10;

      // Detailed Scores Section
      checkPageBreak(100);
      yPosition = addText("Detailed Scores", margin, yPosition, {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000000",
      });
      yPosition += 10;

      analysis.criteriaScores.forEach((criteria, index) => {
        checkPageBreak(40);

        // Score header
        yPosition = addText(
          `${criteria.title}: ${criteria.score}/${
            criteria.maxScore
          } (${Math.round((criteria.score / criteria.maxScore) * 100)}%)`,
          margin,
          yPosition,
          { fontSize: 12, fontWeight: "bold", color: "#000000" }
        );

        // Score bar background
        pdf.setFillColor(200, 200, 200);
        pdf.rect(margin, yPosition + 2, contentWidth, 3, "F");

        // Score bar fill
        const scorePercentage = (criteria.score / criteria.maxScore) * 100;
        const scoreColor =
          scorePercentage >= 80
            ? [16, 185, 129]
            : scorePercentage >= 60
            ? [234, 179, 8]
            : [249, 115, 22];
        pdf.setFillColor(...scoreColor);
        pdf.rect(
          margin,
          yPosition + 2,
          (contentWidth * scorePercentage) / 100,
          3,
          "F"
        );

        yPosition += 10;

        // Feedback
        yPosition = addText(criteria.feedback, margin, yPosition, {
          fontSize: 10,
          color: "#666666",
          maxWidth: contentWidth,
        });
        yPosition += 10;
      });

      // Code Quality Metrics
      checkPageBreak(100);
      yPosition = addText("Code Quality Metrics", margin, yPosition, {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000000",
      });
      yPosition += 10;

      Object.entries(analysis.codeQualityMetrics).forEach(([key, value]) => {
        checkPageBreak(25);

        const metricName = key.replace(/([A-Z])/g, " $1").trim();
        yPosition = addText(`${metricName}: ${value}/10`, margin, yPosition, {
          fontSize: 12,
          fontWeight: "bold",
          color: "#000000",
        });

        // Metric bar background
        pdf.setFillColor(200, 200, 200);
        pdf.rect(margin, yPosition + 2, contentWidth, 3, "F");

        // Metric bar fill
        const metricColor =
          value >= 8
            ? [16, 185, 129]
            : value >= 6
            ? [234, 179, 8]
            : [249, 115, 22];
        pdf.setFillColor(...metricColor);
        pdf.rect(margin, yPosition + 2, (contentWidth * value) / 10, 3, "F");

        yPosition += 15;
      });

      // AI Recommendation
      checkPageBreak(60);
      yPosition = addText("AI Recommendation", margin, yPosition, {
        fontSize: 16,
        fontWeight: "bold",
        color: "#10B981",
      });
      yPosition += 10;

      yPosition = addText(analysis.recommendation, margin, yPosition, {
        fontSize: 11,
        color: "#333333",
        maxWidth: contentWidth,
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor("#999999");
      pdf.text(
        `Generated by vHack AI Analysis • ${new Date().toLocaleDateString()} • Powered by Groq AI`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Download PDF
      const fileName = `ai-analysis-${project.title
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;
      pdf.save(fileName);

      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const downloadReport = () => {
    generatePDFReport();
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
                <div className="p-3 bg-gradient-to-br from-zinc-800 to-neutral-900 rounded-xl border border-zinc-700">
                  <TbBrain className="w-6 h-6 text-zinc-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    AI Project Analysis
                  </h2>
                  <p className="text-zinc-400">
                    {project.title} • {project.team?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {analysis && (
                  <Button
                    onClick={downloadReport}
                    disabled={generatingPDF}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white hover:text-white"
                  >
                    {generatingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <TbDownload className="w-4 h-4 mr-1" />
                        Export PDF
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                  <div className="w-16 h-16 border-4 border-emerald-500/30 rounded-full animate-spin border-t-emerald-500"></div>
                  <TbBrain className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-white font-medium mt-4">
                  Analyzing repository...
                </p>
                <p className="text-zinc-400 text-sm">
                  This may take 30-60 seconds
                </p>
              </div>
            ) : !analysis ? (
              <div className="text-center py-12">
                <TbBrain className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Ready for AI Analysis
                </h3>
                <p className="text-zinc-400 mb-6">
                  Get detailed insights about code quality, innovation, and
                  technical implementation
                </p>
                <Button
                  onClick={() => fetchAnalysis()}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                >
                  <TbBrain className="w-4 h-4 mr-2" />
                  Start AI Analysis
                </Button>
              </div>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <TabsList className="grid grid-cols-4 bg-zinc-900 border border-zinc-800">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-emerald-600 text-white data-[state=active]:text-white"
                    >
                      <TbChartBar className="w-4 h-4 mr-1" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="scores"
                      className="data-[state=active]:bg-emerald-600 text-white data-[state=active]:text-white"
                    >
                      <TbTarget className="w-4 h-4 mr-1" />
                      Detailed Scores
                    </TabsTrigger>
                    <TabsTrigger
                      value="insights"
                      className="data-[state=active]:bg-emerald-600 text-white data-[state=active]:text-white"
                    >
                      <TbBulb className="w-4 h-4 mr-1" />
                      Insights
                    </TabsTrigger>
                    <TabsTrigger
                      value="technical"
                      className="data-[state=active]:bg-emerald-600 text-white data-[state=active]:text-white"
                    >
                      <TbCode className="w-4 h-4 mr-1" />
                      Technical
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                  {/* Overall Score Card */}
                  <Card className="bg-gradient-to-br from-zinc-900/80 to-neutral-900/80 border border-zinc-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            Overall AI Score
                          </h3>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-4xl font-bold ${getScoreColor(
                                analysis.overallScore
                              )}`}
                            >
                              {analysis.overallScore}
                            </span>
                            <span className="text-2xl text-zinc-400">/100</span>
                            <Badge
                              className={`${getScoreBadgeColor(
                                analysis.overallScore
                              )} text-white`}
                            >
                              {analysis.overallScore >= 80
                                ? "Excellent"
                                : analysis.overallScore >= 60
                                ? "Good"
                                : analysis.overallScore >= 40
                                ? "Average"
                                : "Needs Improvement"}
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
                                <span className="text-sm text-yellow-400">
                                  Cached Result
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative w-32 h-32">
                          <svg
                            className="w-32 h-32 transform -rotate-90"
                            viewBox="0 0 120 120"
                          >
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
                              strokeDasharray={`${
                                (analysis.overallScore / 100) * 314
                              } 314`}
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {analysis.overallScore}%
                            </span>
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
                            <p className="font-medium text-white">
                              {analysis.repository.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Language</p>
                            <p className="font-medium text-white">
                              {analysis.repository.language || "Multiple"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Stars</p>
                            <p className="font-medium text-white">
                              {analysis.repository.stars || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-zinc-400">Forks</p>
                            <p className="font-medium text-white">
                              {analysis.repository.forks || 0}
                            </p>
                          </div>
                        </div>
                        {analysis.repository.description && (
                          <div>
                            <p className="text-sm text-zinc-400">Description</p>
                            <p className="text-white">
                              {analysis.repository.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(analysis.codeQualityMetrics).map(
                      ([key, value]) => (
                        <Card key={key} className="bg-zinc-900 border-zinc-800">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-zinc-400 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span
                                className={`font-bold ${getScoreColor(
                                  value,
                                  10
                                )}`}
                              >
                                {value}/10
                              </span>
                            </div>
                            <Progress
                              value={(value / 10) * 100}
                              className="h-2"
                            />
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="scores" className="space-y-6">
                  <div className="grid gap-4">
                    {analysis.criteriaScores.map((criteria, index) => (
                      <Card key={index} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white">
                              {criteria.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xl font-bold ${getScoreColor(
                                  criteria.score,
                                  criteria.maxScore
                                )}`}
                              >
                                {criteria.score}
                              </span>
                              <span className="text-zinc-400">
                                /{criteria.maxScore}
                              </span>
                              <Badge
                                className={getScoreBadgeColor(
                                  criteria.score,
                                  criteria.maxScore
                                )}
                              >
                                {Math.round(
                                  (criteria.score / criteria.maxScore) * 100
                                )}
                                %
                              </Badge>
                            </div>
                          </div>
                          <Progress
                            value={(criteria.score / criteria.maxScore) * 100}
                            className="h-3 mb-4"
                          />
                          <p className="text-zinc-300 leading-relaxed">
                            {criteria.feedback}
                          </p>
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
                          <TbCheck className="w-5 h-5 text-emerald-400" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <TbCheck className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
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
                          <TbCode className="w-5 h-5 text-cyan-400" />
                          Technical Highlights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.technicalHighlights.map(
                          (highlight, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <TbCode className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
                              <p className="text-zinc-300">{highlight}</p>
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>

                    {/* Innovation Factors */}
                    <Card className="bg-zinc-900 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TbRocket className="w-5 h-5 text-violet-400" />
                          Innovation Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.innovationFactors.map((factor, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <TbRocket className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
                            <p className="text-zinc-300">{factor}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI Recommendation */}
                  <Card className="bg-gradient-to-r from-zinc-900/60 to-neutral-900/60 border border-zinc-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TbBrain className="w-5 h-5 text-emerald-400" />
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
                      {Object.entries(analysis.codeQualityMetrics).map(
                        ([key, value]) => (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <span
                                className={`font-bold ${getScoreColor(
                                  value,
                                  10
                                )}`}
                              >
                                {value}/10
                              </span>
                            </div>
                            <Progress
                              value={(value / 10) * 100}
                              className="h-3"
                            />
                            <p className="text-sm text-zinc-400 mt-1">
                              {key === "structureQuality" &&
                                "Project organization and code architecture"}
                              {key === "documentationQuality" &&
                                "README and code documentation quality"}
                              {key === "testingCoverage" &&
                                "Testing framework and coverage implementation"}
                              {key === "architectureDesign" &&
                                "Overall system design and patterns"}
                            </p>
                          </div>
                        )
                      )}
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
                          <p className="text-sm text-zinc-400 mb-1">
                            Analysis Date
                          </p>
                          <p className="text-white">
                            {new Date(analysis.analyzedAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-zinc-400 mb-1">
                            Confidence Level
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={analysis.confidenceLevel}
                              className="h-2 flex-1"
                            />
                            <span className="text-white font-medium">
                              {analysis.confidenceLevel}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800">
                        <p className="text-sm text-zinc-400 mb-2">
                          Analysis powered by
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg flex items-center justify-center">
                            <TbBrain className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-medium">
                            Groq AI + GitHub Analysis
                          </span>
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
