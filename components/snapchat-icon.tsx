import type { SVGProps } from "react"

export function SnapchatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-3.1 19.5 10 10 0 0 0 6.2 0A10 10 0 0 0 12 2Zm0 0a9.94 9.94 0 0 1 4 .85" />
      <path d="M12 2v8" />
      <path d="m19 5-7 5" />
      <path d="M12 10a5 5 0 0 1-5 5" />
      <path d="M12 10a5 5 0 0 0 5 5" />
      <path d="M7 15h10" />
      <path d="M12 15v5" />
      <path d="M7 20h10" />
    </svg>
  )
}
