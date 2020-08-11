import React, { useState, useEffect } from "react";
import { Text, View, Button, Alert } from "react-native";

interface QuoteScreenProps {
  book: string;
  onNextQuoteRequested(): void;
}

function getRandomNumberFromBeatifulDistribution(quotes: any[]): number {
  const randNumber = Math.floor(Math.random() * Math.floor(1000*quotes.length));
  const quoteNumber = (((1000*quotes.length)/(randNumber + 1)) - 1) % quotes.length;
  return Math.round(quoteNumber);
}

export function QuoteScreen(props: QuoteScreenProps) {
  const [curretnQuote, setCurrentQuote] = useState<string>("");
  const [currentAuthor, setCurrentAuthor] = useState<string>("");
  const [currentBook, setCurrentBook] = useState<string>("");

  const quotedBook = props.book;
  useEffect(() => {
    async function doit() {
      const response = await fetch(
        `https://goodquotesapi.herokuapp.com/title/${encodeURIComponent(quotedBook)}`
      )
    const result = await response.json();
    const quoteNumber = getRandomNumberFromBeatifulDistribution(result.quotes);
    console.log(quoteNumber);

    setCurrentQuote(result.quotes[quoteNumber].quote);
    setCurrentAuthor(result.quotes[quoteNumber].author);
    setCurrentBook(result.quotes[quoteNumber].publication);
    }
    doit();
  }, [quotedBook]);

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
      <Text>{currentBook}</Text>
      <View>
        <Text style={{ fontSize: 30, textAlign: "center" }}>{curretnQuote}</Text>
        <Text style={{ textAlign: "right" }}>~ {currentAuthor}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Button title="Next" onPress={props.onNextQuoteRequested} />
        <Button title="share" onPress={() => {
          Alert.alert("TODO: Implement")
        }} />
      </View>
    </View>
  );
}
