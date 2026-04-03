import { useEffect, useRef, useState } from "react";
import { Product } from "@/lib/data";
import Navbar from "@/components/Navbar";
import { Camera, CameraOff, Trash2, Scan, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";

// SVG face curves overlay
const FaceCurvesOverlay = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    viewBox="0 0 640 480"
    preserveAspectRatio="xMidYMid meet"
    style={{ transform: "scaleX(-1)" }}
  >
    {/* Outer face oval */}
    <ellipse cx="320" cy="215" rx="115" ry="145" fill="none" stroke="rgba(255,200,180,0.55)" strokeWidth="1.5" strokeDasharray="6 4" />
    {/* Forehead guide */}
    <path d="M 220 130 Q 320 90 420 130" fill="none" stroke="rgba(255,200,180,0.4)" strokeWidth="1" strokeDasharray="4 4" />
    {/* Jaw line */}
    <path d="M 230 300 Q 280 360 320 370 Q 360 360 410 300" fill="none" stroke="rgba(255,200,180,0.45)" strokeWidth="1" strokeDasharray="4 4" />
    {/* Left eye oval */}
    <ellipse cx="270" cy="195" rx="32" ry="16" fill="none" stroke="rgba(255,200,180,0.55)" strokeWidth="1.2" strokeDasharray="5 3" />
    {/* Right eye oval */}
    <ellipse cx="370" cy="195" rx="32" ry="16" fill="none" stroke="rgba(255,200,180,0.55)" strokeWidth="1.2" strokeDasharray="5 3" />
    {/* Eyebrow guides */}
    <path d="M 240 172 Q 270 162 300 168" fill="none" stroke="rgba(255,200,180,0.4)" strokeWidth="1" strokeDasharray="3 3" />
    <path d="M 340 168 Q 370 162 400 172" fill="none" stroke="rgba(255,200,180,0.4)" strokeWidth="1" strokeDasharray="3 3" />
    {/* Nose bridge */}
    <path d="M 315 210 L 310 258" fill="none" stroke="rgba(255,200,180,0.35)" strokeWidth="1" strokeDasharray="3 4" />
    {/* Nose base */}
    <path d="M 295 260 Q 320 270 345 260" fill="none" stroke="rgba(255,200,180,0.45)" strokeWidth="1" strokeDasharray="3 3" />
    {/* Nostril curves */}
    <ellipse cx="305" cy="262" rx="10" ry="6" fill="none" stroke="rgba(255,200,180,0.35)" strokeWidth="1" />
    <ellipse cx="335" cy="262" rx="10" ry="6" fill="none" stroke="rgba(255,200,180,0.35)" strokeWidth="1" />
    {/* Upper lip */}
    <path d="M 290 290 Q 305 283 320 290 Q 335 283 350 290" fill="none" stroke="rgba(255,200,180,0.55)" strokeWidth="1.2" strokeDasharray="4 3" />
    {/* Lower lip */}
    <path d="M 290 290 Q 320 312 350 290" fill="none" stroke="rgba(255,200,180,0.5)" strokeWidth="1.2" strokeDasharray="4 3" />
    {/* Centre symmetry line */}
    <line x1="320" y1="110" x2="320" y2="370" stroke="rgba(255,200,180,0.18)" strokeWidth="0.8" strokeDasharray="6 6" />
    {/* Cheekbone guides */}
    <path d="M 205 230 Q 235 255 250 270" fill="none" stroke="rgba(255,200,180,0.3)" strokeWidth="1" strokeDasharray="3 5" />
    <path d="M 435 230 Q 405 255 390 270" fill="none" stroke="rgba(255,200,180,0.3)" strokeWidth="1" strokeDasharray="3 5" />
  </svg>
);

// Privacy blur/pixelate overlay using canvas
const PrivacyOverlay = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const draw = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.readyState < 2) {
        animId = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw video mirrored
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Pixelate body area (below face — roughly y > 40% of height)
      const bodyY = Math.floor(canvas.height * 0.42);
      const bodyH = canvas.height - bodyY;
      const pixelSize = 18;
      // Save original pixels then redraw in blocks
      const imageData = ctx.getImageData(0, bodyY, canvas.width, bodyH);
      // Draw pixelated version
      ctx.imageSmoothingEnabled = false;
      const tmp = document.createElement("canvas");
      tmp.width = Math.ceil(canvas.width / pixelSize);
      tmp.height = Math.ceil(bodyH / pixelSize);
      const tc = tmp.getContext("2d");
      if (tc) {
        tc.putImageData(imageData, 0, 0);
        ctx.drawImage(tmp, 0, bodyY, canvas.width, bodyH);
      }
      // Frosted tint over body
      ctx.fillStyle = "rgba(255,240,245,0.35)";
      ctx.fillRect(0, bodyY, canvas.width, bodyH);

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover"
      style={{ transform: "none" }}
    />
  );
};

const TrialRoom = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [trialItems, setTrialItems] = useState<Product[]>([]);
  const [selectedItem, setSelectedItem] = useState<Product | null>(null);
  const [overlayPos, setOverlayPos] = useState({ x: 50, y: 55 });
  const [overlaySize, setOverlaySize] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFaceCurves, setShowFaceCurves] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("trialItems") || "[]");
    setTrialItems(items);
  }, []);

  useEffect(() => {
    if (cameraOn && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraOn, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      setCameraOn(true);
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOn(false);
    setShowFaceCurves(false);
    setPrivacyMode(false);
  };

  const removeItem = (id: string) => {
    const updated = trialItems.filter((p) => p.id !== id);
    setTrialItems(updated);
    localStorage.setItem("trialItems", JSON.stringify(updated));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-light">Virtual Trial Room</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your webcam to see how items look on you</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Camera */}
          <div className="lg:col-span-2">
            <div
              ref={containerRef}
              className="relative aspect-[4/3] overflow-hidden bg-secondary"
              onMouseMove={(e) => {
                if (!isDragging || !containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const x = ((e.clientX - dragStart.x) / rect.width) * 100 + overlayPos.x;
                const y = ((e.clientY - dragStart.y) / rect.height) * 100 + overlayPos.y;
                setOverlayPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
                setDragStart({ x: e.clientX, y: e.clientY });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {cameraOn ? (
                <>
                  {/* Raw video (hidden when privacy mode is on) */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover ${privacyMode ? "invisible" : ""}`}
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Privacy canvas overlay */}
                  {privacyMode && <PrivacyOverlay videoRef={videoRef} />}

                  {/* Face curves overlay */}
                  {showFaceCurves && <FaceCurvesOverlay />}

                  {/* Product overlay */}
                  {selectedItem && (
                    <img
                      src={selectedItem.image}
                      alt="overlay"
                      className="absolute cursor-move select-none"
                      style={{
                        left: `${overlayPos.x}%`,
                        top: `${overlayPos.y}%`,
                        transform: "translate(-50%, -50%)",
                        width: `${overlaySize}%`,
                        opacity: 0.85,
                        mixBlendMode: "multiply",
                        pointerEvents: "auto",
                        zIndex: 10,
                      }}
                      draggable={false}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                        setDragStart({ x: e.clientX, y: e.clientY });
                      }}
                    />
                  )}

                  {/* Privacy badge */}
                  {privacyMode && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded bg-primary/80 px-2.5 py-1 text-xs text-primary-foreground backdrop-blur z-20">
                      <EyeOff className="h-3 w-3" /> Privacy Mode On
                    </div>
                  )}

                  {selectedItem && (
                    <div className="absolute bottom-4 left-4 rounded bg-primary/80 px-3 py-2 text-xs text-primary-foreground backdrop-blur z-20">
                      Trying: {selectedItem.name} — Drag to reposition
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                  <Camera className="h-12 w-12" />
                  <p className="text-sm">Camera is off</p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={cameraOn ? stopCamera : startCamera}
                className="flex items-center gap-2 bg-primary px-5 py-2.5 text-xs uppercase tracking-widest text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {cameraOn ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                {cameraOn ? "Stop Camera" : "Start Camera"}
              </button>

              {cameraOn && (
                <>
                  <button
                    onClick={() => setShowFaceCurves((v) => !v)}
                    title="Toggle face curve guides"
                    className={`flex items-center gap-2 border px-4 py-2.5 text-xs uppercase tracking-widest transition-colors ${
                      showFaceCurves
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Scan className="h-4 w-4" />
                    Face Curves
                  </button>

                  <button
                    onClick={() => setPrivacyMode((v) => !v)}
                    title="Privacy blur for women"
                    className={`flex items-center gap-2 border px-4 py-2.5 text-xs uppercase tracking-widest transition-colors ${
                      privacyMode
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {privacyMode ? "Privacy On" : "Privacy"}
                  </button>

                  {selectedItem && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <label>Size:</label>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={overlaySize}
                        onChange={(e) => setOverlaySize(Number(e.target.value))}
                        className="w-28 accent-primary"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {cameraOn && (
              <p className="mt-2 text-xs text-muted-foreground">
                {showFaceCurves && "Face guide curves are active. "}
                {privacyMode && "Privacy mode blurs your body area for comfort. "}
                {!showFaceCurves && !privacyMode && "Tip: Enable Face Curves for makeup guidance or Privacy mode for comfort."}
              </p>
            )}
          </div>

          {/* Trial items sidebar */}
          <div>
            <h2 className="font-display text-xl font-medium">Your Items ({trialItems.length})</h2>
            {trialItems.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No items yet. Browse the shop and add items to try on.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {trialItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-3 border p-3 transition-colors ${
                      selectedItem?.id === item.id ? "border-accent bg-rose-gold-light" : "hover:bg-secondary"
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <img src={item.image} alt={item.name} className="h-16 w-12 object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialRoom;
