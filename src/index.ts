import { prepareData, renderChart } from "./chart";
import globals from "./globals";

/**
 * Get an element from the DOM, or throw an error if it doesn't exist.
 */
const $ = (selector: string) => {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);

  return element as HTMLElement;
};

const jsonFileInput = $("input#jsonFileInput");
const chartElement = $("div#chart");
const chartTitleElement = $("h2#chartTitle");
const errorElement = $("#error");
const headerUploadButton = $("button#headerUploadButton");
const uploadButton = $("button#uploadButton");
const exampleLink = $("a#exampleLink");
const dragOverlayElement = $("div#dragOverlay");

const showError = (message: string) => {
  console.error(message);
  chartElement.innerHTML = "";
  errorElement.innerHTML = `<h3>Error</h3><p>${message}</p>`;
};

const handleFile = async (file?: File) => {
  if (!file) return;

  exampleLink.style.display = "none";
  uploadButton.style.display = "none";
  errorElement.innerHTML = "";
  chartElement.innerHTML = "Processing file...";
  chartTitleElement.innerHTML = file.name;
  chartTitleElement.style.display = "block";
  document.body.scrollIntoView();

  const text = await file.text();

  const encodedText = new TextEncoder().encode(text);
  globals.isAscii = text.length === encodedText.byteLength;

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    if (file.type !== "application/json") {
      showError("That's not a JSON file.");
    } else {
      showError(`Unable to parse JSON file: ${(error as Error).message}`);
    }
    return;
  }

  let data;
  try {
    data = prepareData(json);
  } catch (error) {
    showError(`Unable to analyze JSON: ${(error as Error).message}`);
    return;
  }

  chartElement.innerHTML = "";

  try {
    renderChart(data, chartElement);
  } catch (error) {
    showError(`Unable to render chart: ${(error as Error).message}`);
  }
};

uploadButton.addEventListener("click", () => jsonFileInput.click());
headerUploadButton.addEventListener("click", () => jsonFileInput.click());

document.body.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.stopPropagation();

  dragOverlayElement.classList.add("dragging");
});

document.body.addEventListener("dragleave", (event) => {
  event.preventDefault();
  event.stopPropagation();

  dragOverlayElement.classList.remove("dragging");
});

document.body.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  dragOverlayElement.classList.remove("dragging");

  const file = event.dataTransfer?.files?.[0];
  handleFile(file);
});

jsonFileInput.addEventListener("change", async (event) => {
  window.location.hash = "";
  const file = (event.target as HTMLInputElement).files?.[0];
  handleFile(file);
});

const fetchJSONFile = async (url: string, name: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error fetching file.");

  const json = await response.json();
  const blob = new Blob([JSON.stringify(json)], { type: "application/json" });

  return new File([blob], name, { type: blob.type });
};

const parseHashParameters = () => {
  const hash = window.location.hash.substring(1); // remove the leading '#'
  const urlSearchParams = new URLSearchParams(hash);
  const params = Object.fromEntries(urlSearchParams.entries());

  return params;
};

const handleFileInHashParameters = async () => {
  const hashParameters = parseHashParameters();

  if (hashParameters.file) {
    const fileUrl = hashParameters.file;
    const file = await fetchJSONFile(fileUrl, hashParameters.name ?? fileUrl);
    handleFile(file);
  }
};

window.addEventListener("hashchange", () => {
  handleFileInHashParameters();
});

handleFileInHashParameters();
