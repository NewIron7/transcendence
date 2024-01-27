import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convert_coordinates(
  prevx: number,
  prevy: number,
  original_width: number,
  original_height: number,
  new_width: number,
  new_height: number,
  ) {
  const x_ratio = new_width / original_width
  const y_ratio = new_height / original_height

  const x = prevx * x_ratio
  const y = prevy * y_ratio

  return ({x, y});
}

export function formatReadableDate(date: Date) {
  const nDate = new Date(date);
  const str = nDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
  });
  return (str);
}

