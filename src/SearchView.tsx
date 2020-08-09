import React, { useState } from "react";
import { Text, View, Button, FlatList } from "react-native";
import { SearchBar, ListItem, Overlay } from "react-native-elements";

interface Book {
  isbn: string;
  title: string;
  author: string;
  isAlreadyInLibrary: boolean;
}

const mockSearchBase: Book[] = [
  {
    isbn: "a",
    title: "Homo Deus",
    author: "Yuval Noah Harari",
    isAlreadyInLibrary: true,
  },
  {
    isbn: "b",
    title: "1984",
    author: "George Orwell",
    isAlreadyInLibrary: true,
  },
  {
    isbn: "c",
    title: "Der kleine Prinz",
    author: "Saint Exupery",
    isAlreadyInLibrary: false,
  },
  {
    isbn: "d",
    title: "Lean Startup",
    author: "Eric Ries",
    isAlreadyInLibrary: false,
  },
];

async function search(searchterm: string): Promise<Book[]> {
  return mockSearchBase.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchterm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchterm.toLowerCase()) ||
      book.isbn.toLowerCase() === searchterm.toLowerCase()
    );
  });
}

enum ReadingState {
  to_read,
  reading,
  completed,
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
              subtitle={info.item.author}
              checkmark={
                info.item.isAlreadyInLibrary || (
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
                  if(book.isbn !== bookToAdd) return book;
                  else return {isbn: book.isbn, author: book.author, title: book.title, isAlreadyInLibrary: true}
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
