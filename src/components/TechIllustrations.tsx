/**
 * Original 3D-isometric technology vector illustrations crafted for THREE ANGELS IT SERVICES.
 * Uses deep midnight navy (#0B1220 / #14243A), electric blue (#2563EB), cyan (#06B6D4), and amber (#F59E0B).
 */

export function HeroTechScene() {
  return (
    <div className="relative flex h-full min-h-[340px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0F1B2E] p-4">
      {/* Subtle atmospheric glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-4 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"
      />

      <svg
        viewBox="0 0 640 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="3D isometric illustration of cloud computing, networking nodes, workstation code screen, and cybersecurity shield"
        className="relative z-10 h-full w-full max-w-[600px]"
      >
        <defs>
          <linearGradient id="iso-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="iso-cyan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="iso-amber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="iso-slate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3352" />
            <stop offset="100%" stopColor="#0B1220" />
          </linearGradient>
        </defs>

        {/* Isometric base grid platform */}
        <path
          d="M320 62L578 190L320 318L62 190L320 62Z"
          fill="#101D33"
          stroke="#1E3A5F"
          strokeWidth="1.5"
        />
        <path
          d="M320 92L518 190L320 288L122 190L320 92Z"
          fill="#0B1220"
          stroke="#06B6D4"
          strokeOpacity="0.25"
          strokeDasharray="5 5"
        />

        {/* Luminous network pathways */}
        <path d="M180 148L320 218L468 144" stroke="#06B6D4" strokeWidth="2.5" strokeOpacity="0.7" />
        <path d="M320 112V218" stroke="#2563EB" strokeWidth="2.5" strokeOpacity="0.8" />
        <path d="M210 250L320 218L438 258" stroke="#F59E0B" strokeWidth="2" strokeOpacity="0.7" strokeDasharray="4 4" />

        {/* Cloud Computing Cluster (Top Center) */}
        <g className="animate-subtle-float">
          <path
            d="M276 86C276 72 288 61 303 61C312 61 320 65 325 71C329 68 334 67 340 67C354 67 365 78 365 92C365 93 365 94 365 95C374 98 380 106 380 116C380 128 370 138 357 138H279C265 138 254 127 254 114C254 102 263 91 276 89V86Z"
            fill="url(#iso-slate)"
            stroke="#22D3EE"
            strokeWidth="2"
          />
          <circle cx="298" cy="106" r="5" fill="#06B6D4" />
          <circle cx="320" cy="106" r="5" fill="#2563EB" />
          <circle cx="342" cy="106" r="5" fill="#F59E0B" />
        </g>

        {/* Left 3D Server Rack Cube */}
        <g>
          <path d="M130 122L180 98L230 122L180 146L130 122Z" fill="#2563EB" />
          <path d="M130 122L180 146V202L130 178V122Z" fill="#172A46" stroke="#3B82F6" strokeWidth="1.2" />
          <path d="M230 122L180 146V202L230 178V122Z" fill="#0F1D32" stroke="#1E3A5F" strokeWidth="1.2" />
          <line x1="142" y1="144" x2="168" y2="157" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
          <line x1="142" y1="160" x2="168" y2="173" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
          <circle cx="195" cy="158" r="3" fill="#F59E0B" />
          <circle cx="207" cy="152" r="3" fill="#22D3EE" />
        </g>

        {/* Right 3D Cybersecurity Shield Module */}
        <g>
          <path d="M416 122L466 98L516 122L466 146L416 122Z" fill="#0E223D" stroke="#06B6D4" strokeWidth="1.5" />
          <path d="M416 122L466 146V198L416 174V122Z" fill="#132946" stroke="#06B6D4" strokeWidth="1.2" />
          <path d="M516 122L466 146V198L516 174V122Z" fill="#0B1628" stroke="#1E3A5F" strokeWidth="1.2" />
          {/* Floating shield emblem */}
          <path
            d="M466 64L492 74V96C492 112 480 124 466 130C452 124 440 112 440 96V74L466 64Z"
            fill="url(#iso-cyan)"
            fillOpacity="0.22"
            stroke="#22D3EE"
            strokeWidth="2"
          />
          <path d="M457 96L463 102L476 88" stroke="#F8FAFC" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Center Foreground 3D Workstation Laptop </> */}
        <g>
          {/* Laptop base */}
          <path d="M238 256L320 216L402 256L320 296L238 256Z" fill="url(#iso-blue)" />
          <path d="M238 256L320 296V308L238 268V256Z" fill="#1E3A8A" />
          <path d="M402 256L320 296V308L402 268V256Z" fill="#172554" />
          {/* Screen */}
          <path
            d="M254 166L386 166L398 242L242 242L254 166Z"
            fill="#0F172A"
            stroke="#38BDF8"
            strokeWidth="2"
          />
          <rect x="262" y="176" width="116" height="56" rx="4" fill="#0B1220" />
          {/* </> Code glyph inside screen */}
          <path d="M298 196L284 204L298 212" stroke="#06B6D4" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M326 192L314 216" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <path d="M342 196L356 204L342 212" stroke="#06B6D4" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Floating Hardware & AI Data Nodes */}
        <g>
          <rect x="132" y="256" width="66" height="44" rx="8" fill="#14243A" stroke="#2563EB" strokeWidth="1.5" />
          <circle cx="150" cy="278" r="5" fill="#F59E0B" />
          <line x1="162" y1="274" x2="184" y2="274" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="162" y1="283" x2="178" y2="283" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        <g>
          <rect x="444" y="256" width="74" height="44" rx="8" fill="#14243A" stroke="#F59E0B" strokeOpacity="0.7" strokeWidth="1.5" />
          <path d="M460 286L472 272L482 280L496 266L504 274" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Network pulse nodes */}
        <circle cx="320" cy="348" r="5" fill="#06B6D4" />
        <circle cx="110" cy="190" r="4" fill="#F59E0B" />
        <circle cx="530" cy="190" r="4" fill="#3B82F6" />
      </svg>
    </div>
  );
}

export function CyberShieldGraphic() {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="3D cybersecurity shield protecting digital assets"
      className="h-full w-full"
    >
      <rect width="360" height="220" fill="#0E192D" />
      <path d="M40 165L180 198L320 165" stroke="#1E3A5F" strokeWidth="1.5" />
      <path d="M180 34L244 58V108C244 146 216 174 180 188C144 174 116 146 116 108V58L180 34Z" fill="#14243A" stroke="#06B6D4" strokeWidth="2.5" />
      <path d="M180 54L224 70V106C224 134 205 154 180 165C155 154 136 134 136 106V70L180 54Z" fill="#2563EB" fillOpacity="0.25" stroke="#3B82F6" strokeWidth="1.5" />
      <rect x="164" y="98" width="32" height="26" rx="5" fill="#06B6D4" />
      <path d="M171 98V90C171 84.5 175 80 180 80C185 80 189 84.5 189 90V98" stroke="#F8FAFC" strokeWidth="2.5" />
      <circle cx="180" cy="111" r="3" fill="#0B1220" />
      {/* Deflected warning vectors */}
      <path d="M58 84L98 96" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" />
      <circle cx="52" cy="82" r="6" fill="#F59E0B" />
      <path d="M302 84L262 96" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="308" cy="82" r="6" fill="#22D3EE" />
    </svg>
  );
}

export function CoursesLearningGraphic() {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="3D digital learning modules and programming console"
      className="h-full w-full"
    >
      <rect width="360" height="220" fill="#0E192D" />
      {/* Isometric layered curriculum slabs */}
      <path d="M180 132L286 168L180 202L74 168L180 132Z" fill="#1B3252" stroke="#2563EB" strokeWidth="1.5" />
      <path d="M180 106L270 138L180 170L90 138L180 106Z" fill="#14243A" stroke="#06B6D4" strokeWidth="1.5" />
      {/* Console frame */}
      <rect x="116" y="42" width="128" height="82" rx="10" fill="#0B1220" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="132" cy="56" r="3.5" fill="#F59E0B" />
      <circle cx="144" cy="56" r="3.5" fill="#06B6D4" />
      <circle cx="156" cy="56" r="3.5" fill="#2563EB" />
      <path d="M158 80L144 89L158 98" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M186 76L174 102" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M202 80L216 89L202 98" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloudInfraGraphic() {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="3D cloud computing and networking infrastructure"
      className="h-full w-full"
    >
      <rect width="360" height="220" fill="#0E192D" />
      {/* Cloud node */}
      <path
        d="M148 56C148 44 158 34 171 34C179 34 186 38 190 43C194 41 198 40 203 40C214 40 223 49 223 60V62C231 64 236 71 236 79C236 89 228 97 217 97H150C138 97 129 88 129 77C129 66 137 58 148 56Z"
        fill="#14243A"
        stroke="#06B6D4"
        strokeWidth="2"
      />
      {/* Links */}
      <path d="M152 97L96 146" stroke="#2563EB" strokeWidth="2.5" />
      <path d="M182 97V146" stroke="#06B6D4" strokeWidth="2.5" />
      <path d="M212 97L266 146" stroke="#F59E0B" strokeWidth="2.5" />
      {/* Three server nodes */}
      <rect x="64" y="146" width="64" height="42" rx="8" fill="#14243A" stroke="#2563EB" strokeWidth="1.5" />
      <circle cx="80" cy="167" r="4" fill="#06B6D4" />
      <line x1="92" y1="167" x2="116" y2="167" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

      <rect x="148" y="146" width="64" height="42" rx="8" fill="#14243A" stroke="#06B6D4" strokeWidth="1.5" />
      <circle cx="164" cy="167" r="4" fill="#22D3EE" />
      <line x1="176" y1="167" x2="200" y2="167" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />

      <rect x="232" y="146" width="64" height="42" rx="8" fill="#14243A" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="248" cy="167" r="4" fill="#F59E0B" />
      <line x1="260" y1="167" x2="284" y2="167" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function DigitalResourcesGraphic() {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="3D digital learning guides and reference documentation"
      className="h-full w-full"
    >
      <rect width="360" height="220" fill="#0E192D" />
      <rect x="116" y="48" width="128" height="142" rx="10" fill="#1B3252" stroke="#2563EB" strokeWidth="1.5" transform="rotate(-6 116 48)" />
      <rect x="118" y="38" width="128" height="144" rx="10" fill="#14243A" stroke="#06B6D4" strokeWidth="2" />
      <rect x="136" y="58" width="44" height="10" rx="4" fill="#F59E0B" />
      <line x1="136" y1="86" x2="226" y2="86" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
      <line x1="136" y1="104" x2="212" y2="104" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="136" y1="120" x2="220" y2="120" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="136" y="140" width="90" height="24" rx="6" fill="#2563EB" fillOpacity="0.3" stroke="#3B82F6" />
      <path d="M174 152H188M181 146V158" stroke="#22D3EE" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
