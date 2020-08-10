import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { QuoteScreen } from "./QuoteScreen";
import { LibraryScreen } from "./LibraryScreen"
import Constants from "expo-constants"
import { SearchView, Book, ReadingState } from "./SearchView";
import SwipeablePanel from "rn-swipeable-panel";
import * as firebase from "firebase";

// Optionally import the services that you want to use
//import "firebase/auth";
//import "firebase/database";
//import "firebase/firestore";
//import "firebase/functions";
//import "firebase/storage";

// Initialize Firebase
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD5usI-2ccLN54HYvWrQDC58IiPci-oRy4",
  authDomain: "kwooks.firebaseapp.com",
  databaseURL: "https://kwooks.firebaseio.com",
  projectId: "kwooks",
  storageBucket: "kwooks.appspot.com",
  messagingSenderId: "980225253473",
  appId: "1:980225253473:web:709db0e55f9c32fa46ca20",
};

// Initialize Firebase
if (firebase.apps.length === 0) firebase.initializeApp(firebaseConfig);

export default function App() {
  const [panelActive, setPanelActive] = useState<boolean>(true);
  
  return (
    <View style={{ paddingTop: Constants.statusBarHeight, height: "100%" }}>
      <QuoteScreen
        quote="C'est la fucking vie!"
        author="someone smart"
        book="very good book"
        onNextQuoteRequested={() => {}}
      />
      <SwipeablePanel
        fullWidth
        openLarge
        isActive={panelActive}
        onClose={() => setPanelActive(false)}
        barStyle={(undefined as unknown) as object}
      >
        <LibraryScreen
          onOpenFilteredQuoteView={(book: Book) => {
            return;
          }}
        />
      </SwipeablePanel>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
