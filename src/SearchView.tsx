import React, { useState, useEffect, useContext } from "react";
import { Text, View, Button, FlatList } from "react-native";
import { SearchBar, ListItem, Overlay } from "react-native-elements";
import { isbn } from "simple-isbn";
import { Book, ReadingState } from "./Book";
import { LibraryContext } from "./LibraryContext";
import { searchGoogleBooks} from "./searchGoogleBooks"

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
