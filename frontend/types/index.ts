import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Match {
  id: string;
  round: number;
  state: string;
  teams?: any[];
  winner?: any;
}
