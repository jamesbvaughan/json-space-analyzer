/**
 * Get an element from the DOM, or throw an error if it doesn't exist.
 */
const $ = (selector: string) => {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);

  return element;
};

export const jsonFileInput = $("input#jsonFileInput") as HTMLInputElement;
export const chartElement = $("div#chart") as HTMLDivElement;
export const chartTitleElement = $("h2#chartTitle") as HTMLHeadingElement;
export const errorElement = $("#error");
export const headerUploadButton = $("button#headerUploadButton");
export const uploadButton = $("button#uploadButton") as HTMLButtonElement;
export const exampleButton = $("button#exampleButton") as HTMLButtonElement;
