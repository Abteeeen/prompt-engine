import React from 'react'

interface IconProps {
  className?: string
  strokeWidth?: number
}

function base({ className = 'w-4 h-4', strokeWidth = 2 }: IconProps, children: React.ReactNode) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const HomeIcon = (p: IconProps) => base(p, <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></>)
export const GridIcon = (p: IconProps) => base(p, <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>)
export const ZapIcon = (p: IconProps) => base(p, <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />)
export const BookmarkIcon = (p: IconProps) => base(p, <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />)
export const SettingsIcon = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>)
export const LogOutIcon = (p: IconProps) => base(p, <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>)
export const CopyIcon = (p: IconProps) => base(p, <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>)
export const CheckIcon = (p: IconProps) => base(p, <path d="M20 6 9 17l-5-5" />)
export const ExternalLinkIcon = (p: IconProps) => base(p, <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" /></>)
export const StarIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg className={p.className || 'w-4 h-4'} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={p.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)
export const TrashIcon = (p: IconProps) => base(p, <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>)
export const ChevronDownIcon = (p: IconProps) => base(p, <path d="m6 9 6 6 6-6" />)
export const ClockIcon = (p: IconProps) => base(p, <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>)
export const SearchIcon = (p: IconProps) => base(p, <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>)
export const XIcon = (p: IconProps) => base(p, <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>)
export const ArrowRightIcon = (p: IconProps) => base(p, <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>)
export const ArrowLeftIcon = (p: IconProps) => base(p, <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>)
export const AlertIcon = (p: IconProps) => base(p, <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" /></>)
export const SendIcon = (p: IconProps) => base(p, <><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" /></>)
export const PaperclipIcon = (p: IconProps) => base(p, <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />)
export const SparkleIcon = (p: IconProps) => base(p, <><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m5.6 5.6 2.8 2.8" /><path d="m15.6 15.6 2.8 2.8" /><path d="m5.6 18.4 2.8-2.8" /><path d="m15.6 8.4 2.8-2.8" /></>)
export const ThumbsUpIcon = (p: IconProps) => base(p, <><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></>)
export const ThumbsDownIcon = (p: IconProps) => base(p, <><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /></>)
export const UserIcon = (p: IconProps) => base(p, <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>)
export const FileTextIcon = (p: IconProps) => base(p, <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>)
export const RefreshIcon = (p: IconProps) => base(p, <><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></>)

export function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
