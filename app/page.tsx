'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';
import * as faceapi from 'face-api.js';

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
  const boundingBoxStyle = 'mogged'; // 'mogged' or 'default'

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

  // Real face detection with face-api.js
  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let isModelLoaded = false;
    let animationId: number;

    const loadModels = async () => {
      try {
        console.log('Loading face detection models...');
        
        // Load face detection model
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        
        isModelLoaded = true;
        console.log('Face detection models loaded successfully');
        startDetection();
      } catch (error) {
        console.log('Failed to load models, using fallback:', error);
        startFallbackDetection();
      }
    };

    const startDetection = () => {
      const detectFaces = async () => {
        if (!video || !ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
          animationId = requestAnimationFrame(detectFaces);
          return;
        }

        try {
          // Detect faces
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (detections.length > 0) {
            // Draw bounding box around first detected face
            const detection = detections[0];
            const box = detection.box;
            
            // Scale coordinates to canvas size
            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;
            
            const scaledX = box.x * scaleX;
            const scaledY = box.y * scaleY;
            const scaledWidth = box.width * scaleX;
            const scaledHeight = box.height * scaleY;
            
            if (boundingBoxStyle === 'mogged') {
              // Red bounding box
              ctx.strokeStyle = '#FF0000';
              ctx.lineWidth = 3;
              ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
              
              // Draw "MOGGED" label underneath red box
              const labelX = scaledX;
              const labelY = scaledY + scaledHeight + 20;
              const labelWidth = scaledWidth; // Match bounding box width
              const labelHeight = 80; // Much larger height
              
              // Draw rounded red background
              ctx.fillStyle = '#FF0000';
              ctx.beginPath();
              ctx.roundRect(labelX, labelY, labelWidth, labelHeight, 16);
              ctx.fill();
              
              // Draw white text - MUCH larger and all caps
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 40px Arial'; // MUCH larger font
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('MOGGED', labelX + labelWidth/2, labelY + labelHeight/2);
            } else {
              // Default green bounding box
              ctx.strokeStyle = '#00FF00';
              ctx.lineWidth = 3;
              ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
            }
          }
        } catch (error) {
          console.log('Detection error:', error);
        }
        
        animationId = requestAnimationFrame(detectFaces);
      };

      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        detectFaces();
      } else {
        video.addEventListener('loadeddata', detectFaces);
      }
    };

    const startFallbackDetection = () => {
      // Fallback: centered box that moves slightly
      let x = canvas.width / 2 - 100;
      let y = canvas.height / 2 - 100;
      
      const drawFallback = () => {
        if (!ctx || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          animationId = requestAnimationFrame(drawFallback);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Very subtle movement
        x += (Math.random() - 0.5) * 0.5;
        y += (Math.random() - 0.5) * 0.5;
        
        // Keep centered
        x = Math.max(50, Math.min(canvas.width - 250, x));
        y = Math.max(50, Math.min(canvas.height - 250, y));
        
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, 200, 200);
        
        animationId = requestAnimationFrame(drawFallback);
      };

      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        drawFallback();
      } else {
        video.addEventListener('loadeddata', drawFallback);
      }
    };

    loadModels();

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [stream]);

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
        </div>
      )}
    </div>
  );
}
