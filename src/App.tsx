import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { QuoteScreen } from "./QuoteScreen";
import { LibraryScreen } from "./LibraryScreen";
import Constants from "expo-constants";
import { Book, ReadingState } from "./Book";
import { BottomNavigation } from "react-native-paper";
import { publishBookState } from "./LibraryScreen";
import { LibraryContext } from "./LibraryContext";
import { isbn } from "simple-isbn";
import { getToken } from "./token";

enum Scenes {
  Quotes,
  Library,
}

export default function App() {
  const [scene, setScene] = useState<Scenes>(Scenes.Quotes);
  const [library, setLibrary] = useState<Book[]>([]);
  useEffect(() => {
    async function doit() {
      const response = await fetch(
        "https://us-central1-kwooks.cloudfunctions.net/getUsersLibrary",
        {
          body: JSON.stringify({
            token: await getToken(),
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

  return (
    <LibraryContext.Provider
      value={{
        books: library,
        upsertToLibrary: async (bookISBN: string, newState: ReadingState) => {
          setLibrary(
            library
              .filter((book: Book) => {
                console.log(book.isbn == bookISBN);
                return book.isbn != bookISBN;
              })
              .concat([
                {
                  authors: [bookISBN],
                  title: bookISBN,
                  state: newState,
                  isbn: bookISBN,
                },
              ])
          );
          await publishBookState(bookISBN, newState);
        },
      }}
    >
      <View style={{ paddingTop: Constants.statusBarHeight, height: "100%" }}>
        <BottomNavigation
          navigationState={{
            index: scene,
            routes: [
              { key: "" + Scenes.Quotes, title: "Quotes", icon: "text" },
              { key: "" + Scenes.Library, title: "Library", icon: "library" },
            ],
          }}
          onIndexChange={setScene}
          renderScene={BottomNavigation.SceneMap({
            [Scenes.Quotes]: () => <QuoteScreen/>,
            [Scenes.Library]: (props) => (
              <LibraryScreen
                onOpenFilteredQuoteView={(book: Book) => {
                  props.jumpTo("" + Scenes.Quotes);
                  return;
                }}
              />
            ),
          })}
        />
      </View>
    </LibraryContext.Provider>
  );
}
