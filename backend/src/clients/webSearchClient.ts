import { tavily, TavilyClient } from "@tavily/core";
import WebSearchInterafce from "../interface/Websearch.interface.js";

class TavilyWebSearch implements WebSearchInterafce {
  private tivalyClient: TavilyClient;
  constructor(private apiKey: string) {
    this.tivalyClient = tavily({
      apiKey: this.apiKey,
    });
  }

  public webSearch = async ({ query }: { query: string }) => {
    try {
      if (!query) {
        console.log("no input query...");
        throw new Error("No query found");
      }
      console.log("searching web...");
      const response = await this.tivalyClient.search(query, {
        searchDepth: "basic",
        maxResults: 5,
      });
      const responseContent = response.results
        .map((r) => r.content)
        .join("\n\n");
      console.log("web search finished...");
      return {
        content: responseContent,
      };
    } catch (error) {
      console.log("[tavily client] web search error...");
      throw error;
    }
  };
}

export default TavilyWebSearch;
