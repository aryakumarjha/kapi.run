"use client";

import { format } from "date-fns";

interface FormattedTimeProps {
  input: string;
  format: string;
  className?: string;
}

// Sole purpose of this component is to format the time
// base on client`s locale and timezone
export default function FormattedTime({
  input,
  format: formatString,
  className,
}: FormattedTimeProps) {
  return (
    <span className={className}>{format(new Date(input), formatString)}</span>
  );
}
