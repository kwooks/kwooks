import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { QuoteScreen } from "./QuoteScreen";
import Constants from "expo-constants"

export default function App() {
  return (
    <View style={{paddingTop: Constants.statusBarHeight, height: "100%" }}>
      <QuoteScreen
        quote="The quick brown fox jumped over the crazy frog."
        author="Simon Knott"
        book="Lebenswerk"
        onNextQuoteRequested={() => {}}
      />
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
