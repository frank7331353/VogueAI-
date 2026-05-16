
export type StudioAction = 'TRY_ON' | 'GHOST_MANNEQUIN' | 'RELIGHT' | 'REPOSE' | 'BEAUTY';

export interface ImageData {
  url: string;
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  action: StudioAction;
  timestamp: number;
}

export interface StudioState {
  baseImage: ImageData | null;
  garmentImage: ImageData | null;
  action: StudioAction;
  isProcessing: boolean;
  resultImage: string | null;
  history: HistoryItem[];
  logs: string[];
  settings: {
    lighting: string;
    pose: string;
    garmentDesc: string;
    beauty: string;
    aspectRatio: string;
  };
}
