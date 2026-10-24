export const tools = [
  {
    type: "function",
    function: {
      name: "webSearch",
      description: "Search real time data from the web",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "query to do web search",
          },
        },
        required: ["query"],
      },
    },
  },
];

