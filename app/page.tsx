"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { FaceDetectionCanvas } from "../components/FaceDetectionCanvas";
import { BoundingBoxStyle, DetectionMode } from "../types/face-detection";
import ChevronBadge from "../components/ChevronBadge";
import ModeToggle from "../components/ModeToggle";
import MobileWarning from "../components/MobileWarning";
import { useTimelineState } from "../hooks/useTimelineState";
import { TIMELINE_TIMINGS, TIMELINE_CONFIG } from "../config/timeline";

const textMessages = ["mogcam.com"];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [smileStatus, setSmileStatus] = useState<string>("no_faces");
  const [isDuoMode, setIsDuoMode] = useState<boolean>(false); // Default to singleplayer
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [currentFaceCount, setCurrentFaceCount] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Timeline state management
  const { timelineState, nextStep, resetTimeline } = useTimelineState();

  // Bounding box style selector based on timeline
  const boundingBoxStyle: BoundingBoxStyle = 
    timelineState.currentStep === 'waiting' || timelineState.currentStep.startsWith('countdown_') || timelineState.currentStep === 'scanning' || timelineState.currentStep === 'calculating'
      ? "default" 
      : timelineState.willBeMogging ? "mogging" : "mogged";

  // Detection mode based on toggle
  const detectionMode: DetectionMode = isDuoMode ? "duo" : "solo";

  // Button handler for manual progression
  const handleNextStep = () => {
    nextStep();
  };

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 1280 },
            facingMode: "user",
          },
          audio: false,
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Failed to access camera. Please allow camera permissions.");
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textMessages.length);
    }, 3000);

    return () => clearInterval(textInterval);
  }, []);

  // Listen for smile status changes
  useEffect(() => {
    const handleSmileStatusChange = (event: any) => {
      setSmileStatus(event.detail);
    };

    window.addEventListener("smileStatusChange", handleSmileStatusChange);

    return () => {
      window.removeEventListener("smileStatusChange", handleSmileStatusChange);
    };
  }, []);

  // Listen for face detection changes
  useEffect(() => {
    const handleFaceDetectionChange = (event: any) => {
      const detections = event.detail || [];
      const faceCount = detections.length;
      setCurrentFaceCount(faceCount);

      const hasDetections = faceCount > 0;
      if (hasDetections && !faceDetected) {
        setFaceDetected(true);
        // Start timeline when face first detected
        if (timelineState.currentStep === 'waiting') {
          nextStep(); // Move to countdown_3
        }
      } else if (!hasDetections && faceDetected) {
        setFaceDetected(false);
        resetTimeline(); // Reset to waiting when no faces
      }
    };

    window.addEventListener("faceDetectionChange", handleFaceDetectionChange);

    return () => {
      window.removeEventListener(
        "faceDetectionChange",
        handleFaceDetectionChange
      );
    };
  }, [faceDetected, timelineState.currentStep, nextStep, resetTimeline]);

  // Auto-advance timeline for continuous loop
  useEffect(() => {
    let timer: number;
    
    // Set timing for each step using config values
    switch (timelineState.currentStep) {
      case 'waiting':
        timer = window.setTimeout(nextStep, TIMELINE_TIMINGS.WAITING_DURATION);
        break;
      case 'countdown_3':
      case 'countdown_2': 
      case 'countdown_1':
        timer = window.setTimeout(nextStep, TIMELINE_TIMINGS.COUNTDOWN_DURATION);
        break;
      case 'scanning':
        timer = window.setTimeout(nextStep, TIMELINE_TIMINGS.SCANNING_DURATION);
        break;
      case 'calculating':
        timer = window.setTimeout(nextStep, TIMELINE_TIMINGS.CALCULATING_DURATION);
        break;
      case 'result_display':
        timer = window.setTimeout(nextStep, TIMELINE_TIMINGS.RESULT_DISPLAY_DURATION);
        break;
      case 'waiting_for_input':
        timer = window.setTimeout(nextStep, TIMELINE_TIMINGS.LOOP_PAUSE_DURATION);
        break;
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timelineState.currentStep, nextStep]);



  // Dynamically scale overlay text to fill screen width (uniform scaling)
  useEffect(() => {
    const updateScale = () => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      // Reset scale to 1 to measure natural width
      overlay.style.setProperty("--overlay-scale", "1");
      const parentWidth = window.innerWidth;
      const textWidth = overlay.scrollWidth;
      if (textWidth > 0) {
        const scale = parentWidth / textWidth;
        overlay.style.setProperty("--overlay-scale", scale.toString());
      }
    };

    updateScale(); // Initial run
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [currentTextIndex]);

  // Show mobile warning on mobile devices
  if (isMobile) {
    return <MobileWarning />;
  }

  return (
    <div className={styles.container}>
      {/* Top badges */}
      <div
        style={{
          position: "fixed",
          top: "0px",
          left: "0px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0px",
        }}
      >
        <div style={{ transform: "scale(0.85)" }}>
          <ChevronBadge label="LIVE" variant="cyan" size="small" />
        </div>
        {/* <div style={{ marginTop: '-20px' }}>
          <ChevronBadge label="菫色いさん" variant="magenta" size="large" />
        </div> */}
      </div>

      {/* Turtle link in top right */}
      <a
        href="https://dangertesting.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          top: "15px",
          right: "15px",
          zIndex: 1000,
        }}
      >
        <Image
          src="/mogturtle.png"
          alt="turtle"
          width={40}
          height={40}
          style={{
            transition: "opacity 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        />
      </a>

      <div
        ref={overlayRef}
        className={styles.overlayText}
        style={{ color: "#FFFF00" }}
      >
        {textMessages[currentTextIndex]}
      </div>
      {error ? (
        <div className={styles.error}>
          <p className={styles.errorTitle}>{error}</p>
          <p className={styles.errorSubtitle}>
            Please refresh the page and allow camera access
          </p>
        </div>
      ) : (
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
          />
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={1280}
            height={1280}
          />
          <FaceDetectionCanvas
            videoRef={videoRef}
            canvasRef={canvasRef}
            style={boundingBoxStyle}
            mode={detectionMode}
            face1State={"calculating"}
            face2State={"calculating"}
          />

          {/* Timeline controls - only show in debug mode */}
          {TIMELINE_CONFIG.DEBUG_MODE && (
            <div style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              color: "white",
              background: "rgba(0,0,0,0.7)",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "14px",
              zIndex: 15,
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <div>Step: <strong>{timelineState.currentStep}</strong></div>
              <button 
                onClick={handleNextStep}
                style={{
                  background: "#20C65F",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                NEXT STEP
              </button>
              <button 
                onClick={resetTimeline}
                style={{
                  background: "#FF073A",
                  color: "white", 
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                RESET
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode Toggle Component */}
      <ModeToggle isDuoMode={isDuoMode} onToggle={setIsDuoMode} />

      {/* Smile status at bottom of website */}
      {smileStatus === "smiling" && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#00FF00",
            fontSize: "24px",
            fontWeight: "bold",
            zIndex: 1000,
          }}
        >
          Smiling
        </div>
      )}
    </div>
  );
}
