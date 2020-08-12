import { Book } from "./Book";
import { isbn } from "simple-isbn";

function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((v) => v != undefined) as T[];
}

function deduplicateBooks(books: Book[]): Book[] {
  const set = new Set<string>();
  const result = new Array<Book>();
  for (const book of books) {
    if (set.has(book.isbn)) continue;
    set.add(book.isbn);
    result.push(book);
  }
  return result;
}

function googleBooksResultToBook(googleBook: any): Book | undefined {
  const isbn = getISBN(googleBook);
  if (!isbn) return undefined;

  return {
    title: googleBook.volumeInfo.title,
    authors: googleBook.volumeInfo.authors || [],
    isbn: isbn,
  };
}

function getISBN(googleBook: any): string | undefined {
  const industryIdentifiers = googleBook.volumeInfo.industryIdentifiers;
  if (!industryIdentifiers) return undefined;

  const isbn13 = industryIdentifiers.find((v: any) => v.type === "ISBN_13");
  if (isbn13) return isbn13.identifier;

  const isbn10 = industryIdentifiers.find((v: any) => v.type === "ISBN_10");
  if (isbn10) return isbn.toIsbn13(isbn10.identifier);

  return undefined;
}

export async function searchGoogleBooks(searchterm: string): Promise<Book[]> {
  const request = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      searchterm
    )}`
  );
  const result = await request.json();
  if (!result.items) return [];

  const books: Book[] = result.items.map(googleBooksResultToBook);
  const definedBooks = filterUndefined(books);
  return deduplicateBooks(definedBooks);
}
