import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @ViewChild('fileSelect') public fileSelect!: ElementRef;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() deleteSelected = new EventEmitter<number>();
  @Output() moveUpSelected = new EventEmitter<number>();
  @Output() moveDownSelected = new EventEmitter<number>();

  files: { id: number; file: File }[] = [];
  private nextId: number = 0;

  onFileChange(event: any) {
    const selectedFiles = event.target.files;
    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      const id = this.nextId++;
      this.files.push({ id, file });
      this.fileSelected.emit(file);
      this.fileSelect.nativeElement.value = null;
    }
  }

  onDelete(id: number) {
    this.files = this.files.filter((f) => f.id !== id);
    this.deleteSelected.emit(id);
  }

  onMoveUp(id: number) {
    this.moveUpSelected.emit(id);
  }

  onMoveDown(id: number) {
    this.moveDownSelected.emit(id);
  }
}
