import React, { useState, useEffect } from "react";
import { Text, View, SectionList, Animated, TouchableOpacity } from "react-native";
import { ListItem, Overlay } from "react-native-elements";
import { RadioButton } from "react-native-paper";
import { Book, ReadingState } from "./Book";
import { SearchView } from "./SearchView";
import { createDndContext } from "react-native-easy-dnd";

const { Provider, Droppable, Draggable } = createDndContext();

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

  const [draggedBook, setDraggedBook] = useState<Book | undefined>();

  const [library, setLibrary] = useLibrary();

  const sortedBooks = groupBooksByCategory(library);

  function handleDrop(targetState: ReadingState) {
    setLibrary(
      library.map((element) => {
        if (element === draggedBook) {
          return {
            ...draggedBook,
            state: targetState,
          };
        } else return element;
      })
    );
    publishBookState(draggedBook!.isbn, targetState);
    setDraggedBook(undefined);
  }

  return (
    <Provider>
      <View style={{ flex: 1, paddingHorizontal: 30, paddingVertical: 20 }}>
        <SearchView onAdd={() => {}} onClose={() => {}} />

        <SectionList
          sections={[
            { state: ReadingState.to_read, data: sortedBooks.to_read },
            { state: ReadingState.reading, data: sortedBooks.reading },
            { state: ReadingState.completed, data: sortedBooks.completed },
          ]}
          renderSectionHeader={(sectionheader) => {
            let sectionTitle: string = "Beendet";
            if (sectionheader.section.state === ReadingState.reading)
              sectionTitle = "Aktuell";
            if (sectionheader.section.state === ReadingState.to_read)
              sectionTitle = "Lese-Wunschliste";
            return <ListItem title={sectionTitle} bottomDivider />;
          }}
          renderItem={({ item }) => {
            return (
              <View>
                <Draggable
                  onDragStart={() => {
                    setDraggedBook(item);
                  }}
                >
                  {({ viewProps }) => {
                    return (
                      <Animated.View {...viewProps} style={[viewProps.style]}>
                        <TouchableOpacity
                          onPress={() => props.onOpenFilteredQuoteView(item)}
                          onLongPress={() => setSelectedBook(item)}
                        >
                          <ListItem
                            title={item.title}
                            subtitle={item.authors.join(", ")}
                            bottomDivider
                          />
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  }}
                </Draggable>
              </View>
            );
          }}
          keyExtractor={(item) => (typeof item === "string" ? item : item.isbn)}
        />
        <Overlay isVisible={!!selectedBook} animationType="slide" transparent>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Verschieben nach</Text>

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

                await publishBookState(
                  selectedBook!.isbn,
                  value as ReadingState
                );
              }}
              value={selectedBook?.state!}
            >
              <View style={{ flexDirection: "column", flex: 1 }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <RadioButton value="to_read"></RadioButton>
                  <ListItem title="Lese-Wunschliste"></ListItem>
                </View>
                <View style={{ flex: 1 }}>
                  <ListItem title="Aktuell"></ListItem>
                  <RadioButton value="reading"></RadioButton>
                </View>
                <View style={{ flex: 1 }}>
                  <ListItem title="Gelesen"></ListItem>
                  <RadioButton value="completed"></RadioButton>
                </View>
              </View>
            </RadioButton.Group>
          </View>
        </Overlay>
      </View>

      <View
        style={{
          position: "absolute",
          height: !!draggedBook ? "100%" : "0%",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <Droppable
          onDrop={() => {
            handleDrop(ReadingState.to_read);
          }}
        >
          {({ active, viewProps }) => (
            <Animated.View
              {...viewProps}
              style={[
                viewProps.style,
                { padding: 100, backgroundColor: active ? "grey" : undefined },
              ]}
            >
              <Text>Lese-Wunschliste</Text>
            </Animated.View>
          )}
        </Droppable>
        <Droppable
          onDrop={() => {
            handleDrop(ReadingState.reading);
          }}
        >
          {({ active, viewProps }) => (
            <Animated.View
              {...viewProps}
              style={[
                viewProps.style,
                { padding: 100, backgroundColor: active ? "grey" : undefined },
              ]}
            >
              <Text>Aktuell</Text>
            </Animated.View>
          )}
        </Droppable>
        <Droppable
          onDrop={() => {
            handleDrop(ReadingState.completed);
          }}
        >
          {({ active, viewProps }) => (
            <Animated.View
              {...viewProps}
              style={[
                viewProps.style,
                { padding: 100, backgroundColor: active ? "grey" : undefined },
              ]}
            >
              <Text>Beendet</Text>
            </Animated.View>
          )}
        </Droppable>
      </View>
    </Provider>
  );
}
