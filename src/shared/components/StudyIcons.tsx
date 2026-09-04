export interface StudyIconProps {
  name: string;
  size?: number;
  color?: string;
  class?: string;
}

export const STUDY_ICONS_LIST = [
  { id: 'calculator', label: 'Calculator / Math' },
  { id: 'atom', label: 'Atom / Physics' },
  { id: 'flask', label: 'Flask / Chemistry' },
  { id: 'dna', label: 'DNA / Biology' },
  { id: 'microscope', label: 'Microscope' },
  { id: 'lightning', label: 'Lightning / Energy' },
  { id: 'magnet', label: 'Magnet' },
  { id: 'compass', label: 'Compass / Geometry' },
  { id: 'book', label: 'Book' },
  { id: 'notebook', label: 'Notebook' },
  { id: 'file-text', label: 'Document' },
  { id: 'graduation-cap', label: 'Graduation' },
  { id: 'lightbulb', label: 'Lightbulb / Idea' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'code', label: 'Code' },
  { id: 'target', label: 'Target / Goal' },
  { id: 'star', label: 'Star' },
  { id: 'globe', label: 'Globe' },
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

    case 'atom':
      return (
        <svg {...commonProps}>
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.8" fill={color} />
        </svg>
      );

    case 'flask':
      return (
        <svg {...commonProps}>
          <path d="M10 2v7.31L4.15 19.1A2 2 0 0 0 5.86 22h12.28a2 2 0 0 0 1.71-2.9L14 9.31V2" />
          <line x1="8.5" x2="15.5" y1="2" y2="2" />
          <line x1="6.5" x2="17.5" y1="16" y2="16" />
        </svg>
      );

    case 'dna':
      return (
        <svg {...commonProps}>
          <path d="m2 15 8.5-8.5" />
          <path d="m22 9-8.5 8.5" />
          <path d="M2 9a7 7 0 0 1 10.5 6 7 7 0 0 0 9.5 0" />
          <path d="M2 15a7 7 0 0 0 10.5-6 7 7 0 0 1 9.5 0" />
          <path d="m7 7 3-3" />
          <path d="m14 20 3-3" />
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

    case 'lightning':
      return (
        <svg {...commonProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

    case 'lightbulb':
      return (
        <svg {...commonProps}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-7 7c0 2.4 1.2 4.5 3 5.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3c1.8-1.2 3-3.3 3-5.7a7 7 0 0 0-7-7z" />
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

    case 'code':
      return (
        <svg {...commonProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
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

    case 'globe':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
