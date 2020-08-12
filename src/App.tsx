import React, { useState } from "react";
import { View } from "react-native";
import { QuoteScreen } from "./QuoteScreen";
import { LibraryScreen } from "./LibraryScreen";
import Constants from "expo-constants";
import * as firebase from "firebase";
import { Book } from "./Book";
import { BottomNavigation } from "react-native-paper";

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

  return (
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
              book="anna karenina"
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
  );
}
