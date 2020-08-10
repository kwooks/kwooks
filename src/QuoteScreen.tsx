import React from "react";
import { Text, View, Button, Alert } from "react-native";

interface QuoteScreenProps {
  quote: string;
  author: string;
  book: string;
  chapter?: number;
  onNextQuoteRequested(): void;
}

export function QuoteScreen(props: QuoteScreenProps) {
  return (
    <View
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        flex: 1,
        paddingHorizontal: 30,
        paddingVertical: 20,
      }}
    >
      <Text>{props.book}</Text>
      <View>
        <Text style={{ fontSize: 30, textAlign: "center" }}>{props.quote}</Text>
        <Text style={{ textAlign: "right" }}>~ {props.author}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Button title="nextQuote" onPress={props.onNextQuoteRequested} />
        <Button title="share" onPress={() => {
          Alert.alert("TODO: Implement")
        }} />
      </View>
    </View>
  );
}
