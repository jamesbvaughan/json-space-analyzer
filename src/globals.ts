const globals: {
  /**
   * Whether the selected JSON file is all ASCII.
   *
   * If so, we can use a faster method to calculate the sizes of the stringified
   * objects inside it.
   */
  isAscii: boolean;
} = {
  isAscii: false,
};

export default globals;

