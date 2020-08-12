import { Book } from "../../src/Book";
import { searchGoogleBooks } from "../../src/searchGoogleBooks";
import * as admin from "firebase-admin";

const db = () => admin.firestore();

export async function addBookToCache(isbn: string) {
  const searchResult = await searchGoogleBooks(isbn);
  await db().collection("books").doc(searchResult[0].isbn).set({title: searchResult[0].title, authors: searchResult[0].authors});
}

export async function getBooksFromCache(isbns: string[]): Promise<Book[]> {
  console.log({ isbns })
  const cachedBooks = await db().collection("books").where(admin.firestore.FieldPath.documentId(), "in", isbns).get();
  const resultBooks = cachedBooks.docs.map((element) => {
    return {title: element.data().title, authors: element.data().authors, isbn: element.id };
  });  
  return resultBooks;
}
