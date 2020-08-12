import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { QuoteScreen } from "./QuoteScreen";
import { LibraryScreen } from "./LibraryScreen";
import Constants from "expo-constants";
import { Book, ReadingState } from "./Book";
import { BottomNavigation } from "react-native-paper";
import { LibraryContext, publishBookState } from "./LibraryScreen";
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

  async function addBookToUsersLibrary(
    bookISBN: string,
    initialState: ReadingState
  ) {
    await fetch("https://us-central1-kwooks.cloudfunctions.net/addToLibrary", {
      body: JSON.stringify({
        token: await getToken(),
        isbn: bookISBN,
        state: initialState,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  }

  return (
    <LibraryContext.Provider
      value={{
        books: library,
        upsertToLibrary: async (bookISBN: string, newState: ReadingState) => {
          await publishBookState(bookISBN, newState);
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
            [Scenes.Quotes]: () => <QuoteScreen book="anna karenina" />,
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
