type Props = {
  size?: number;
  className?: string;
  children: React.ReactNode;
};

export function Icon({ size = 16, className, children }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconSearch({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconSync({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path
        d="M4 12a8 8 0 0 1 13.4-5.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 9V4h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 12a8 8 0 0 1-13.4 5.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 15v5h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function IconPlus({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconLock({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Icon size={size} className={className}>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 10V8a4 4 0 0 1 8 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function IconLogOut({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M10 7V5a2 2 0 0 1 2-2h5v16h-5a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="2" />
      <path d="M13 12H4m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconExternalLink({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M14 5h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 14L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M19 14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function IconMoreHorizontal({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </Icon>
  );
}

export function IconKey({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Icon size={size} className={className}>
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M11 12l9-9m0 0h-4m4 0v4M15 7l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function IconMail({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Icon size={size} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function IconCopy({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconEdit({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path
        d="M4 20h4l10-10-4-4L4 16v4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function IconTrash({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconX({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconNote({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path
        d="M7 4h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M14 4v4h4M8 12h8M8 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconShield({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Icon size={size} className={className}>
      <path
        d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Icon>
  );
}

export function IconFolder({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Icon>
  );
}

export function IconGlobe({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Icon>
  );
}

export function IconCalendar({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconWand({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path
        d="M15 4l5 5M4 20l9-9M9 11l2 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconChevronRight({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconUser({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconMenu({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconEye({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Icon size={size} className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconEyeOff({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.4M9.9 5.1A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-4.2 4.7M6.1 6.1C3.5 8 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  );
}

export function IconRestore({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

export function IconVault({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}

export function IconShare({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="6" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="18" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8.2 11l6.3-3.8M8.2 13l6.3 3.8" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function IconWarning({ size = 16 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path
        d="M12 4l9 16H3L12 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 10v4M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Icon>
  );
}
