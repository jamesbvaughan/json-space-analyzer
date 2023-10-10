import Sunburst, { Node } from "sunburst-chart";

/**
 * Returns the size of a string in bytes.
 *
 * This is used rather than `string.length` because the length of a string
 * does not necessarily equal the number of bytes it takes up in memory.
 */
const byteSizeOfString = (str: string) => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(str);
  return encodedData.length;
};

const byteSizeOfObject = (object: object) =>
  byteSizeOfString(JSON.stringify(object));

/**
 * Prepare an object for use with Sunburst by annotating every node with the
 * total size of its children.
 */
const objectToHeirarchyList = (object: object): Node[] =>
  Object.entries(object).map(([name, value]) => ({
    name,
    value: byteSizeOfObject(value),
    children:
      typeof value === "object" && value !== null
        ? objectToHeirarchyList(value)
        : undefined,
  }));

export const prepareData = (json: object) => ({
  name: "root",
  value: byteSizeOfObject(json),
  children: objectToHeirarchyList(json),
});

/**
 * Compute a hash of a string for use in indexing into a list of colors.
 */
const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32 bit integer
  }
  return hash;
};

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

const generateColor = (node: Node) => {
  const hash = stringToHash(node.name || "");
  const index = Math.abs(hash) % colors.length;
  return `var(--${colors[index]})`;
};

const generateTooltopContent = (node: Node) => {
  let tooltopContent = `Size (bytes): ${node.value}`;

  if (node.children !== undefined) {
    tooltopContent += `<br />Children: ${node.children.length}`;
  }

  return tooltopContent;
};

export const renderChart = (data: Node, element: HTMLElement) => {
  const render = Sunburst()
    .sort((a, b) => b.value - a.value)
    .color(generateColor)
    .strokeColor("transparent")
    .excludeRoot(true)
    .transitionDuration(0)
    .minSliceAngle(0.05)
    .tooltipContent(generateTooltopContent)
    .data(data);

  render(element);
};
