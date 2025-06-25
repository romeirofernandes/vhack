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
  TbTrophy,
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

  const shareUrl = hackathon
    ? `${window.location.origin}/participant/hackathon/${hackathon._id}`
    : "";

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
          dark: "#1e1b4b",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrCodeUrl(qr);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const downloadAsImage = async () => {
    if (!posterRef.current || !hackathon) return;

    setLoading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#09090b",
      });

      const link = document.createElement("a");
      link.download = `${hackathon.title.replace(/\s+/g, "_")}_poster.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Poster downloaded successfully!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Error downloading poster. Try again.");
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
        backgroundColor: "#0f0f23",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 150;
      const imgHeight = (800 * imgWidth) / 500;
      const x = (210 - imgWidth) / 2;
      const y = (297 - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`${hackathon.title.replace(/\s+/g, "_")}_poster.pdf`);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Error downloading PDF. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) {
      toast.error("No link to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error copying link");
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
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(8px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-950 rounded-2xl max-w-[1400px] w-full max-h-[95vh] overflow-y-auto border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-6 border-b border-white/10 bg-white/5"
            >
              <div>
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
                >
                  Share Your Hackathon
                </h2>
              </div>
              <button
                onClick={onClose}
                className="bg-white/10 border border-white/20 text-white cursor-pointer p-3 rounded-lg hover:bg-white/20 transition"
              >
                <TbX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 px-4 sm:px-8 py-6"
            >
              {/* Poster Preview */}
              <div className="flex flex-col items-center gap-6"
              >
                {/* Poster */}
                <div
                  ref={posterRef}
                  className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative"
                >
                  {/* Decorative Elements */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-50px",
                      right: "-50px",
                      width: "200px",
                      height: "200px",
                      background:
                        "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.1) 50%, transparent 70%)",
                      borderRadius: "50%",
                      filter: "blur(40px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-30px",
                      left: "-30px",
                      width: "150px",
                      height: "150px",
                      background:
                        "radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 50%, transparent 70%)",
                      borderRadius: "50%",
                      filter: "blur(30px)",
                    }}
                  />

                  {/* Header Section */}
                  <div
                    style={{
                      position: "relative",
                      height: "240px",
                      background:
                        "linear-gradient(135deg, #0f172a 0%, #1e293b 20%, #0369a1 40%, #0891b2 60%, #059669 80%, #10b981 100%)",
                      overflow: "hidden",
                    }}
                  >
                    {hackathon.bannerImageUrl && (
                      <img
                        src={hackathon.bannerImageUrl}
                        alt={hackathon.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: 0.4,
                          mixBlendMode: "overlay",
                        }}
                      />
                    )}

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div
                        style={{
                          position: "absolute",
                          top: "20px",
                          right: "20px",
                          padding: "12px",
                          background: "rgba(255, 255, 255, 0.96)",
                          borderRadius: "18px",
                          border: "2px solid rgba(6, 182, 212, 0.2)",
                          boxShadow:
                            "0 8px 25px rgba(6, 182, 212, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "10px",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(to bottom, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.7) 100%)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: "32px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 20px",
                            borderRadius: "20px",
                            color: "white",
                            fontSize: "14px",
                            fontWeight: "700",
                            background:
                              "linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(34, 197, 94, 0.3))",
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            boxShadow: "0 4px 15px rgba(6, 182, 212, 0.2)",
                          }}
                        >
                          {hackathon.status.charAt(0).toUpperCase() +
                            hackathon.status.slice(1)}
                        </div>
                      </div>

                      <div>
                        <h1
                          style={{
                            fontSize: "42px",
                            fontWeight: "900",
                            background:
                              "linear-gradient(135deg, #ffffff 0%, #e0f2fe 50%, #b3f3ff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            lineHeight: "1.1",
                            margin: "0 0 12px 0",
                            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                            letterSpacing: "-1px",
                          }}
                        >
                          {hackathon.title}
                        </h1>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "4px",
                              height: "24px",
                              background:
                                "linear-gradient(to bottom, #06b6d4, #10b981)",
                              borderRadius: "2px",
                              boxShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
                            }}
                          />
                          <p
                            style={{
                              background:
                                "linear-gradient(135deg, #a7f3d0 0%, #bfdbfe 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              fontWeight: "600",
                              fontSize: "18px",
                              margin: 0,
                              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                            }}
                          >
                            {hackathon.theme}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div style={{ padding: "28px", position: "relative" }}>
                    {/* Description */}
                    <div style={{ marginBottom: "20px" }}>
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: "15px",
                          lineHeight: "1.6",
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontWeight: "400",
                        }}
                      >
                        {hackathon.description}
                      </p>
                    </div>

                    {/* Key Info Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        marginBottom: "20px",
                      }}
                    >
                      {/* Date */}
                      <div
                        style={{
                          borderRadius: "16px",
                          padding: "18px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "1px",
                            fontSize: "28px",
                            opacity: 0.5,
                          }}
                        >
                          📅
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <TbCalendar
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#d1d5db",
                            }}
                          />
                          <span
                            style={{
                              color: "#f3f4f6",
                              fontWeight: "700",
                              fontSize: "11px",
                              letterSpacing: "1px",
                            }}
                          >
                            EVENT DATES
                          </span>
                        </div>
                        <div
                          style={{
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          {formatDate(hackathon.timelines.hackathonStart)}
                        </div>
                        <div
                          style={{
                            color: "#d1d5db",
                            fontSize: "11px",
                            fontWeight: "500",
                          }}
                        >
                          to {formatDate(hackathon.timelines.hackathonEnd)}
                        </div>
                      </div>

                      {/* Team Size */}
                      <div
                        style={{
                          borderRadius: "16px",
                          padding: "18px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-1px",
                            fontSize: "28px",
                            opacity: 0.5,
                          }}
                        >
                          👥
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <TbUsers
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#d1d5db",
                            }}
                          />
                          <span
                            style={{
                              color: "#f3f4f6",
                              fontWeight: "700",
                              fontSize: "11px",
                              letterSpacing: "1px",
                            }}
                          >
                            TEAM SIZE
                          </span>
                        </div>
                        <div
                          style={{
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          {hackathon.teamSettings.minTeamSize} -{" "}
                          {hackathon.teamSettings.maxTeamSize} members
                        </div>
                        <div
                          style={{
                            color: "#d1d5db",
                            fontSize: "11px",
                            fontWeight: "500",
                          }}
                        >
                          {hackathon.teamSettings.allowSolo
                            ? "Solo participation allowed"
                            : "Teams required"}
                        </div>
                      </div>

                      {/* Location */}
                      <div
                        style={{
                          borderRadius: "16px",
                          padding: "18px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-4px",
                            fontSize: "28px",
                            opacity: 0.5,
                          }}
                        >
                          📍
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <TbMapPin
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#d1d5db",
                            }}
                          />
                          <span
                            style={{
                              color: "#f3f4f6",
                              fontWeight: "700",
                              fontSize: "11px",
                              letterSpacing: "1px",
                            }}
                          >
                            LOCATION
                          </span>
                        </div>
                        <div
                          style={{
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          {hackathon.location || "Virtual Event"}
                        </div>
                      </div>

                      {/* Registration */}
                      <div
                        style={{
                          borderRadius: "16px",
                          padding: "18px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            fontSize: "28px",
                            opacity: 0.5,
                          }}
                        >
                          ⏰
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "10px",
                          }}
                        >
                          <TbClock
                            style={{
                              width: "16px",
                              height: "16px",
                              color: "#d1d5db",
                            }}
                          />
                          <span
                            style={{
                              color: "#f3f4f6",
                              fontWeight: "700",
                              fontSize: "11px",
                              letterSpacing: "1px",
                            }}
                          >
                            REGISTER BY
                          </span>
                        </div>
                        <div
                          style={{
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "700",
                          }}
                        >
                          {formatDate(hackathon.timelines.registrationEnd)}
                        </div>
                      </div>
                    </div>

                    {/* Prizes */}
                    {hackathon.prizes &&
                      (hackathon.prizes.firstPrize ||
                        hackathon.prizes.secondPrize ||
                        hackathon.prizes.thirdPrize) && (
                        <div
                          style={{
                            borderRadius: "18px",
                            padding: "20px",
                            background:
                              "linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
                            border: "2px solid rgba(251, 191, 36, 0.2)",
                            marginBottom: "20px",
                            position: "relative",
                            overflow: "hidden",
                            boxShadow: "0 8px 25px rgba(251, 191, 36, 0.1)",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "-15px",
                              right: "-15px",
                              fontSize: "60px",
                              opacity: 0.5,
                              transform: "rotate(15deg)",
                            }}
                          >
                            🏆
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              marginBottom: "14px",
                            }}
                          >
                            <TbTrophy
                              style={{
                                width: "20px",
                                height: "20px",
                                color: "#fbbf24",
                              }}
                            />
                            <span
                              style={{
                                color: "#fbbf24",
                                fontWeight: "900",
                                fontSize: "14px",
                                letterSpacing: "2px",
                              }}
                            >
                              PRIZE POOL
                            </span>
                          </div>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(120px, 1fr))",
                              gap: "10px",
                            }}
                          >
                            {hackathon.prizes.firstPrize && (
                              <div
                                style={{
                                  background: "rgba(251, 191, 36, 0.2)",
                                  padding: "10px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(251, 191, 36, 0.3)",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "18px",
                                    marginBottom: "3px",
                                  }}
                                >
                                  🥇
                                </div>
                                <div
                                  style={{
                                    color: "#fbbf24",
                                    fontWeight: "800",
                                    fontSize: "11px",
                                  }}
                                >
                                  {hackathon.prizes.firstPrize}
                                </div>
                              </div>
                            )}
                            {hackathon.prizes.secondPrize && (
                              <div
                                style={{
                                  background: "rgba(251, 191, 36, 0.2)",
                                  padding: "10px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(251, 191, 36, 0.3)",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "18px",
                                    marginBottom: "3px",
                                  }}
                                >
                                  🥈
                                </div>
                                <div
                                  style={{
                                    color: "#fbbf24",
                                    fontWeight: "800",
                                    fontSize: "11px",
                                  }}
                                >
                                  {hackathon.prizes.secondPrize}
                                </div>
                              </div>
                            )}
                            {hackathon.prizes.thirdPrize && (
                              <div
                                style={{
                                  background: "rgba(251, 191, 36, 0.2)",
                                  padding: "10px",
                                  borderRadius: "10px",
                                  border: "1px solid rgba(251, 191, 36, 0.3)",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "18px",
                                    marginBottom: "3px",
                                  }}
                                >
                                  🥉
                                </div>
                                <div
                                  style={{
                                    color: "#fbbf24",
                                    fontWeight: "800",
                                    fontSize: "11px",
                                  }}
                                >
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
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
                        borderRadius: "18px",
                        padding: "20px",
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          borderRadius: "10px",
                          background:
                            "linear-gradient(135deg, #18181b, #27272a)",
                          color: "white",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        <TbQrcode style={{ width: "18px", height: "18px" }} />
                        <span
                          style={{
                            fontWeight: "800",
                            fontSize: "14px",
                            letterSpacing: "1px",
                          }}
                        >
                          REGISTER NOW
                        </span>
                      </div>

                      <p
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                          margin: "0 0 10px 0",
                          fontWeight: "500",
                          lineHeight: "1.4",
                        }}
                      >
                        Scan the QR code above or visit the link below to join!
                      </p>

                      <div
                        style={{
                          background: "rgba(24, 24, 27, 0.5)",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <p
                          style={{
                            color: "#d1d5db",
                            fontFamily: "monospace",
                            fontSize: "10px",
                            wordBreak: "break-all",
                            margin: 0,
                            fontWeight: "600",
                          }}
                        >
                          {shareUrl
                            .replace("http://", "")
                            .replace("https://", "")}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      style={{
                        textAlign: "center",
                        paddingTop: "20px",
                        marginTop: "20px",
                        borderTop: "2px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: "13px",
                          margin: "0 0 6px 0",
                          fontWeight: "500",
                        }}
                      >
                        Organized by {hackathon.organizerName || "Anonymous"}
                      </p>
                      <p
                        style={{
                          background:
                            "linear-gradient(to right, white, #d1d5db)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "14px",
                          margin: 0,
                          fontWeight: "800",
                          letterSpacing: "1px",
                        }}
                      >
                        JOIN THE INNOVATION REVOLUTION 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Panel */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "white",
                      marginBottom: "20px",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Share Options
                  </h3>

                  {/* Share Link */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      marginBottom: "20px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <TbQrcode
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "white",
                        }}
                      />
                      <span
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: "16px",
                        }}
                      >
                        Registration Link
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        style={{
                          flex: 1,
                          backgroundColor: "rgba(24, 24, 27, 0.8)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          color: "white",
                          fontSize: "14px",
                          fontFamily: "monospace",
                        }}
                      />
                      <Button
                        onClick={copyLink}
                        style={{
                          background: copied
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(255, 255, 255, 0.1)",
                          color: "white",
                          border: `1px solid ${
                            copied
                              ? "rgba(34, 197, 94, 0.3)"
                              : "rgba(255, 255, 255, 0.2)"
                          }`,
                          borderRadius: "12px",
                          padding: "12px 16px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {copied ? (
                          <TbCheck style={{ width: "18px", height: "18px" }} />
                        ) : (
                          <TbCopy style={{ width: "18px", height: "18px" }} />
                        )}
                      </Button>
                    </div>
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: "13px",
                        margin: 0,
                        lineHeight: "1.4",
                      }}
                    >
                      Share this link for participants to register and join
                      teams
                    </p>
                  </div>

                  {/* Download Options */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      marginBottom: "20px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <TbDownload
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "white",
                        }}
                      />
                      <span
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: "16px",
                        }}
                      >
                        Download Poster
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <Button
                        onClick={downloadAsImage}
                        disabled={loading}
                        style={{
                          background: loading
                            ? "#374151"
                            : "rgba(255, 255, 255, 0.1)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "700",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? "Loading..." : "PNG"}
                      </Button>
                      <Button
                        onClick={downloadAsPDF}
                        disabled={loading}
                        style={{
                          background: loading
                            ? "#374151"
                            : "rgba(255, 255, 255, 0.1)",
                          color: "white",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "12px",
                          padding: "16px",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          fontWeight: "700",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? "Loading..." : "PDF"}
                      </Button>
                    </div>
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: "13px",
                        marginTop: "12px",
                        margin: "12px 0 0 0",
                        lineHeight: "1.4",
                      }}
                    >
                      High-quality downloads perfect for social media and print
                    </p>
                  </div>

                  {/* Social Share */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <TbShare
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "white",
                        }}
                      />
                      <span
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: "16px",
                        }}
                      >
                        Social Media
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "12px",
                      }}
                    >
                      <button
                        onClick={() => {
                          const text = `🚀 Join ${hackathon.title} - ${hackathon.theme} hackathon!\n\n🎯 Amazing prizes await\n🤝 Build something incredible\n\nRegister: ${shareUrl}`;
                          window.open(
                            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                              text
                            )}`,
                            "_blank"
                          );
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, #1d9bf0, #1a8cd8)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "700",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => {
                          window.open(
                            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                              shareUrl
                            )}`,
                            "_blank"
                          );
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, #0077b5, #005885)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "700",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Share on LinkedIn
                      </button>
                      <button
                        onClick={() => {
                          const text = `🚀 Join ${hackathon.title} hackathon!\n\n${hackathon.theme}\n\nRegister now: ${shareUrl}`;
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(text)}`,
                            "_blank"
                          );
                        }}
                        style={{
                          background:
                            "linear-gradient(135deg, #25d366, #1aab5c)",
                          border: "none",
                          color: "white",
                          borderRadius: "12px",
                          padding: "12px 16px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "700",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Share on WhatsApp
                      </button>
                    </div>
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: "13px",
                        marginTop: "12px",
                        margin: "12px 0 0 0",
                        lineHeight: "1.4",
                      }}
                    >
                      Share on your favorite platforms to reach more developers
                    </p>
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
