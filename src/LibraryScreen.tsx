import React, { useState, useEffect } from "react";
import { Text, View, SectionList } from "react-native";
import { ListItem, Overlay } from "react-native-elements";
import { TouchableOpacity } from "react-native-gesture-handler";
import { RadioButton } from "react-native-paper";
import { Book, ReadingState } from "./Book";

function groupBooksByCategory(books: Book[]) {
  const completed: Book[] = [];
  const reading: Book[] = [];
  const to_read: Book[] = [];
  books.forEach((book) => {
    if (book.state === ReadingState.completed) completed.push(book);
    if (book.state === ReadingState.reading) reading.push(book);
    if (book.state === ReadingState.to_read) to_read.push(book);
  });

  return { completed, reading, to_read };
}

async function publishBookState(bookISBN: string, newState: ReadingState) {
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

interface LibraryScreenProps {
  onOpenFilteredQuoteView(book: Book): void;
}

function useLibrary(): [Book[], React.Dispatch<React.SetStateAction<Book[]>>] {
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

      const result: {
        library: { isbn: string; state: ReadingState }[];
      } = await response.json();

      const enrichedLibrary = result.library.map((element) => {
        const book: Book = {
          isbn: element.isbn,
          authors: [element.isbn],
          state: element.state,
          title: element.isbn,
        };
        return book;
      });

      setLibrary(enrichedLibrary);
    }

    doit();
  }, [setLibrary]);

  return [library, setLibrary];
}

export function LibraryScreen(props: LibraryScreenProps) {
  const [selectedBook, setSelectedBook] = useState<Book | undefined>();

  const [library, setLibrary] = useLibrary();

  const sortedBooks = groupBooksByCategory(library);

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
              onLongPress={() => setSelectedBook(item)}
            >
              <View>
                <ListItem title={item.title}></ListItem>
              </View>
            </TouchableOpacity>
          );
        }}
        renderSectionHeader={(sectionheader) => {
          return (
            <Text style={{ fontSize: 20 }}>{sectionheader.section.title}</Text>
          );
        }}
        keyExtractor={(item) => (typeof item === "string" ? item : item.isbn)}
      />
      <Overlay isVisible={!!selectedBook} animationType="slide" transparent>
        <View>
          <Text>Verschieben nach</Text>

          <RadioButton.Group
            onValueChange={async (value) => {
              setSelectedBook(undefined);
              setLibrary(
                library.map((book) => {
                  if (book === selectedBook) {
                    return { ...book, state: value as ReadingState };
                  }
                  return book;
                })
              );

              await publishBookState(selectedBook!.isbn, value as ReadingState);
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
