import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { QuoteScreen } from "./QuoteScreen";
import { LibraryScreen } from "./LibraryScreen";
import Constants from "expo-constants";
import * as firebase from "firebase";
import { Book, ReadingState } from "./Book";
import { BottomNavigation } from "react-native-paper";
import { LibraryContext, publishBookState } from "./LibraryScreen";
import { isbn } from "simple-isbn";

var firebaseConfig = {
  apiKey: "AIzaSyD5usI-2ccLN54HYvWrQDC58IiPci-oRy4",
  authDomain: "kwooks.firebaseapp.com",
  databaseURL: "https://kwooks.firebaseio.com",
  projectId: "kwooks",
  storageBucket: "kwooks.appspot.com",
  messagingSenderId: "980225253473",
  appId: "1:980225253473:web:709db0e55f9c32fa46ca20",
};

if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

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

  async function addBookToUsersLibrary(bookISBN: string, initialState: ReadingState){
    await fetch("https://us-central1-kwooks.cloudfunctions.net/addToLibrary", {
      body: JSON.stringify({
        token: "dc7bb80a-7df0-4d5b-a8cb-26ba8f654e5a",
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
          setLibrary(library.concat([{authors:[bookISBN], title: bookISBN, state:newState, isbn: bookISBN}]));
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
            [Scenes.Quotes]: () => (
              <QuoteScreen
                quote="C'est la fucking vie!"
                author="someone smart"
                book="very good book"
                onNextQuoteRequested={() => {}}
              />
            ),
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
