import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AvatarCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
  /** Output size in px (square). Default 512. */
  outputSize?: number;
}

async function getCroppedBlob(imageSrc: string, area: Area, outputSize: number): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, outputSize, outputSize);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar"))),
      "image/jpeg",
      0.9,
    ),
  );
}

export function AvatarCropDialog({
  open,
  imageSrc,
  onCancel,
  onConfirm,
  outputSize = 512,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => setAreaPixels(pixels), []);

  async function confirm() {
    if (!imageSrc || !areaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(imageSrc, areaPixels, outputSize);
      await onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atur Foto Profile</DialogTitle>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-md bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
            />
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Zoom</Label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[var(--navy)]"
          />
          <p className="text-[11px] text-muted-foreground">
            Geser foto untuk reposisi · output akan dipotong jadi {outputSize}×{outputSize}px.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} disabled={busy}>Batal</Button>
          <Button onClick={confirm} disabled={busy || !areaPixels}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Memproses…
              </>
            ) : (
              "Crop & Unggah"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
