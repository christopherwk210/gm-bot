/** Represents a set of options to be consumed by the file generator */
export interface Schematic {
  /** The name used to trigger this schematic from the command line */
  name: string;

  /** Template file contents */
  template: string;

  /** Prompts to ask the user when they trigger this schematic */
  inputs: string[];

  /**
   * Async pre-write callback, this is where modifications to your template should
   * occur. An array of strings is passed that matches the answers given to
   * each input. This function should return a string equal to the full path of the
   * final file, including extension. You can also return an object instead which
   * will be passed as the error object in the postWrite callback.
   */
  preWrite: (inputResults: string[]) => Promise<string|Object>;

  /**
   * Post-write callback, this is where you should log the status of the generation
   * if needed. If there were any errors writing to the file, they will be passed
   * as a string.
   */
  postWrite: (error?: any) => void;
}
