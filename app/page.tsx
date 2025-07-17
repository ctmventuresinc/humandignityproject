"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { FaceDetectionCanvas } from "../components/FaceDetectionCanvas";
import { BoundingBoxStyle, DetectionMode } from "../types/face-detection";
import ChevronBadge from "../components/ChevronBadge";
import ModeToggle from "../components/ModeToggle";
import MobileWarning from "../components/MobileWarning";

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
  const [moggingState, setMoggingState] = useState<
    "calculating" | "mogging" | "mogged"
  >("calculating");
  const [face1State, setFace1State] = useState<
    "calculating" | "mogging" | "mogged"
  >("calculating");
  const [face2State, setFace2State] = useState<
    "calculating" | "mogging" | "mogged"
  >("calculating");
  const [showOrangeFlash, setShowOrangeFlash] = useState<boolean>(false);
  const [showMoggedOverlay, setShowMoggedOverlay] = useState<boolean>(false);
  const [showGreenFlash, setShowGreenFlash] = useState<boolean>(false);
  const [showMoggingOverlay, setShowMoggingOverlay] = useState<boolean>(false);
  const [currentFaceCount, setCurrentFaceCount] = useState<number>(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Keep track of previous state and any active timers so we can cancel them
  const prevMoggingStateRef = useRef<"calculating" | "mogging" | "mogged">(
    moggingState
  );
  const effectTimersRef = useRef<number[]>([]);

  // Helper to clear all scheduled timers in our effect sequence
  const clearEffectTimers = () => {
    effectTimersRef.current.forEach((id) => clearTimeout(id));
    effectTimersRef.current = [];
  };

  // Bounding box style selector
  const boundingBoxStyle: BoundingBoxStyle =
    moggingState === "calculating" ? "default" : moggingState;

  // Detection mode based on toggle
  const detectionMode: DetectionMode = isDuoMode ? "duo" : "solo";

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

        // Start scanning line animation immediately when face detected
        window.localStorage.setItem(
          "faceDetectionStarted",
          Date.now().toString()
        );
        window.localStorage.setItem("currentlyScanning", "false");
      }
    };

    window.addEventListener("faceDetectionChange", handleFaceDetectionChange);

    return () => {
      window.removeEventListener(
        "faceDetectionChange",
        handleFaceDetectionChange
      );
    };
  }, [faceDetected]);

  // Listen for scan end events to switch state
  useEffect(() => {
    const handleScanEnd = () => {
      // Only change states if faces are actually detected
      if (currentFaceCount === 0) return;
      
      if (isDuoMode) {
        // Only proceed if we have 2 faces in duo mode
        if (currentFaceCount < 2) return;
        // Handle duo mode - only one face can be mogging, the other must be mogged
        // 50% chance determines which face gets to be mogging
        const face1GetsMogging = Math.random() < 0.5;
        
        setFace1State((prev) => {
          if (prev === "calculating") {
            return "mogged"; // Always start with mogged after calculating
          } else {
            return face1GetsMogging ? "mogging" : "mogged";
          }
        });

        setFace2State((prev) => {
          if (prev === "calculating") {
            return "mogging"; // Start with mogging for face 2
          } else {
            return face1GetsMogging ? "mogged" : "mogging";
          }
        });
      } else {
        // Handle single player mode - only proceed if we have exactly 1 face
        if (currentFaceCount !== 1) return;
        
        setMoggingState((prev) => {
          let nextState: "calculating" | "mogging" | "mogged";

          if (prev === "calculating") {
            nextState = "mogged"; // Always start with mogged after calculating
          } else {
            // Randomly choose between mogging and mogged. Same-state transitions are allowed.
            nextState = Math.random() < 0.5 ? "mogging" : "mogged";
          }

          return nextState;
        });
      }
    };

    window.addEventListener("scanEnd", handleScanEnd);

    return () => {
      window.removeEventListener("scanEnd", handleScanEnd);
    };
  }, [isDuoMode, currentFaceCount]);

  // ------------------------------------------------------------
  // Effect handler: run flashes/graphic when moggingState changes
  // ------------------------------------------------------------
  useEffect(() => {
    const previous = prevMoggingStateRef.current;

    // Only react if the state actually changed
    if (moggingState === previous) return;

    // Update previous state reference for next run
    prevMoggingStateRef.current = moggingState;

    // Clear any previous timers and hide all overlays/flash states
    clearEffectTimers();
    setShowOrangeFlash(false);
    setShowGreenFlash(false);
    setShowMoggedOverlay(false);
    setShowMoggingOverlay(false);

    const timers: number[] = [];

    if (moggingState === "mogged") {
      // ORANGE flash + red overlay
      setShowOrangeFlash(true);
      timers.push(window.setTimeout(() => setShowOrangeFlash(false), 100));

      timers.push(
        window.setTimeout(() => {
          setShowOrangeFlash(true);
          timers.push(window.setTimeout(() => setShowOrangeFlash(false), 100));
        }, 150)
      );

      timers.push(
        window.setTimeout(() => {
          setShowMoggedOverlay(true);
          timers.push(
            window.setTimeout(() => setShowMoggedOverlay(false), 1500)
          );
        }, 400)
      );
    } else if (moggingState === "mogging") {
      // GREEN flash + green overlay
      setShowGreenFlash(true);
      timers.push(window.setTimeout(() => setShowGreenFlash(false), 100));

      timers.push(
        window.setTimeout(() => {
          setShowGreenFlash(true);
          timers.push(window.setTimeout(() => setShowGreenFlash(false), 100));
        }, 150)
      );

      timers.push(
        window.setTimeout(() => {
          setShowMoggingOverlay(true);
          timers.push(
            window.setTimeout(() => setShowMoggingOverlay(false), 1500)
          );
        }, 400)
      );
    }

    effectTimersRef.current = timers;

    // Cleanup when effect re-runs or component unmounts
    return () => {
      clearEffectTimers();
      setShowOrangeFlash(false);
      setShowGreenFlash(false);
      setShowMoggedOverlay(false);
      setShowMoggingOverlay(false);
    };
  }, [moggingState]);

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
            face1State={face1State}
            face2State={face2State}
          />

          {/* Orange flash overlay */}
          {showOrangeFlash && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(254, 107, 0, 0.6)",
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          )}

          {/* Green flash overlay */}
          {showGreenFlash && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(32, 201, 95, 0.6)", // Green
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          )}

          {/* Mogged overlay */}
          {showMoggedOverlay && (
          <div
          style={{
          position: "absolute",
          top: "50%",
          left: "calc(50% - 100px)",
          transform: "translate(-50%, -50%) rotate(-15deg) scale(1.5)",
                zIndex: 20,
                pointerEvents: "none",
                animation: "moggedFlash 1.2s ease-in-out forwards",
              }}
            >
              <img
                src="/mogged.png"
                alt="MOGGED"
                style={{
                  width: "350px",
                  height: "auto",
                  filter: "drop-shadow(0 0 25px #FF073A)",
                }}
              />
            </div>
          )}

          {/* Mogging overlay */}
          {showMoggingOverlay && (
          <div
          style={{
          position: "absolute",
          top: "50%",
          left: "calc(50% - 100px)",
          transform: "translate(-50%, -50%) rotate(-15deg) scale(1.5)",
                zIndex: 20,
                pointerEvents: "none",
                animation: "moggedFlash 1.2s ease-in-out forwards",
              }}
            >
              <img
                src="/mogging.png"
                alt="MOGGING"
                style={{
                  width: "350px",
                  height: "auto",
                  filter: "drop-shadow(0 0 25px #20C95F)",
                }}
              />
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
