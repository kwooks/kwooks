import { ReadingState, Book } from "./Book";
import React from "react";

interface LibraryContextValue {
  books: Book[];
  upsertToLibrary: (bookISBN: string, state: ReadingState) => Promise<void>;
}

export const LibraryContext = React.createContext<LibraryContextValue>({
  books: [],
  upsertToLibrary: async () => {},
});
