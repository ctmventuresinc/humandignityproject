'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import { FaceDetectionCanvas } from '../components/FaceDetectionCanvas';
import { BoundingBoxStyle } from '../types/face-detection';

const textMessages = [
  "danger testing",
  "screenshot moment",
  "this is not an app",
  "you are not a rapper",
  "shipper is my pronoun",
  "you just came back from japan",
  "danger resting",
  "this is a conspiracy",
  "shipper energy"
];

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  
  // Bounding box style selector
  const boundingBoxStyle: BoundingBoxStyle = 'mogged'; // 'mogged' or 'default'

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 1280 },
            facingMode: 'user'
          },
          audio: false
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Failed to access camera. Please allow camera permissions.');
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);



  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        (prevIndex + 1) % textMessages.length
      );
    }, 3000);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.overlayText}>
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
          />
        </div>
      )}
    </div>
  );
}
