export function MessengerWallpaper() {
  return (
    <div className="messenger-wallpaper pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg
        className="messenger-wallpaper__field absolute -inset-[8%] h-[116%] w-[116%] text-primary"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="messenger-wallpaper-pattern" width="288" height="244" patternUnits="userSpaceOnUse">
            <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
              <path d="M29 34 66 19 54 57 43 43 33 51l4-14-8-3Z" />
              <path d="m43 43 23-24" />

              <path d="M126 24c0-7 6-12 13-12h28c8 0 14 5 14 12v14c0 7-6 12-14 12h-13l-12 10 2-10h-5c-7 0-13-5-13-12V24Z" />
              <path d="M141 31h25" />

              <path d="m242 28 3 9 9 3-9 4-3 9-4-9-9-4 9-3 4-9Z" />
              <circle cx="262" cy="78" r="4" />

              <path d="M45 120c-5-7-17-4-17 6 0 11 17 20 17 20s17-9 17-20c0-10-12-13-17-6Z" />
              <path d="M102 103c7-10 21-10 28 0 5 7 4 17-2 23-4 4-6 7-6 12h-12c0-5-2-8-6-12-6-6-7-16-2-23Z" />
              <path d="M109 146h14M111 153h10" />

              <path d="M194 101h29c8 0 14 6 14 14v19c0 8-6 14-14 14h-10l-13 11 2-11h-8c-8 0-14-6-14-14v-19c0-8 6-14 14-14Z" />
              <path d="M195 124h27" />

              <path d="m268 154-10 17h10l-7 18 20-23h-11l9-12h-11Z" />

              <path d="M18 204c10-9 20-9 30 0s20 9 30 0" />
              <circle cx="104" cy="209" r="8" />
              <path d="m104 205 3 3-5 6" />

              <path d="M153 189h24c7 0 12 5 12 12v17c0 7-5 12-12 12h-24c-7 0-12-5-12-12v-17c0-7 5-12 12-12Z" />
              <path d="M153 189v-6c0-7 5-12 12-12s12 5 12 12v6M157 209h16" />
              <circle cx="157" cy="203" r="1" fill="currentColor" stroke="none" />
              <circle cx="173" cy="203" r="1" fill="currentColor" stroke="none" />

              <path d="m232 208 8 8 17-20" />
              <path d="M224 209c0-12 9-21 21-21 11 0 20 9 20 21s-9 21-20 21c-12 0-21-9-21-21Z" />
            </g>
          </pattern>

          <filter id="messenger-wallpaper-warp" x="-12%" y="-12%" width="124%" height="124%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.011"
              numOctaves="1"
              seed="17"
              result="wallpaper-noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="28s"
                values="0.006 0.011;0.009 0.007;0.005 0.014;0.006 0.011"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="wallpaper-noise" scale="20" xChannelSelector="R" yChannelSelector="B">
              <animate attributeName="scale" dur="22s" values="12;26;16;12" repeatCount="indefinite" />
            </feDisplacementMap>
          </filter>

          <linearGradient id="messenger-wallpaper-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0.32" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.8" />
            <stop offset="1" stopColor="white" stopOpacity="0.42" />
          </linearGradient>
          <mask id="messenger-wallpaper-mask">
            <rect width="1440" height="900" fill="url(#messenger-wallpaper-fade)" />
          </mask>
        </defs>

        <g className="messenger-wallpaper__distorted" filter="url(#messenger-wallpaper-warp)" mask="url(#messenger-wallpaper-mask)">
          <rect width="1440" height="900" fill="url(#messenger-wallpaper-pattern)" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/35 to-background" />
    </div>
  );
}
