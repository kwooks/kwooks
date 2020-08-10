export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  state?: ReadingState;
}

export enum ReadingState {
  to_read = "to_read",
  reading = "reading",
  completed = "completed",
}
