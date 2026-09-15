export function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
      <path
        d="M7.6 9.8h2.6v8.4H7.6V9.8Zm1.3-4.2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 9.8h2.5v1.2h.03c.35-.66 1.2-1.36 2.47-1.36 2.64 0 3.13 1.74 3.13 4v4.56h-2.6v-4.04c0-.96-.02-2.2-1.34-2.2-1.34 0-1.55 1.05-1.55 2.13v4.11H12V9.8Z"
        fill="white"
      />
    </svg>
  );
}

export function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
          <stop offset="0%" stopColor="#FEE411" />
          <stop offset="20%" stopColor="#FEDA77" />
          <stop offset="40%" stopColor="#F58529" />
          <stop offset="60%" stopColor="#DD2A7B" />
          <stop offset="80%" stopColor="#8134AF" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="white" strokeWidth="1.6" />
      <circle cx="16.4" cy="7.6" r="1" fill="white" />
    </svg>
  );
}
