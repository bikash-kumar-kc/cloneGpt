class WebSearchInterafce {
  public webSearch = async ({
    query,
  }: {
    query: string;
    //@ts-ignore
  }): Promise<{ content: string }> => {};
}

export default WebSearchInterafce;
