import React, { useState, useEffect } from "react";
import { Text, View, SectionList, TouchableHighlight } from "react-native";

import { ListItem, Overlay } from "react-native-elements";

import DraggableFlatList from "react-native-draggable-flatlist";

import { Book, ReadingState } from "./SearchView";
import { ProgressPlugin } from "webpack";
import { TouchableOpacity } from "react-native-gesture-handler";

import { RadioButton } from "react-native-paper";

interface LibraryScreenProps {
  onOpenFilteredQuoteView(book: Book): void;
}

interface sortedBooks {
  completed: Book[];
  to_read: Book[];
  reading: Book[];
}

function sortBooksByCategory(books: Book[]): sortedBooks {
  var sortedList: sortedBooks = { completed: [], reading: [], to_read: [] };
  books.forEach((book) => {
    if (book.state == ReadingState.completed) sortedList.completed.push(book);
    if (book.state == ReadingState.reading) sortedList.reading.push(book);
    if (book.state == ReadingState.to_read) sortedList.to_read.push(book);
  });
  return sortedList;
}

async function changeBookState(bookISBN: string, newState: ReadingState) {
  await fetch("https://us-central1-kwooks.cloudfunctions.net/addToLibrary", {
    body: JSON.stringify({
      token: "dc7bb80a-7df0-4d5b-a8cb-26ba8f654e5a",
      isbn: bookISBN,
      state: newState,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
}

export function LibraryScreen(props: LibraryScreenProps) {

  const [selectedBook, setSelectedBook] = useState<Book>();

  const [library, setLibrary] = useState<Book[]>([]);
  useEffect(() => {
    async function doit() {
      const response = await fetch(
        "https://us-central1-kwooks.cloudfunctions.net/getUsersLibrary",
        {
          body: JSON.stringify({
            token: "dc7bb80a-7df0-4d5b-a8cb-26ba8f654e5a",
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }
      );

      const library: {
        library: { isbn: string; state: ReadingState }[];
      } = await response.json();
      console.log(library);

      const lib = library.library.map((element) => {
        const book: Book = {
          isbn: element.isbn,
          author: element.isbn,
          state: element.state,
          title: element.isbn,
        };
        return book;
      });

      setLibrary(lib);
      console.log(lib);
    }
    doit();
  }, [setLibrary]);

  const sortedBooks: sortedBooks = sortBooksByCategory(library);

  return (
    <View style={{ flex: 1, paddingHorizontal: 30, paddingVertical: 20 }}>
      <SectionList
        sections={[
          { title: "Aktuell", data: sortedBooks.reading },
          { title: "Beendet", data: sortedBooks.completed },
          { title: "Anstehend", data: sortedBooks.to_read },
        ]}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => props.onOpenFilteredQuoteView(item)}
              onLongPress={()=> setSelectedBook(item)}
            >
              <View>
                <ListItem title={item.title}></ListItem>
              </View>
            </TouchableOpacity>
          );
        }}
        renderSectionHeader={(sectionheader) => {
          return (
            <View>
              <Text style={{ fontSize: 20 }}>
                {sectionheader.section.title}
              </Text>
            </View>
          );
        }}
        keyExtractor={(item) =>
          `sectionlist-item-${typeof item === "string" ? item : item.isbn}`
        }
      />
      <Overlay isVisible={!!selectedBook} animationType="slide" transparent>
        <View>
          <Text>Verschieben nach</Text>

          <RadioButton.Group
            onValueChange={(value) => {
              changeBookState(selectedBook!.isbn, value as ReadingState);
              setSelectedBook(undefined);              
              setLibrary(
                library.map((book) => {
                  if (book == selectedBook) {
                    return {...book, state:value as ReadingState};
                  }
                  return book;
                })
              );
            }}
            value={selectedBook?.state!}
          >
            <View>
              <ListItem title="Beendet"></ListItem>
              <RadioButton value="completed"></RadioButton>
            </View>
            <View>
              <ListItem title="Aktuell"></ListItem>
              <RadioButton value="reading"></RadioButton>
            </View>
            <View>
              <ListItem title="Zu lesen"></ListItem>
              <RadioButton value="to_read"></RadioButton>
            </View>
          </RadioButton.Group>
        </View>
      </Overlay>
    </View>
  );
}
