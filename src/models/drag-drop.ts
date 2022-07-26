// namespace App {

// __ IXa Drag & Drop Interfaces - purpose is to force a class to implement everything it needs to either be draggable or be a valid drop target
// __ 'export' means these interfaces are now available from inside the namespace and also outside of this file
export interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
}

// }
