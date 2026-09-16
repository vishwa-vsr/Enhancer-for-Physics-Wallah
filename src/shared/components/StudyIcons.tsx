export interface StudyIconProps {
  name: string;
  size?: number;
  color?: string;
  class?: string;
}

export interface IconDefinition {
  id: string;
  label: string;
  category: 'Math' | 'Physics' | 'Chemistry & Biology' | 'Tech & Code' | 'Study & General';
}

export const STUDY_ICONS_LIST: IconDefinition[] = [
  // Mathematics
  { id: 'calculator', label: 'Calculator', category: 'Math' },
  { id: 'pi', label: 'Pi Symbol (π)', category: 'Math' },
  { id: 'compass', label: 'Geometry Compass', category: 'Math' },
  { id: 'ruler', label: 'Ruler', category: 'Math' },
  { id: 'divide', label: 'Division (÷)', category: 'Math' },
  { id: 'plus-minus', label: 'Plus-Minus (±)', category: 'Math' },
  { id: 'equal', label: 'Equal (=)', category: 'Math' },
  { id: 'percent', label: 'Percentage (%)', category: 'Math' },
  { id: 'infinity', label: 'Infinity (∞)', category: 'Math' },
  { id: 'function', label: 'Function f(x)', category: 'Math' },
  { id: 'sigma', label: 'Sigma / Summation (Σ)', category: 'Math' },
  { id: 'fx', label: 'Function Subscript (fx)', category: 'Math' },

  // Physics & Space
  { id: 'atom', label: 'Atom', category: 'Physics' },
  { id: 'magnet', label: 'Magnet', category: 'Physics' },
  { id: 'lightning', label: 'Lightning / Electricity', category: 'Physics' },
  { id: 'rocket', label: 'Rocket', category: 'Physics' },
  { id: 'telescope', label: 'Telescope', category: 'Physics' },
  { id: 'satellite', label: 'Satellite', category: 'Physics' },
  { id: 'pendulum', label: 'Pendulum', category: 'Physics' },
  { id: 'battery', label: 'Battery / Energy', category: 'Physics' },
  { id: 'sparkles', label: 'Quantum Sparkles', category: 'Physics' },
  { id: 'wave', label: 'Sine Wave', category: 'Physics' },

  // Chemistry & Biology
  { id: 'flask', label: 'Conical Flask', category: 'Chemistry & Biology' },
  { id: 'test-tube', label: 'Test Tube', category: 'Chemistry & Biology' },
  { id: 'beaker', label: 'Beaker', category: 'Chemistry & Biology' },
  { id: 'dna', label: 'Vertical DNA Helix', category: 'Chemistry & Biology' },
  { id: 'microscope', label: 'Microscope', category: 'Chemistry & Biology' },
  { id: 'leaf', label: 'Biology Leaf', category: 'Chemistry & Biology' },
  { id: 'plant', label: 'Sprout / Botany', category: 'Chemistry & Biology' },
  { id: 'droplet', label: 'Solution Droplet', category: 'Chemistry & Biology' },
  { id: 'flame', label: 'Bunsen Flame', category: 'Chemistry & Biology' },
  { id: 'brain', label: 'Brain / Neuroscience', category: 'Chemistry & Biology' },
  { id: 'pill', label: 'Capsule / Medical', category: 'Chemistry & Biology' },
  { id: 'cell', label: 'Cell Structure', category: 'Chemistry & Biology' },

  // Technology & Code
  { id: 'code', label: 'Code Tag', category: 'Tech & Code' },
  { id: 'terminal', label: 'Command Terminal', category: 'Tech & Code' },
  { id: 'cpu', label: 'CPU Microchip', category: 'Tech & Code' },
  { id: 'binary', label: 'Binary Stream', category: 'Tech & Code' },
  { id: 'database', label: 'Database', category: 'Tech & Code' },
  { id: 'laptop', label: 'Laptop', category: 'Tech & Code' },
  { id: 'network', label: 'Network Graph', category: 'Tech & Code' },
  { id: 'bug', label: 'Bug / Debug', category: 'Tech & Code' },

  // Study & General Academics
  { id: 'book', label: 'Textbook', category: 'Study & General' },
  { id: 'notebook', label: 'Notebook', category: 'Study & General' },
  { id: 'file-text', label: 'Document', category: 'Study & General' },
  { id: 'graduation-cap', label: 'Graduation Cap', category: 'Study & General' },
  { id: 'diploma', label: 'Diploma / Scroll', category: 'Study & General' },
  { id: 'lightbulb', label: 'Idea / Lightbulb', category: 'Study & General' },
  { id: 'pencil', label: 'Pencil', category: 'Study & General' },
  { id: 'target', label: 'Target / Goal', category: 'Study & General' },
  { id: 'star', label: 'Star Rating', category: 'Study & General' },
  { id: 'trophy', label: 'Trophy Award', category: 'Study & General' },
  { id: 'globe', label: 'World Globe', category: 'Study & General' },
  { id: 'clock', label: 'Timer / Clock', category: 'Study & General' },
  { id: 'bookmark', label: 'Bookmark', category: 'Study & General' },
];

export const StudyIcon = ({
  name,
  size = 18,
  color = 'currentColor',
  class: className = '',
}: StudyIconProps) => {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    width: size,
    height: size,
    class: className,
    style: { display: 'block', flexShrink: 0 },
  };

  switch (name) {
    // ----------------- MATHEMATICS -----------------
    case 'calculator':
      return (
        <svg {...commonProps}>
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <line x1="8" x2="16" y1="6" y2="6" />
          <line x1="16" x2="16.01" y1="14" y2="14" />
          <line x1="16" x2="16.01" y1="18" y2="18" />
          <line x1="12" x2="12.01" y1="10" y2="10" />
          <line x1="12" x2="12.01" y1="14" y2="14" />
          <line x1="12" x2="12.01" y1="18" y2="18" />
          <line x1="8" x2="8.01" y1="10" y2="10" />
          <line x1="8" x2="8.01" y1="14" y2="14" />
          <line x1="8" x2="8.01" y1="18" y2="18" />
        </svg>
      );

    case 'pi':
      return (
        <svg {...commonProps}>
          <line x1="4" x2="20" y1="5" y2="5" />
          <path d="M8 5v14" />
          <path d="M16 5v10c0 2.2 1.8 4 4 4" />
        </svg>
      );

    case 'compass':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="5" r="2" />
          <path d="m12 7-1.9 5.8a2 2 0 0 0 1.2 2.5l2.4.8a2 2 0 0 0 2.5-1.2L18 9" />
          <path d="M7 21l3.5-11" />
          <path d="m17 21-2.5-8" />
          <path d="M9 16h6" />
        </svg>
      );

    case 'ruler':
      return (
        <svg {...commonProps}>
          <path d="M21.3 8.7 8.7 21.3a2.5 2.5 0 0 1-3.5 0l-2.5-2.5a2.5 2.5 0 0 1 0-3.5L15.3 2.7a2.5 2.5 0 0 1 3.5 0l2.5 2.5a2.5 2.5 0 0 1 0 3.5Z" />
          <line x1="7.5" y1="10.5" x2="10.5" y2="13.5" />
          <line x1="10.5" y1="7.5" x2="13.5" y2="10.5" />
          <line x1="13.5" y1="4.5" x2="16.5" y2="7.5" />
        </svg>
      );

    case 'divide':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="6" r="1.5" fill={color} />
          <line x1="5" x2="19" y1="12" y2="12" />
          <circle cx="12" cy="18" r="1.5" fill={color} />
        </svg>
      );

    case 'plus-minus':
      return (
        <svg {...commonProps}>
          <line x1="12" x2="12" y1="4" y2="12" />
          <line x1="8" x2="16" y1="8" y2="8" />
          <line x1="7" x2="17" y1="18" y2="18" />
        </svg>
      );

    case 'equal':
      return (
        <svg {...commonProps}>
          <line x1="5" x2="19" y1="9" y2="9" />
          <line x1="5" x2="19" y1="15" y2="15" />
        </svg>
      );

    case 'percent':
      return (
        <svg {...commonProps}>
          <line x1="19" x2="5" y1="5" y2="19" />
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );

    case 'infinity':
      return (
        <svg {...commonProps}>
          <path d="M12 12c-2-2.7-4-4-6.5-4a4.5 4.5 0 0 0 0 9c2.5 0 4.5-1.3 6.5-4Zm0 0c2 2.7 4 4 6.5 4a4.5 4.5 0 0 0 0-9c-2.5 0-4.5 1.3-6.5 4Z" />
        </svg>
      );

    case 'function':
      return (
        <svg {...commonProps}>
          <path d="M9 3a3 3 0 0 0-3 3v11a3 3 0 0 1-3 3" />
          <line x1="2" y1="11" x2="9" y2="11" />
          <path d="M12 6c-1.5 3.5-1.5 8.5 0 12" />
          <line x1="14.5" y1="9.5" x2="18.5" y2="14.5" />
          <line x1="18.5" y1="9.5" x2="14.5" y2="14.5" />
          <path d="M21 6c1.5 3.5 1.5 8.5 0 12" />
        </svg>
      );

    case 'sigma':
      return (
        <svg {...commonProps}>
          <polyline points="18 7 18 4 6 4 13 12 6 20 18 20 18 17" />
        </svg>
      );

    case 'fx':
      return (
        <svg {...commonProps}>
          <path d="M14 3a3.5 3.5 0 0 0-3.5 3.5v10a3.5 3.5 0 0 1-3.5 3.5" />
          <line x1="5" y1="10" x2="14" y2="10" />
          <line x1="15" y1="15" x2="20" y2="20" />
          <line x1="20" y1="15" x2="15" y2="20" />
        </svg>
      );

    // ----------------- PHYSICS & SPACE -----------------
    case 'atom':
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill={color} />
        </svg>
      );

    case 'magnet':
      return (
        <svg {...commonProps}>
          <path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15" />
          <path d="m5 8 4 4" />
          <path d="m12 15 4 4" />
        </svg>
      );

    case 'lightning':
      return (
        <svg {...commonProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );

    case 'rocket':
      return (
        <svg {...commonProps}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );

    case 'telescope':
      return (
        <svg {...commonProps}>
          <path d="m10 11 11-6a1 1 0 0 1 1.4.9v2.2a1 1 0 0 1-.5.9l-11 6" />
          <path d="m2 15 8-4.5v5L2 20Z" />
          <line x1="8" y1="17.5" x2="6" y2="22" />
          <line x1="12" y1="15" x2="14" y2="22" />
        </svg>
      );

    case 'satellite':
      return (
        <svg {...commonProps}>
          <path d="M13 7 9 3 5 7l4 4" />
          <path d="m17 11 4 4-4 4-4-4" />
          <path d="m8 12 4 4 6-6-4-4Z" />
          <path d="m16 8 3-3" />
          <path d="M9 21a6 6 0 0 0-6-6" />
        </svg>
      );

    case 'pendulum':
      return (
        <svg {...commonProps}>
          <line x1="4" x2="20" y1="3" y2="3" />
          <line x1="12" x2="16" y1="3" y2="15" />
          <circle cx="17" cy="18" r="3" />
        </svg>
      );

    case 'battery':
      return (
        <svg {...commonProps}>
          <rect width="16" height="10" x="2" y="7" rx="2" ry="2" />
          <line x1="22" x2="22" y1="11" y2="13" />
          <line x1="6" x2="6" y1="10" y2="14" />
          <line x1="10" x2="10" y1="10" y2="14" />
        </svg>
      );

    case 'sparkles':
      return (
        <svg {...commonProps}>
          <path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5Z" />
          <path d="M19 3v4M21 5h-4" />
        </svg>
      );

    case 'wave':
      return (
        <svg {...commonProps}>
          <path d="M2 12c2.5-6 4.5-6 7 0s4.5 6 7 0 4.5-6 6 0" />
        </svg>
      );

    // ----------------- CHEMISTRY & BIOLOGY -----------------
    case 'flask':
      return (
        <svg {...commonProps}>
          <path d="M10 2v7.31L4.15 19.1A2 2 0 0 0 5.86 22h12.28a2 2 0 0 0 1.71-2.9L14 9.31V2" />
          <line x1="8.5" x2="15.5" y1="2" y2="2" />
          <line x1="6.5" x2="17.5" y1="16" y2="16" />
        </svg>
      );

    case 'test-tube':
      return (
        <svg {...commonProps}>
          <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
          <line x1="8.5" x2="15.5" y1="2" y2="2" />
          <line x1="9.5" x2="14.5" y1="12" y2="12" />
        </svg>
      );

    case 'beaker':
      return (
        <svg {...commonProps}>
          <path d="M4 3h16l-2 16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L4 3Z" />
          <line x1="4" x2="20" y1="3" y2="3" />
          <line x1="7" x2="11" y1="8" y2="8" />
          <line x1="7" x2="12" y1="12" y2="12" />
          <line x1="7" x2="11" y1="16" y2="16" />
        </svg>
      );

    // FIXED GORGEOUS VERTICAL SCIENTIFIC DNA DOUBLE HELIX
    case 'dna':
      return (
        <svg {...commonProps}>
          {/* Main vertical helical strands */}
          <path d="M7 2c0 5 10 5 10 10s-10 5-10 10" />
          <path d="M17 2c0 5-10 5-10 10s10 5 10 10" />
          {/* Horizontal cross base-pair rungs */}
          <line x1="8.5" y1="4.5" x2="15.5" y2="4.5" />
          <line x1="9.5" y1="9.5" x2="14.5" y2="9.5" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
          <line x1="8.5" y1="19.5" x2="15.5" y2="19.5" />
        </svg>
      );

    case 'microscope':
      return (
        <svg {...commonProps}>
          <path d="M6 18h8" />
          <path d="M3 22h18" />
          <path d="M14 22a7 7 0 1 0 0-14h-1" />
          <path d="M9 14h2" />
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
      );

    case 'leaf':
      return (
        <svg {...commonProps}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );

    case 'plant':
      return (
        <svg {...commonProps}>
          <path d="M12 10a4 4 0 0 0-4-4H4v4a4 4 0 0 0 4 4" />
          <path d="M12 10a4 4 0 0 1 4-4h4v4a4 4 0 0 1-4 4" />
          <path d="M12 4v16" />
          <path d="M4 20h16" />
        </svg>
      );

    case 'droplet':
      return (
        <svg {...commonProps}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );

    case 'flame':
      return (
        <svg {...commonProps}>
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );

    case 'brain':
      return (
        <svg {...commonProps}>
          <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .8.2 1.5.6 2.2A4.5 4.5 0 0 0 4 13c0 2 1.3 3.7 3.1 4.3A4.5 4.5 0 0 0 12 21V2Z" />
          <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .8-.2 1.5-.6 2.2A4.5 4.5 0 0 1 20 13c0 2-1.3 3.7-3.1 4.3A4.5 4.5 0 0 1 12 21V2Z" />
        </svg>
      );

    case 'pill':
      return (
        <svg {...commonProps}>
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <line x1="8.5" x2="15.5" y1="8.5" y2="15.5" />
        </svg>
      );

    case 'cell':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" fill={color} />
          <circle cx="16" cy="8" r="1" fill={color} />
          <circle cx="8" cy="15" r="1" fill={color} />
        </svg>
      );

    // ----------------- TECH & CODE -----------------
    case 'code':
      return (
        <svg {...commonProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );

    case 'terminal':
      return (
        <svg {...commonProps}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" x2="20" y1="19" y2="19" />
        </svg>
      );

    case 'cpu':
      return (
        <svg {...commonProps}>
          <rect width="12" height="12" x="6" y="6" rx="2" />
          <line x1="9" x2="9" y1="1" y2="6" />
          <line x1="15" x2="15" y1="1" y2="6" />
          <line x1="9" x2="9" y1="18" y2="23" />
          <line x1="15" x2="15" y1="18" y2="23" />
          <line x1="1" x2="6" y1="9" y2="9" />
          <line x1="1" x2="6" y1="15" y2="15" />
          <line x1="18" x2="23" y1="9" y2="9" />
          <line x1="18" x2="23" y1="15" y2="15" />
        </svg>
      );

    case 'binary':
      return (
        <svg {...commonProps}>
          <rect width="4" height="6" x="6" y="4" rx="1" />
          <line x1="16" x2="16" y1="4" y2="10" />
          <line x1="8" x2="8" y1="14" y2="20" />
          <rect width="4" height="6" x="14" y="14" rx="1" />
        </svg>
      );

    case 'database':
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );

    case 'laptop':
      return (
        <svg {...commonProps}>
          <rect width="18" height="12" x="3" y="4" rx="2" />
          <line x1="2" x2="22" y1="20" y2="20" />
        </svg>
      );

    case 'network':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="5" r="2.5" />
          <circle cx="5" cy="18" r="2.5" />
          <circle cx="19" cy="18" r="2.5" />
          <line x1="10" x2="6.5" y1="7" y2="16" />
          <line x1="14" x2="17.5" y1="7" y2="16" />
          <line x1="7.5" x2="16.5" y1="18" y2="18" />
        </svg>
      );

    case 'bug':
      return (
        <svg {...commonProps}>
          <rect width="8" height="12" x="8" y="7" rx="4" />
          <path d="m19 7-3 2" />
          <path d="m5 7 3 2" />
          <path d="m19 17-3-2" />
          <path d="m5 17 3-2" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <path d="M10 4h4" />
        </svg>
      );

    // ----------------- STUDY & GENERAL ACADEMICS -----------------
    case 'notebook':
      return (
        <svg {...commonProps}>
          <path d="M2 6h4" />
          <path d="M2 10h4" />
          <path d="M2 14h4" />
          <path d="M2 18h4" />
          <rect width="16" height="20" x="4" y="2" rx="2" />
          <path d="M9.5 8h5" />
          <path d="M9.5 12h5" />
          <path d="M9.5 16h3" />
        </svg>
      );

    case 'file-text':
      return (
        <svg {...commonProps}>
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M10 9H8" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
        </svg>
      );

    case 'graduation-cap':
      return (
        <svg {...commonProps}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );

    case 'diploma':
      return (
        <svg {...commonProps}>
          <path d="M15 12h-5" />
          <path d="M15 8h-5" />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
          <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1Z" />
          <path d="M4 17a2 2 0 0 1 2-2h4v6H6a2 2 0 0 1-2-2v-2Z" />
        </svg>
      );

    case 'lightbulb':
      return (
        <svg {...commonProps}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 0 0-7-7z" />
        </svg>
      );

    case 'pencil':
      return (
        <svg {...commonProps}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <line x1="15" x2="19" y1="5" y2="9" />
        </svg>
      );

    case 'target':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );

    case 'star':
      return (
        <svg {...commonProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );

    case 'trophy':
      return (
        <svg {...commonProps}>
          <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" />
          <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
          <path d="M4 3h16v6a6 6 0 0 1-12 0V3Z" />
          <path d="M12 15v3" />
          <path d="M8 21h8" />
        </svg>
      );

    case 'globe':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );

    case 'bookmark':
      return (
        <svg {...commonProps}>
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      );

    case 'book':
    default:
      return (
        <svg {...commonProps}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      );
  }
};
