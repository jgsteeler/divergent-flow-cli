export interface ICaptureService {
  /**
   * Creates a new capture for the current user
   * @param text - The raw text content to capture
   * @returns Promise that resolves when capture is created
   */
  createCapture(text: string): Promise<void>;

  /**
   * Lists unmigrated captures for the current user
   * @returns Promise that resolves with array of capture objects
   */
  listUnmigratedCaptures(): Promise<any[]>;
}