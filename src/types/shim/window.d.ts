interface Window {
  /** 
   * https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker
   * 
   * Chrome only
   */
  showOpenFilePicker?(options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: any[]
  }): Promise<FileSystemFileHandle[]>
}
