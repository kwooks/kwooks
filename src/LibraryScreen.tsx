import React, { useState } from "react";
import { Text, View, SectionList, TouchableHighlight } from "react-native";

import { ListItem } from "react-native-elements";

import DraggableFlatList from "react-native-draggable-flatlist";

import { Book, ReadingState } from "./SearchView";
import { ProgressPlugin } from "webpack";
import { TouchableOpacity } from "react-native-gesture-handler";

interface LibraryScreenProps {
  books: Book[];
  onOpenFilteredQuoteView(book: Book): void;
}

interface sortedBooks {
  completed: (Book | string)[];
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

export function LibraryScreen(props: LibraryScreenProps) {
  const sortedBooks: sortedBooks = sortBooksByCategory(props.books);
  const completed: [Book | string] = ["Beendet"];

  const [bookData, setBookData] = useState<(string | Book)[]>(
    completed
      .concat(sortedBooks.completed)
      .concat(["Aktuell"])
      .concat(sortedBooks.reading)
      .concat(["Anstehend"])
      .concat(sortedBooks.to_read)
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 30, paddingVertical: 20 }}>
      <DraggableFlatList
        data={bookData}
        
        onDragEnd={({ data }) => {if(typeof data[0] == "string") setBookData(data);}}

        renderItem={({ item, drag }) => {
          if (typeof item === "string") {
            return (
              <View>
                <Text style={{ fontSize: 20 }}>{item}</Text>
              </View>
            );
          } else {
            return (
              <TouchableOpacity
                onPress={() => props.onOpenFilteredQuoteView(item)}
                onLongPress={drag}
              >
                <View>
                  <ListItem title={item.title}></ListItem>
                </View>
              </TouchableOpacity>
            );
          }
        }}
        keyExtractor={(item) =>
          `draggable-item-${typeof item === "string" ? item : item.isbn}`
        }
      />
    </View>
  );
}
