import { google } from "googleapis";
import { BracketData, BracketDataParser } from "./BracketDataParser.js";
import { Chart, Settings } from "./chartPicker";

// CHANGE THESE TO MATCH THE WANTED GOOGLE SHEET
// ---------------------------------------------
const spreadsheetId = "1IvZCvV_dwNrOY-8DPGpLu0pylrmBzL-K2SvbXUNqgAI";
export const bracketTab = "Bracket";
// export const lowerBracketTab = "LowerBracket";
const songPicksTab = "SongPicks";
const groupPlayerSongsTab = "GroupPlayerSongs";
const dataFetchingRange = "A1:U100";
// ---------------------------------------------

console.log("Authenticating for google sheets...");
const auth = new google.auth.GoogleAuth({
  keyFile: "keys.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

// @ts-ignore
const authClient = await auth.getClient();

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

export async function sendSongPicksToSheets(
  settings: Settings,
  selectedCharts: Chart[]
): Promise<void> {
  const bracket = settings.bracket;
  const group = settings.group;
  console.log(
    "sending to sheets: ",
    bracket,
    group,
    settings.players.map((p) => p.name),
    selectedCharts.map((c) => c.title)
  );

  const songPickValues: string[][] = [];
  const groupPlayerSongsValues: any[][] = [];

  songPickValues.push([bracket, group]);

  selectedCharts.forEach((c) => {
    songPickValues[0].push(c.title);

    settings.players.forEach((p) => {
      groupPlayerSongsValues.push([bracket, group, p.name, c.title]);
    });
  });

  // Send song picks to google sheets
  try {
    // @ts-ignore
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: `${songPicksTab}!A:G`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: songPickValues,
      },
    });
  } catch (e) {
    console.log(`Error: Could not send song picks to ${songPicksTab} tab!`, e);
  }

  try {
    // @ts-ignore
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: `${groupPlayerSongsTab}!A:D`,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: groupPlayerSongsValues,
      },
    });
  } catch (e) {
    console.log(
      `Error: Could not send song picks to ${groupPlayerSongsTab} tab!`,
      e
    );
  }
}
