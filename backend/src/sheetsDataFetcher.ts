import { google } from "googleapis";
import { BracketData, BracketDataParser } from "./BracketDataParser.js";

// CHANGE THESE TO MATCH THE WANTED GOOGLE SHEET
// ---------------------------------------------
const spreadsheetId = "1YXOvYsa4RPephIZDCKtja91IzZqrGdYiNST15xfPw2c";
export const upperBracketTab = "UpperBracket";
export const lowerBracketTab = "LowerBracket";
const dataFetchingRange = "A1:U100";
// ---------------------------------------------

console.log("Authenticating for google sheets...");
const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// @ts-ignore
const authClient = await auth.getClient();
console.log(authClient);

const googleSheets = google.sheets({ version: "v4", auth: authClient });
console.log("Done.");

export async function fetchDataFromGoogleApi(
  tabName: string
): Promise<BracketData | undefined> {
  try {
    const results = await googleSheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!${dataFetchingRange}`,
      majorDimension: "ROWS",
    });

    if (results.status < 200 && results.status > 299) {
      throw new Error(
        `Request returned ${results.status} - ${results.statusText}`
      );
    }

    const rows = results.data.values!;

    const bracketParser = new BracketDataParser();
    return bracketParser.parseBracketData(rows);
  } catch (e) {
    console.log(`Error while fetching tab ${tabName} data`, e);
  }
}
