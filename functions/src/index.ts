import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as uuid from "uuid";

admin.initializeApp();
const db = admin.firestore();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const greeter = functions.https.onRequest((request, response) => {
  response.send("Greetings, " + request.body);
});

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Kwooks!");
});

export const createUserAccount = functions.https.onRequest(
  async (request, response) => {
    const token = uuid.v4();
    const user = await db
      .collection("users")
      .add({ tokens: [token], library: [] });
    response.json({
      token: token,
      id: user.id,
    });
  }
);

export const addQuote = functions.https.onRequest(async (request, response) => {
  const quote = request.body.quote;
  const isbn = request.body.isbn;
  const token = request.body.token;
  const result = await db
    .collection("users")
    .where("tokens", "array-contains", token)
    .get();
  if (result.empty) {
    response.status(401);
    response.end();
    return;
  }
  const user = result.docs[0];
  await db.collection("quotes").add({ isbn, quote, userID: user.id });
  response.end();
});

export const addToLibrary = functions.https.onRequest(
  async (request, response) => {
    const isbn = request.body.isbn;
    const token = request.body.token;
    const state = request.body.state;

    const result = await db
      .collection("users")
      .where("tokens", "array-contains", token)
      .get();
    if (result.empty) {
      response.status(401);
      response.end();
      return;
    }
    const user = result.docs[0];

    await user.ref.collection("library").doc(isbn).set({ state: state });

    response.end();
  }
);
export const deleteBookFromLibrary = functions.https.onRequest(
  async (request, response) => {
    const isbn = request.body.isbn;
    const token = request.body.token;
    const result = await db
      .collection("users")
      .where("tokens", "array-contains", token)
      .get();
    if (result.empty) {
      response.status(401);
      response.end();
      return;
    }
    const user = result.docs[0];

    await user.ref.collection("library").doc(isbn).delete();

    response.end();
  }
);

export const getUsersLibrary = functions.https.onRequest(
  async (request, response) => {
    const token = request.body.token;
    const result = await db
      .collection("users")
      .where("tokens", "array-contains", token)
      .get();
    if (result.empty) {
      response.status(401);
      response.end();
      return;
    }

    const user = result.docs[0];
    const library_result = await user.ref.collection("library").get();

    response.json({
      library: library_result.docs.map((element) => {
        return { isbn: element.id, state: element.data().state };
      }),
    });
  }
);
