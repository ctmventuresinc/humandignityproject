"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { FaceDetectionCanvas } from "../components/FaceDetectionCanvas";
import { BoundingBoxStyle, DetectionMode } from "../types/face-detection";
import ChevronBadge from "../components/ChevronBadge";

const textMessages = ["mogcam.com"];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [smileStatus, setSmileStatus] = useState<string>('no_faces');
  const [isDuoMode, setIsDuoMode] = useState<boolean>(false); // Default to singleplayer
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [moggingState, setMoggingState] = useState<'calculating' | 'mogging' | 'mogged'>('calculating');
  const [showOrangeFlash, setShowOrangeFlash] = useState<boolean>(false);
  const [showMoggedOverlay, setShowMoggedOverlay] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Bounding box style selector
  const boundingBoxStyle: BoundingBoxStyle = moggingState === 'calculating' ? 'default' : moggingState;

  // Detection mode based on toggle
  const detectionMode: DetectionMode = isDuoMode ? "duo" : "solo";

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
    
    window.addEventListener('smileStatusChange', handleSmileStatusChange);
    
    return () => {
      window.removeEventListener('smileStatusChange', handleSmileStatusChange);
    };
  }, []);

  // Listen for face detection changes
  useEffect(() => {
    const handleFaceDetectionChange = (event: any) => {
      const hasDetections = event.detail && event.detail.length > 0;
      if (hasDetections && !faceDetected) {
        setFaceDetected(true);
        
        // Start scanning line animation immediately when face detected
        window.localStorage.setItem('faceDetectionStarted', Date.now().toString());
        window.localStorage.setItem('currentlyScanning', 'false');
      }
    };
    
    window.addEventListener('faceDetectionChange', handleFaceDetectionChange);
    
    return () => {
      window.removeEventListener('faceDetectionChange', handleFaceDetectionChange);
    };
  }, [faceDetected]);

  // Listen for scan end events to switch state
  useEffect(() => {
    const handleScanEnd = () => {
      setMoggingState(prev => {
        const nextState = prev === 'calculating' ? 'mogging' : (prev === 'mogging' ? 'mogged' : 'mogging');
        
        // If switching to mogged, trigger orange flash and overlay
        if (nextState === 'mogged') {
          // First flash
          setShowOrangeFlash(true);
          setTimeout(() => setShowOrangeFlash(false), 100); // Flash for 100ms
          
          // Second flash
          setTimeout(() => {
            setShowOrangeFlash(true);
            setTimeout(() => setShowOrangeFlash(false), 100); // Flash for 100ms
          }, 150);
          
          // Start mogged graphic after both flashes
          setTimeout(() => {
            setShowMoggedOverlay(true);
            setTimeout(() => setShowMoggedOverlay(false), 1500); // Show overlay for 1.5 seconds
          }, 400);
        }
        
        return nextState;
      });
    };
    
    window.addEventListener('scanEnd', handleScanEnd);
    
    return () => {
      window.removeEventListener('scanEnd', handleScanEnd);
    };
  }, []);

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

  return (
    <div className={styles.container}>
      {/* Top badges */}
      <div style={{
        position: 'fixed',
        top: '15px',
        left: '15px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0px'
      }}>
        <div style={{ transform: 'scale(0.85)' }}>
          <ChevronBadge label="LIVE" variant="cyan" size="small" />
        </div>
        {/* <div style={{ marginTop: '-20px' }}>
          <ChevronBadge label="菫色いさん" variant="magenta" size="large" />
        </div> */}
      </div>
      

      
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
          />
          
          {/* Orange flash overlay */}
          {showOrangeFlash && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(254, 107, 0, 0.6)',
              pointerEvents: 'none',
              zIndex: 10
            }} />
          )}
          
          {/* Mogged overlay */}
          {showMoggedOverlay && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-15deg) scale(1.5)',
              zIndex: 20,
              pointerEvents: 'none',
              animation: 'moggedFlash 1.2s ease-in-out forwards'
            }}>
              <img 
                src="/mogged.png" 
                alt="MOGGED" 
                style={{
                  width: '350px',
                  height: 'auto',
                  filter: 'drop-shadow(0 0 25px #FF073A)'
                }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Singleplayer/Multiplayer Mode Toggle - Sticky bottom footer */}
      <div style={{
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        right: '0px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '20px',
        backgroundColor: 'transparent'
      }}>
        <span style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)',
          fontFamily: 'Arial, sans-serif'
        }}>
          Singleplayer
        </span>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isDuoMode}
            onChange={(e) => setIsDuoMode(e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '50px',
            height: '24px',
            backgroundColor: isDuoMode ? '#00FFFF' : '#006666',
            borderRadius: '25px',
            position: 'relative',
            transition: 'background-color 0.3s',
            border: '2px solid #00FFFF'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '1px',
              left: isDuoMode ? '28px' : '1px',
              transition: 'left 0.3s'
            }} />
          </div>
        </label>
        <span style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)',
          fontFamily: 'Arial, sans-serif'
        }}>
          Multiplayer
        </span>
      </div>
      
      {/* Smile status at bottom of website */}
      {smileStatus === 'smiling' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#00FF00',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Smiling
        </div>
      )}
    </div>
  );
}
