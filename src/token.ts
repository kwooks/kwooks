import * as SecureStore from "expo-secure-store";

export async function getToken() {
  let token = await SecureStore.getItemAsync("token");
  if (token === null) {
    token = await createUserToken();
    SecureStore.setItemAsync("token", token);
  }
  return token;
}
async function createUserToken(): Promise<string> {
  const response = await fetch(
    "https://us-central1-kwooks.cloudfunctions.net/createUserAccount",
    {
      method: "GET",
    }
  );
  const result: {
    token: string;
  } = await response.json();
  return result.token;
}
