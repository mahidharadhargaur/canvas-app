import { AfterViewInit, Component, ElementRef, ViewChild, Input } from '@angular/core';

interface ImageLayer {
  id: number;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  isDragging: boolean;
  isResizing: boolean;
  resizeHandleSize: number;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private crc!: CanvasRenderingContext2D;

  private imageLayers: ImageLayer[] = [];
  private selectedImageLayer: ImageLayer | null = null;

  private nextId: number = 0;
  private startX: number = 0;
  private startY: number = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.crc = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.setupCanvas();
  }

  setupCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.crc.fillStyle = 'white';
    this.crc.fillRect(0, 0, canvas.width, canvas.height);
  }

  @Input() set file(file: File | null) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = this.canvasRef.nativeElement;
          const width = Math.min(img.width, canvas.width);
          const height = Math.min(img.height, canvas.height);
          this.imageLayers.push({ 
            id: this.nextId++, 
            image: img, 
            x: 50, 
            y: 50, 
            width: width, 
            height: height,
            isDragging: false,
            isResizing: false,
            resizeHandleSize: 10 
          });
          this.redrawCanvas();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  redrawCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.crc.clearRect(0, 0, canvas.width, canvas.height);
    this.crc.fillStyle = 'white';
    this.crc.fillRect(0, 0, canvas.width, canvas.height);

    this.imageLayers.forEach(layer => {
      this.crc.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
      this.drawResizeHandles(layer);
    });
  }

  drawResizeHandles(layer: ImageLayer) {
    const handleSize = layer.resizeHandleSize;
    this.crc.fillStyle = 'blue';
    this.crc.fillRect(layer.x + layer.width - handleSize / 2, layer.y + layer.height - handleSize / 2, handleSize, handleSize);
  }

  onFileSelected(file: File) {
    this.file = file;
  }

  onDeleteSelected(id: number) {
    this.imageLayers = this.imageLayers.filter(layer => layer.id !== id);
    this.redrawCanvas();
  }

  onMoveUpSelected(id: number) {
    const index = this.imageLayers.findIndex(layer => layer.id === id);
    if (index > 0) {
      [this.imageLayers[index], this.imageLayers[index - 1]] = [this.imageLayers[index - 1], this.imageLayers[index]];
      this.redrawCanvas();
    }
  }

  onMoveDownSelected(id: number) {
    const index = this.imageLayers.findIndex(layer => layer.id === id);
    if (index < this.imageLayers.length - 1) {
      [this.imageLayers[index], this.imageLayers[index + 1]] = [this.imageLayers[index + 1], this.imageLayers[index]];
      this.redrawCanvas();
    }
  }

  onMouseDown(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.startX = offsetX;
    this.startY = offsetY;
    const selectedLayer = this.imageLayers.find(layer => this.isMouseOverLayer(offsetX, offsetY, layer));

    if (selectedLayer) {
      const handleSize = selectedLayer.resizeHandleSize;
      if (offsetX >= selectedLayer.x + selectedLayer.width - handleSize / 2 &&
          offsetX <= selectedLayer.x + selectedLayer.width + handleSize / 2 &&
          offsetY >= selectedLayer.y + selectedLayer.height - handleSize / 2 &&
          offsetY <= selectedLayer.y + selectedLayer.height + handleSize / 2) {
        selectedLayer.isResizing = true;
      } else {
        selectedLayer.isDragging = true;
      }
      this.selectedImageLayer = selectedLayer;
    }
  }

  onMouseUp(event: MouseEvent) {
    if (this.selectedImageLayer) {
      this.selectedImageLayer.isDragging = false;
      this.selectedImageLayer.isResizing = false;
      this.selectedImageLayer = null;
    }
  }

  onMouseMove(event: MouseEvent) {
    if (!this.selectedImageLayer) return;

    const { offsetX, offsetY } = event;

    if (this.selectedImageLayer.isDragging) {
      const dx = offsetX - this.startX;
      const dy = offsetY - this.startY;
      this.startX = offsetX;
      this.startY = offsetY;

      this.selectedImageLayer.x += dx;
      this.selectedImageLayer.y += dy;

      this.redrawCanvas();
    }

    if (this.selectedImageLayer.isResizing) {
      const newWidth = offsetX - this.selectedImageLayer.x;
      const newHeight = offsetY - this.selectedImageLayer.y;

      const canvas = this.canvasRef.nativeElement;

      if (newWidth > 0 && newHeight > 0 && newWidth <= canvas.width && newHeight <= canvas.height) {
        this.selectedImageLayer.width = newWidth;
        this.selectedImageLayer.height = newHeight;
      }

      this.redrawCanvas();
    }
  }

  isMouseOverLayer(mouseX: number, mouseY: number, layer: ImageLayer): boolean {
    return mouseX >= layer.x && mouseX <= layer.x + layer.width &&
           mouseY >= layer.y && mouseY <= layer.y + layer.height;
  }
}
