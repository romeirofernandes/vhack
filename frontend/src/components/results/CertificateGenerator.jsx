import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Download, Award, Trophy, Medal, Star } from "lucide-react";

const getPositionText = (position) => {
  if (position === 1) return "First Place";
  if (position === 2) return "Second Place";
  if (position === 3) return "Third Place";
  return "Participation";
};

const getPositionIcon = (position) => {
  if (position === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
  if (position === 2) return <Medal className="w-8 h-8 text-gray-400" />;
  if (position === 3) return <Medal className="w-8 h-8 text-orange-500" />;
  return <Star className="w-8 h-8 text-blue-500" />;
};

const CertificateGenerator = ({ hackathonId }) => {
  const { user } = useAuth();
  
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificateData();
  }, [hackathonId, user]);

  const fetchCertificateData = async () => {
    if (!hackathonId || !user) return;

    try {
      setLoading(true);
      const idToken = await user.getIdToken();

      // Get hackathon details
      const hackRes = await fetch(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const hackData = await hackRes.json();
      
      if (!hackData.success) {
        setError("Hackathon not found");
        return;
      }

      // Check if results should be published (auto-check date)
      const resultsPublished = hackData.data.resultsPublished || 
        (hackData.data.timelines?.resultsDate && 
         new Date() >= new Date(hackData.data.timelines.resultsDate));

      if (!resultsPublished) {
        setError("Results not published yet");
        return;
      }

      // Get user's team
      const teamRes = await fetch(
        `${import.meta.env.VITE_API_URL}/teams/hackathon/${hackathonId}/my`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const teamData = await teamRes.json();
      console.log("Team Data:", teamData);
      
      if (!teamData.success || !teamData.data) {
        setError("You are not registered for this hackathon");
        return;
      }

      // Get results to find user's position
      const resultsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/results/hackathon/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const resultsData = await resultsRes.json();
      console.log("Results Data:", resultsData);

      let position = null;
      if (resultsData.success && resultsData.results) {
        console.log("Looking for team ID:", teamData.data._id);
        console.log("Available results:", resultsData.results);
        
        const userResult = resultsData.results.find(result => {
          console.log("Checking result team ID:", result.team?._id, "vs", teamData.data._id);
          console.log("Checking result team name:", result.team?.name, "vs", teamData.data.name);
          
          return (
            result.team?._id === teamData.data._id ||
            result.team?._id?.toString() === teamData.data._id?.toString() ||
            result.team?.name === teamData.data.name
          );
        });
        
        console.log("Found user result:", userResult);
        
        if (userResult) {
          position = userResult.rank;
          console.log("User position:", position);
        }
      }

      setCertificateData({
        participantName: user.displayName || user.email,
        teamName: teamData.data.name,
        hackathonName: hackData.data.title,
        position: position,
        resultsDate: hackData.data.timelines?.resultsDate || new Date(),
      });

    } catch (error) {
      console.error("Error fetching certificate data:", error);
      setError("Failed to load certificate data");
    } finally {
      setLoading(false);
    }
  };

  const generatePDFCertificate = () => {
  if (!certificateData) return;

  try {
    // Create PDF in landscape orientation
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = [255, 215, 0]; // Gold
    const secondaryColor = [30, 58, 138]; // Blue
    const textColor = [17, 24, 39]; // Dark gray
    
    // Draw decorative border
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(3);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Inner border
    pdf.setLineWidth(1);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);
    
    // Header decorative elements
    pdf.setFillColor(...primaryColor);
    pdf.circle(30, 30, 5, 'F');
    pdf.circle(pageWidth - 30, 30, 5, 'F');
    pdf.circle(30, pageHeight - 30, 5, 'F');
    pdf.circle(pageWidth - 30, pageHeight - 30, 5, 'F');
    
    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(...secondaryColor);
    const certificateTitle = certificateData.position && certificateData.position <= 3 
      ? 'CERTIFICATE OF ACHIEVEMENT' 
      : 'CERTIFICATE OF PARTICIPATION';
    pdf.text(certificateTitle, pageWidth / 2, 50, { align: 'center' });
    
    // Decorative line under title
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(2);
    pdf.line(60, 55, pageWidth - 60, 55);
    
    // "This is to certify that"
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(...textColor);
    pdf.text('This is to certify that', pageWidth / 2, 75, { align: 'center' });
    
    // Participant name (highlighted)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor(...secondaryColor);
    pdf.text(certificateData.participantName, pageWidth / 2, 95, { align: 'center' });
    
    // Team info
    if (certificateData.teamName) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(...textColor);
      pdf.text(`as a member of team "${certificateData.teamName}"`, pageWidth / 2, 110, { align: 'center' });
    }
    
    // Achievement/Position
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    const positionColor = certificateData.position === 1 ? [255, 215, 0] : 
                         certificateData.position === 2 ? [192, 192, 192] :
                         certificateData.position === 3 ? [205, 127, 50] : 
                         [59, 130, 246];
    pdf.setTextColor(...positionColor);
    pdf.text(`has achieved ${getPositionText(certificateData.position)}`, pageWidth / 2, 130, { align: 'center' });
    
    // "in" text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(...textColor);
    pdf.text('in', pageWidth / 2, 145, { align: 'center' });
    
    // Hackathon name (highlighted)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(...secondaryColor);
    pdf.text(certificateData.hackathonName, pageWidth / 2, 165, { align: 'center' });
    
    // Date section
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(...textColor);
    pdf.text(`Date: ${currentDate}`, pageWidth / 2, pageHeight - 40, { align: 'center' });
    
    // Footer branding
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.text('vHack Platform', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    // Save the PDF
    const fileName = `${certificateData.participantName.replace(/\s+/g, '_')}_${certificateData.hackathonName.replace(/\s+/g, '_')}_certificate.pdf`;
    pdf.save(fileName);
    
    toast.success("Certificate downloaded successfully!");
  } catch (error) {
    console.error("Error generating certificate:", error);
    toast.error("Failed to generate certificate");
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent mx-auto mb-2"></div>
          <p className="text-white/70">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-400 bg-red-950/20 border border-red-800 rounded-lg p-4">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!certificateData) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Certificate Preview Card */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-8 shadow-xl max-w-2xl w-full">
        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            {getPositionIcon(certificateData.position)}
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800">
            Certificate of {certificateData.position && certificateData.position <= 3 ? "Achievement" : "Participation"}
          </h2>
          
          {/* Participant Info */}
          <div className="space-y-2">
            <p className="text-gray-600">This is proudly presented to</p>
            <p className="text-xl font-bold text-blue-700">{certificateData.participantName}</p>
            {certificateData.teamName && (
              <p className="text-gray-600">
                as a member of <span className="font-semibold text-blue-600">{certificateData.teamName}</span>
              </p>
            )}
          </div>
          
          {/* Achievement */}
          <div className="py-3">
            <p className={`text-lg font-bold ${
              certificateData.position === 1 ? 'text-yellow-600' :
              certificateData.position === 2 ? 'text-gray-500' :
              certificateData.position === 3 ? 'text-orange-500' :
              'text-blue-600'
            }`}>
              {getPositionText(certificateData.position)}
            </p>
          </div>
          
          {/* Hackathon */}
          <p className="text-gray-600">
            in <span className="font-semibold text-gray-800">{certificateData.hackathonName}</span>
          </p>
          
          {/* Date */}
          <p className="text-sm text-gray-500 pt-4">
            {new Date().toLocaleDateString()} • vHack Platform
          </p>
        </div>
      </div>
      
      {/* Download Button */}
      <button
        onClick={generatePDFCertificate}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
      >
        <Download className="w-5 h-5" />
        Download Certificate
      </button>
    </div>
  );
};

export default CertificateGenerator;