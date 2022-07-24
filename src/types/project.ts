export interface Track {
  name: string;
  description: string;

  blocks: TrackBlock[];
  modifiers: TrackBlockModifier[];
}

export interface TrackBlock {
  start: number;
  duration: number;

  mediaFile: string;
  srcStart: number;
  modifiers: TrackBlockModifier[];
}

export interface TrackBlockModifier {
  type: string;
  disabled: boolean;
  params: any;
}
