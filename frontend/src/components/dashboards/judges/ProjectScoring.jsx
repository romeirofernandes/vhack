import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import {
  MdStar,
  MdFeedback,
  MdSend,
  MdCheck,
  MdEdit,
  MdPerson,
  MdGroup,
  MdLink,
  MdCode,
  MdDescription
} from "react-icons/md";

const ProjectScoring = ({ project, hackathon, onScoreSubmitted }) => {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasScored, setHasScored] = useState(false);
  const [existingScore, setExistingScore] = useState(null);

  useEffect(() => {
    // Check if judge has already scored this project
    const judgeScore = project.scores?.find(
      score => score.judge._id === user._id || score.judge === user._id
    );

    if (judgeScore) {
      setHasScored(true);
      setExistingScore(judgeScore);
      setScores(judgeScore.criteria || []);
      setFeedback(judgeScore.feedback || "");
    } else {
      // Initialize scores based on judging criteria
      const initialScores = hackathon.judgingCriteria.map(criteria => ({
        title: criteria.title,
        score: 0,
        maxScore: criteria.maxScore || 10
      }));
      setScores(initialScores);
    }
  }, [project, hackathon, user]);

  const handleScoreChange = (index, value) => {
    setScores(scores.map((score, i) => 
      i === index ? { ...score, score: value[0] } : score
    ));
  };

  const handleSubmitScore = async () => {
    try {
      setLoading(true);

      // Validate scores
      if (scores.some(score => score.score === 0)) {
        toast.error("Please provide scores for all criteria");
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch(
        `http://localhost:8000/projects/${project._id}/score`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            scores: scores.map(({ title, score, maxScore }) => ({
              title,
              score,
              maxScore
            })),
            feedback: feedback.trim()
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Score submitted successfully!");
        setHasScored(true);
        if (onScoreSubmitted) onScoreSubmitted();
      } else {
        toast.error(data.error || "Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      toast.error("Failed to submit score");
    } finally {
      setLoading(false);
    }
  };

  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const maxTotalScore = scores.reduce((sum, score) => sum + (score.maxScore || 10), 0);

  return (
    <div className="space-y-6">
      {/* Project Info */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-white mb-2">
                {project.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-zinc-400">
                <div className="flex items-center gap-1">
                  <MdGroup className="w-4 h-4" />
                  <span>{project.team?.name || "Solo Project"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MdPerson className="w-4 h-4" />
                  <span>{project.builders?.length || 1} member(s)</span>
                </div>
              </div>
            </div>
            <Badge 
              className={`${
                project.status === "submitted" ? "bg-yellow-600" : 
                project.status === "judging" ? "bg-blue-600" : "bg-green-600"
              } text-white`}
            >
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">Description</h4>
              <p className="text-zinc-300">{project.description}</p>
            </div>
            
            {project.technologies?.length > 0 && (
              <div>
                <h4 className="font-medium text-white mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-zinc-300">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Project Links */}
            <div className="flex gap-4">
              {project.links?.github && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                    <MdCode className="w-4 h-4 mr-2" />
                    GitHub
                  </a>
                </Button>
              )}
              {project.links?.live && (
                <Button variant="outline" size="sm" asChild>
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer">
                    <MdLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Section */}
      <Card className="bg-zinc-950 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MdStar className="w-5 h-5" />
            {hasScored ? "Your Score" : "Score Project"}
          </CardTitle>
          {hasScored && (
            <div className="text-zinc-400">
              Submitted on {new Date(existingScore?.submittedAt).toLocaleDateString()}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Judging Criteria */}
          {scores.map((score, index) => (
            <div key={score.title} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">{score.title}</Label>
                <div className="text-zinc-300">
                  {score.score} / {score.maxScore}
                </div>
              </div>
              <Slider
                value={[score.score]}
                onValueChange={(value) => handleScoreChange(index, value)}
                max={score.maxScore}
                step={1}
                disabled={hasScored}
                className="w-full"
              />
            </div>
          ))}

          {/* Total Score */}
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Total Score</span>
              <span className="text-2xl font-bold text-white">
                {totalScore} / {maxTotalScore}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label className="text-white font-medium flex items-center gap-2">
              <MdFeedback className="w-4 h-4" />
              Feedback
            </Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback to help the team improve..."
              disabled={hasScored}
              className="bg-zinc-900 border-zinc-700 text-white min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          {!hasScored && (
            <Button
              onClick={handleSubmitScore}
              disabled={loading || scores.some(score => score.score === 0)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MdSend className="w-4 h-4" />
                  Submit Score
                </div>
              )}
            </Button>
          )}

          {hasScored && (
            <Alert className="bg-green-950/40 border-green-800/50">
              <MdCheck className="w-4 h-4" />
              <AlertDescription className="text-green-300">
                You have successfully scored this project. You can view but not modify your score.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectScoring;