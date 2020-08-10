import React, { useState } from "react";
import { Text, View, Button, FlatList } from "react-native";
import { SearchBar, ListItem, Overlay } from "react-native-elements";
import {isbn} from "simple-isbn";

export interface Book {
  isbn: string;
  title: string;
  authors: string[];
  state?: ReadingState;
}

export enum ReadingState {
  to_read,
  reading,
  completed,
}

async function search(searchterm: string): Promise<Book[]> {
  const request = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchterm)}`);
  const result = await request.json();
  if (!result.items) return [];
  return deduplicateBooks(result.items.map(googleBooksResultToBook).filter((googleBooksResultToBook: Book | undefined) => googleBooksResultToBook != undefined));
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
  console.log(googleBook);
  const isbn13 = getISBN(googleBook);
  if(!isbn13) return undefined; 
  if (googleBook.volumeInfo.authors == undefined) googleBook.volumeInfo.authors = [""];
  return {
    "title": googleBook.volumeInfo.title,
    "authors": googleBook.volumeInfo.authors,
    "isbn": isbn13
  };
}

function getISBN(googleBook: any): string | undefined {
  if (!googleBook.volumeInfo.industryIdentifiers) return undefined; 
  const isbn13 = googleBook.volumeInfo.industryIdentifiers.find((v: any)=>v.type==="ISBN_13")?.identifier;
  if (isbn13) return isbn13;
  const isbn10 = googleBook.volumeInfo.industryIdentifiers.find((v: any)=>v.type==="ISBN_10")?.identifier;
  if (isbn10) return isbn.toIsbn13(isbn10);
  return undefined;
}

interface SearchViewProps {
  onClose(): void;
  onAdd(isbn: string, state: ReadingState): void;
}

export function SearchView(props: SearchViewProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [bookToAdd, setBookToAdd] = useState<string | undefined>();
  return (
    <View>
      <SearchBar
        placeholder="Bücher hinzufügen ..."
        value={searchInput}
        onChangeText={async (text) => {
          setLoading(true);
          setSearchInput(text);
          const result = await search(text);
          setSearchResult(result);
          setLoading(false);
        }}
      />
      <FlatList
        keyExtractor={(book) => {
          return book.isbn;
        }}
        data={searchResult}
        renderItem={(info) => {
          return (
            <ListItem
              title={info.item.title}
              subtitle={info.item.authors.join(", ")}
              checkmark={
                !!info.item.state || (
                  <Button
                    title="+"
                    onPress={() => {
                      setBookToAdd(info.item.isbn);
                    }}
                  />
                )
              }
              bottomDivider
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
              props.onAdd(bookToAdd!, ReadingState.to_read);

              setSearchResult(
                searchResult.map((book) => {
                  if (book.isbn !== bookToAdd) return book;
                  else
                    return {
                      isbn: book.isbn,
                      authors: book.authors,
                      title: book.title,
                    };
                })
              );
              setBookToAdd(undefined);
            }}
          />
          <Button
            title="Aktuell"
            onPress={() => {
              props.onAdd(bookToAdd!, ReadingState.reading);
              setBookToAdd(undefined);
            }}
          />
          <Button
            title="Gelesen"
            onPress={() => {
              props.onAdd(bookToAdd!, ReadingState.completed);
              setBookToAdd(undefined);
            }}
          />
        </View>
      </Overlay>
    </View>
  );
}
