import * as fetch from "node-fetch";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as uuid from "uuid";
import { addBookToCache, getBooksFromCache } from "./booksCache";

if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
}

admin.initializeApp();
const db = admin.firestore();

async function getUserByToken(token: string) {
  const result = await db
    .collection("users")
    .where("tokens", "array-contains", token)
    .get();

  if (result.empty) {
    return undefined;
  }

  return result.docs[0];
}

function withAuthentication(
  callback: (
    request: functions.https.Request,
    response: functions.Response<any>,
    user: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData
    >
  ) => Promise<void>
) {
  return async (
    request: functions.https.Request,
    response: functions.Response<any>
  ) => {
    const token = request.body.token;
    const user = await getUserByToken(token);
    if (!user) {
      response.status(401).end();
      return;
    }

    callback(request, response, user);
  };
}

export const createUserAccount = functions.https.onRequest(
  async (request, response) => {
    const tokenOfNewUser = uuid.v4();

    await db.collection("users").add({ tokens: [tokenOfNewUser] });

    response
      .json({
        token: tokenOfNewUser,
      })
      .end();
  }
);

export const addQuote = functions.https.onRequest(
  withAuthentication(async (request, response, user) => {
    const quote = request.body.quote;
    const isbn = request.body.isbn;

    await db.collection("quotes").add({ isbn, quote, userID: user.id });
    response.status(200).end();
  })
);

export const addToLibrary = functions.https.onRequest(
  withAuthentication(async (request, response, user) => {
    const isbn = request.body.isbn;
    const state = request.body.state;

    await user.ref.collection("library").doc(isbn).set({ state: state });

    await addBookToCache(isbn);

    response.status(200).end();
  })
);

export const deleteBookFromLibrary = functions.https.onRequest(
  withAuthentication(async (request, response, user) => {
    const isbn = request.body.isbn;

    await user.ref.collection("library").doc(isbn).delete();

    response.end();
  })
);

export const getUsersLibrary = functions.https.onRequest(
  withAuthentication(async (request, response, user) => {
    const library_result = await user.ref.collection("library").get();

    const someBooks = getBooksFromCache(library_result.docs.map((element) => {
      return element.id;
    }));
    console.log(someBooks);

    response.json({
      library: library_result.docs.map((element) => {
        return { isbn: element.id, state: element.data().state };
      }),
    });
  })
);
