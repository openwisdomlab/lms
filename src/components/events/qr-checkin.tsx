"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Loader2,
  MapPin,
  Clock,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QRCheckinProps {
  onCheckIn?: (code: string, location?: { lat: number; lng: number }) => Promise<{
    success: boolean;
    event_title?: string;
    xp_earned?: number;
    error?: string;
  }>;
}

type CheckinState = "idle" | "scanning" | "manual" | "processing" | "success" | "error";

export function QRCheckin({ onCheckIn }: QRCheckinProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<CheckinState>("idle");
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<{
    success: boolean;
    event_title?: string;
    xp_earned?: number;
    error?: string;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get user location when opening
  useEffect(() => {
    if (isOpen && !userLocation) {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location not available:", error);
        }
      );
    }
  }, [isOpen, userLocation]);

  // Start camera for QR scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState("scanning");
    } catch (error) {
      console.error("Camera access denied:", error);
      setState("manual");
    }
  };

  // Stop camera
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle code submission
  const handleSubmitCode = async (code: string) => {
    if (!code.trim()) return;

    setState("processing");

    try {
      // Simulate API call - replace with actual implementation
      const response = onCheckIn
        ? await onCheckIn(code, userLocation || undefined)
        : await simulateCheckin(code);

      setResult(response);
      setState(response.success ? "success" : "error");
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to process check-in. Please try again.",
      });
      setState("error");
    }
  };

  // Simulated check-in for demo
  const simulateCheckin = async (code: string): Promise<{
    success: boolean;
    event_title?: string;
    xp_earned?: number;
    error?: string;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (code.toUpperCase().startsWith("MARS") || code.length >= 6) {
      return {
        success: true,
        event_title: "Mars Colonization Workshop",
        xp_earned: 150,
      };
    }

    return {
      success: false,
      error: "Invalid check-in code. Please verify and try again.",
    };
  };

  // Reset state when closing
  const handleClose = () => {
    stopScanning();
    setState("idle");
    setManualCode("");
    setResult(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="w-4 h-4 mr-2" />
          Scan Check-in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Event Check-in</DialogTitle>
          <DialogDescription>
            Scan the QR code or enter the event code manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Idle state - choose method */}
          {state === "idle" && (
            <div className="space-y-3">
              <Button className="w-full" onClick={startScanning}>
                <Camera className="w-4 h-4 mr-2" />
                Scan QR Code
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setState("manual")}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Enter Code Manually
              </Button>

              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <MapPin className="w-4 h-4" />
                  <span>Location detected for verification</span>
                </div>
              )}
            </div>
          )}

          {/* Scanning state */}
          {state === "scanning" && (
            <div className="space-y-3">
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-lg" />
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">
                  Position QR code within the frame
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    stopScanning();
                    setState("manual");
                  }}
                >
                  Enter Manually
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    stopScanning();
                    setState("idle");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Manual entry state */}
          {state === "manual" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Code</label>
                <Input
                  placeholder="e.g., MARS-LSS-2024"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg tracking-wider"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleSubmitCode(manualCode)}
                  disabled={!manualCode.trim()}
                >
                  Check In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setManualCode("");
                    setState("idle");
                  }}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Processing state */}
          {state === "processing" && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying check-in code...</p>
            </div>
          )}

          {/* Success state */}
          {state === "success" && result && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Check-in Successful!</h3>
                <p className="text-muted-foreground">{result.event_title}</p>
              </div>
              {result.xp_earned && (
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">+{result.xp_earned} XP earned</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Checked in at {new Date().toLocaleTimeString()}</span>
              </div>
              <Button className="w-full" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}

          {/* Error state */}
          {state === "error" && result && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Check-in Failed</h3>
                <p className="text-muted-foreground">{result.error}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setResult(null);
                    setState("manual");
                  }}
                >
                  Try Again
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// QR Code display component for event organizers
interface QRCodeDisplayProps {
  code: string;
  eventTitle: string;
}

export function QRCodeDisplay({ code, eventTitle }: QRCodeDisplayProps) {
  // In a real implementation, you would use a QR code library
  // like 'qrcode.react' to generate the actual QR code

  return (
    <div className="p-6 bg-white rounded-lg text-center space-y-4">
      <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
        <QrCode className="w-24 h-24 text-gray-400" />
      </div>
      <div>
        <p className="font-mono text-lg font-bold tracking-wider">{code}</p>
        <p className="text-sm text-muted-foreground">{eventTitle}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Scan this code to check in to the event
      </p>
    </div>
  );
}
