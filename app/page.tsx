"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { FaceDetectionCanvas } from "../components/FaceDetectionCanvas";
import { BoundingBoxStyle, DetectionMode } from "../types/face-detection";

const textMessages = ["mogcam.com"];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [smileStatus, setSmileStatus] = useState<string>('no_faces');
  const [isDuoMode, setIsDuoMode] = useState<boolean>(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Bounding box style selector
  const boundingBoxStyle: BoundingBoxStyle = "mogging"; // 'default', 'mogged', 'mogging', or 'spotlight'

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
      {/* Duo/Solo Mode Toggle */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 15px',
        borderRadius: '25px',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        <span>Duo Mode</span>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isDuoMode}
            onChange={(e) => setIsDuoMode(e.target.checked)}
            style={{ display: 'none' }}
          />
          <div style={{
            width: '50px',
            height: '25px',
            backgroundColor: isDuoMode ? '#00FF00' : '#FF0000',
            borderRadius: '25px',
            position: 'relative',
            transition: 'background-color 0.3s'
          }}>
            <div style={{
              width: '21px',
              height: '21px',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: isDuoMode ? '27px' : '2px',
              transition: 'left 0.3s'
            }} />
          </div>
        </label>
      </div>
      
      <div
        ref={overlayRef}
        className={styles.overlayText}
        style={{ color: "#FFF" }}
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
        </div>
      )}
      
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
      
      {smileStatus === 'not_smiling' && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FF0000',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          Not smiling
        </div>
      )}
    </div>
  );
}
