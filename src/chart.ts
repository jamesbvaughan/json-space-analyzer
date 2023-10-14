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

const byteSizeOfObject = (object: unknown) =>
  byteSizeOfString(JSON.stringify(object));

/**
 * Computes and returns the size in bytes that a member of a JSON object or
 * array takes up on disk, including the key, commas, quotation marks, and
 * colon.
 */
const byteSizeOfEntry = (
  name: string,
  value: unknown,
  isParentArray: boolean,
  addCommaSize: boolean,
) => {
  const entrySize = isParentArray
    ? byteSizeOfObject(value)
    : byteSizeOfString(`"${name}":${value}`);

  return entrySize + (addCommaSize ? 1 : 0);
};

/**
 * Prepare an object for use with Sunburst by annotating every node with the
 * total size of its children.
 */
const objectToHeirarchyList = (object: object): Node[] => {
  const entries = Object.entries(object);
  const isArray = Array.isArray(object);

  return entries.map(([name, entry], index) => {
    let value: number | undefined = undefined;
    let children: Node[] | undefined = undefined;

    if (typeof entry === "object" && entry !== null) {
      children = objectToHeirarchyList(entry);
    } else {
      value = byteSizeOfEntry(name, entry, isArray, index < entries.length - 1);
    }

    return { name, value, children };
  });
};

export const prepareData = (json: object) => ({
  name: "root",
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

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const generateTooltipContent = (node: Node): string => {
  let tooltipRows = [];

  if (node.__dataNode) {
    const sizeString = formatBytes(node.__dataNode.value || 0);
    tooltipRows.push(`Size: ${sizeString}`);
  }

  if (node.children !== undefined) {
    tooltipRows.push(`Children: ${node.children.length}`);
  }

  return tooltipRows.join("<br/>");
};

export const renderChart = (data: Node, element: HTMLElement) => {
  const render = Sunburst()
    .sort((a, b) => b.value - a.value)
    .color(generateColor)
    .strokeColor("transparent")
    .excludeRoot(true)
    .transitionDuration(0)
    .minSliceAngle(0.05)
    .tooltipContent(generateTooltipContent)
    .data(data);

  render(element);
};
