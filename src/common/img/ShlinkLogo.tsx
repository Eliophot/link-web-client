import { MAIN_COLOR } from '../../utils/theme';

export interface ShlinkLogoProps {
  color?: string;
  className?: string;
}

export const ShlinkLogo = ({ color = MAIN_COLOR, className }: ShlinkLogoProps) => (
  <svg className={className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 229.1 244.6">
    <g fill={color}><circle cx="215" cy="120.7" r="11.3"/><path d="M221.2 144.2a24.4 24.4 0 0 1-30.5-23.5 24.3 24.3 0 0 1 30.5-23.5V80.1c0-11.7-8.2-26-18.3-31.8l-73-42.1c-5-2.9-11.4-4.5-18.4-4.5S98.1 3.3 93.2 6.2l-73 42a40.7 40.7 0 0 0-18.4 32v84.3c0 11.7 8.3 26 18.4 31.8l73 42.1c5 2.9 11.4 4.4 18.4 4.4 6.9 0 13.4-1.5 18.3-4.4l73-42.1a40.6 40.6 0 0 0 18.3-31.8v-20.2zM131 112.6c-.3.8-.8 1.5-1.3 2.2a12 12 0 0 1-4.4 3.8c-1.7 1-3.6 2.2-5.7 2.2H94.9v45.6h52.4c-.6 1.8-1.7 3.5-3.3 5a12.1 12.1 0 0 1-8.5 3.1H94.7a12 12 0 0 1-8.9-3.7 12 12 0 0 1-3.7-8.8V81.6c0-3.4 1.2-6.2 3.7-8.7a12 12 0 0 1 8.9-3.7h52.6c-.6 1.8-1.7 3.3-3.3 4.8a11.9 11.9 0 0 1-8.4 3.2H95v35.4h36z"/></g>
  </svg>
);
