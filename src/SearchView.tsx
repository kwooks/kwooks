import React, { useState, useEffect, useContext } from "react";
import { Text, View, Button, FlatList } from "react-native";
import { SearchBar, ListItem, Overlay } from "react-native-elements";
import { isbn } from "simple-isbn";
import { Book, ReadingState } from "./Book";
import { LibraryContext } from "./LibraryScreen";

function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((v) => v != undefined) as T[];
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

function googleBooksResultToBook(googleBook: any): Book | undefined {
  const isbn = getISBN(googleBook);
  if (!isbn) return undefined;

  return {
    title: googleBook.volumeInfo.title,
    authors: googleBook.volumeInfo.authors || [],
    isbn: isbn,
  };
}

async function searchGoogleBooks(searchterm: string): Promise<Book[]> {
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

interface SearchViewProps {
  onClose(): void;
  onAdd(isbn: string, state: ReadingState): void;
}

export function SearchView(props: SearchViewProps) {
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<Book[]>([]);

  async function searchFor(searchterm: string) {
    setLoading(true);
    const result = await searchGoogleBooks(searchterm);
    setSearchResult(result);
    setLoading(false);
  }

  const [bookToAdd, setBookToAdd] = useState<string | undefined>();

  const { books, upsertToLibrary } = useContext(LibraryContext);

  function addBookToAddToLibrary(state: ReadingState) {
    upsertToLibrary(bookToAdd!, ReadingState.to_read);
    setSearchInput("");
    setBookToAdd(undefined);
  }

  return (
    <View>
      <SearchBar
        placeholder="Bücher hinzufügen ..."
        value={searchInput}
        onChangeText={async (text) => {
          setSearchInput(text);
          await searchFor(text);
        }}
      />
      <FlatList
        keyExtractor={(book) => {
          return book.isbn;
        }}
        data={searchResult}
        renderItem={(info) => {
          const isBookInLibrary = books.map(b => b.isbn).includes(info.item.isbn)
          return (
            <ListItem
              title={info.item.title}
              subtitle={info.item.authors.join(", ")}
              bottomDivider
              checkmark={
                  isBookInLibrary || (
                  <Button
                    title="+"
                    onPress={() => {
                      setBookToAdd(info.item.isbn);
                    }}
                  />
                )
              }
            />
          );
        }}
      />
      <Overlay isVisible={!!bookToAdd} animationType="slide" transparent>
        <View>
          <Text>Hinzufügen zu:</Text>
          <Button
            title="Lese-Wunschliste"
            onPress={() => {
              addBookToAddToLibrary(ReadingState.to_read);
            }}
          />
          <Button
            title="Aktuell"
            onPress={() => {
              addBookToAddToLibrary(ReadingState.reading);
            }}
          />
          <Button
            title="Gelesen"
            onPress={() => {
              addBookToAddToLibrary(ReadingState.completed);
            }}
          />
        </View>
      </Overlay>
    </View>
  );
}
