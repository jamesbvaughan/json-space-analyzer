import { prepareData, renderChart } from "./chart";

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
const exampleButton = $("button#exampleButton");

const showError = (message: string) => {
  console.error(message);
  chartElement.innerHTML = "";
  errorElement.innerHTML = `<h3>Error</h3><p>${message}</p>`;
};

const handleFile = async (file?: File) => {
  if (!file) return;

  exampleButton.style.display = "none";
  uploadButton.style.display = "none";
  errorElement.innerHTML = "";
  chartElement.innerHTML = "Processing file...";
  chartTitleElement.innerHTML = file.name;
  chartTitleElement.style.display = "block";

  const text = await file.text();

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
});

document.body.addEventListener("dragleave", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

document.body.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const file = event.dataTransfer?.files?.[0];
  handleFile(file);
});

jsonFileInput.addEventListener("change", async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  handleFile(file);
});

const exampleFileUrl =
  "https://raw.githubusercontent.com/jamesbvaughan/json-space-analyzer/main/package.json";

const fetchExampleFile = async (): Promise<File> => {
  const response = await fetch(exampleFileUrl);
  if (!response.ok) throw new Error("Error fetching file.");

  const json = await response.json();
  const blob = new Blob([JSON.stringify(json)], { type: "application/json" });

  return new File([blob], "package.json", { type: blob.type });
};

exampleButton.addEventListener("click", async () => {
  let file: File;
  try {
    file = await fetchExampleFile();
  } catch (error) {
    showError((error as Error).message);
    return;
  }

  handleFile(file);
});
