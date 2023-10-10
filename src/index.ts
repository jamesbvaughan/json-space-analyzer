/// <reference lib="dom" />

import Sunburst from "sunburst-chart";

const $ = (selector: string) => {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);

  return element;
};

const jsonFileInput = $("input#jsonFileInput") as HTMLInputElement;
const chartElement = $("div#chart") as HTMLDivElement;
const chartTitleElement = $("h2#chartTitle") as HTMLHeadingElement;
const errorElement = $("#error");
const headerUploadButton = $("button#headerUploadButton");
const uploadButton = $("button#uploadButton") as HTMLButtonElement;
const exampleButton = $("button#exampleButton") as HTMLButtonElement;

type SizeHeirarchyNode = {
  name: string;
  value: number;
  children?: SizeHeirarchyNode[];
};

const byteSizeOfString = (str: string) => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(str);
  return encodedData.length;
};

const byteSizeOfObject = (object: object) =>
  byteSizeOfString(JSON.stringify(object));

const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const objectToHeirarchyList = (object: object): SizeHeirarchyNode[] =>
  Object.entries(object).map(([name, value]) => ({
    name,
    value: byteSizeOfObject(value),
    children:
      typeof value === "object" && value !== null
        ? objectToHeirarchyList(value)
        : undefined,
  }));

const colors = [
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "magenta",
];

const showError = (message: string) => {
  chartElement.innerHTML = "";
  errorElement.innerHTML = `<h3>Error</h3><p>${message}</p>`;
};

const renderChart = (json: object) => {
  let data: SizeHeirarchyNode;
  try {
    data = {
      name: "root",
      value: byteSizeOfObject(json),
      children: objectToHeirarchyList(json),
    };
  } catch (error) {
    showError(`Unable to analyze JSON data: ${(error as Error).message}`);
    return;
  }

  try {
    const render = Sunburst()
      .sort((a, b) => b.value - a.value)
      .color((node) => {
        const hash = stringToHash(node.name || "");
        const index = Math.abs(hash) % colors.length;
        return `var(--${colors[index]})`;
      })
      .strokeColor("transparent")
      .excludeRoot(true)
      .transitionDuration(0)
      .minSliceAngle(0.05)
      .tooltipContent((x) => `Size (bytes): ${x.value}`)
      .data(data);

    chartElement.innerHTML = "";

    render(chartElement);
  } catch (error) {
    showError(`Unable to render chart: ${(error as Error).message}`);
  }
};

const resetUI = ({ filename }: { filename: string }) => {
  exampleButton.style.display = "none";
  uploadButton.style.display = "none";
  errorElement.innerHTML = "";
  chartElement.innerHTML = "Processing file...";
  chartTitleElement.innerHTML = filename;
  chartTitleElement.style.display = "block";
};

const handleFile = async (file: File) => {
  resetUI({ filename: file.name });

  const text = await file.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    showError(`Unable to parse JSON file: ${(error as Error).message}`);
    return;
  }

  renderChart(json);
};

const handleExampleFile = async () => {
  resetUI({ filename: "package.json" });

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/jamesbvaughan/json-space-analyzer/main/package.json",
    );

    if (!response.ok) {
      throw new Error("Error fetching file.");
    }

    const json = await response.json();

    renderChart(json);
  } catch (error) {
    showError(`Unable to load example file: ${(error as Error).message}`);
  }
};

uploadButton.addEventListener("click", () => jsonFileInput.click());
headerUploadButton.addEventListener("click", () => jsonFileInput.click());

exampleButton.addEventListener("click", handleExampleFile);

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
  if (file) handleFile(file);
});

jsonFileInput.addEventListener("change", async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) handleFile(file);
});
