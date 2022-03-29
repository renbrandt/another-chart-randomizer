export interface BracketData {
  groups: Group[];
}

interface Group {
  name: string;
  players: string[];
}

const finalGroupTitleName = "FINAL GROUP";
const groupRowSearchLength = 6;
const groupRegexp = /^GROUP [0-9]{1,3} - [WL]$/;

export class BracketDataParser {
  private static parseGroupData(
    currentValue: string,
    rowIndex: number,
    columnIndex: number,
    rows: any[][]
  ) {
    const groupData: Group = {
      name: currentValue,
      players: [],
    };

    // Get data for all players in the group
    for (
      let playerIndex = 0;
      playerIndex < groupRowSearchLength;
      playerIndex++
    ) {
      const playerNameRowIndex = rowIndex + 2 + playerIndex;
      const playerName = rows[playerNameRowIndex][columnIndex];

      // Player entry exists
      if (typeof playerName === "string" && playerName.length > 0) {
        groupData.players.push(playerName);
      }
    }

    return groupData;
  }

  public parseBracketData(rows: any[][]): BracketData {
    const results: BracketData = {
      groups: [],
    };

    // Loop through all rows and columns
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const columns = rows[rowIndex];

      for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
        const currentValue = columns[columnIndex];

        // Check if the current value matches regexp
        if (
          typeof currentValue === "string" &&
          groupRegexp.test(currentValue.toUpperCase())
        ) {
          const groupData = BracketDataParser.parseGroupData(
            currentValue,
            rowIndex,
            columnIndex,
            rows
          );
          results.groups.push(groupData);
        }
        // Check for "FINAL GROUP" title
        else if (
          typeof currentValue === "string" &&
          currentValue === finalGroupTitleName
        ) {
          const groupData = BracketDataParser.parseGroupData(
            currentValue,
            rowIndex,
            columnIndex,
            rows
          );
          results.groups.push(groupData);
        }
      }
    }

    return results;
  }
}
