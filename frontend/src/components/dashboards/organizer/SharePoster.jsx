import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TbX, 
  TbDownload, 
  TbShare,
  TbQrcode,
  TbCopy,
  TbCheck,
  TbSparkles,
  TbCalendar,
  TbUsers,
  TbMapPin,
  TbClock,
  TbTrophy
} from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";

const SharePoster = ({ hackathon, isOpen, onClose }) => {
  const posterRef = useRef(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = hackathon ? `${window.location.origin}/participant/hackathon/${hackathon._id}` : '';

  useEffect(() => {
    if (isOpen && hackathon && hackathon._id) {
      generateQRCode();
    }
  }, [isOpen, hackathon]);

  const generateQRCode = async () => {
    if (!shareUrl) return;
    
    try {
      const qr = await QRCode.toDataURL(shareUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const downloadAsImage = async () => {
    if (!posterRef.current || !hackathon) return;
    
    setLoading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#0f0f23'
      });
      
      const link = document.createElement('a');
      link.download = `${hackathon.title.replace(/\s+/g, '_')}_poster.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Poster downloaded successfully!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Error downloading poster. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = async () => {
    if (!posterRef.current || !hackathon) return;
    
    setLoading(true);
    try {
      const imgData = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#0f0f23'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 150;
      const imgHeight = (800 * imgWidth) / 500;
      const x = (210 - imgWidth) / 2;
      const y = (297 - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${hackathon.title.replace(/\s+/g, '_')}_poster.pdf`);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) {
      toast.error('No link to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error copying link');
    }
  };

  if (!hackathon) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: '#09090b',
              borderRadius: '24px',
              maxWidth: '1400px',
              width: '100%',
              maxHeight: '95vh',
              overflowY: 'auto',
              border: '1px solid #1e293b',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '32px',
              borderBottom: '1px solid #1e293b',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0 
                }}>
                  Share Your Hackathon
                </h2>
                <p style={{ color: '#94a3b8', marginTop: '8px', margin: '8px 0 0 0', fontSize: '16px' }}>
                  Create a stunning poster to attract the best developers
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <TbX style={{ width: '24px', height: '24px' }} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 350px',
              gap: '32px',
              padding: '32px'
            }}>
              {/* Poster Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TbSparkles style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                    Poster Preview
                  </h3>
                </div>
                
                {/* Poster */}
                <div 
                  ref={posterRef}
                  style={{ 
                    width: '500px', 
                    height: 'auto',
                    backgroundColor: '#0f0f23',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.2)',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    position: 'relative'
                  }}
                >
                  {/* Decorative Elements */}
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(30px)'
                  }} />

                  {/* Header Section */}
                  <div 
                    style={{
                      position: 'relative',
                      height: '240px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                      overflow: 'hidden'
                    }}
                  >
                    {hackathon.bannerImageUrl && (
                      <img
                        src={hackathon.bannerImageUrl}
                        alt={hackathon.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.6,
                          mixBlendMode: 'overlay'
                        }}
                      />
                    )}
                    
                    {/* QR Code in top right */}
                    {qrCodeUrl && (
                      <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                      }}>
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            display: 'block'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Geometric patterns */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0.1,
                      background: `
                        radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 2px),
                        radial-gradient(circle at 80% 80%, #ffffff 1px, transparent 1px)
                      `,
                      backgroundSize: '30px 30px, 20px 20px'
                    }} />
                    
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(15,15,35,0.1) 0%, rgba(15,15,35,0.8) 100%)'
                      }}
                    />
                    
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <div 
                          style={{
                            padding: '12px 20px',
                            borderRadius: '20px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '700',
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                          }}
                        >
                          {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                        </div>
                      </div>
                      
                      <div>
                        <h1 
                          style={{
                            fontSize: '42px',
                            fontWeight: '900',
                            color: 'white',
                            lineHeight: '1.1',
                            margin: '0 0 12px 0',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            letterSpacing: '-1px'
                          }}
                        >
                          {hackathon.title}
                        </h1>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '24px',
                            background: 'linear-gradient(to bottom, #fbbf24, #f59e0b)',
                            borderRadius: '2px'
                          }} />
                          <p 
                            style={{
                              color: '#fef3c7',
                              fontWeight: '600',
                              fontSize: '18px',
                              margin: 0,
                              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                            }}
                          >
                            {hackathon.theme}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div style={{ padding: '28px', position: 'relative' }}>
                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                      <p 
                        style={{
                          color: '#cbd5e1',
                          fontSize: '15px',
                          lineHeight: '1.6',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontWeight: '400'
                        }}
                      >
                        {hackathon.description}
                      </p>
                    </div>

                    {/* Key Info Grid */}
                    <div 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '14px',
                        marginBottom: '20px'
                      }}
                    >
                      {/* Date */}
                      <div 
                        style={{
                          borderRadius: '16px',
                          padding: '18px',
                          background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          fontSize: '28px',
                          opacity: 0.2
                        }}>
                          📅
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <TbCalendar style={{ width: '16px', height: '16px', color: '#93c5fd' }} />
                          <span style={{ color: '#dbeafe', fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>
                            EVENT DATES
                          </span>
                        </div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                          {formatDate(hackathon.timelines.hackathonStart)}
                        </div>
                        <div style={{ color: '#93c5fd', fontSize: '11px', fontWeight: '500' }}>
                          to {formatDate(hackathon.timelines.hackathonEnd)}
                        </div>
                      </div>

                      {/* Team Size */}
                      <div 
                        style={{
                          borderRadius: '16px',
                          padding: '18px',
                          background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          fontSize: '28px',
                          opacity: 0.2
                        }}>
                          👥
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <TbUsers style={{ width: '16px', height: '16px', color: '#6ee7b7' }} />
                          <span style={{ color: '#d1fae5', fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>
                            TEAM SIZE
                          </span>
                        </div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                          {hackathon.teamSettings.minTeamSize} - {hackathon.teamSettings.maxTeamSize} members
                        </div>
                        <div style={{ color: '#6ee7b7', fontSize: '11px', fontWeight: '500' }}>
                          {hackathon.teamSettings.allowSolo ? 'Solo participation allowed' : 'Teams required'}
                        </div>
                      </div>

                      {/* Location */}
                      <div 
                        style={{
                          borderRadius: '16px',
                          padding: '18px',
                          background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
                          border: '1px solid rgba(251, 146, 60, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          fontSize: '28px',
                          opacity: 0.2
                        }}>
                          📍
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <TbMapPin style={{ width: '16px', height: '16px', color: '#fed7aa' }} />
                          <span style={{ color: '#fed7aa', fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>
                            LOCATION
                          </span>
                        </div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                          {hackathon.location || 'Virtual Event'}
                        </div>
                      </div>

                      {/* Registration */}
                      <div 
                        style={{
                          borderRadius: '16px',
                          padding: '18px',
                          background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
                          border: '1px solid rgba(244, 114, 182, 0.3)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          fontSize: '28px',
                          opacity: 0.2
                        }}>
                          ⏰
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <TbClock style={{ width: '16px', height: '16px', color: '#fce7f3' }} />
                          <span style={{ color: '#fce7f3', fontWeight: '700', fontSize: '11px', letterSpacing: '1px' }}>
                            REGISTER BY
                          </span>
                        </div>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>
                          {formatDate(hackathon.timelines.registrationEnd)}
                        </div>
                      </div>
                    </div>

                    {/* Prizes */}
                    {hackathon.prizes && (hackathon.prizes.firstPrize || hackathon.prizes.secondPrize || hackathon.prizes.thirdPrize) && (
                      <div 
                        style={{
                          borderRadius: '18px',
                          padding: '20px',
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                          border: '2px solid #fcd34d',
                          marginBottom: '20px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)'
                        }}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            fontSize: '60px',
                            opacity: 0.1,
                            transform: 'rotate(15deg)'
                          }}
                        >
                          🏆
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                          <TbTrophy style={{ width: '20px', height: '20px', color: '#92400e' }} />
                          <span style={{ color: '#92400e', fontWeight: '900', fontSize: '14px', letterSpacing: '2px' }}>
                            PRIZE POOL
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                          {hackathon.prizes.firstPrize && (
                            <div style={{ 
                              background: 'rgba(255, 255, 255, 0.3)', 
                              padding: '10px', 
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '18px', marginBottom: '3px' }}>🥇</div>
                              <div style={{ color: '#92400e', fontWeight: '800', fontSize: '11px' }}>
                                {hackathon.prizes.firstPrize}
                              </div>
                            </div>
                          )}
                          {hackathon.prizes.secondPrize && (
                            <div style={{ 
                              background: 'rgba(255, 255, 255, 0.3)', 
                              padding: '10px', 
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '18px', marginBottom: '3px' }}>🥈</div>
                              <div style={{ color: '#92400e', fontWeight: '800', fontSize: '11px' }}>
                                {hackathon.prizes.secondPrize}
                              </div>
                            </div>
                          )}
                          {hackathon.prizes.thirdPrize && (
                            <div style={{ 
                              background: 'rgba(255, 255, 255, 0.3)', 
                              padding: '10px', 
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.4)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '18px', marginBottom: '3px' }}>🥉</div>
                              <div style={{ color: '#92400e', fontWeight: '800', fontSize: '11px' }}>
                                {hackathon.prizes.thirdPrize}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Registration Call to Action */}
                    <div 
                      style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderRadius: '18px',
                        padding: '20px',
                        border: '2px solid #cbd5e1',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        padding: '8px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <TbQrcode style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontWeight: '800', fontSize: '14px', letterSpacing: '1px' }}>
                          REGISTER NOW
                        </span>
                      </div>
                      
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '13px', 
                        margin: '0 0 10px 0',
                        fontWeight: '500',
                        lineHeight: '1.4'
                      }}>
                        Scan the QR code above or visit the link below to join!
                      </p>
                      
                      <div style={{
                        background: '#f1f5f9',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1'
                      }}>
                        <p 
                          style={{
                            color: '#334155',
                            fontFamily: 'monospace',
                            fontSize: '10px',
                            wordBreak: 'break-all',
                            margin: 0,
                            fontWeight: '600'
                          }}
                        >
                          {shareUrl.replace('http://', '').replace('https://', '')}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div 
                      style={{
                        textAlign: 'center',
                        paddingTop: '20px',
                        marginTop: '20px',
                        borderTop: '2px solid #1e293b'
                      }}
                    >
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '13px', 
                        margin: '0 0 6px 0',
                        fontWeight: '500'
                      }}>
                        Organized by {hackathon.organizerName || 'Anonymous'}
                      </p>
                      <p style={{ 
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '14px', 
                        margin: 0,
                        fontWeight: '800',
                        letterSpacing: '1px'
                      }}>
                        JOIN THE INNOVATION REVOLUTION 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Share Options
                  </h3>
                  
                  {/* Share Link */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #475569',
                    marginBottom: '20px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <TbQrcode style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                      <span style={{ color: '#3b82f6', fontWeight: '700', fontSize: '16px' }}>Registration Link</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        style={{
                          flex: 1,
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          color: 'white',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Button
                        onClick={copyLink}
                        style={{
                          background: copied ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {copied ? <TbCheck style={{ width: '18px', height: '18px' }} /> : <TbCopy style={{ width: '18px', height: '18px' }} />}
                      </Button>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: '1.4' }}>
                      Share this link for participants to register and join teams
                    </p>
                  </div>

                  {/* Download Options */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #475569',
                    marginBottom: '20px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <TbDownload style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                      <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '16px' }}>Download Poster</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Button
                        onClick={downloadAsImage}
                        disabled={loading}
                        style={{
                          background: loading ? '#374151' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Loading...' : 'PNG'}
                      </Button>
                      <Button
                        onClick={downloadAsPDF}
                        disabled={loading}
                        style={{
                          background: loading ? '#374151' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? 'Loading...' : 'PDF'}
                      </Button>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px', margin: '12px 0 0 0', lineHeight: '1.4' }}>
                      High-quality downloads perfect for social media and print
                    </p>
                  </div>

                  {/* Social Share */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #475569',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <TbShare style={{ width: '20px', height: '20px', color: '#eab308' }} />
                      <span style={{ color: '#eab308', fontWeight: '700', fontSize: '16px' }}>Social Media</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      <button
                        onClick={() => {
                          const text = `🚀 Join ${hackathon.title} - ${hackathon.theme} hackathon!\n\n🎯 Amazing prizes await\n🤝 Build something incredible\n\nRegister: ${shareUrl}`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #1da1f2, #0d91e0)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => {
                          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #0077b5, #005885)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Share on LinkedIn
                      </button>
                      <button
                        onClick={() => {
                          const text = `🚀 Join ${hackathon.title} hackathon!\n\n${hackathon.theme}\n\nRegister now: ${shareUrl}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #25d366, #1ebe57)',
                          border: 'none',
                          color: 'white',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Share on WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SharePoster;