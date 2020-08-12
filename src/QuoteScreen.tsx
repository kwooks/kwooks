import React, { useState, useEffect } from "react";
import { Text, View, Share, Alert, Button } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";

interface QuoteData {
  quote: string | undefined;
  author: string | undefined;
  book: string | undefined;
  quoteNumber: number | undefined;
}

function getRandomNumber(quotes: any[]): number {
  const randNumber = Math.floor(
    Math.random() * Math.floor(1000 * quotes.length)
  );
  const quoteNumber =
    ((1000 * quotes.length) / (randNumber + 1) - 1) % quotes.length;
  return Math.round(quoteNumber);
}

export function QuoteScreen() {
  const [currentQuoteData, setCurrentQuoteData] = useState<QuoteData>();
  const [nextQuoteData, setNextQuoteData] = useState<QuoteData>();
  const [loading, setLoading] = useState<boolean>(false);

  async function updateQuoteScreen() {
    setNextQuoteData((quote) => {
      setCurrentQuoteData(quote);
      return quote;
    });

    setLoading(true);
    const response = await fetch(
      `https://goodquotesapi.herokuapp.com/title/${encodeURIComponent(
        quotedBook
      )}`
    );
    let result = await response.json();
    setLoading(false);
    result.quotes = result.quotes.filter((quote: any) => quote.quote.length < 320);
    let quoteNum = getRandomNumber(result.quotes);
    setNextQuoteData({
      quote: result.quotes[quoteNum].quote,
      author: result.quotes[quoteNum].author,
      book: result.quotes[quoteNum].publication,
      quoteNumber: quoteNum,
    });
  }

  const onShare = async () => {
    const result = await Share.share({
      message:
        currentQuoteData?.quote + '\n~ '+ currentQuoteData?.author  
    });
  };

  const quotedBook = "anna karenina"; // TODO
  
  useEffect(() => {
    async function updateTwice() {
      await updateQuoteScreen();
      await updateQuoteScreen();
    }
    updateTwice();
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
      <Text>{currentQuoteData?.book}</Text>
      <View>
        <Text style={{ fontSize: 30, textAlign: "center" }}>
          {currentQuoteData?.quote}
        </Text>
        <Text style={{ textAlign: "right" }}>~ {currentQuoteData?.author}</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Icon.Button name="share" onPress={onShare}>
          Share
        </Icon.Button>
        <Icon.Button name="arrow-right" onPress={updateQuoteScreen}>
          Next
        </Icon.Button>
      </View>
    </View>
  );
}
