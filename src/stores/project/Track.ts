export class Track {
  public blocks: TrackBlock[] = [];

  constructor(
    public name: string = 'Track',
    public description: string = ''
  ) {
  }

  public addBlock(block: TrackBlock) {
    this.blocks.push(block);
  }
}

export class TrackBlock {
  constructor(
    public track: Track
  ) {
  }
}
