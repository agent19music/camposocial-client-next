declare module "html-to-image" {
  export function toPng(
    node: HTMLElement,
    options?: {
      width?: number;
      height?: number;
      style?: Partial<CSSStyleDeclaration>;
      quality?: number;
      pixelRatio?: number;
      backgroundColor?: string;
      cacheBust?: boolean;
      filter?: (domNode: HTMLElement) => boolean;
      canvasWidth?: number;
      canvasHeight?: number;
      skipFonts?: boolean;
      preferCssPageSize?: boolean;
    }
  ): Promise<string>;
}


