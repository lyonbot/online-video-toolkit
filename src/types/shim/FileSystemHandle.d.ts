interface FileSystemHandle {
  queryPermission(opt: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>
  requestPermission(opt: { mode: 'read' | 'readwrite' }): Promise<'granted' | 'denied' | 'prompt'>
}