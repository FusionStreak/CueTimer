export type ColorKey = 'green' | 'yellow' | 'orange' | 'blue' | 'red';

export interface Cue {
  id: string;
  t: number; // seconds from scene start
  name: string;
  color: ColorKey;
}
