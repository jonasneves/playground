export interface ModelData {
  name: string;
  family: string;
  variants: string[];
  params: number;
  topAccuracy: number;
  year: number;
  available: boolean;
  pytorch: boolean;
  tensorflow: boolean;
}

export interface FrameworkCode {
  pytorch: string;
  tensorflow: string;
}
