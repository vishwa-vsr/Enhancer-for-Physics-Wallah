export interface StudyIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  class?: string;
}

export interface IconDefinition {
  id: string;
  label: string;
  category: 'Math' | 'Physics' | 'Chemistry & Biology' | 'Tech & Code' | 'Study & General';
}

export const STUDY_ICONS_LIST: IconDefinition[] = [
  // ----------------- MATH -----------------
  { id: 'equal-sign', label: 'Equal Sign (=)', category: 'Math' },
  { id: 'not-equal-sign', label: 'Not Equal (≠)', category: 'Math' },
  { id: 'less-than', label: 'Less Than (<)', category: 'Math' },
  { id: 'greater-than', label: 'Greater Than (>)', category: 'Math' },
  { id: 'inequality-01', label: 'Less or Equal (≤)', category: 'Math' },
  { id: 'inequality-02', label: 'Greater or Equal (≥)', category: 'Math' },
  { id: '1st-brecket', label: 'Parentheses ()', category: 'Math' },
  { id: '2nd-brecket', label: 'Square Brackets []', category: 'Math' },
  { id: '3rd-brecket', label: 'Curly Braces {}', category: 'Math' },
  { id: 'plus-minus-01', label: 'Plus-Minus (±)', category: 'Math' },
  { id: 'minus-plus-01', label: 'Minus-Plus (∓)', category: 'Math' },
  { id: 'plus-minus-02', label: 'Plus-Minus Diagonal', category: 'Math' },
  { id: 'minus-plus-02', label: 'Minus-Plus Diagonal', category: 'Math' },
  { id: 'plus-sign', label: 'Addition (+)', category: 'Math' },
  { id: 'minus-sign', label: 'Subtraction (−)', category: 'Math' },
  { id: 'multiplication-sign', label: 'Multiplication (×)', category: 'Math' },
  { id: 'divide-sign', label: 'Division (÷)', category: 'Math' },
  { id: 'percent', label: 'Percentage (%)', category: 'Math' },
  { id: 'triangle-01', label: 'Equilateral Triangle', category: 'Math' },
  { id: 'triangle-02', label: 'Delta Triangle', category: 'Math' },
  { id: 'left-triangle', label: 'Left Right Triangle', category: 'Math' },
  { id: 'right-triangle', label: 'Right Triangle', category: 'Math' },
  { id: 'parabola-01', label: 'Parabola Up', category: 'Math' },
  { id: 'parabola-02', label: 'Parabola Axis', category: 'Math' },
  { id: 'parabola-03', label: 'Parabola Curve', category: 'Math' },
  { id: 'compass', label: 'Geometry Compass', category: 'Math' },
  { id: 'angle', label: 'Angle', category: 'Math' },
  { id: 'acute', label: 'Acute Angle', category: 'Math' },
  { id: 'left-angle', label: 'Left Angle', category: 'Math' },
  { id: 'right-angle', label: 'Right Angle', category: 'Math' },
  { id: 'hyperbole', label: 'Hyperbola', category: 'Math' },
  { id: 'coordinate-01', label: '2D Coordinates', category: 'Math' },
  { id: 'reflex', label: 'Reflex Angle', category: 'Math' },
  { id: 'angle-02', label: 'Angle Ray', category: 'Math' },
  { id: 'obtuse', label: 'Obtuse Angle', category: 'Math' },
  { id: 'calculator', label: 'Calculator', category: 'Math' },
  { id: 'cordinate-02', label: '3D Coordinates', category: 'Math' },
  { id: 'tan', label: 'Tangent (tan)', category: 'Math' },
  { id: 'sin', label: 'Sine (sin)', category: 'Math' },
  { id: 'cos', label: 'Cosine (cos)', category: 'Math' },
  { id: 'beta', label: 'Beta Symbol (β)', category: 'Math' },
  { id: 'pi', label: 'Pi Symbol (π)', category: 'Math' },
  { id: 'insert-pi', label: 'Insert Pi', category: 'Math' },
  { id: 'remove-pi', label: 'Remove Pi', category: 'Math' },
  { id: 'alpha', label: 'Alpha Symbol (α)', category: 'Math' },
  { id: 'infinity-01', label: 'Infinity (∞)', category: 'Math' },
  { id: 'approximately-equal', label: 'Approx Equal (≈)', category: 'Math' },
  { id: 'congruent-to', label: 'Congruent (≅)', category: 'Math' },
  { id: 'function-of-x', label: 'Function f(x)', category: 'Math' },
  { id: 'function', label: 'Function f', category: 'Math' },
  { id: 'x-variable', label: 'Variable x', category: 'Math' },
  { id: 'square-01', label: 'Square Power (x²)', category: 'Math' },
  { id: 'root-01', label: 'Square Root (√x)', category: 'Math' },
  { id: 'n-th-root', label: 'Nth Root (ⁿ√x)', category: 'Math' },
  { id: 'summation-01', label: 'Summation (Σ)', category: 'Math' },
  { id: 'more-or-less', label: 'More or Less (≷)', category: 'Math' },
  { id: 'sine-01', label: 'Sine Wave 1', category: 'Math' },
  { id: 'sine-02', label: 'Sine Wave 2', category: 'Math' },
  { id: 'cosine-01', label: 'Cosine Wave 1', category: 'Math' },
  { id: 'cosine-02', label: 'Cosine Wave 2', category: 'Math' },
  { id: 'prism', label: 'Prism 3D (Geometry)', category: 'Math' },
  { id: 'cube', label: 'Cube 3D', category: 'Math' },
  { id: 'rectangular', label: 'Cuboid 3D', category: 'Math' },
  { id: 'pyramid', label: 'Pyramid 3D', category: 'Math' },
  { id: 'sphere', label: 'Sphere 3D', category: 'Math' },
  { id: 'cylinder-01', label: 'Cylinder Vertical', category: 'Math' },
  { id: 'cylinder-02', label: 'Truncated Cone', category: 'Math' },
  { id: 'cylinder-03', label: 'Cylinder 3D', category: 'Math' },
  { id: 'cone-01', label: 'Cone 3D', category: 'Math' },
  { id: 'cylinder-04', label: 'Hemisphere Cylinder', category: 'Math' },
  { id: 'cone-02', label: 'Inverted Cone', category: 'Math' },
  { id: 'infinity-02', label: 'Infinity Variant', category: 'Math' },
  { id: 'absolute', label: 'Absolute Value (|x|)', category: 'Math' },
  { id: 'matrix', label: 'Matrix Grid', category: 'Math' },
  { id: 'root-02', label: 'Root Variant', category: 'Math' },
  { id: 'summation-02', label: 'Summation Bracket', category: 'Math' },
  { id: 'abacus', label: 'Abacus', category: 'Math' },
  { id: 'equal-sign-square', label: 'Equal (Square)', category: 'Math' },
  { id: 'not-equal-sign-square', label: 'Not Equal (Square)', category: 'Math' },
  { id: 'less-than-square', label: 'Less Than (Square)', category: 'Math' },
  { id: 'greater-than-square', label: 'Greater Than (Square)', category: 'Math' },
  { id: 'inequality-square-01', label: 'Inequality (Square 1)', category: 'Math' },
  { id: 'inequality-square-02', label: 'Inequality (Square 2)', category: 'Math' },
  { id: '1st-brecket-square', label: 'Parentheses (Square)', category: 'Math' },
  { id: '2nd-brecket-square', label: 'Brackets (Square)', category: 'Math' },
  { id: '3rd-brecket-square', label: 'Braces (Square)', category: 'Math' },
  { id: 'plus-minus-square-01', label: 'Plus-Minus (Square 1)', category: 'Math' },
  { id: 'minus-plus-square-01', label: 'Minus-Plus (Square 1)', category: 'Math' },
  { id: 'plus-minus-square-02', label: 'Plus-Minus (Square 2)', category: 'Math' },
  { id: 'minus-plus-square-02', label: 'Minus-Plus (Square 2)', category: 'Math' },
  { id: 'plus-sign-square', label: 'Plus (Square)', category: 'Math' },
  { id: 'minus-sign-square', label: 'Minus (Square)', category: 'Math' },
  { id: 'multiplication-sign-square', label: 'Multiply (Square)', category: 'Math' },
  { id: 'divide-sign-square', label: 'Divide (Square)', category: 'Math' },
  { id: 'percent-square', label: 'Percent (Square)', category: 'Math' },
  { id: 'pi-square', label: 'Pi (Square)', category: 'Math' },
  { id: 'alpha-square', label: 'Alpha (Square)', category: 'Math' },
  { id: 'infinity-square', label: 'Infinity (Square)', category: 'Math' },
  { id: 'approximately-equal-square', label: 'Approx Equal (Square)', category: 'Math' },
  { id: 'congruent-to-square', label: 'Congruent (Square)', category: 'Math' },
  { id: 'function-square', label: 'Function f (Square)', category: 'Math' },
  { id: 'x-variable-square', label: 'Variable x (Square)', category: 'Math' },
  { id: 'square-square', label: 'x² (Square)', category: 'Math' },
  { id: 'square-root-square', label: 'Square Root (Square)', category: 'Math' },
  { id: 'n-th-root-square', label: 'Nth Root (Square)', category: 'Math' },
  { id: 'summation-square', label: 'Summation (Square)', category: 'Math' },
  { id: 'more-or-less-square', label: 'More or Less (Square)', category: 'Math' },
  { id: 'equal-sign-circle', label: 'Equal (Circle)', category: 'Math' },
  { id: 'not-equal-sign-circle', label: 'Not Equal (Circle)', category: 'Math' },
  { id: 'less-than-circle', label: 'Less Than (Circle)', category: 'Math' },
  { id: 'greater-than-circle', label: 'Greater Than (Circle)', category: 'Math' },
  { id: 'inequality-circle-01', label: 'Inequality (Circle 1)', category: 'Math' },
  { id: 'inequality-circle-02', label: 'Inequality (Circle 2)', category: 'Math' },
  { id: '1st-brecket-circle', label: 'Parentheses (Circle)', category: 'Math' },
  { id: '2nd-brecket-circle', label: 'Brackets (Circle)', category: 'Math' },
  { id: '3rd-brecket-circle', label: 'Braces (Circle)', category: 'Math' },
  { id: 'plus-minus-circle-01', label: 'Plus-Minus (Circle 1)', category: 'Math' },
  { id: 'minus-plus-circle-01', label: 'Minus-Plus (Circle 1)', category: 'Math' },
  { id: 'plus-minus-circle-02', label: 'Plus-Minus (Circle 2)', category: 'Math' },
  { id: 'minus-plus-circle-02', label: 'Minus-Plus (Circle 2)', category: 'Math' },
  { id: 'plus-sign-circle', label: 'Plus (Circle)', category: 'Math' },
  { id: 'minus-sign-circle', label: 'Minus (Circle)', category: 'Math' },
  { id: 'multiplication-sign-circle', label: 'Multiply (Circle)', category: 'Math' },
  { id: 'divide-sign-circle', label: 'Divide (Circle)', category: 'Math' },
  { id: 'percent-circle', label: 'Percent (Circle)', category: 'Math' },
  { id: 'pi-circle', label: 'Pi (Circle)', category: 'Math' },
  { id: 'alpha-circle', label: 'Alpha (Circle)', category: 'Math' },
  { id: 'infinity-circle', label: 'Infinity (Circle)', category: 'Math' },
  { id: 'approximately-equal-circle', label: 'Approx Equal (Circle)', category: 'Math' },
  { id: 'congruent-to-circle', label: 'Congruent (Circle)', category: 'Math' },
  { id: 'function-circle', label: 'Function f (Circle)', category: 'Math' },
  { id: 'x-variable-circle', label: 'Variable x (Circle)', category: 'Math' },
  { id: 'square-circle', label: 'x² (Circle)', category: 'Math' },
  { id: 'root-circle', label: 'Square Root (Circle)', category: 'Math' },
  { id: 'n-th-root-circle', label: 'Nth Root (Circle)', category: 'Math' },
  { id: 'summation-circle', label: 'Summation (Circle)', category: 'Math' },
  { id: 'more-or-less-circle', label: 'More or Less (Circle)', category: 'Math' },
  { id: 'root-1st-brecket', label: 'Root Parentheses', category: 'Math' },
  { id: 'root-2nd-brecket', label: 'Root Brackets', category: 'Math' },
  { id: 'root-3rd-brecket', label: 'Root Braces', category: 'Math' },
  { id: 'rhombus', label: 'Rhombus', category: 'Math' },
  { id: 'pentagon', label: 'Pentagon', category: 'Math' },
  { id: 'hexagon', label: 'Hexagon', category: 'Math' },
  { id: 'octagon', label: 'Octagon', category: 'Math' },
  { id: 'parallelogram', label: 'Parallelogram', category: 'Math' },
  { id: 'segment', label: 'Line Segment AB', category: 'Math' },
  { id: 'radius', label: 'Radius', category: 'Math' },
  { id: 'diameter', label: 'Diameter', category: 'Math' },
  { id: 'triangle', label: 'Trigonometric Triangle', category: 'Math' },
  // ----------------- PHYSICS -----------------
  { id: 'acceleration', label: 'Acceleration Velocity', category: 'Physics' },
  { id: 'atom-01', label: 'Atomic Orbitals', category: 'Physics' },
  { id: 'atom-02', label: 'Atom Nucleus', category: 'Physics' },
  { id: 'bounding-box', label: 'Bounding Matrix', category: 'Physics' },
  { id: 'black-hole', label: 'Singularity / Black Hole', category: 'Physics' },
  { id: 'gravity', label: 'Gravitational Field', category: 'Physics' },
  { id: 'magnet', label: 'Horseshoe Magnet', category: 'Physics' },
  { id: 'pendulum', label: 'Newton\'s Pendulum', category: 'Physics' },
  { id: 'optical-prism', label: 'Optical Prism (Light Spectrum)', category: 'Physics' },
  { id: 'pulley', label: 'Mechanical Pulley', category: 'Physics' },
  { id: 'solar-system', label: 'Planetary Solar System', category: 'Physics' },
  { id: 'submerge', label: 'Hydrostatic Buoyancy', category: 'Physics' },
  { id: 'ufo', label: 'Spacecraft Module', category: 'Physics' },
  { id: 'wind-turbine', label: 'Aerodynamic Turbine', category: 'Physics' },
  { id: 'lightning', label: 'Lightning / Electricity', category: 'Physics' },
  { id: 'rocket', label: 'Rocket', category: 'Physics' },
  { id: 'telescope', label: 'Telescope', category: 'Physics' },
  { id: 'satellite', label: 'Satellite', category: 'Physics' },
  { id: 'battery', label: 'Battery / Energy', category: 'Physics' },
  { id: 'sparkles', label: 'Quantum Sparkles', category: 'Physics' },
  { id: 'wave', label: 'Sine Wave', category: 'Physics' },
  // ----------------- CHEMISTRY & BIOLOGY -----------------
  { id: 'aids', label: 'Ribbon / Awareness', category: 'Chemistry & Biology' },
  { id: 'ampoule', label: 'Medical Ampoule', category: 'Chemistry & Biology' },
  { id: 'bandage', label: 'Adhesive Bandage', category: 'Chemistry & Biology' },
  { id: 'blood', label: 'Blood Drops', category: 'Chemistry & Biology' },
  { id: 'blood-type', label: 'Blood Type', category: 'Chemistry & Biology' },
  { id: 'blood-pressure', label: 'Blood Pressure', category: 'Chemistry & Biology' },
  { id: 'blood-bag', label: 'Blood / IV Bag', category: 'Chemistry & Biology' },
  { id: 'blood-bottle', label: 'Blood Bottle', category: 'Chemistry & Biology' },
  { id: 'brain-01', label: 'Brain Profile', category: 'Chemistry & Biology' },
  { id: 'brain-02', label: 'Brain Top View', category: 'Chemistry & Biology' },
  { id: 'bone-01', label: 'Bone', category: 'Chemistry & Biology' },
  { id: 'bone-02', label: 'Bone Joint', category: 'Chemistry & Biology' },
  { id: 'broken-bone', label: 'Fractured Bone', category: 'Chemistry & Biology' },
  { id: 'caduceus', label: 'Caduceus Medical Staff', category: 'Chemistry & Biology' },
  { id: 'cardiogram-01', label: 'ECG Screen', category: 'Chemistry & Biology' },
  { id: 'cardiogram-02', label: 'Heart ECG', category: 'Chemistry & Biology' },
  { id: 'covid-info', label: 'Virus / Covid', category: 'Chemistry & Biology' },
  { id: 'patient', label: 'Patient Care', category: 'Chemistry & Biology' },
  { id: 'pulse-01', label: 'Pulse Beat', category: 'Chemistry & Biology' },
  { id: 'pulse-02', label: 'Pulse Wave', category: 'Chemistry & Biology' },
  { id: 'pulse-rectangle-01', label: 'ECG Monitor 1', category: 'Chemistry & Biology' },
  { id: 'pulse-rectangle-02', label: 'ECG Monitor 2', category: 'Chemistry & Biology' },
  { id: 'clinic', label: 'Clinic / Medical Cross', category: 'Chemistry & Biology' },
  { id: 'dental-tooth', label: 'Molar Tooth', category: 'Chemistry & Biology' },
  { id: 'dental-braces', label: 'Dental Braces', category: 'Chemistry & Biology' },
  { id: 'dental-care', label: 'Dental Care Shield', category: 'Chemistry & Biology' },
  { id: 'dental-broken-tooth', label: 'Broken Tooth', category: 'Chemistry & Biology' },
  { id: 'digestion', label: 'Stomach / Digestion', category: 'Chemistry & Biology' },
  { id: 'dna', label: 'DNA Molecule', category: 'Chemistry & Biology' },
  { id: 'disability-01', label: 'Accessibility Wheelchair', category: 'Chemistry & Biology' },
  { id: 'disability-02', label: 'Accessibility Sitting', category: 'Chemistry & Biology' },
  { id: 'dropper', label: 'Pipette Dropper', category: 'Chemistry & Biology' },
  { id: 'ear', label: 'Ear / Auditory', category: 'Chemistry & Biology' },
  { id: 'eye', label: 'Eye / Vision', category: 'Chemistry & Biology' },
  { id: 'first-aid-kit', label: 'First Aid Kit', category: 'Chemistry & Biology' },
  { id: 'give-pill', label: 'Handing Pill', category: 'Chemistry & Biology' },
  { id: 'give-blood', label: 'Blood Donation', category: 'Chemistry & Biology' },
  { id: 'hand-sanitizer', label: 'Hand Sanitizer', category: 'Chemistry & Biology' },
  { id: 'health', label: 'Heart Health', category: 'Chemistry & Biology' },
  { id: 'doctor-01', label: 'Doctor Male', category: 'Chemistry & Biology' },
  { id: 'doctor-02', label: 'Doctor Female', category: 'Chemistry & Biology' },
  { id: 'doctor-03', label: 'Physician', category: 'Chemistry & Biology' },
  { id: 'stethoscope-02', label: 'Stethoscope Chest', category: 'Chemistry & Biology' },
  { id: 'thread', label: 'Suture Spool', category: 'Chemistry & Biology' },
  { id: 'healthcare', label: 'Healthcare Hand', category: 'Chemistry & Biology' },
  { id: 'hospital-01', label: 'Hospital Building', category: 'Chemistry & Biology' },
  { id: 'hospital-02', label: 'Hospital Clinic', category: 'Chemistry & Biology' },
  { id: 'hospital-bed-01', label: 'Hospital Bed Standard', category: 'Chemistry & Biology' },
  { id: 'hospital-bed-02', label: 'Hospital Bed ICU', category: 'Chemistry & Biology' },
  { id: 'hospital-location', label: 'Hospital Location Pin', category: 'Chemistry & Biology' },
  { id: 'injection', label: 'Syringe Injection', category: 'Chemistry & Biology' },
  { id: 'kidneys', label: 'Kidneys System', category: 'Chemistry & Biology' },
  { id: 'labs', label: 'Laboratory Vials', category: 'Chemistry & Biology' },
  { id: 'liver', label: 'Liver Organ', category: 'Chemistry & Biology' },
  { id: 'lungs', label: 'Lungs Respiratory', category: 'Chemistry & Biology' },
  { id: 'mask', label: 'Surgical Mask', category: 'Chemistry & Biology' },
  { id: 'mask-love', label: 'Care Mask', category: 'Chemistry & Biology' },
  { id: 'medicine-01', label: 'Pills Blister Pack', category: 'Chemistry & Biology' },
  { id: 'medicine-02', label: 'Medicine Capsules', category: 'Chemistry & Biology' },
  { id: 'medicine-syrup', label: 'Syrup Bottle', category: 'Chemistry & Biology' },
  { id: 'medicine-bottle-01', label: 'Pill Bottle Standard', category: 'Chemistry & Biology' },
  { id: 'medicine-bottle-02', label: 'Pill Bottle Dropper', category: 'Chemistry & Biology' },
  { id: 'medical-file', label: 'Medical Records File', category: 'Chemistry & Biology' },
  { id: 'mortar', label: 'Mortar & Pestle', category: 'Chemistry & Biology' },
  { id: 'nose', label: 'Nose / Olfactory', category: 'Chemistry & Biology' },
  { id: 'prescription', label: 'Rx Prescription Pad', category: 'Chemistry & Biology' },
  { id: 'protection-mask', label: 'N95 Respirator', category: 'Chemistry & Biology' },
  { id: 'safe', label: 'Protection Shield', category: 'Chemistry & Biology' },
  { id: 'skull', label: 'Cranium / Skull', category: 'Chemistry & Biology' },
  { id: 'sperm', label: 'Gamete / Reproductive', category: 'Chemistry & Biology' },
  { id: 'stethoscope', label: 'Stethoscope Standard', category: 'Chemistry & Biology' },
  { id: 'thermometer', label: 'Clinical Thermometer', category: 'Chemistry & Biology' },
  { id: 'tissue-paper', label: 'Sanitary Tissue', category: 'Chemistry & Biology' },
  { id: 'tongue', label: 'Oral / Tongue', category: 'Chemistry & Biology' },
  { id: 'treatment', label: 'Medical Treatment', category: 'Chemistry & Biology' },
  { id: 'vaccine', label: 'Vaccine Bottle', category: 'Chemistry & Biology' },
  { id: 'wheelchair', label: 'Wheelchair Mobility', category: 'Chemistry & Biology' },
  { id: 'x-ray', label: 'Chest X-Ray Plate', category: 'Chemistry & Biology' },
  { id: 'bacteria', label: 'Bacteria Colony', category: 'Chemistry & Biology' },
  { id: 'cells', label: 'Cellular Structure', category: 'Chemistry & Biology' },
  { id: 'molecules', label: 'Chemical Molecule', category: 'Chemistry & Biology' },
  { id: 'test-tube', label: 'Laboratory Test Tube', category: 'Chemistry & Biology' },
  { id: 'flask', label: 'Conical Flask', category: 'Chemistry & Biology' },
  { id: 'beaker', label: 'Beaker', category: 'Chemistry & Biology' },
  { id: 'microscope', label: 'Microscope', category: 'Chemistry & Biology' },
  { id: 'leaf', label: 'Biology Leaf', category: 'Chemistry & Biology' },
  { id: 'plant', label: 'Sprout / Botany', category: 'Chemistry & Biology' },
  { id: 'droplet', label: 'Solution Droplet', category: 'Chemistry & Biology' },
  { id: 'flame', label: 'Bunsen Flame', category: 'Chemistry & Biology' },
  // ----------------- TECH & CODE -----------------
  { id: 'bot', label: 'AI Robot Assistant', category: 'Tech & Code' },
  { id: 'nano-technology', label: 'Nanotechnology Lattice', category: 'Tech & Code' },
  { id: 'siri', label: 'Digital Voice AI', category: 'Tech & Code' },
  { id: 'code', label: 'Code Tag', category: 'Tech & Code' },
  { id: 'terminal', label: 'Command Terminal', category: 'Tech & Code' },
  { id: 'cpu', label: 'CPU Microchip', category: 'Tech & Code' },
  { id: 'binary', label: 'Binary Stream', category: 'Tech & Code' },
  { id: 'database', label: 'Database', category: 'Tech & Code' },
  { id: 'laptop', label: 'Laptop', category: 'Tech & Code' },
  { id: 'network', label: 'Network Graph', category: 'Tech & Code' },
  { id: 'bug', label: 'Bug / Debug', category: 'Tech & Code' },
  // ----------------- STUDY & GENERAL -----------------
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
  strokeWidth = 2.3,
  class: className = '',
}: StudyIconProps) => {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    width: size,
    height: size,
    class: className,
    style: { display: 'block', flexShrink: 0 },
  };

  switch (name) {
    case 'equal-sign':
      return (
        <svg {...commonProps} viewBox="48.0 202.0 24 24">
          <path d="M52 210H68"/><path d="M52 218H68"/>
        </svg>
      );

    case 'not-equal-sign':
      return (
        <svg {...commonProps} viewBox="48.0 246.0 24 24">
          <path d="M52 254H68"/><path d="M52 262H68"/><path d="M54 266L66 250"/>
        </svg>
      );

    case 'less-than':
      return (
        <svg {...commonProps} viewBox="48.0 290.0 24 24">
          <path d="M65 294L56.6694 300.041C54.4435 301.655 54.4435 302.345 56.6694 303.959L65 310"/>
        </svg>
      );

    case 'greater-than':
      return (
        <svg {...commonProps} viewBox="48.0 334.0 24 24">
          <path d="M55 338L63.3306 344.041C65.5565 345.655 65.5565 346.345 63.3306 347.959L55 354"/>
        </svg>
      );

    case 'inequality-01':
      return (
        <svg {...commonProps} viewBox="48.0 378.0 24 24">
          <path d="M51 398H69"/><path d="M69 394H54.8378C52.4571 394 51.2668 394 51.0348 393.373C50.8029 392.746 51.7372 392.053 53.6057 390.668L65.3015 382"/>
        </svg>
      );

    case 'inequality-02':
      return (
        <svg {...commonProps} viewBox="48.0 422.0 24 24">
          <path d="M69 442H51"/><path d="M51 438H65.1622C67.5429 438 68.7332 438 68.9652 437.373C69.1971 436.746 68.2628 436.053 66.3943 434.668L54.6985 426"/>
        </svg>
      );

    case '1st-brecket':
      return (
        <svg {...commonProps} viewBox="48.0 466.0 24 24">
          <path d="M54 469C51.589 470.935 50 474.243 50 478C50 481.757 51.589 485.065 54 487"/><path d="M66 469C68.411 470.935 70 474.243 70 478C70 481.757 68.411 485.065 66 487"/>
        </svg>
      );

    case '2nd-brecket':
      return (
        <svg {...commonProps} viewBox="48.0 510.0 24 24">
          <path d="M65.225 513C66.6145 513.154 67.5498 513.501 68.2479 514.287C69.5 515.696 69.5 517.964 69.5 522.5C69.5 527.036 69.5 529.304 68.2479 530.713C67.5498 531.499 66.6145 531.846 65.225 532M54.775 532C53.3855 531.846 52.4502 531.499 51.7521 530.713C50.5 529.304 50.5 527.036 50.5 522.5C50.5 517.964 50.5 515.696 51.7521 514.287C52.4502 513.501 53.3855 513.154 54.775 513"/>
        </svg>
      );

    case '3rd-brecket':
      return (
        <svg {...commonProps} viewBox="48.0 554.0 24 24">
          <path d="M66 575C67.2322 575 68.231 573.849 68.231 572.429C68.231 570.181 68.1312 568.686 69.6733 566.909C70.1089 566.407 70.1089 565.593 69.6733 565.091C68.1312 563.314 68.231 561.819 68.231 559.571C68.231 558.151 67.2322 557 66 557"/><path d="M54 575C52.7678 575 51.769 573.849 51.769 572.429C51.769 570.181 51.8688 568.686 50.3267 566.909C49.8911 566.407 49.8911 565.593 50.3267 565.091C51.835 563.353 51.769 561.84 51.769 559.571C51.769 558.151 52.7678 557 54 557"/>
        </svg>
      );

    case 'plus-minus-01':
      return (
        <svg {...commonProps} viewBox="48.0 598.0 24 24">
          <path d="M60 601V615M67 608H53"/><path d="M67 619H53"/>
        </svg>
      );

    case 'minus-plus-01':
      return (
        <svg {...commonProps} viewBox="48.0 642.0 24 24">
          <path d="M60 649V663M67 656H53"/><path d="M67 645H53"/>
        </svg>
      );

    case 'plus-minus-02':
      return (
        <svg {...commonProps} viewBox="48.0 686.0 24 24">
          <path d="M51 707L69 689"/><path d="M55 689V697M59 693L51 693"/><path d="M69 704L61 704"/>
        </svg>
      );

    case 'minus-plus-02':
      return (
        <svg {...commonProps} viewBox="48.0 730.0 24 24">
          <path d="M51 751L69 733"/><path d="M65 743V751M69 747L61 747"/><path d="M59 737L51 737"/>
        </svg>
      );

    case 'plus-sign':
      return (
        <svg {...commonProps} viewBox="48.0 774.0 24 24">
          <path d="M60 778V794M68 786H52"/>
        </svg>
      );

    case 'minus-sign':
      return (
        <svg {...commonProps} viewBox="48.0 818.0 24 24">
          <path d="M68 830H52"/>
        </svg>
      );

    case 'multiplication-sign':
      return (
        <svg {...commonProps} viewBox="48.0 862.0 24 24">
          <path d="M66 868L60 874M60 874L54 880M60 874L66 880M60 874L54 868"/>
        </svg>
      );

    case 'divide-sign':
      return (
        <svg {...commonProps} viewBox="48.0 906.0 24 24">
          <path d="M51 918H69"/><path d="M62.5 911.5C62.5 912.881 61.3807 914 60 914C58.6193 914 57.5 912.881 57.5 911.5C57.5 910.119 58.6193 909 60 909C61.3807 909 62.5 910.119 62.5 911.5Z"/><path d="M62.5 924.5C62.5 925.881 61.3807 927 60 927C58.6193 927 57.5 925.881 57.5 924.5C57.5 923.119 58.6193 922 60 922C61.3807 922 62.5 923.119 62.5 924.5Z"/>
        </svg>
      );

    case 'percent':
      return (
        <svg {...commonProps} viewBox="48.0 950.0 24 24">
          <path d="M52 970L68 954"/><path d="M56.2678 954.732C57.2441 955.709 57.2441 957.291 56.2678 958.268C55.2915 959.244 53.7085 959.244 52.7322 958.268C51.7559 957.291 51.7559 955.709 52.7322 954.732C53.7085 953.756 55.2915 953.756 56.2678 954.732Z"/><path d="M67.2678 965.732C68.2441 966.709 68.2441 968.291 67.2678 969.268C66.2915 970.244 64.7085 970.244 63.7322 969.268C62.7559 968.291 62.7559 966.709 63.7322 965.732C64.7085 964.756 66.2915 964.756 67.2678 965.732Z"/>
        </svg>
      );

    case 'triangle-01':
      return (
        <svg {...commonProps} viewBox="48.0 994.0 24 24">
          <path d="M55.8975 1000.73C57.712 997.578 58.6193 996 60 996C61.3807 996 62.288 997.578 64.1025 1000.73L67.8592 1007.26C69.5848 1010.27 70.4476 1011.77 69.7671 1012.88C69.0866 1014 67.3099 1014 63.7567 1014H56.2433C52.6901 1014 50.9134 1014 50.2329 1012.88C49.5524 1011.77 50.4152 1010.27 52.1408 1007.26L55.8975 1000.73Z"/><path d="M60 1014V1016"/><path d="M68 1003L66 1004"/><path d="M52 1003L54 1004"/><path d="M52 1008.41C53.8895 1009.05 55.2524 1010.88 55.2524 1013.03C55.2524 1013.36 55.2199 1013.69 55.158 1014M64.842 1014C64.7801 1013.69 64.7476 1013.36 64.7476 1013.03C64.7476 1010.88 66.1105 1009.05 68 1008.41M63.2815 1000C62.429 1000.84 61.273 1001.35 60 1001.35C58.727 1001.35 57.571 1000.84 56.7185 1000"/>
        </svg>
      );

    case 'triangle-02':
      return (
        <svg {...commonProps} viewBox="48.0 1038.0 24 24">
          <path d="M67.4955 1050.63L67.8592 1051.26C69.5848 1054.27 70.4476 1055.77 69.7671 1056.88C69.0866 1058 67.3099 1058 63.7567 1058H63M52.5045 1050.63L52.1408 1051.26C50.4152 1054.27 49.5524 1055.77 50.2329 1056.88C50.9134 1058 52.6901 1058 56.2433 1058H57M55.5331 1045.37L55.8975 1044.73C57.712 1041.58 58.6193 1040 60 1040C61.3807 1040 62.288 1041.58 64.1025 1044.73L64.4669 1045.37"/><path d="M60 1056V1060"/><path d="M67.6602 1047L64.1961 1049"/><path d="M52.3398 1047L55.8039 1049"/>
        </svg>
      );

    case 'left-triangle':
      return (
        <svg {...commonProps} viewBox="48.0 1082.0 24 24">
          <path d="M59 1102V1104"/><path d="M68 1090V1088.48C68 1085.78 68 1084.42 67.2091 1084.07C66.4182 1083.72 65.4766 1084.66 63.5934 1086.53L52.7165 1097.34C50.7279 1099.31 49.7336 1100.3 50.0617 1101.15C50.3898 1102 51.7657 1102 54.5175 1102H56M59 1102H65.3944C66.6227 1102 67.2368 1102 67.6184 1101.6C68 1101.21 68 1100.57 68 1099.29V1095C68 1094.06 68 1093.59 68.2929 1093.29C68.5858 1093 69.0572 1093 70 1093"/><path d="M68 1097H67C65.1144 1097 64.1716 1097 63.5858 1097.59C63 1098.17 63 1099.11 63 1101V1102"/>
        </svg>
      );

    case 'right-triangle':
      return (
        <svg {...commonProps} viewBox="48.0 1126.0 24 24">
          <path d="M52 1134V1132.48C52 1129.78 52 1128.42 52.7909 1128.07C53.5818 1127.72 54.5234 1128.66 56.4066 1130.53L67.2835 1141.34C69.2721 1143.31 70.2664 1144.3 69.9383 1145.15C69.6102 1146 68.2343 1146 65.4825 1146H64M61 1148C61 1147.06 61 1146.59 60.7071 1146.29C60.4142 1146 59.9428 1146 59 1146H54.6056C53.3773 1146 52.7632 1146 52.3816 1145.6C52 1145.21 52 1144.57 52 1143.29V1139C52 1138.06 52 1137.59 51.7071 1137.29C51.4142 1137 50.9428 1137 50 1137"/><path d="M52 1141H53C54.8856 1141 55.8284 1141 56.4142 1141.59C57 1142.17 57 1143.11 57 1145V1146"/>
        </svg>
      );

    case 'parabola-01':
      return (
        <svg {...commonProps} viewBox="48.0 1170.0 24 24">
          <path d="M69 1173C69 1181.28 64.9706 1188 60 1188C55.0294 1188 51 1181.28 51 1173"/><path d="M51 1191H52.0588M63.7059 1191H64.7647M67.9412 1191H69M55.2353 1191H56.2941M59.4706 1191H60.5294"/>
        </svg>
      );

    case 'parabola-02':
      return (
        <svg {...commonProps} viewBox="48.0 1214.0 24 24">
          <path d="M68.9531 1216C68.9531 1224.28 64.9237 1231 59.9531 1231C54.9826 1231 50.9531 1224.28 50.9531 1216"/><path d="M50.9531 1234H52.0119M63.659 1234H64.7178M67.8943 1234H68.9531M55.1884 1234H56.2472"/><path d="M57.4531 1218.5C59.0531 1216.69 59.4031 1216 59.9531 1216M62.4531 1218.5C60.8531 1216.69 60.5031 1216 59.9531 1216M59.9531 1216V1236"/>
        </svg>
      );

    case 'parabola-03':
      return (
        <svg {...commonProps} viewBox="48.0 1258.0 24 24">
          <path d="M69 1260C69 1268.28 64.9706 1275 60 1275C55.0294 1275 51 1268.28 51 1260"/><path d="M50 1278H70"/><path d="M57.5 1262.5C59.1 1260.69 59.45 1260 60 1260M62.5 1262.5C60.9 1260.69 60.55 1260 60 1260M60 1260V1280"/>
        </svg>
      );

    case 'compass':
      return (
        <svg {...commonProps} viewBox="48.0 1302.0 24 24">
          <path d="M58 1312L53 1324M62 1312L67 1324"/><path d="M60 1306L60 1304"/><circle cx="60" cy="1309" r="3"/><path d="M51 1315C52.9907 1318.02 56.2797 1320 60 1320C63.7203 1320 67.0093 1318.02 69 1315"/><path d="M60 1319V1321"/>
        </svg>
      );

    case 'angle':
      return (
        <svg {...commonProps} viewBox="48.0 1346.0 24 24">
          <path d="M60 1368V1348M50 1363L60 1348L70 1363"/><path d="M64 1354C62.8554 1355.26 61.4798 1356 60 1356C58.5202 1356 57.1446 1355.26 56 1354"/><path d="M60 1360C57.7804 1360 55.7169 1359.26 54 1358"/>
        </svg>
      );

    case 'acute':
      return (
        <svg {...commonProps} viewBox="48.0 1390.0 24 24">
          <path d="M62.5553 1394.87C62.4051 1394.15 62.3051 1392.4 61.7799 1392.07C61.2797 1391.82 59.404 1392.3 58.6036 1392.52M61.7799 1392.07L51.8255 1408.17C51.8255 1408.17 51.3003 1409.02 51.6005 1409.5C51.8256 1410.02 53.1261 1410 53.1261 1410H68.5078M68.5078 1410C68.5078 1409.4 66.707 1408.2 66.5319 1408M68.5078 1410C68.5078 1410.6 67.0572 1411.45 66.5319 1412"/><path d="M55.5 1402.5C57.3758 1402.83 58.8108 1403.72 59.6612 1405.05C60.6116 1406.4 60.7273 1408.28 60.152 1409.8"/>
        </svg>
      );

    case 'left-angle':
      return (
        <svg {...commonProps} viewBox="48.0 1434.0 24 24">
          <path d="M69 1439C68.6068 1438.6 67.5602 1437 67 1437C66.4398 1437 65.3932 1438.6 65 1439"/><path d="M53 1451C52.5954 1451.39 51 1452.44 51 1453C51 1453.56 52.5954 1454.61 53 1455"/><path d="M67 1446H66C63.1716 1446 61.7574 1446 60.8787 1446.88C60 1447.76 60 1449.17 60 1452V1453"/><path d="M51 1453H61C63.8284 1453 65.2426 1453 66.1213 1452.15C67 1451.3 67 1449.92 67 1447.18V1437"/>
        </svg>
      );

    case 'right-angle':
      return (
        <svg {...commonProps} viewBox="48.0 1478.0 24 24">
          <path d="M51 1483C51.3932 1482.6 52.4398 1481 53 1481C53.5602 1481 54.6068 1482.6 55 1483"/><path d="M67 1495C67.4046 1495.39 69 1496.44 69 1497C69 1497.56 67.4046 1498.61 67 1499"/><path d="M53 1490H54C56.8284 1490 58.2426 1490 59.1213 1490.88C60 1491.76 60 1493.17 60 1496V1497"/><path d="M69 1497H59C56.1716 1497 54.7574 1497 53.8787 1496.12C53 1495.24 53 1493.83 53 1491L53 1481"/>
        </svg>
      );

    case 'hyperbole':
      return (
        <svg {...commonProps} viewBox="48.0 1522.0 24 24">
          <path d="M50 1534H70"/><path d="M60 1544L60 1524"/><path d="M69 1530C66.2386 1530 64 1527.76 64 1525"/><path d="M51 1538C53.7614 1538 56 1540.24 56 1543"/>
        </svg>
      );

    case 'coordinate-01':
      return (
        <svg {...commonProps} viewBox="48.0 1566.0 24 24">
          <path d="M54.25 1588C54.25 1588.41 54.5858 1588.75 55 1588.75C55.4142 1588.75 55.75 1588.41 55.75 1588L55 1588L54.25 1588ZM55.75 1568C55.75 1567.59 55.4142 1567.25 55 1567.25C54.5858 1567.25 54.25 1567.59 54.25 1568L55 1568L55.75 1568ZM55 1588L55.75 1588L55.75 1568L55 1568L54.25 1568L54.25 1588L55 1588Z" fill={color}/><path d="M52 1571C52.5898 1570.39 54.1597 1568 55 1568C55.8403 1568 57.4102 1570.39 58 1571"/><path d="M50 1582.25C49.5858 1582.25 49.25 1582.59 49.25 1583C49.25 1583.41 49.5858 1583.75 50 1583.75L50 1583L50 1582.25ZM70 1583.75C70.4142 1583.75 70.75 1583.41 70.75 1583C70.75 1582.59 70.4142 1582.25 70 1582.25L70 1583L70 1583.75ZM50 1583L50 1583.75L70 1583.75L70 1583L70 1582.25L50 1582.25L50 1583Z" fill={color}/><path d="M67 1580C67.6068 1580.59 70 1582.16 70 1583C70 1583.84 67.6068 1585.41 67 1586"/>
        </svg>
      );

    case 'reflex':
      return (
        <svg {...commonProps} viewBox="48.0 1610.0 24 24">
          <path d="M70.0007 1620.5H59.8276C58.692 1620.5 58.1242 1620.5 57.6578 1620.77C57.1915 1621.04 56.9109 1621.54 56.3499 1622.52L51.7081 1631.45M70.0007 1620.5C70.0007 1619.94 67.9999 1618.5 67.9999 1618.5M70.0007 1620.5C70.0007 1621.06 67.9999 1622.5 67.9999 1622.5M54.353 1630.74C54.353 1630.74 52.1777 1631.72 51.7081 1631.45C51.2386 1631.18 51 1628.79 51 1628.79"/><path d="M63.9368 1620.5C63.9785 1620.19 64 1619.87 64 1619.55C64 1615.66 60.866 1612.5 57 1612.5C53.134 1612.5 50 1615.66 50 1619.55C50 1622.36 51.6351 1624.87 54 1626"/>
        </svg>
      );

    case 'angle-02':
      return (
        <svg {...commonProps} viewBox="48.0 1654.0 24 24">
          <path d="M69 1674H54.4735C52.3671 1674 51.3139 1674 51.0518 1673.38C50.7897 1672.77 51.5344 1672.04 53.0238 1670.59L65.9249 1658"/><path d="M59 1674C59 1671.35 57.7737 1669.07 56 1668"/>
        </svg>
      );

    case 'obtuse':
      return (
        <svg {...commonProps} viewBox="48.0 1698.0 24 24">
          <path d="M70.0007 1715C70.0007 1715.56 67.9999 1717 67.9999 1717M70.0007 1715C70.0007 1714.44 67.9999 1713 67.9999 1713M70.0007 1715H59.5039C58.2864 1715 57.6776 1715 57.1908 1714.7C56.7039 1714.39 56.4379 1713.84 55.9059 1712.75L50.7081 1702.05M50.7081 1702.05C50.2386 1702.32 50 1704.71 50 1704.71M50.7081 1702.05C51.1777 1701.78 53.353 1702.76 53.353 1702.76"/><path d="M54 1708.8C54.8825 1708.29 55.9071 1708 57 1708C60.3137 1708 63 1710.69 63 1714C63 1714.34 62.9716 1714.67 62.917 1715"/>
        </svg>
      );

    case 'calculator':
      return (
        <svg {...commonProps} viewBox="48.0 1742.0 24 24">
          <path d="M53.5 1745V1750M56 1747.5L51 1747.5"/><path d="M56 1758L54 1760M54 1760L52 1762M54 1760L56 1762M54 1760L52 1758"/><path d="M68 1748L64 1748"/><path d="M68 1760.5L64 1760.5M68 1757.5L64 1757.5"/><path d="M70 1754L50 1754"/><path d="M60 1764L60 1744"/>
        </svg>
      );

    case 'cordinate-02':
      return (
        <svg {...commonProps} viewBox="48.0 1786.0 24 24">
          <path d="M61.5 1788L60 1789.5M60 1789.5V1791M60 1789.5L58.5 1788"/><path d="M50 1800H53L50 1803H53"/><path d="M67 1800L70 1803M70 1800L67 1803"/><path d="M60 1794V1802M60 1802L51 1808M60 1802L69 1808"/>
        </svg>
      );

    case 'tan':
      return (
        <svg {...commonProps} viewBox="293.0 202.0 24 24">
          <path d="M302.5 219L303.7 215M303.7 215L305.5 209L307.3 215L308.5 219M303.7 215H307.3"/><path d="M316 209V219L311 209V219"/><path d="M296 209H298.5M301 209H298.5M298.5 219V209"/>
        </svg>
      );

    case 'sin':
      return (
        <svg {...commonProps} viewBox="293.0 246.0 24 24">
          <path d="M304 253H306M308 253H306M308 263H306M304 263H306M306 253V263"/><path d="M316 253V263L311 253V263"/><path d="M300.69 254.616C300.264 253.652 299.443 253 298.5 253H298C296.895 253 296 254.119 296 255.5C296 256.881 296.895 258 298 258H299C300.105 258 301 259.119 301 260.5C301 261.881 300.105 263 299 263H298.5C297.475 263 296.594 262.229 296.208 261.125"/>
        </svg>
      );

    case 'cos':
      return (
        <svg {...commonProps} viewBox="293.0 290.0 24 24">
          <path d="M303.5 299.5C303.5 298.119 304.619 297 306 297C307.381 297 308.5 298.119 308.5 299.5V304.5C308.5 305.881 307.381 307 306 307C304.619 307 303.5 305.881 303.5 304.5V299.5Z"/><path d="M315.69 298.616C315.264 297.652 314.443 297 313.5 297H313C311.895 297 311 298.119 311 299.5C311 300.881 311.895 302 313 302H314C315.105 302 316 303.119 316 304.5C316 305.881 315.105 307 314 307H313.5C312.475 307 311.594 306.229 311.208 305.125"/><path d="M301 298.314C300.551 297.532 299.671 297 298.659 297C297.19 297 296 298.119 296 299.5V304.5C296 305.881 297.19 307 298.659 307C299.671 307 300.551 306.468 301 305.686"/>
        </svg>
      );

    case 'beta':
      return (
        <svg {...commonProps} viewBox="293.0 334.0 24 24">
          <path d="M306.883 344.2C309.135 344.2 310.961 342.588 310.961 340.6C310.961 338.612 309.135 337 306.883 337C304.631 337 302.805 338.612 302.805 340.6V353.2C302.805 354.194 301.892 355 300.766 355C300.011 355 299.353 354.638 299 354.1M302.805 348.7C302.805 351.185 305.087 353.2 307.903 353.2C310.718 353.2 313 351.185 313 348.7C313 346.215 310.718 344.087 307.903 344.087"/>
        </svg>
      );

    case 'pi':
      return (
        <svg {...commonProps} viewBox="293.0 378.0 24 24">
          <path d="M297 387.3C297 385.5 299.061 383.7 301.685 383.7L310.957 383.7C313.2 383.7 315 382.35 315 381"/><path d="M310.502 384L309.607 396.314C309.518 397.765 310.51 399 311.765 399C312.697 399 313.524 398.309 313.818 397.285L314.102 396.3"/><path d="M304 384C303.867 387.062 303.6 392.75 303.2 394.5C302.8 396.25 302 398 300 398"/>
        </svg>
      );

    case 'insert-pi':
      return (
        <svg {...commonProps} viewBox="293.0 422.0 24 24">
          <path d="M297 430.8C297 429 299.061 427.2 301.685 427.2L310.957 427.2C313.2 427.2 315 425.85 315 424.5"/><path d="M310.5 427.5L310 433"/><path d="M304 427.5C303.867 430.562 303.6 436.25 303.2 438C302.8 439.75 302 441.5 300 441.5"/><path d="M311 438.167V439.5M311 439.5V440.833M311 439.5H312.333M311 439.5H309.667M315 439.5C315 441.709 313.209 443.5 311 443.5C308.791 443.5 307 441.709 307 439.5C307 437.291 308.791 435.5 311 435.5C313.209 435.5 315 437.291 315 439.5Z"/>
        </svg>
      );

    case 'remove-pi':
      return (
        <svg {...commonProps} viewBox="293.0 466.0 24 24">
          <path d="M297 474.8C297 473 299.061 471.2 301.685 471.2L310.957 471.2C313.2 471.2 315 469.85 315 468.5"/><path d="M310.5 471.5L310 477"/><path d="M304 471.5C303.867 474.562 303.6 480.25 303.2 482C302.8 483.75 302 485.5 300 485.5"/><path d="M312.333 483.5H309.667M315 483.5C315 485.709 313.209 487.5 311 487.5C308.791 487.5 307 485.709 307 483.5C307 481.291 308.791 479.5 311 479.5C313.209 479.5 315 481.291 315 483.5Z"/>
        </svg>
      );

    case 'alpha':
      return (
        <svg {...commonProps} viewBox="293.0 510.0 24 24">
          <path d="M311.394 514C311.594 515.85 311.344 520 310.171 523.275C308.772 527.5 306.674 529.35 305.001 529.8C301.755 530.673 299.032 528.45 297.884 525.975C296.41 522.8 296.81 519.125 298.858 516.475C300.905 513.825 304.776 512.675 307.648 516.25C308.747 517.925 309.222 519.725 309.446 521.175C309.896 522.775 310.121 526.775 311.294 528.725C312.218 530.175 313.642 530.1 314.166 529.875C314.516 529.7 315 529.32 315 528.22"/>
        </svg>
      );

    case 'infinity-01':
      return (
        <svg {...commonProps} viewBox="293.0 554.0 24 24">
          <path d="M306 566C306 566 303.261 571 300.5 571C297.739 571 296 568.761 296 566C296 563.239 297.739 561 300.5 561C303.261 561 306 566 306 566ZM306 566C306 566 308.739 571 311.5 571C314.261 571 316 568.761 316 566C316 563.239 314.261 561 311.5 561C308.739 561 306 566 306 566Z"/>
        </svg>
      );

    case 'approximately-equal':
      return (
        <svg {...commonProps} viewBox="293.0 598.0 24 24">
          <path d="M298 605.927C300.667 602.928 303.333 603.806 306 606C308.667 608.194 311.333 609.072 314 606.073"/><path d="M298 613.927C300.667 610.928 303.333 611.806 306 614C308.667 616.194 311.333 617.072 314 614.073"/>
        </svg>
      );

    case 'congruent-to':
      return (
        <svg {...commonProps} viewBox="293.0 642.0 24 24">
          <path d="M298 655H314"/><path d="M298 661H314"/><path d="M298 648.927C300.667 645.928 303.333 646.806 306 649C308.667 651.194 311.333 652.072 314 649.073"/>
        </svg>
      );

    case 'function-of-x':
      return (
        <svg {...commonProps} viewBox="293.0 686.0 24 24">
          <path d="M296 704.222C296.189 705.072 296.569 706 297.562 706C299.281 706 299.711 704.222 301 698C302.289 691.778 302.719 690 304.438 690C305.431 690 305.811 690.928 306 691.778M298.917 695.778H304.438"/><path d="M315 698C316.38 701.253 316.285 702.981 315 706"/><path d="M306 698C304.62 701.253 304.715 702.981 306 706"/><path d="M308.289 699.999C309.093 699.969 309.551 700.064 309.823 700.546C310.151 701.216 310.978 703.068 311.183 703.472C311.307 703.649 311.471 703.904 311.999 703.988L312.71 704"/><path d="M313.002 700C311.879 700 311.087 701.288 310.559 701.936C309.791 702.944 308.927 704.05 307.996 704"/>
        </svg>
      );

    case 'function':
      return (
        <svg {...commonProps} viewBox="293.0 730.0 24 24">
          <path d="M299 749C299.264 749.956 299.797 751 301.187 751C303.594 751 304.195 749 306 742C307.805 735 308.406 733 310.813 733C312.203 733 312.736 734.044 313 735"/><path d="M303 740H311"/>
        </svg>
      );

    case 'x-variable':
      return (
        <svg {...commonProps} viewBox="293.0 774.0 24 24">
          <path d="M314 777.5C307.633 777.5 304.367 794.5 298 794.5"/><path d="M313 794.5C311.382 794.5 310.574 794.5 309.892 794.158C309.504 793.964 309.152 793.693 308.851 793.357C308.322 792.767 308.032 791.92 307.451 790.228L304.549 781.772C303.968 780.08 303.678 779.233 303.149 778.643C302.848 778.307 302.496 778.036 302.108 777.842C301.426 777.5 300.618 777.5 299 777.5"/>
        </svg>
      );

    case 'square-01':
      return (
        <svg {...commonProps} viewBox="293.0 818.0 24 24">
          <path d="M296.715 825.025C298.706 824.92 299.955 825.077 300.736 826.911C301.556 829.111 303.586 835.24 304.093 836.655C304.64 838.174 305.342 839.222 308.231 838.96"/><path d="M309 825.007C306.137 824.982 303.795 829.722 302.493 831.992C301.062 834.611 298.603 839.152 296 838.977"/><path d="M316 827H312L315.2 824.6C315.704 824.222 316 823.629 316 823C316 821.895 315.105 821 314 821C312.896 821 312 821.895 312 823"/>
        </svg>
      );

    case 'root-01':
      return (
        <svg {...commonProps} viewBox="293.0 862.0 24 24">
          <path d="M316 867H307.614C306.38 867 305.965 867.14 305.659 868.364L303.339 877.642C302.789 879.84 302.515 880.939 301.785 880.998C301.055 881.056 300.55 880.02 299.541 877.947L298.97 876.775C298.535 875.882 298.318 875.436 297.879 875.315C297.217 875.133 296.508 875.67 296 876"/><path d="M308.398 873.004C309.178 872.92 310.132 873.038 310.438 873.64C311.05 874.84 312.058 877.36 312.418 878.14C312.598 878.44 312.778 878.8 313.498 878.98C313.978 879.04 314.602 878.995 314.602 878.995"/><path d="M315 872.998C313.5 872.998 312.54 874.66 311.7 875.68C310.62 877.24 309.42 879.1 307.98 878.98"/>
        </svg>
      );

    case 'n-th-root':
      return (
        <svg {...commonProps} viewBox="293.0 906.0 24 24">
          <path d="M316 913H307.614C306.38 913 305.965 913.14 305.659 914.364L303.339 923.642C302.789 925.84 302.515 926.939 301.785 926.998C301.055 927.056 300.55 926.02 299.541 923.947L298.97 922.775C298.535 921.882 298.318 921.436 297.879 921.315C297.217 921.133 296.508 921.67 296 922"/><path d="M297 915V911.571M297 911.571C297 910.151 298.119 909 299.5 909C300.881 909 302 910.151 302 911.571V915M297 911.571V909"/>
        </svg>
      );

    case 'summation-01':
      return (
        <svg {...commonProps} viewBox="293.0 950.0 24 24">
          <path d="M313 967.143C313 968.646 313 969.398 312.65 969.947C312.468 970.233 312.223 970.475 311.933 970.655C311.376 971 310.614 971 309.09 971H303.199C300.614 971 299.321 971 299.046 970.265C298.77 969.531 299.751 968.701 301.714 967.042L305.657 963.708C306.596 962.914 307.065 962.517 307.065 962C307.065 961.483 306.596 961.086 305.657 960.292L301.714 956.958C299.751 955.299 298.77 954.469 299.046 953.735C299.321 953 300.614 953 303.199 953H309.09C310.614 953 311.376 953 311.933 953.345C312.223 953.525 312.468 953.767 312.65 954.053C313 954.602 313 955.354 313 956.857"/>
        </svg>
      );

    case 'more-or-less':
      return (
        <svg {...commonProps} viewBox="293.0 994.0 24 24">
          <path d="M298 1006H314"/><path d="M314 1001L301.003 1001C299.182 1001 298.271 1001 298.045 1000.38C297.818 999.765 298.462 999.039 299.75 997.586L300.269 997"/><path d="M298 1011L310.997 1011C312.818 1011 313.729 1011 313.955 1011.62C314.182 1012.23 313.538 1012.96 312.25 1014.41L311.731 1015"/>
        </svg>
      );

    case 'sine-01':
      return (
        <svg {...commonProps} viewBox="293.0 1038.0 24 24">
          <path d="M299.001 1052C299.002 1049.78 298.816 1042 302.502 1042C304.434 1042 306.001 1045.58 306.001 1050C306.001 1054.42 307.567 1058 309.5 1058C313.186 1058 313 1050.22 313 1048"/><path d="M296 1050H299"/><path d="M313 1050H316"/><path d="M302 1050H310"/><path d="M314.915 1040.83C314.709 1040.35 314.153 1040 313.5 1040C312.672 1040 312 1040.56 312 1041.25C312 1041.94 312.672 1042.5 313.5 1042.5C314.328 1042.5 315 1043.06 315 1043.75C315 1044.44 314.328 1045 313.5 1045C312.847 1045 312.291 1044.65 312.085 1044.17"/><path d="M299.544 1055C298.691 1055 298 1055.67 298 1056.5V1058.5C298 1059.33 298.691 1060 299.544 1060M299.544 1055C300.216 1055 300.788 1055.42 301 1056M299.544 1055C298.872 1055 298.3 1055.42 298.088 1056M299.544 1060C298.872 1060 298.3 1059.58 298.088 1059M299.544 1060C300.216 1060 300.788 1059.58 301 1059"/>
        </svg>
      );

    case 'sine-02':
      return (
        <svg {...commonProps} viewBox="293.0 1082.0 24 24">
          <path d="M315 1091.01C315 1094 314.087 1103 310.177 1103C308.132 1103 306.834 1099.38 306 1094C305.166 1088.62 303.868 1085 301.823 1085C297.913 1085 297 1094 297 1096.99"/><path d="M296 1094H299"/><path d="M302 1094H304"/><path d="M308 1094H310"/><path d="M313 1094H316"/>
        </svg>
      );

    case 'cosine-01':
      return (
        <svg {...commonProps} viewBox="293.0 1126.0 24 24">
          <path d="M316 1146.73C312 1148.67 310.588 1139.65 310.331 1138.05C309.467 1132.64 308.12 1129 306 1129C303.88 1129 302.533 1132.64 301.669 1138.05C301.412 1139.65 300 1148.67 296 1146.73"/><path d="M296 1138H298.5"/><path d="M313.5 1138H316"/><path d="M304.5 1138H307.5"/>
        </svg>
      );

    case 'cosine-02':
      return (
        <svg {...commonProps} viewBox="293.0 1170.0 24 24">
          <path d="M316 1173.27C312 1171.33 310.588 1180.35 310.331 1181.95C309.467 1187.36 308.12 1191 306 1191C303.88 1191 302.533 1187.36 301.669 1181.95C301.412 1180.35 300 1171.33 296 1173.27"/><path d="M296 1182H299"/><path d="M313 1182H316"/><path d="M304 1182H308"/>
        </svg>
      );

    case 'prism':
      return (
        <svg {...commonProps} viewBox="293.0 1214.0 24 24">
          <path d="M306 1229C306.323 1229 306.607 1229.2 307.175 1229.6L310.919 1232.24C313.104 1233.78 314.197 1234.56 313.971 1235.28M306 1229C305.677 1229 305.393 1229.2 304.825 1229.6L301.081 1232.24C298.896 1233.78 297.803 1234.56 298.029 1235.28M306 1229V1225.5M313.971 1235.28C313.745 1236 312.411 1236 309.744 1236H302.256C299.589 1236 298.255 1236 298.029 1235.28M313.971 1235.28V1222M298.029 1235.28V1222"/><path d="M306 1216C306.323 1216 306.607 1216.2 307.175 1216.6L310.919 1219.24C313.104 1220.78 314.197 1221.56 313.971 1222.28C313.745 1223 312.411 1223 309.744 1223H302.256C299.589 1223 298.255 1223 298.029 1222.28C297.803 1221.56 298.896 1220.78 301.081 1219.24L304.825 1216.6C305.393 1216.2 305.677 1216 306 1216ZM306 1216V1220.5"/>
        </svg>
      );

    case 'cube':
      return (
        <svg {...commonProps} viewBox="293.0 1258.0 24 24">
          <path d="M296.793 1279.21C297.086 1279.5 297.557 1279.5 298.5 1279.5H308.5C309.443 1279.5 309.914 1279.5 310.207 1279.21M296.793 1279.21C296.5 1278.91 296.5 1278.44 296.5 1277.5V1267.5C296.5 1266.56 296.5 1266.09 296.793 1265.79M296.793 1279.21L302.793 1273.21M310.207 1279.21C310.5 1278.91 310.5 1278.44 310.5 1277.5V1267.5C310.5 1266.56 310.5 1266.09 310.207 1265.79M310.207 1279.21L315.207 1274.21C315.5 1273.91 315.5 1273.44 315.5 1272.5V1262.5C315.5 1261.56 315.5 1261.09 315.207 1260.79M310.207 1265.79C309.914 1265.5 309.443 1265.5 308.5 1265.5H298.5C297.557 1265.5 297.086 1265.5 296.793 1265.79M310.207 1265.79L315.207 1260.79M296.793 1265.79L301.793 1260.79C302.086 1260.5 302.557 1260.5 303.5 1260.5H313.5C314.443 1260.5 314.914 1260.5 315.207 1260.79M302.793 1273.21C303.086 1273.5 303.557 1273.5 304.5 1273.5H308M302.793 1273.21C302.5 1272.91 302.5 1272.44 302.5 1271.5V1268.5"/>
        </svg>
      );

    case 'rectangular':
      return (
        <svg {...commonProps} viewBox="293.0 1302.0 24 24">
          <path d="M301.689 1304.44L299.354 1306.22C298.382 1306.96 297.896 1307.33 298.019 1307.67C298.142 1308 298.764 1308 300.009 1308H310C310.364 1308 310.547 1308 310.715 1307.94C310.884 1307.89 311.026 1307.78 311.311 1307.56L313.646 1305.78C314.618 1305.04 315.104 1304.67 314.981 1304.33C314.858 1304 314.236 1304 312.991 1304H303C302.636 1304 302.453 1304 302.285 1304.06C302.116 1304.11 301.974 1304.22 301.689 1304.44Z"/><path d="M298.019 1323.67C298.142 1324 298.764 1324 300.009 1324H310C310.364 1324 310.547 1324 310.715 1323.94M298.019 1323.67C297.896 1323.33 298.382 1322.96 299.354 1322.22L301.689 1320.44C301.974 1320.22 302.116 1320.11 302.285 1320.06M298.019 1323.67V1307.67M302.285 1320.06C302.453 1320 302.636 1320 303 1320H308M302.285 1320.06V1311M310.715 1323.94C310.884 1323.89 311.026 1323.78 311.311 1323.56L313.646 1321.78C314.618 1321.04 315.104 1320.67 314.981 1320.33V1304.33M310.715 1323.94V1307.94"/>
        </svg>
      );

    case 'pyramid':
      return (
        <svg {...commonProps} viewBox="293.0 1346.0 24 24">
          <path d="M306 1348V1368"/><path d="M308.869 1359.68L315.989 1363.59M315.989 1363.59L315.994 1363.59M315.989 1363.59C316.064 1363.15 315.757 1362.66 315.187 1361.75L307.784 1349.92C306.983 1348.64 306.583 1348 306 1348C305.417 1348 305.017 1348.64 304.216 1349.92L296.813 1361.75C296.243 1362.66 295.936 1363.15 296.011 1363.59M315.989 1363.59C315.982 1363.62 315.973 1363.66 315.961 1363.7C315.809 1364.16 315.267 1364.38 314.184 1364.81L306.781 1367.77C306.396 1367.92 306.203 1368 306 1368C305.797 1368 305.604 1367.92 305.219 1367.77L297.816 1364.81C296.733 1364.38 296.191 1364.16 296.039 1363.7C296.027 1363.66 296.018 1363.62 296.011 1363.59M296.006 1363.59L296.011 1363.59M296.011 1363.59L303.131 1359.68"/>
        </svg>
      );

    case 'sphere':
      return (
        <svg {...commonProps} viewBox="293.0 1390.0 24 24">
          <path d="M306 1400.5C305.172 1400.5 304.5 1401.17 304.5 1402C304.5 1402.83 305.172 1403.5 306 1403.5C306.828 1403.5 307.5 1402.83 307.5 1402C307.5 1401.17 306.828 1400.5 306 1400.5ZM306 1400.5V1392"/><circle cx="306" cy="1402" r="10"/><path d="M309 1398C313.057 1398.52 316 1400.07 316 1401.91C316 1404.17 311.523 1406 306 1406C300.477 1406 296 1404.17 296 1401.91C296 1400.07 298.943 1398.52 303 1398"/>
        </svg>
      );

    case 'cylinder-01':
      return (
        <svg {...commonProps} viewBox="293.0 1434.0 24 24">
          <path d="M314 1439.5C314 1441.43 310.418 1443 306 1443C301.582 1443 298 1441.43 298 1439.5C298 1437.57 301.582 1436 306 1436C310.418 1436 314 1437.57 314 1439.5Z"/><path d="M314 1452.5C314 1454.43 310.418 1456 306 1456C301.582 1456 298 1454.43 298 1452.5C298 1450.57 301.582 1449 306 1449C310.418 1449 314 1450.57 314 1452.5Z"/><path d="M314 1452.5V1439.5M298 1452.5V1439.5"/>
        </svg>
      );

    case 'cylinder-02':
      return (
        <svg {...commonProps} viewBox="293.0 1478.0 24 24">
          <path d="M311 1482C311 1483.1 308.761 1484 306 1484C303.239 1484 301 1483.1 301 1482C301 1480.9 303.239 1480 306 1480C308.761 1480 311 1480.9 311 1482Z"/><path d="M315 1496C315 1498.21 310.971 1500 306 1500C301.029 1500 297 1498.21 297 1496C297 1493.79 301.029 1492 306 1492C310.971 1492 315 1493.79 315 1496Z"/><path d="M297.5 1494.5L301 1482M314.5 1494.5L311 1482"/>
        </svg>
      );

    case 'cylinder-03':
      return (
        <svg {...commonProps} viewBox="293.0 1522.0 24 24">
          <path d="M316 1541C316 1542.66 311.523 1544 306 1544C300.477 1544 296 1542.66 296 1541C296 1539.34 300.477 1538 306 1538C311.523 1538 316 1539.34 316 1541Z"/><path d="M316 1527C316 1528.66 311.523 1530 306 1530C300.477 1530 296 1528.66 296 1527C296 1525.34 300.477 1524 306 1524C311.523 1524 316 1525.34 316 1527Z"/><path d="M316 1527V1541M296 1527V1541"/>
        </svg>
      );

    case 'cone-01':
      return (
        <svg {...commonProps} viewBox="293.0 1566.0 24 24">
          <path d="M315 1584C315 1581.79 310.971 1580 306 1580C301.029 1580 297 1581.79 297 1584C297 1586.21 301.029 1588 306 1588C310.971 1588 315 1586.21 315 1584Z"/><path d="M314.5 1582.5L310.156 1573.39C308.343 1569.8 307.436 1568 306 1568C304.564 1568 303.657 1569.8 301.844 1573.39L297.5 1582.5"/>
        </svg>
      );

    case 'cylinder-04':
      return (
        <svg {...commonProps} viewBox="293.0 1610.0 24 24">
          <path d="M306 1629L303.879 1631.12M303.879 1631.12C304.422 1631.66 305.172 1632 306 1632C307.657 1632 309 1630.66 309 1629C309 1627.34 307.657 1626 306 1626C304.343 1626 303 1627.34 303 1629C303 1629.83 303.336 1630.58 303.879 1631.12Z"/><path d="M304 1626H308C310.809 1626 312.213 1626 313.222 1625.33C313.659 1625.03 314.034 1624.66 314.326 1624.22C315 1623.21 315 1621.81 315 1619C315 1616.19 315 1614.79 314.326 1613.78C314.034 1613.34 313.659 1612.97 313.222 1612.67C312.213 1612 310.809 1612 308 1612H304C301.191 1612 299.787 1612 298.778 1612.67C298.341 1612.97 297.966 1613.34 297.674 1613.78C297 1614.79 297 1616.19 297 1619C297 1621.81 297 1623.21 297.674 1624.22C297.966 1624.66 298.341 1625.03 298.778 1625.33C299.787 1626 301.191 1626 304 1626Z"/>
        </svg>
      );

    case 'cone-02':
      return (
        <svg {...commonProps} viewBox="293.0 1654.0 24 24">
          <path d="M306 1673H309M309 1673C309 1672.23 308.707 1671.46 308.121 1670.88C306.95 1669.71 305.05 1669.71 303.879 1670.88C302.707 1672.05 302.707 1673.95 303.879 1675.12C305.05 1676.29 306.95 1676.29 308.121 1675.12C308.707 1674.54 309 1673.77 309 1673Z"/><path d="M306 1657L306 1660"/><path d="M306 1666H306.009"/><path d="M306 1663H306.009"/><path d="M296.949 1665.5C298.922 1668.22 302.24 1670 306 1670C309.76 1670 313.078 1668.22 315.051 1665.5C315.76 1664.52 316.114 1664.03 315.967 1663.18C315.82 1662.33 315.184 1661.89 313.91 1661.01L308.399 1657.2C307.239 1656.4 306.659 1656 306 1656C305.341 1656 304.761 1656.4 303.601 1657.2L298.09 1661.01C296.816 1661.89 296.18 1662.33 296.033 1663.18C295.886 1664.03 296.24 1664.52 296.949 1665.5Z"/>
        </svg>
      );

    case 'infinity-02':
      return (
        <svg {...commonProps} viewBox="293.0 1698.0 24 24">
          <path d="M306 1710C306 1710 304.357 1713 302.7 1713C301.043 1713 300 1711.66 300 1710C300 1708.34 301.043 1707 302.7 1707C304.357 1707 306 1710 306 1710ZM306 1710C306 1710 307.643 1713 309.3 1713C310.957 1713 312 1711.66 312 1710C312 1708.34 310.957 1707 309.3 1707C307.643 1707 306 1710 306 1710Z"/><path d="M311.725 1700.5C313.114 1700.65 314.05 1701 314.748 1701.79C316 1703.2 316 1705.46 316 1710C316 1714.54 316 1716.8 314.748 1718.21C314.05 1719 313.114 1719.35 311.725 1719.5M300.275 1719.5C298.886 1719.35 297.95 1719 297.252 1718.21C296 1716.8 296 1714.54 296 1710C296 1705.46 296 1703.2 297.252 1701.79C297.95 1701 298.886 1700.65 300.275 1700.5"/>
        </svg>
      );

    case 'absolute':
      return (
        <svg {...commonProps} viewBox="293.0 1742.0 24 24">
          <path d="M311.725 1744.5C313.114 1744.65 314.05 1745 314.748 1745.79C316 1747.2 316 1749.46 316 1754C316 1758.54 316 1760.8 314.748 1762.21C314.05 1763 313.114 1763.35 311.725 1763.5M300.275 1763.5C298.886 1763.35 297.95 1763 297.252 1762.21C296 1760.8 296 1758.54 296 1754C296 1749.46 296 1747.2 297.252 1745.79C297.95 1745 298.886 1744.65 300.275 1744.5"/><path d="M301 1757.25C300.586 1757.25 300.25 1757.59 300.25 1758C300.25 1758.41 300.586 1758.75 301 1758.75V1758V1757.25ZM311 1750.75C311.414 1750.75 311.75 1750.41 311.75 1750C311.75 1749.59 311.414 1749.25 311 1749.25V1750V1750.75ZM305.086 1752.01L305.767 1751.7V1751.7L305.086 1752.01ZM306.914 1755.99L307.596 1755.68V1755.68L306.914 1755.99ZM307.797 1757.46L308.277 1756.89L308.277 1756.89L307.797 1757.46ZM310.412 1758.75C310.826 1758.75 311.162 1758.41 311.162 1758C311.162 1757.59 310.826 1757.25 310.412 1757.25V1758V1758.75ZM308.453 1757.84L308.19 1758.54H308.19L308.453 1757.84ZM301.588 1749.25C301.174 1749.25 300.838 1749.59 300.838 1750C300.838 1750.41 301.174 1750.75 301.588 1750.75V1750V1749.25ZM303.547 1750.16L303.284 1750.86V1750.86L303.547 1750.16ZM304.203 1750.54L303.723 1751.11L303.723 1751.11L304.203 1750.54ZM301 1758V1758.75C302.264 1758.75 303.313 1758.11 304.19 1757.3C305.063 1756.5 305.857 1755.44 306.599 1754.45C307.363 1753.44 308.073 1752.5 308.827 1751.8C309.576 1751.11 310.275 1750.75 311 1750.75V1750V1749.25C309.736 1749.25 308.687 1749.89 307.81 1750.7C306.937 1751.5 306.143 1752.56 305.401 1753.55C304.637 1754.56 303.927 1755.5 303.173 1756.2C302.424 1756.89 301.725 1757.25 301 1757.25V1758ZM305.086 1752.01L304.404 1752.32L306.233 1756.3L306.914 1755.99L307.596 1755.68L305.767 1751.7L305.086 1752.01ZM306.914 1755.99L306.233 1756.3C306.57 1757.04 306.823 1757.63 307.317 1758.04L307.797 1757.46L308.277 1756.89C308.104 1756.74 307.99 1756.54 307.596 1755.68L306.914 1755.99ZM310.412 1758V1757.25C309.33 1757.25 308.987 1757.24 308.716 1757.14L308.453 1757.84L308.19 1758.54C308.778 1758.76 309.455 1758.75 310.412 1758.75V1758ZM307.797 1757.46L307.317 1758.04C307.575 1758.25 307.871 1758.42 308.19 1758.54L308.453 1757.84L308.716 1757.14C308.546 1757.07 308.398 1756.99 308.277 1756.89L307.797 1757.46ZM301.588 1750V1750.75C302.67 1750.75 303.013 1750.76 303.284 1750.86L303.547 1750.16L303.81 1749.46C303.222 1749.24 302.545 1749.25 301.588 1749.25V1750ZM305.086 1752.01L305.767 1751.7C305.43 1750.96 305.177 1750.37 304.683 1749.96L304.203 1750.54L303.723 1751.11C303.896 1751.26 304.01 1751.46 304.404 1752.32L305.086 1752.01ZM303.547 1750.16L303.284 1750.86C303.454 1750.93 303.602 1751.01 303.723 1751.11L304.203 1750.54L304.683 1749.96C304.425 1749.75 304.129 1749.58 303.81 1749.46L303.547 1750.16Z" fill={color}/>
        </svg>
      );

    case 'matrix':
      return (
        <svg {...commonProps} viewBox="293.0 1786.0 24 24">
          <path d="M311.725 1788.5C313.114 1788.65 314.05 1789 314.748 1789.79C316 1791.2 316 1793.46 316 1798C316 1802.54 316 1804.8 314.748 1806.21C314.05 1807 313.114 1807.35 311.725 1807.5M300.275 1807.5C298.886 1807.35 297.95 1807 297.252 1806.21C296 1804.8 296 1802.54 296 1798C296 1793.46 296 1791.2 297.252 1789.79C297.95 1789 298.886 1788.65 300.275 1788.5"/><path d="M301 1794H301.009M305.996 1794H306.004M310.991 1794H311M301 1798H301.009M301 1802H301.009M305.996 1798H306.004M305.996 1802H306.004M310.991 1798H311M310.991 1802H311"/>
        </svg>
      );

    case 'root-02':
      return (
        <svg {...commonProps} viewBox="552.0 202.0 24 24">
          <path d="M569.725 204.5C571.114 204.654 572.05 205.001 572.748 205.787C574 207.196 574 209.464 574 214C574 218.536 574 220.804 572.748 222.213C572.05 222.999 571.114 223.346 569.725 223.5M558.275 223.5C556.886 223.346 555.95 222.999 555.252 222.213C554 220.804 554 218.536 554 214C554 209.464 554 207.196 555.252 205.787C555.95 205.001 556.886 204.654 558.275 204.5"/><path d="M559.634 215.586L558.954 215.904L558.954 215.904L559.634 215.586ZM559.948 216.256L559.268 216.574L559.948 216.256ZM562.037 216.081L561.307 215.905V215.905L562.037 216.081ZM563.312 210.779L564.042 210.955V210.955L563.312 210.779ZM564.388 210V210.75V210ZM570 210.75C570.414 210.75 570.75 210.414 570.75 210C570.75 209.586 570.414 209.25 570 209.25V210V210.75ZM561.182 217.999L561.119 217.251L561.119 217.251L561.182 217.999ZM559.033 214.751L558.827 215.472L558.827 215.472L559.033 214.751ZM557.581 214.521C557.237 214.752 557.147 215.218 557.378 215.562C557.609 215.905 558.076 215.996 558.419 215.765L558 215.143L557.581 214.521ZM564.876 216.107C564.462 216.107 564.126 216.443 564.126 216.857C564.126 217.271 564.462 217.607 564.876 217.607V216.857V216.107ZM568.726 214.179C569.141 214.179 569.476 213.843 569.476 213.429C569.476 213.014 569.141 212.679 568.726 212.679V213.429V214.179ZM566.449 214.29L565.756 214.576V214.576L566.449 214.29ZM567.154 215.996L567.847 215.709V215.709L567.154 215.996ZM567.493 216.627L568.003 216.077L568.003 216.077L567.493 216.627ZM568.5 217.607C568.914 217.607 569.25 217.271 569.25 216.857C569.25 216.443 568.914 216.107 568.5 216.107V216.857V217.607ZM567.746 216.788L568.034 216.096V216.096L567.746 216.788ZM565.103 212.679C564.689 212.679 564.353 213.014 564.353 213.429C564.353 213.843 564.689 214.179 565.103 214.179V213.429V212.679ZM565.857 213.497L565.569 214.19V214.19L565.857 213.497ZM566.11 213.659L566.62 213.109H566.62L566.11 213.659ZM559.634 215.586L558.954 215.904L559.268 216.574L559.948 216.256L560.627 215.937L560.313 215.267L559.634 215.586ZM562.037 216.081L562.766 216.256L564.042 210.955L563.312 210.779L562.583 210.604L561.307 215.905L562.037 216.081ZM564.388 210V210.75H570V210V209.25H564.388V210ZM559.948 216.256L559.268 216.574C559.536 217.144 559.769 217.646 559.993 217.991C560.19 218.297 560.58 218.802 561.244 218.746L561.182 217.999L561.119 217.251C561.382 217.229 561.432 217.455 561.252 217.176C561.098 216.938 560.915 216.552 560.627 215.937L559.948 216.256ZM562.037 216.081L561.307 215.905C561.15 216.558 561.05 216.966 560.949 217.223C560.83 217.523 560.843 217.274 561.119 217.251L561.182 217.999L561.244 218.746C561.921 218.689 562.211 218.11 562.344 217.774C562.494 217.394 562.621 216.86 562.766 216.256L562.037 216.081ZM559.634 215.586L560.313 215.267C560.203 215.033 560.087 214.782 559.96 214.59C559.818 214.374 559.599 214.133 559.239 214.03L559.033 214.751L558.827 215.472C558.779 215.459 558.738 215.434 558.71 215.41C558.687 215.392 558.688 215.385 558.709 215.416C558.73 215.449 558.759 215.5 558.803 215.586C558.846 215.672 558.893 215.774 558.954 215.904L559.634 215.586ZM563.312 210.779L564.042 210.955C564.077 210.807 564.105 210.739 564.12 210.712C564.129 210.695 564.115 210.725 564.071 210.754C564.034 210.778 564.017 210.773 564.071 210.765C564.131 210.755 564.224 210.75 564.388 210.75V210V209.25C564.079 209.25 563.624 209.252 563.246 209.501C562.828 209.777 562.675 210.224 562.583 210.604L563.312 210.779ZM558 215.143L558.419 215.765C558.458 215.739 558.5 215.71 558.535 215.686C558.572 215.66 558.606 215.636 558.641 215.614C558.71 215.568 558.767 215.535 558.816 215.511C558.929 215.455 558.909 215.496 558.827 215.472L559.033 214.751L559.239 214.03C558.793 213.903 558.397 214.045 558.154 214.164C557.916 214.281 557.681 214.453 557.581 214.521L558 215.143ZM564.876 216.857V217.607C565.559 217.607 566.078 217.222 566.446 216.845C566.815 216.466 567.143 215.976 567.423 215.563L566.801 215.143L566.18 214.723C565.88 215.167 565.629 215.534 565.372 215.798C565.113 216.063 564.96 216.107 564.876 216.107V216.857ZM566.801 215.143L567.423 215.563C567.723 215.119 567.974 214.752 568.231 214.488C568.49 214.222 568.643 214.179 568.726 214.179V213.429V212.679C568.044 212.679 567.525 213.063 567.157 213.441C566.788 213.82 566.46 214.309 566.18 214.723L566.801 215.143ZM566.449 214.29L565.756 214.576L566.108 215.429L566.801 215.143L567.495 214.857L567.143 214.004L566.449 214.29ZM566.801 215.143L566.108 215.429L566.46 216.282L567.154 215.996L567.847 215.709L567.495 214.857L566.801 215.143ZM567.154 215.996L566.46 216.282C566.574 216.558 566.706 216.919 566.983 217.177L567.493 216.627L568.003 216.077C568.026 216.098 568.024 216.108 567.996 216.053C567.962 215.986 567.922 215.891 567.847 215.709L567.154 215.996ZM568.5 216.857V216.107C568.293 216.107 568.177 216.107 568.092 216.1C568.016 216.095 568.014 216.088 568.034 216.096L567.746 216.788L567.457 217.481C567.795 217.621 568.175 217.607 568.5 217.607V216.857ZM567.493 216.627L566.983 217.177C567.123 217.306 567.284 217.408 567.457 217.481L567.746 216.788L568.034 216.096C568.02 216.09 568.01 216.083 568.003 216.077L567.493 216.627ZM565.103 213.429V214.179C565.31 214.179 565.426 214.179 565.511 214.185C565.587 214.191 565.589 214.198 565.569 214.19L565.857 213.497L566.146 212.805C565.808 212.665 565.428 212.679 565.103 212.679V213.429ZM566.449 214.29L567.143 214.004C567.029 213.728 566.897 213.367 566.62 213.109L566.11 213.659L565.6 214.209C565.577 214.188 565.579 214.178 565.607 214.233C565.641 214.3 565.681 214.395 565.756 214.576L566.449 214.29ZM565.857 213.497L565.569 214.19C565.583 214.196 565.593 214.203 565.6 214.209L566.11 213.659L566.62 213.109C566.48 212.98 566.319 212.878 566.146 212.805L565.857 213.497Z" fill={color}/>
        </svg>
      );

    case 'summation-02':
      return (
        <svg {...commonProps} viewBox="552.0 246.0 24 24">
          <path d="M569.725 248.5C571.114 248.654 572.05 249.001 572.748 249.787C574 251.196 574 253.464 574 258C574 262.536 574 264.804 572.748 266.213C572.05 266.999 571.114 267.346 569.725 267.5M558.275 267.5C556.886 267.346 555.95 266.999 555.252 266.213C554 264.804 554 262.536 554 258C554 253.464 554 251.196 555.252 249.787C555.95 249.001 556.886 248.654 558.275 248.5"/><path d="M567 260.499C566.998 261.027 566.983 261.314 566.85 261.53C566.524 262.061 565.874 261.998 565.324 261.998H562.799C561.692 261.998 561.138 261.998 561.02 261.671C560.901 261.345 561.322 260.976 562.163 260.239L563.853 258.759C564.255 258.406 564.457 258.23 564.457 258C564.457 257.77 564.255 257.594 563.853 257.241L562.163 255.761C561.322 255.024 560.901 254.655 561.02 254.329C561.138 254.002 561.692 254.002 562.799 254.002H565.324C565.874 254.002 566.524 253.939 566.85 254.47C566.983 254.686 566.998 254.973 567 255.501"/>
        </svg>
      );

    case 'abacus':
      return (
        <svg {...commonProps} viewBox="552.0 290.0 24 24">
          <path d="M554.5 302C554.5 297.522 554.5 295.282 555.891 293.891C557.282 292.5 559.522 292.5 564 292.5C568.478 292.5 570.718 292.5 572.109 293.891C573.5 295.282 573.5 297.522 573.5 302C573.5 306.478 573.5 308.718 572.109 310.109C570.718 311.5 568.478 311.5 564 311.5C559.522 311.5 557.282 311.5 555.891 310.109C554.5 308.718 554.5 306.478 554.5 302Z"/><path d="M558 299H561.5M569 299H570M564 298V300M566.5 298V300"/><path d="M570 305H564M559 305H558M561.5 304V306"/>
        </svg>
      );

    case 'equal-sign-square':
      return (
        <svg {...commonProps} viewBox="552.0 334.0 24 24">
          <path d="M560 343H568M560 349H568"/><path d="M554.5 346C554.5 341.522 554.5 339.282 555.891 337.891C557.282 336.5 559.522 336.5 564 336.5C568.478 336.5 570.718 336.5 572.109 337.891C573.5 339.282 573.5 341.522 573.5 346C573.5 350.478 573.5 352.718 572.109 354.109C570.718 355.5 568.478 355.5 564 355.5C559.522 355.5 557.282 355.5 555.891 354.109C554.5 352.718 554.5 350.478 554.5 346Z"/>
        </svg>
      );

    case 'not-equal-sign-square':
      return (
        <svg {...commonProps} viewBox="552.0 378.0 24 24">
          <path d="M554.5 390C554.5 385.522 554.5 383.282 555.891 381.891C557.282 380.5 559.522 380.5 564 380.5C568.478 380.5 570.718 380.5 572.109 381.891C573.5 383.282 573.5 385.522 573.5 390C573.5 394.478 573.5 396.718 572.109 398.109C570.718 399.5 568.478 399.5 564 399.5C559.522 399.5 557.282 399.5 555.891 398.109C554.5 396.718 554.5 394.478 554.5 390Z"/><path d="M559 387.778H569M559 392.222H569M560.667 395L567.333 385"/>
        </svg>
      );

    case 'less-than-square':
      return (
        <svg {...commonProps} viewBox="552.0 422.0 24 24">
          <path d="M554.5 434C554.5 429.522 554.5 427.282 555.891 425.891C557.282 424.5 559.522 424.5 564 424.5C568.478 424.5 570.718 424.5 572.109 425.891C573.5 427.282 573.5 429.522 573.5 434C573.5 438.478 573.5 440.718 572.109 442.109C570.718 443.5 568.478 443.5 564 443.5C559.522 443.5 557.282 443.5 555.891 442.109C554.5 440.718 554.5 438.478 554.5 434Z"/><path d="M566 430L562.668 433.02C561.777 433.827 561.777 434.173 562.668 434.98L566 438"/>
        </svg>
      );

    case 'greater-than-square':
      return (
        <svg {...commonProps} viewBox="552.0 466.0 24 24">
          <path d="M573.5 478C573.5 473.522 573.5 471.282 572.109 469.891C570.718 468.5 568.478 468.5 564 468.5C559.522 468.5 557.282 468.5 555.891 469.891C554.5 471.282 554.5 473.522 554.5 478C554.5 482.478 554.5 484.718 555.891 486.109C557.282 487.5 559.522 487.5 564 487.5C568.478 487.5 570.718 487.5 572.109 486.109C573.5 484.718 573.5 482.478 573.5 478Z"/><path d="M562 474L565.332 477.02C566.223 477.827 566.223 478.173 565.332 478.98L562 482"/>
        </svg>
      );

    case 'inequality-square-01':
      return (
        <svg {...commonProps} viewBox="552.0 510.0 24 24">
          <path d="M554.5 522C554.5 517.522 554.5 515.282 555.891 513.891C557.282 512.5 559.522 512.5 564 512.5C568.478 512.5 570.718 512.5 572.109 513.891C573.5 515.282 573.5 517.522 573.5 522C573.5 526.478 573.5 528.718 572.109 530.109C570.718 531.5 568.478 531.5 564 531.5C559.522 531.5 557.282 531.5 555.891 530.109C554.5 528.718 554.5 526.478 554.5 522Z"/><path d="M565.998 517.5L560.138 522.671C559.801 523.08 560.131 523.5 560.583 523.5H568.02"/><path d="M560 526.5H568.02"/>
        </svg>
      );

    case 'inequality-square-02':
      return (
        <svg {...commonProps} viewBox="552.0 554.0 24 24">
          <path d="M554.5 566C554.5 561.522 554.5 559.282 555.891 557.891C557.282 556.5 559.522 556.5 564 556.5C568.478 556.5 570.718 556.5 572.109 557.891C573.5 559.282 573.5 561.522 573.5 566C573.5 570.478 573.5 572.718 572.109 574.109C570.718 575.5 568.478 575.5 564 575.5C559.522 575.5 557.282 575.5 555.891 574.109C554.5 572.718 554.5 570.478 554.5 566Z"/><path d="M562.022 561.5L567.866 566.671C568.202 567.08 567.873 567.5 567.422 567.5H560.006"/><path d="M568.023 570.5H560.002"/>
        </svg>
      );

    case '1st-brecket-square':
      return (
        <svg {...commonProps} viewBox="552.0 598.0 24 24">
          <path d="M554.5 610C554.5 605.522 554.5 603.282 555.891 601.891C557.282 600.5 559.522 600.5 564 600.5C568.478 600.5 570.718 600.5 572.109 601.891C573.5 603.282 573.5 605.522 573.5 610C573.5 614.478 573.5 616.718 572.109 618.109C570.718 619.5 568.478 619.5 564 619.5C559.522 619.5 557.282 619.5 555.891 618.109C554.5 616.718 554.5 614.478 554.5 610Z"/><path d="M561 606C559.795 606.86 559 608.33 559 610C559 611.67 559.795 613.14 561 614M567 606C568.205 606.86 569 608.33 569 610C569 611.67 568.205 613.14 567 614"/>
        </svg>
      );

    case '2nd-brecket-square':
      return (
        <svg {...commonProps} viewBox="552.0 642.0 24 24">
          <path d="M567 650C567.65 650.065 568.088 650.211 568.414 650.542C569 651.135 569 652.09 569 654C569 655.91 569 656.865 568.414 657.458C568.088 657.789 567.65 657.935 567 658M561 658C560.35 657.935 559.912 657.789 559.586 657.458C559 656.865 559 655.91 559 654C559 652.09 559 651.135 559.586 650.542C559.912 650.211 560.35 650.065 561 650"/><path d="M554.5 654C554.5 649.522 554.5 647.282 555.891 645.891C557.282 644.5 559.522 644.5 564 644.5C568.478 644.5 570.718 644.5 572.109 645.891C573.5 647.282 573.5 649.522 573.5 654C573.5 658.478 573.5 660.718 572.109 662.109C570.718 663.5 568.478 663.5 564 663.5C559.522 663.5 557.282 663.5 555.891 662.109C554.5 660.718 554.5 658.478 554.5 654Z"/>
        </svg>
      );

    case '3rd-brecket-square':
      return (
        <svg {...commonProps} viewBox="552.0 686.0 24 24">
          <path d="M566 702C566.924 702 567.673 701.488 567.673 700.857C567.673 699.636 567.687 699.134 568.755 698.404C569.082 698.181 569.082 697.819 568.755 697.596C567.687 696.866 567.673 696.364 567.673 695.143C567.673 694.512 566.924 694 566 694M562 702C561.076 702 560.327 701.488 560.327 700.857C560.327 699.636 560.313 699.134 559.245 698.404C558.918 698.181 558.918 697.819 559.245 697.596C560.313 696.866 560.327 696.364 560.327 695.143C560.327 694.512 561.076 694 562 694"/><path d="M554.5 698C554.5 693.522 554.5 691.282 555.891 689.891C557.282 688.5 559.522 688.5 564 688.5C568.478 688.5 570.718 688.5 572.109 689.891C573.5 691.282 573.5 693.522 573.5 698C573.5 702.478 573.5 704.718 572.109 706.109C570.718 707.5 568.478 707.5 564 707.5C559.522 707.5 557.282 707.5 555.891 706.109C554.5 704.718 554.5 702.478 554.5 698Z"/>
        </svg>
      );

    case 'plus-minus-square-01':
      return (
        <svg {...commonProps} viewBox="552.0 730.0 24 24">
          <path d="M564 737.5V743.864M567.5 740.682H560.5M567.5 746.5H560.5"/><path d="M554.5 742C554.5 737.522 554.5 735.282 555.891 733.891C557.282 732.5 559.522 732.5 564 732.5C568.478 732.5 570.718 732.5 572.109 733.891C573.5 735.282 573.5 737.522 573.5 742C573.5 746.478 573.5 748.718 572.109 750.109C570.718 751.5 568.478 751.5 564 751.5C559.522 751.5 557.282 751.5 555.891 750.109C554.5 748.718 554.5 746.478 554.5 742Z"/>
        </svg>
      );

    case 'minus-plus-square-01':
      return (
        <svg {...commonProps} viewBox="552.0 774.0 24 24">
          <path d="M564 790.5V784.136M567.5 787.318H560.5M567.5 781.5H560.5"/><path d="M554.5 786C554.5 781.522 554.5 779.282 555.891 777.891C557.282 776.5 559.522 776.5 564 776.5C568.478 776.5 570.718 776.5 572.109 777.891C573.5 779.282 573.5 781.522 573.5 786C573.5 790.478 573.5 792.718 572.109 794.109C570.718 795.5 568.478 795.5 564 795.5C559.522 795.5 557.282 795.5 555.891 794.109C554.5 792.718 554.5 790.478 554.5 786Z"/>
        </svg>
      );

    case 'plus-minus-square-02':
      return (
        <svg {...commonProps} viewBox="552.0 818.0 24 24">
          <path d="M554.5 830C554.5 825.522 554.5 823.282 555.891 821.891C557.282 820.5 559.522 820.5 564 820.5C568.478 820.5 570.718 820.5 572.109 821.891C573.5 823.282 573.5 825.522 573.5 830C573.5 834.478 573.5 836.718 572.109 838.109C570.718 839.5 568.478 839.5 564 839.5C559.522 839.5 557.282 839.5 555.891 838.109C554.5 836.718 554.5 834.478 554.5 830Z"/><path d="M559 835L569 825M561 825V827M561 827V829M561 827L563 827M561 827L559 827M569 833L565 833"/>
        </svg>
      );

    case 'minus-plus-square-02':
      return (
        <svg {...commonProps} viewBox="552.0 862.0 24 24">
          <path d="M554.5 874C554.5 869.522 554.5 867.282 555.891 865.891C557.282 864.5 559.522 864.5 564 864.5C568.478 864.5 570.718 864.5 572.109 865.891C573.5 867.282 573.5 869.522 573.5 874C573.5 878.478 573.5 880.718 572.109 882.109C570.718 883.5 568.478 883.5 564 883.5C559.522 883.5 557.282 883.5 555.891 882.109C554.5 880.718 554.5 878.478 554.5 874Z"/><path d="M569 869L559 879M567 879V877M567 877V875M567 877L565 877M567 877H569M559 871L563 871"/>
        </svg>
      );

    case 'plus-sign-square':
      return (
        <svg {...commonProps} viewBox="552.0 906.0 24 24">
          <path d="M554.5 918C554.5 913.522 554.5 911.282 555.891 909.891C557.282 908.5 559.522 908.5 564 908.5C568.478 908.5 570.718 908.5 572.109 909.891C573.5 911.282 573.5 913.522 573.5 918C573.5 922.478 573.5 924.718 572.109 926.109C570.718 927.5 568.478 927.5 564 927.5C559.522 927.5 557.282 927.5 555.891 926.109C554.5 924.718 554.5 922.478 554.5 918Z"/><path d="M564 914V922M568 918H560"/>
        </svg>
      );

    case 'minus-sign-square':
      return (
        <svg {...commonProps} viewBox="552.0 950.0 24 24">
          <path d="M554.5 962C554.5 957.522 554.5 955.282 555.891 953.891C557.282 952.5 559.522 952.5 564 952.5C568.478 952.5 570.718 952.5 572.109 953.891C573.5 955.282 573.5 957.522 573.5 962C573.5 966.478 573.5 968.718 572.109 970.109C570.718 971.5 568.478 971.5 564 971.5C559.522 971.5 557.282 971.5 555.891 970.109C554.5 968.718 554.5 966.478 554.5 962Z"/><path d="M568 962H560"/>
        </svg>
      );

    case 'multiplication-sign-square':
      return (
        <svg {...commonProps} viewBox="552.0 994.0 24 24">
          <path d="M554.5 1006C554.5 1001.52 554.5 999.282 555.891 997.891C557.282 996.5 559.522 996.5 564 996.5C568.478 996.5 570.718 996.5 572.109 997.891C573.5 999.282 573.5 1001.52 573.5 1006C573.5 1010.48 573.5 1012.72 572.109 1014.11C570.718 1015.5 568.478 1015.5 564 1015.5C559.522 1015.5 557.282 1015.5 555.891 1014.11C554.5 1012.72 554.5 1010.48 554.5 1006Z"/><path d="M568 1002L564 1006M564 1006L560 1010M564 1006L568 1010M564 1006L560 1002"/>
        </svg>
      );

    case 'divide-sign-square':
      return (
        <svg {...commonProps} viewBox="552.0 1038.0 24 24">
          <path d="M559 1050H569M565 1046C565 1046.55 564.552 1047 564 1047C563.448 1047 563 1046.55 563 1046C563 1045.45 563.448 1045 564 1045C564.552 1045 565 1045.45 565 1046ZM565 1054C565 1054.55 564.552 1055 564 1055C563.448 1055 563 1054.55 563 1054C563 1053.45 563.448 1053 564 1053C564.552 1053 565 1053.45 565 1054Z"/><path d="M554.5 1050C554.5 1045.52 554.5 1043.28 555.891 1041.89C557.282 1040.5 559.522 1040.5 564 1040.5C568.478 1040.5 570.718 1040.5 572.109 1041.89C573.5 1043.28 573.5 1045.52 573.5 1050C573.5 1054.48 573.5 1056.72 572.109 1058.11C570.718 1059.5 568.478 1059.5 564 1059.5C559.522 1059.5 557.282 1059.5 555.891 1058.11C554.5 1056.72 554.5 1054.48 554.5 1050Z"/>
        </svg>
      );

    case 'percent-square':
      return (
        <svg {...commonProps} viewBox="552.0 1082.0 24 24">
          <path d="M554.5 1094C554.5 1089.52 554.5 1087.28 555.891 1085.89C557.282 1084.5 559.522 1084.5 564 1084.5C568.478 1084.5 570.718 1084.5 572.109 1085.89C573.5 1087.28 573.5 1089.52 573.5 1094C573.5 1098.48 573.5 1100.72 572.109 1102.11C570.718 1103.5 568.478 1103.5 564 1103.5C559.522 1103.5 557.282 1103.5 555.891 1102.11C554.5 1100.72 554.5 1098.48 554.5 1094Z"/><path d="M560 1098L568 1090M562 1091C562 1091.55 561.552 1092 561 1092C560.448 1092 560 1091.55 560 1091C560 1090.45 560.448 1090 561 1090C561.552 1090 562 1090.45 562 1091ZM568 1096.83C568 1097.38 567.552 1097.83 567 1097.83C566.448 1097.83 566 1097.38 566 1096.83C566 1096.28 566.448 1095.83 567 1095.83C567.552 1095.83 568 1096.28 568 1096.83Z"/>
        </svg>
      );

    case 'pi-square':
      return (
        <svg {...commonProps} viewBox="552.0 1126.0 24 24">
          <path d="M569 1134H561.222C559.995 1134 559 1134.9 559 1136M562.333 1134L561.374 1140.91C561.291 1141.51 560.677 1141.93 560.012 1141.84C559.562 1141.79 559.187 1141.5 559.043 1141.12L559 1141M565.667 1142L566.778 1134"/><path d="M554.5 1138C554.5 1133.52 554.5 1131.28 555.891 1129.89C557.282 1128.5 559.522 1128.5 564 1128.5C568.478 1128.5 570.718 1128.5 572.109 1129.89C573.5 1131.28 573.5 1133.52 573.5 1138C573.5 1142.48 573.5 1144.72 572.109 1146.11C570.718 1147.5 568.478 1147.5 564 1147.5C559.522 1147.5 557.282 1147.5 555.891 1146.11C554.5 1144.72 554.5 1142.48 554.5 1138Z"/>
        </svg>
      );

    case 'alpha-square':
      return (
        <svg {...commonProps} viewBox="552.0 1170.0 24 24">
          <path d="M567.001 1178C567.108 1178.86 567.001 1180.23 566.601 1181.83C566.255 1182.97 565.162 1186.26 562.324 1185.98C559.872 1185.66 558.845 1183.26 559.019 1181.68C559.085 1180.36 560.071 1178.04 562.697 1178C565.055 1178.2 565.655 1180.21 565.988 1181.9C566.348 1183.46 566.308 1184.23 566.908 1185.3C567.268 1185.88 567.947 1186.1 568.494 1185.96C568.933 1185.78 569 1185.39 569 1185.1"/><path d="M554.5 1182C554.5 1177.52 554.5 1175.28 555.891 1173.89C557.282 1172.5 559.522 1172.5 564 1172.5C568.478 1172.5 570.718 1172.5 572.109 1173.89C573.5 1175.28 573.5 1177.52 573.5 1182C573.5 1186.48 573.5 1188.72 572.109 1190.11C570.718 1191.5 568.478 1191.5 564 1191.5C559.522 1191.5 557.282 1191.5 555.891 1190.11C554.5 1188.72 554.5 1186.48 554.5 1182Z"/>
        </svg>
      );

    case 'infinity-square':
      return (
        <svg {...commonProps} viewBox="552.0 1214.0 24 24">
          <path d="M564 1226C564 1226 562.357 1228.5 560.7 1228.5C559.043 1228.5 558 1227.38 558 1226C558 1224.62 559.043 1223.5 560.7 1223.5C562.357 1223.5 564 1226 564 1226ZM564 1226C564 1226 565.643 1228.5 567.3 1228.5C568.957 1228.5 570 1227.38 570 1226C570 1224.62 568.957 1223.5 567.3 1223.5C565.643 1223.5 564 1226 564 1226Z"/><path d="M554.5 1226C554.5 1221.52 554.5 1219.28 555.891 1217.89C557.282 1216.5 559.522 1216.5 564 1216.5C568.478 1216.5 570.718 1216.5 572.109 1217.89C573.5 1219.28 573.5 1221.52 573.5 1226C573.5 1230.48 573.5 1232.72 572.109 1234.11C570.718 1235.5 568.478 1235.5 564 1235.5C559.522 1235.5 557.282 1235.5 555.891 1234.11C554.5 1232.72 554.5 1230.48 554.5 1226Z"/>
        </svg>
      );

    case 'approximately-equal-square':
      return (
        <svg {...commonProps} viewBox="552.0 1258.0 24 24">
          <path d="M559 1267.28C560.667 1265.29 562.333 1265.87 564 1267.33C565.667 1268.8 567.333 1269.38 569 1267.38M559 1272.62C560.667 1270.62 562.333 1271.2 564 1272.67C565.667 1274.13 567.333 1274.71 569 1272.72"/><path d="M554.5 1270C554.5 1265.52 554.5 1263.28 555.891 1261.89C557.282 1260.5 559.522 1260.5 564 1260.5C568.478 1260.5 570.718 1260.5 572.109 1261.89C573.5 1263.28 573.5 1265.52 573.5 1270C573.5 1274.48 573.5 1276.72 572.109 1278.11C570.718 1279.5 568.478 1279.5 564 1279.5C559.522 1279.5 557.282 1279.5 555.891 1278.11C554.5 1276.72 554.5 1274.48 554.5 1270Z"/>
        </svg>
      );

    case 'congruent-to-square':
      return (
        <svg {...commonProps} viewBox="552.0 1302.0 24 24">
          <path d="M559 1314.5H569M559 1318H569M559 1311.5C560 1309.64 562.333 1309.54 564 1311M569 1310.5C568 1312.36 565.667 1312.45 564 1311"/><path d="M554.5 1314C554.5 1309.52 554.5 1307.28 555.891 1305.89C557.282 1304.5 559.522 1304.5 564 1304.5C568.478 1304.5 570.718 1304.5 572.109 1305.89C573.5 1307.28 573.5 1309.52 573.5 1314C573.5 1318.48 573.5 1320.72 572.109 1322.11C570.718 1323.5 568.478 1323.5 564 1323.5C559.522 1323.5 557.282 1323.5 555.891 1322.11C554.5 1320.72 554.5 1318.48 554.5 1314Z"/>
        </svg>
      );

    case 'function-square':
      return (
        <svg {...commonProps} viewBox="552.0 1346.0 24 24">
          <path d="M560 1361.89C560.151 1362.42 560.455 1363 561.25 1363C562.625 1363 562.969 1361.89 564 1358C565.031 1354.11 565.375 1353 566.75 1353C567.545 1353 567.849 1353.58 568 1354.11M562.333 1356.61H566.75"/><path d="M554.5 1358C554.5 1353.52 554.5 1351.28 555.891 1349.89C557.282 1348.5 559.522 1348.5 564 1348.5C568.478 1348.5 570.718 1348.5 572.109 1349.89C573.5 1351.28 573.5 1353.52 573.5 1358C573.5 1362.48 573.5 1364.72 572.109 1366.11C570.718 1367.5 568.478 1367.5 564 1367.5C559.522 1367.5 557.282 1367.5 555.891 1366.11C554.5 1364.72 554.5 1362.48 554.5 1358Z"/>
        </svg>
      );

    case 'x-variable-square':
      return (
        <svg {...commonProps} viewBox="552.0 1390.0 24 24">
          <path d="M554.5 1402C554.5 1397.52 554.5 1395.28 555.891 1393.89C557.282 1392.5 559.522 1392.5 564 1392.5C568.478 1392.5 570.718 1392.5 572.109 1393.89C573.5 1395.28 573.5 1397.52 573.5 1402C573.5 1406.48 573.5 1408.72 572.109 1410.11C570.718 1411.5 568.478 1411.5 564 1411.5C559.522 1411.5 557.282 1411.5 555.891 1410.11C554.5 1408.72 554.5 1406.48 554.5 1402Z"/><path d="M568 1399C564.816 1399 563.184 1405.02 560 1405.02"/><path d="M567.541 1405.02C566.732 1405.02 566.288 1405.02 565.947 1404.9C565.753 1404.83 565.577 1404.73 565.427 1404.62C565.162 1404.41 565.017 1404.11 564.726 1403.51L563.276 1400.51C562.985 1399.91 562.84 1399.61 562.575 1399.4C562.425 1399.29 562.249 1399.19 562.055 1399.12C561.714 1399 561.27 1399 560.461 1399"/>
        </svg>
      );

    case 'square-square':
      return (
        <svg {...commonProps} viewBox="552.0 1434.0 24 24">
          <path d="M554.5 1446C554.5 1441.52 554.5 1439.28 555.891 1437.89C557.282 1436.5 559.522 1436.5 564 1436.5C568.478 1436.5 570.718 1436.5 572.109 1437.89C573.5 1439.28 573.5 1441.52 573.5 1446C573.5 1450.48 573.5 1452.72 572.109 1454.11C570.718 1455.5 568.478 1455.5 564 1455.5C559.522 1455.5 557.282 1455.5 555.891 1454.11C554.5 1452.72 554.5 1450.48 554.5 1446Z"/><path d="M558.359 1445C558.719 1445 559.712 1444.85 560.073 1445.61C560.488 1446.49 561.53 1449.47 561.779 1450.07C562.067 1450.76 562.511 1451.1 563.651 1450.98"/><path d="M564.006 1444.98C562.62 1444.98 561.6 1447.07 561.047 1447.91C560.387 1448.96 559.32 1451.03 558 1450.98"/><path d="M570 1445H567C567 1445 569.005 1443.68 569.224 1443.53C569.444 1443.38 570 1443.05 570 1442.33C570 1441.6 569.275 1441 568.507 1441C567.74 1441 567 1441.53 567 1442.34"/>
        </svg>
      );

    case 'square-root-square':
      return (
        <svg {...commonProps} viewBox="552.0 1478.0 24 24">
          <path d="M554.5 1490C554.5 1485.52 554.5 1483.28 555.891 1481.89C557.282 1480.5 559.522 1480.5 564 1480.5C568.478 1480.5 570.718 1480.5 572.109 1481.89C573.5 1483.28 573.5 1485.52 573.5 1490C573.5 1494.48 573.5 1496.72 572.109 1498.11C570.718 1499.5 568.478 1499.5 564 1499.5C559.522 1499.5 557.282 1499.5 555.891 1498.11C554.5 1496.72 554.5 1494.48 554.5 1490Z"/><path d="M570 1485.99H564.517C563.7 1485.99 563.46 1486.03 563.299 1486.85L561.954 1492.46C561.622 1493.79 561.451 1493.98 561.12 1494.01C560.76 1493.89 560.59 1493.58 559.98 1492.33L559.635 1491.57C559.372 1491.03 559.286 1490.8 559.02 1490.73C558.62 1490.62 558.307 1490.93 558 1491.13M565.104 1489.42C565.524 1489.41 565.98 1489.39 566.229 1489.81C566.572 1490.5 567.116 1491.92 567.318 1492.37C567.419 1492.54 567.48 1492.69 567.84 1492.81C568.109 1492.84 568.5 1492.85 568.5 1492.85M568.741 1489.41C567.894 1489.41 567.39 1490.36 566.917 1490.95C566.307 1491.86 565.681 1492.87 564.889 1492.84"/>
        </svg>
      );

    case 'n-th-root-square':
      return (
        <svg {...commonProps} viewBox="552.0 1522.0 24 24">
          <path d="M559 1532.52V1530.55M559 1530.55C559.061 1529.73 559.676 1529 560.51 1529C561.494 1529 561.939 1529.93 562.006 1530.55V1532.52M559 1530.55V1529"/><path d="M558.988 1536.51C559.452 1536.26 559.858 1536.17 560.059 1536.34C560.26 1536.51 560.687 1537.31 560.862 1537.61C561.13 1538.08 561.438 1539.02 561.973 1539.02C562.334 1539.02 562.625 1538.04 563.097 1536.88C563.817 1535.1 564.622 1532.86 564.744 1532.66C564.944 1532.32 565.145 1531.99 565.681 1531.99C566.283 1531.99 569.027 1531.99 569.027 1531.99"/><path d="M554.5 1534C554.5 1529.52 554.5 1527.28 555.891 1525.89C557.282 1524.5 559.522 1524.5 564 1524.5C568.478 1524.5 570.718 1524.5 572.109 1525.89C573.5 1527.28 573.5 1529.52 573.5 1534C573.5 1538.48 573.5 1540.72 572.109 1542.11C570.718 1543.5 568.478 1543.5 564 1543.5C559.522 1543.5 557.282 1543.5 555.891 1542.11C554.5 1540.72 554.5 1538.48 554.5 1534Z"/>
        </svg>
      );

    case 'summation-square':
      return (
        <svg {...commonProps} viewBox="552.0 1566.0 24 24">
          <path d="M554.5 1578C554.5 1573.52 554.5 1571.28 555.891 1569.89C557.282 1568.5 559.522 1568.5 564 1568.5C568.478 1568.5 570.718 1568.5 572.109 1569.89C573.5 1571.28 573.5 1573.52 573.5 1578C573.5 1582.48 573.5 1584.72 572.109 1586.11C570.718 1587.5 568.478 1587.5 564 1587.5C559.522 1587.5 557.282 1587.5 555.891 1586.11C554.5 1584.72 554.5 1582.48 554.5 1578Z"/><path d="M567 1580.5C566.998 1581.03 566.983 1581.31 566.85 1581.53C566.524 1582.06 565.874 1582 565.324 1582H562.799C561.692 1582 561.138 1582 561.02 1581.67C560.901 1581.34 561.322 1580.98 562.163 1580.24L563.853 1578.76C564.255 1578.41 564.457 1578.23 564.457 1578C564.457 1577.77 564.255 1577.59 563.853 1577.24L562.163 1575.76C561.322 1575.02 560.901 1574.66 561.02 1574.33C561.138 1574 561.692 1574 562.799 1574H565.324C565.874 1574 566.524 1573.94 566.85 1574.47C566.983 1574.69 566.998 1574.97 567 1575.5"/>
        </svg>
      );

    case 'more-or-less-square':
      return (
        <svg {...commonProps} viewBox="552.0 1610.0 24 24">
          <path d="M554.5 1622C554.5 1617.52 554.5 1615.28 555.891 1613.89C557.282 1612.5 559.522 1612.5 564 1612.5C568.478 1612.5 570.718 1612.5 572.109 1613.89C573.5 1615.28 573.5 1617.52 573.5 1622C573.5 1626.48 573.5 1628.72 572.109 1630.11C570.718 1631.5 568.478 1631.5 564 1631.5C559.522 1631.5 557.282 1631.5 555.891 1630.11C554.5 1628.72 554.5 1626.48 554.5 1622Z"/><path d="M558.996 1622H569.004"/><path d="M569.006 1619H561.002C560.015 1619 559.145 1619.01 559.022 1618.68C558.926 1618.42 559.526 1617.6 560.006 1617"/><path d="M559.01 1625L567.014 1625C568 1625 568.871 1624.99 568.994 1625.32C569.09 1625.58 568.49 1626.4 568.01 1627"/>
        </svg>
      );

    case 'equal-sign-circle':
      return (
        <svg {...commonProps} viewBox="552.0 1654.0 24 24">
          <circle cx="564" cy="1666" r="10"/><path d="M560 1663H568M560 1669H568"/>
        </svg>
      );

    case 'not-equal-sign-circle':
      return (
        <svg {...commonProps} viewBox="552.0 1698.0 24 24">
          <circle cx="564" cy="1710" r="10"/><path d="M559 1707.78H569M559 1712.22H569M560.667 1715L567.333 1705"/>
        </svg>
      );

    case 'less-than-circle':
      return (
        <svg {...commonProps} viewBox="552.0 1742.0 24 24">
          <path d="M566 1750L562.668 1753.02C561.777 1753.83 561.777 1754.17 562.668 1754.98L566 1758"/><circle cx="564" cy="1754" r="10"/>
        </svg>
      );

    case 'greater-than-circle':
      return (
        <svg {...commonProps} viewBox="552.0 1786.0 24 24">
          <path d="M562 1794L565.332 1797.02C566.223 1797.83 566.223 1798.17 565.332 1798.98L562 1802"/><circle cx="564" cy="1798" r="10"/>
        </svg>
      );

    case 'inequality-circle-01':
      return (
        <svg {...commonProps} viewBox="864.0 202.0 24 24">
          <path d="M876 224C881.523 224 886 219.523 886 214C886 208.477 881.523 204 876 204C870.477 204 866 208.477 866 214C866 219.523 870.477 224 876 224Z"/><path d="M877.982 209.5L872.138 214.671C871.802 215.08 872.131 215.5 872.582 215.5H879.998"/><path d="M871.98 218.5H880.002"/>
        </svg>
      );

    case 'inequality-circle-02':
      return (
        <svg {...commonProps} viewBox="864.0 246.0 24 24">
          <path d="M876 268C870.477 268 866 263.523 866 258C866 252.477 870.477 248 876 248C881.523 248 886 252.477 886 258C886 263.523 881.523 268 876 268Z"/><path d="M874.018 253.5L879.862 258.671C880.198 259.08 879.869 259.5 879.418 259.5H872.002"/><path d="M880.02 262.5H871.998"/>
        </svg>
      );

    case '1st-brecket-circle':
      return (
        <svg {...commonProps} viewBox="864.0 290.0 24 24">
          <path d="M873 298C871.795 298.86 871 300.33 871 302C871 303.67 871.795 305.14 873 306M879 298C880.205 298.86 881 300.33 881 302C881 303.67 880.205 305.14 879 306"/><circle cx="876" cy="302" r="10"/>
        </svg>
      );

    case '2nd-brecket-circle':
      return (
        <svg {...commonProps} viewBox="864.0 334.0 24 24">
          <path d="M879 342C879.65 342.065 880.088 342.211 880.414 342.542C881 343.135 881 344.09 881 346C881 347.91 881 348.865 880.414 349.458C880.088 349.789 879.65 349.935 879 350M873 350C872.35 349.935 871.912 349.789 871.586 349.458C871 348.865 871 347.91 871 346C871 344.09 871 343.135 871.586 342.542C871.912 342.211 872.35 342.065 873 342"/><circle cx="876" cy="346" r="10"/>
        </svg>
      );

    case '3rd-brecket-circle':
      return (
        <svg {...commonProps} viewBox="864.0 378.0 24 24">
          <path d="M878 394C878.924 394 879.673 393.488 879.673 392.857C879.673 391.636 879.687 391.134 880.755 390.404C881.082 390.181 881.082 389.819 880.755 389.596C879.687 388.866 879.673 388.364 879.673 387.143C879.673 386.512 878.924 386 878 386M874 394C873.076 394 872.327 393.488 872.327 392.857C872.327 391.636 872.313 391.134 871.245 390.404C870.918 390.181 870.918 389.819 871.245 389.596C872.313 388.866 872.327 388.364 872.327 387.143C872.327 386.512 873.076 386 874 386"/><circle cx="876" cy="390" r="10"/>
        </svg>
      );

    case 'plus-minus-circle-01':
      return (
        <svg {...commonProps} viewBox="864.0 422.0 24 24">
          <path d="M876 429.5V435.864M879.5 432.682H872.5M879.5 438.5H872.5"/><circle cx="876" cy="434" r="10"/>
        </svg>
      );

    case 'minus-plus-circle-01':
      return (
        <svg {...commonProps} viewBox="864.0 466.0 24 24">
          <path d="M876 482.5V476.136M879.5 479.318H872.5M879.5 473.5H872.5"/><circle cx="876" cy="478" r="10"/>
        </svg>
      );

    case 'plus-minus-circle-02':
      return (
        <svg {...commonProps} viewBox="864.0 510.0 24 24">
          <circle cx="876" cy="522" r="10"/><path d="M872 526L880 518M873.5 518L873.5 519.5M873.5 519.5L873.5 521M873.5 519.5L875 519.5M873.5 519.5L872 519.5M880 524.5L877 524.5"/>
        </svg>
      );

    case 'minus-plus-circle-02':
      return (
        <svg {...commonProps} viewBox="864.0 554.0 24 24">
          <path d="M880 562L872 570M878.5 570V568.5M878.5 568.5V567M878.5 568.5H877M878.5 568.5H880M872 563.5H875"/><circle cx="876" cy="566" r="10"/>
        </svg>
      );

    case 'plus-sign-circle':
      return (
        <svg {...commonProps} viewBox="864.0 598.0 24 24">
          <path d="M876 606V614M880 610H872"/><circle cx="876" cy="610" r="10"/>
        </svg>
      );

    case 'minus-sign-circle':
      return (
        <svg {...commonProps} viewBox="864.0 642.0 24 24">
          <path d="M880 654H872"/><circle cx="876" cy="654" r="10"/>
        </svg>
      );

    case 'multiplication-sign-circle':
      return (
        <svg {...commonProps} viewBox="864.0 686.0 24 24">
          <path d="M879.5 694.5L876 698M876 698L872.5 701.5M876 698L879.5 701.5M876 698L872.5 694.5"/><circle cx="876" cy="698" r="10"/>
        </svg>
      );

    case 'divide-sign-circle':
      return (
        <svg {...commonProps} viewBox="864.0 730.0 24 24">
          <path d="M871 742H881M877 738C877 738.552 876.552 739 876 739C875.448 739 875 738.552 875 738C875 737.448 875.448 737 876 737C876.552 737 877 737.448 877 738ZM877 746C877 746.552 876.552 747 876 747C875.448 747 875 746.552 875 746C875 745.448 875.448 745 876 745C876.552 745 877 745.448 877 746Z"/><circle cx="876" cy="742" r="10"/>
        </svg>
      );

    case 'percent-circle':
      return (
        <svg {...commonProps} viewBox="864.0 774.0 24 24">
          <path d="M872 790L880 782M874 783C874 783.552 873.552 784 873 784C872.448 784 872 783.552 872 783C872 782.448 872.448 782 873 782C873.552 782 874 782.448 874 783ZM880 788.828C880 789.381 879.552 789.828 879 789.828C878.448 789.828 878 789.381 878 788.828C878 788.276 878.448 787.828 879 787.828C879.552 787.828 880 788.276 880 788.828Z"/><circle cx="876" cy="786" r="10"/>
        </svg>
      );

    case 'pi-circle':
      return (
        <svg {...commonProps} viewBox="864.0 818.0 24 24">
          <path d="M881 826H873.222C871.995 826 871 826.895 871 828M874.333 826L873.374 832.909C873.291 833.508 872.677 833.93 872.012 833.844C871.562 833.787 871.187 833.505 871.043 833.116L871 833M877.667 834L878.778 826"/><circle cx="876" cy="830" r="10"/>
        </svg>
      );

    case 'alpha-circle':
      return (
        <svg {...commonProps} viewBox="864.0 862.0 24 24">
          <path d="M876 884C881.523 884 886 879.523 886 874C886 868.477 881.523 864 876 864C870.477 864 866 868.477 866 874C866 879.523 870.477 884 876 884Z"/><path d="M880.993 876.111C880.993 876.696 880.822 877.274 880.697 877.532C880.282 878.555 878.913 877.794 878.608 876.694C878.528 876.404 878.369 875.721 878.2 874.975M878.2 874.975C877.993 874.067 877.772 873.066 877.658 872.565C877.148 870.822 875.771 869.954 874.422 870.018C873.227 870.074 871.975 870.844 871.335 872.316C870.978 873.138 870.946 873.95 871.056 874.668C871.204 875.637 871.644 876.446 872.208 876.982C873.275 877.997 874.708 878.196 875.779 877.775C876.626 877.442 877.22 876.777 877.658 876.049C877.866 875.703 878.046 875.342 878.2 874.975ZM878.2 874.975C878.975 873.128 879.105 871.125 879.002 870.018"/>
        </svg>
      );

    case 'infinity-circle':
      return (
        <svg {...commonProps} viewBox="864.0 906.0 24 24">
          <path d="M876 918C876 918 874.357 920.5 872.7 920.5C871.043 920.5 870 919.381 870 918C870 916.619 871.043 915.5 872.7 915.5C874.357 915.5 876 918 876 918ZM876 918C876 918 877.643 920.5 879.3 920.5C880.957 920.5 882 919.381 882 918C882 916.619 880.957 915.5 879.3 915.5C877.643 915.5 876 918 876 918Z"/><circle cx="876" cy="918" r="10"/>
        </svg>
      );

    case 'approximately-equal-circle':
      return (
        <svg {...commonProps} viewBox="864.0 950.0 24 24">
          <path d="M871 959.285C872.667 957.285 874.333 957.871 876 959.333C877.667 960.796 879.333 961.381 881 959.382M871 964.618C872.667 962.619 874.333 963.204 876 964.667C877.667 966.129 879.333 966.715 881 964.715"/><circle cx="876" cy="962" r="10"/>
        </svg>
      );

    case 'congruent-to-circle':
      return (
        <svg {...commonProps} viewBox="864.0 994.0 24 24">
          <path d="M871.5 1006.5H880.5M871.5 1010H880.5M871.5 1003.5C872.4 1001.64 874.5 1001.55 876 1003M880.5 1002.5C879.6 1004.36 877.5 1004.45 876 1003"/><circle cx="876" cy="1006" r="10"/>
        </svg>
      );

    case 'function-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1038.0 24 24">
          <path d="M872.5 1053.5C872.632 1053.98 872.898 1054.5 873.594 1054.5C874.797 1054.5 875.098 1053.5 876 1050C876.902 1046.5 877.203 1045.5 878.406 1045.5C879.102 1045.5 879.368 1046.02 879.5 1046.5M874.542 1048.75H878.406"/><circle cx="876" cy="1050" r="10"/>
        </svg>
      );

    case 'x-variable-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1082.0 24 24">
          <path d="M880 1090.99C876.816 1090.99 875.184 1097.01 872 1097.01"/><path d="M879.541 1097.01C878.732 1097.01 878.288 1097.01 877.947 1096.89C877.753 1096.82 877.577 1096.72 877.427 1096.61C877.162 1096.4 877.017 1096.1 876.726 1095.5L875.276 1092.5C874.985 1091.9 874.84 1091.6 874.575 1091.39C874.425 1091.28 874.249 1091.18 874.055 1091.11C873.714 1090.99 873.27 1090.99 872.461 1090.99"/><path d="M876 1104C881.523 1104 886 1099.52 886 1094C886 1088.48 881.523 1084 876 1084C870.477 1084 866 1088.48 866 1094C866 1099.52 870.477 1104 876 1104Z"/>
        </svg>
      );

    case 'square-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1126.0 24 24">
          <path d="M876 1148C881.523 1148 886 1143.52 886 1138C886 1132.48 881.523 1128 876 1128C870.477 1128 866 1132.48 866 1138C866 1143.52 870.477 1148 876 1148Z"/><path d="M871.293 1137.21C871.957 1137.17 872.501 1137.21 872.761 1137.82C873.061 1138.52 873.901 1140.76 874.081 1141.24C874.288 1141.79 874.621 1142.08 875.625 1142"/><path d="M875.912 1137.21C874.832 1137.15 873.898 1138.86 873.464 1139.62C872.924 1140.46 872.04 1142.02 871.004 1142"/><path d="M881.5 1137H878.5C878.5 1137 880.505 1135.68 880.724 1135.53C880.944 1135.38 881.5 1135.05 881.5 1134.33C881.5 1133.6 880.775 1133 880.007 1133C879.24 1133 878.5 1133.53 878.5 1134.34"/>
        </svg>
      );

    case 'root-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1170.0 24 24">
          <path d="M876 1192C881.523 1192 886 1187.52 886 1182C886 1176.48 881.523 1172 876 1172C870.477 1172 866 1176.48 866 1182C866 1187.52 870.477 1192 876 1192Z"/><path d="M881.52 1178.5H876.558C875.741 1178.5 875.501 1178.54 875.34 1179.36L874.179 1183.97C873.847 1185.3 873.676 1185.49 873.345 1185.52C872.985 1185.4 872.815 1185.09 872.205 1183.84L872.055 1183.5C871.792 1182.96 871.706 1182.73 871.44 1182.66C871.101 1182.57 870.807 1182.8 870.5 1183"/><path d="M876.973 1181.5C877.393 1181.48 877.849 1181.46 878.098 1181.88C878.338 1182.54 878.814 1183.58 879.016 1184.03C879.117 1184.21 879.238 1184.43 879.538 1184.48C879.838 1184.52 880.138 1184.5 880.138 1184.5"/><path d="M880.333 1181.51C879.487 1181.51 879.001 1182.48 878.521 1183.02C878.353 1183.29 877.621 1184.52 876.781 1184.5"/>
        </svg>
      );

    case 'n-th-root-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1214.0 24 24">
          <path d="M876 1236C881.523 1236 886 1231.52 886 1226C886 1220.48 881.523 1216 876 1216C870.477 1216 866 1220.48 866 1226C866 1231.52 870.477 1236 876 1236Z"/><path d="M882.999 1223.99H878C877.996 1223.99 877.992 1223.99 877.991 1223.99L874.502 1231C874.498 1231.01 874.488 1231.01 874.484 1231L872.508 1227.01C872.505 1227.01 872.497 1227.01 872.492 1227.01L871 1228.5M875.002 1224.5V1222.65C875.002 1221.73 874.314 1221 873.485 1221C872.815 1221.01 872.158 1221.58 872.002 1222.46M872.002 1224.49V1222.46M872.002 1222.46V1220.26"/>
        </svg>
      );

    case 'summation-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1258.0 24 24">
          <path d="M879 1272.5C878.998 1273.03 878.983 1273.31 878.85 1273.53C878.524 1274.06 877.874 1274 877.324 1274H874.799C873.692 1274 873.138 1274 873.02 1273.67C872.901 1273.34 873.322 1272.98 874.163 1272.24L875.853 1270.76C876.255 1270.41 876.457 1270.23 876.457 1270C876.457 1269.77 876.255 1269.59 875.853 1269.24L874.163 1267.76C873.322 1267.02 872.901 1266.66 873.02 1266.33C873.138 1266 873.692 1266 874.799 1266H877.324C877.874 1266 878.524 1265.94 878.85 1266.47C878.983 1266.69 878.998 1266.97 879 1267.5"/><circle cx="876" cy="1270" r="10"/>
        </svg>
      );

    case 'more-or-less-circle':
      return (
        <svg {...commonProps} viewBox="864.0 1302.0 24 24">
          <path d="M876 1324C881.523 1324 886 1319.52 886 1314C886 1308.48 881.523 1304 876 1304C870.477 1304 866 1308.48 866 1314C866 1319.52 870.477 1324 876 1324Z"/><path d="M871.5 1314H880.5"/><path d="M880.503 1311.3L873.463 1311.3C872.477 1311.3 871.643 1311.35 871.52 1311.01C871.424 1310.75 871.92 1310.1 872.4 1309.5"/><path d="M871.505 1316.7L878.545 1316.7C879.531 1316.7 880.365 1316.65 880.488 1316.99C880.584 1317.25 880.088 1317.9 879.608 1318.5"/>
        </svg>
      );

    case 'root-1st-brecket':
      return (
        <svg {...commonProps} viewBox="864.0 1346.0 24 24">
          <path d="M882 1354H876.517C875.7 1354 875.46 1354.04 875.299 1354.86L873.954 1360.47C873.622 1361.8 873.451 1361.99 873.12 1362.02C872.76 1361.9 872.59 1361.59 871.98 1360.34L871.635 1359.58C871.372 1359.04 871.286 1358.81 871.02 1358.74C870.62 1358.63 870.307 1358.94 870 1359.14"/><path d="M877.105 1357.43C877.525 1357.42 877.981 1357.4 878.231 1357.82C878.574 1358.51 879.118 1359.93 879.319 1360.38C879.42 1360.55 879.481 1360.7 879.841 1360.82C880.111 1360.85 880.501 1360.86 880.501 1360.86"/><path d="M880.739 1357.42C879.893 1357.42 879.389 1358.37 878.915 1358.96C878.305 1359.87 877.679 1360.88 876.887 1360.85"/><path d="M870 1349C867.589 1350.93 866 1354.24 866 1358C866 1361.76 867.589 1365.07 870 1367"/><path d="M882 1349C884.411 1350.93 886 1354.24 886 1358C886 1361.76 884.411 1365.07 882 1367"/>
        </svg>
      );

    case 'root-2nd-brecket':
      return (
        <svg {...commonProps} viewBox="864.0 1390.0 24 24">
          <path d="M881.725 1392.5C883.115 1392.65 884.05 1393 884.748 1393.79C886 1395.2 886 1397.46 886 1402C886 1406.54 886 1408.8 884.748 1410.21C884.05 1411 883.115 1411.35 881.725 1411.5M870.275 1411.5C868.886 1411.35 867.95 1411 867.252 1410.21C866 1408.8 866 1406.54 866 1402C866 1397.46 866 1395.2 867.252 1393.79C867.95 1393 868.886 1392.65 870.275 1392.5"/><path d="M882 1398H876.517C875.7 1398 875.46 1398.04 875.299 1398.86L873.954 1404.47C873.622 1405.8 873.451 1405.99 873.12 1406.02C872.76 1405.9 872.59 1405.59 871.98 1404.34L871.635 1403.58C871.372 1403.04 871.286 1402.81 871.02 1402.74C870.62 1402.63 870.307 1402.94 870 1403.14"/><path d="M877.105 1401.43C877.525 1401.42 877.981 1401.4 878.231 1401.82C878.574 1402.51 879.118 1403.93 879.319 1404.38C879.42 1404.55 879.481 1404.7 879.841 1404.82C880.111 1404.85 880.501 1404.86 880.501 1404.86"/><path d="M880.739 1401.42C879.893 1401.42 879.389 1402.37 878.915 1402.96C878.305 1403.87 877.679 1404.88 876.887 1404.85"/>
        </svg>
      );

    case 'root-3rd-brecket':
      return (
        <svg {...commonProps} viewBox="864.0 1434.0 24 24">
          <path d="M882 1442H876.517C875.7 1442 875.46 1442.04 875.299 1442.86L873.954 1448.47C873.622 1449.8 873.451 1449.99 873.12 1450.02C872.76 1449.9 872.59 1449.59 871.98 1448.34L871.635 1447.58C871.372 1447.04 871.286 1446.81 871.02 1446.74C870.62 1446.63 870.307 1446.94 870 1447.14"/><path d="M877.105 1445.43C877.525 1445.42 877.981 1445.4 878.231 1445.82C878.574 1446.51 879.118 1447.93 879.319 1448.38C879.42 1448.55 879.481 1448.7 879.841 1448.82C880.111 1448.85 880.501 1448.86 880.501 1448.86"/><path d="M880.739 1445.42C879.893 1445.42 879.389 1446.37 878.915 1446.96C878.305 1447.87 877.679 1448.88 876.887 1448.85"/><path d="M882 1455C883.232 1455 884.231 1453.85 884.231 1452.43C884.231 1450.18 884.131 1448.69 885.673 1446.91C886.109 1446.41 886.109 1445.59 885.673 1445.09C884.131 1443.31 884.231 1441.82 884.231 1439.57C884.231 1438.15 883.232 1437 882 1437"/><path d="M870 1455C868.768 1455 867.769 1453.85 867.769 1452.43C867.769 1450.18 867.869 1448.69 866.327 1446.91C865.891 1446.41 865.891 1445.59 866.327 1445.09C867.835 1443.35 867.769 1441.84 867.769 1439.57C867.769 1438.15 868.768 1437 870 1437"/>
        </svg>
      );

    case 'rhombus':
      return (
        <svg {...commonProps} viewBox="864.0 1478.0 24 24">
          <path d="M872.056 1482.79C873.915 1480.93 874.845 1480 876 1480C877.155 1480 878.085 1480.93 879.944 1482.79L883.211 1486.06C885.07 1487.92 886 1488.84 886 1490C886 1491.16 885.07 1492.08 883.211 1493.94L879.944 1497.21C878.085 1499.07 877.155 1500 876 1500C874.845 1500 873.915 1499.07 872.056 1497.21L868.789 1493.94C866.93 1492.08 866 1491.16 866 1490C866 1488.84 866.93 1487.92 868.789 1486.06L872.056 1482.79Z"/>
        </svg>
      );

    case 'pentagon':
      return (
        <svg {...commonProps} viewBox="864.0 1522.0 24 24">
          <path d="M872.438 1525.93C874.156 1524.64 875.016 1524 876 1524C876.984 1524 877.844 1524.64 879.562 1525.93L883.004 1528.51C884.722 1529.8 885.581 1530.45 885.886 1531.41C886.19 1532.38 885.862 1533.42 885.205 1535.5L883.891 1539.68C883.234 1541.76 882.906 1542.81 882.11 1543.4C881.313 1544 880.251 1544 878.127 1544H873.873C871.749 1544 870.687 1544 869.89 1543.4C869.094 1542.81 868.766 1541.76 868.109 1539.68L866.795 1535.5C866.138 1533.42 865.81 1532.38 866.114 1531.41C866.419 1530.45 867.278 1529.8 868.996 1528.51L872.438 1525.93Z"/>
        </svg>
      );

    case 'hexagon':
      return (
        <svg {...commonProps} viewBox="864.0 1566.0 24 24">
          <path d="M872.882 1569.33C874.404 1568.44 875.165 1568 876 1568C876.835 1568 877.596 1568.44 879.118 1569.33L881.882 1570.94C883.404 1571.83 884.165 1572.27 884.582 1573C885 1573.73 885 1574.62 885 1576.39V1579.61C885 1581.38 885 1582.27 884.582 1583C884.165 1583.73 883.404 1584.17 881.882 1585.06L879.118 1586.67C877.596 1587.56 876.835 1588 876 1588C875.165 1588 874.404 1587.56 872.882 1586.67L870.118 1585.06C868.596 1584.17 867.835 1583.73 867.418 1583C867 1582.27 867 1581.38 867 1579.61V1576.39C867 1574.62 867 1573.73 867.418 1573C867.835 1572.27 868.596 1571.83 870.118 1570.94L872.882 1569.33Z"/>
        </svg>
      );

    case 'octagon':
      return (
        <svg {...commonProps} viewBox="864.0 1610.0 24 24">
          <path d="M877.515 1612C878.741 1612 879.354 1612 879.905 1612.23C880.457 1612.46 880.89 1612.89 881.757 1613.76L884.242 1616.24C885.11 1617.11 885.543 1617.54 885.771 1618.09C886 1618.65 886 1619.26 886 1620.49V1623.51C886 1624.74 886 1625.35 885.771 1625.91C885.543 1626.46 885.11 1626.89 884.242 1627.76L881.757 1630.24C880.89 1631.11 880.457 1631.54 879.905 1631.77C879.354 1632 878.741 1632 877.515 1632H874.485C873.259 1632 872.646 1632 872.094 1631.77C871.543 1631.54 871.11 1631.11 870.242 1630.24L867.757 1627.76C866.89 1626.89 866.457 1626.46 866.228 1625.91C866 1625.35 866 1624.74 866 1623.51V1620.49C866 1619.26 866 1618.65 866.228 1618.09C866.457 1617.54 866.89 1617.11 867.757 1616.24L870.242 1613.76C871.11 1612.89 871.543 1612.46 872.094 1612.23C872.646 1612 873.259 1612 874.485 1612H877.515Z"/>
        </svg>
      );

    case 'parallelogram':
      return (
        <svg {...commonProps} viewBox="864.0 1654.0 24 24">
          <path d="M868.091 1662.54C868.696 1660.36 868.998 1659.27 869.9 1658.64C870.802 1658 872.049 1658 874.542 1658H878.566C882.487 1658 884.447 1658 885.445 1659.15C886.444 1660.31 885.968 1662.02 885.017 1665.46L883.909 1669.46C883.304 1671.64 883.002 1672.73 882.1 1673.36C881.198 1674 879.951 1674 877.458 1674H873.434C869.513 1674 867.553 1674 866.555 1672.85C865.556 1671.69 866.032 1669.98 866.983 1666.54L868.091 1662.54Z"/>
        </svg>
      );

    case 'segment':
      return (
        <svg {...commonProps} viewBox="864.0 1698.0 24 24">
          <path d="M875 1712L873.071 1706.5M873.071 1706.5L871.379 1701.67C871.332 1701.54 871.309 1701.47 871.279 1701.42C871.165 1701.2 870.971 1701.05 870.749 1701.01C870.692 1701 870.628 1701 870.5 1701C870.372 1701 870.308 1701 870.251 1701.01C870.029 1701.05 869.835 1701.2 869.721 1701.42C869.691 1701.47 869.668 1701.54 869.621 1701.67L867.929 1706.5M873.071 1706.5L867.929 1706.5M867.929 1706.5L866 1712"/><path d="M884 1717C884 1718.1 883.105 1719 882 1719C880.895 1719 880 1718.1 880 1717M884 1717C884 1715.9 883.105 1715 882 1715C880.895 1715 880 1715.9 880 1717M884 1717H886M880 1717H872M872 1717C872 1718.1 871.105 1719 870 1719C868.895 1719 868 1718.1 868 1717M872 1717C872 1715.9 871.105 1715 870 1715C868.895 1715 868 1715.9 868 1717M868 1717H866"/><path d="M879 1706.5V1703C879 1702.06 879 1701.59 879.293 1701.29C879.586 1701 880.057 1701 881 1701H882.25C883.769 1701 885 1702.23 885 1703.75C885 1705.27 883.769 1706.5 882.25 1706.5H879ZM879 1706.5H883.25C884.769 1706.5 886 1707.73 886 1709.25C886 1710.77 884.769 1712 883.25 1712H881C880.057 1712 879.586 1712 879.293 1711.71C879 1711.41 879 1710.94 879 1710V1706.5Z"/>
        </svg>
      );

    case 'radius':
      return (
        <svg {...commonProps} viewBox="864.0 1742.0 24 24">
          <path d="M876 1755.5C875.172 1755.5 874.5 1754.83 874.5 1754C874.5 1753.17 875.172 1752.5 876 1752.5C876.828 1752.5 877.5 1753.17 877.5 1754C877.5 1754.83 876.828 1755.5 876 1755.5Z"/><path d="M876 1764C870.477 1764 866 1759.52 866 1754C866 1748.48 870.477 1744 876 1744C881.523 1744 886 1748.48 886 1754C886 1759.52 881.523 1764 876 1764Z"/><path d="M883.001 1754H878M883.001 1754C883.001 1753.44 881 1752 881 1752M883.001 1754C883.001 1754.56 881 1756 881 1756"/>
        </svg>
      );

    case 'diameter':
      return (
        <svg {...commonProps} viewBox="864.0 1786.0 24 24">
          <path d="M877.5 1798H883"/><path d="M874.5 1798H869"/><path d="M876 1799.5C875.172 1799.5 874.5 1798.83 874.5 1798C874.5 1797.17 875.172 1796.5 876 1796.5C876.828 1796.5 877.5 1797.17 877.5 1798C877.5 1798.83 876.828 1799.5 876 1799.5Z"/><path d="M876 1808C870.477 1808 866 1803.52 866 1798C866 1792.48 870.477 1788 876 1788C881.523 1788 886 1792.48 886 1798C886 1803.52 881.523 1808 876 1808Z"/><path d="M871.012 1800C870.492 1799.48 869.002 1798.5 869.002 1798C869.002 1797.5 870.512 1796.5 871.012 1796"/><path d="M881 1796C881.52 1796.52 883.01 1797.5 883.01 1798C883.01 1798.5 881.5 1799.5 881 1800"/>
        </svg>
      );

    case 'aids':
      return (
        <svg {...commonProps} viewBox="48.0 202.0 24 24">
          <path d="M60 204C57.9271 204 54.8825 204.567 54.29 206.892C53.7657 208.949 53.8876 210.42 55.1936 212.167L62.8875 222.458C63.6615 223.494 64.0486 224.011 64.5727 224C65.0969 223.988 65.4599 223.454 66.186 222.386L66.7147 221.608C67.6223 220.272 68.0762 219.605 67.9895 218.883C67.9029 218.161 67.3034 217.615 66.1043 216.523L54.7991 206"/><path d="M60 204C62.0729 204 65.1175 204.567 65.71 206.892C66.2343 208.949 66.1124 210.42 64.8064 212.167L63.4358 214M65.2009 206L60 210.841M60 218.596L57.1125 222.458C56.3385 223.494 55.9514 224.011 55.4273 224C54.9031 223.988 54.5401 223.454 53.814 222.386L53.2853 221.608C52.3777 220.272 51.9238 219.605 52.0105 218.883C52.0971 218.161 52.6966 217.615 53.8957 216.523L56.6062 214"/>
        </svg>
      );

    case 'ampoule':
      return (
        <svg {...commonProps} viewBox="48.0 246.0 24 24">
          <path d="M53.4457 248.999C53.1298 251.879 51.5799 253.069 52.9375 255.605C53.0245 255.768 53.068 255.849 53.0841 255.886C53.2697 256.312 53.1909 256.695 52.8527 257.014C52.8234 257.041 52.774 257.081 52.675 257.16C52.5051 257.296 52.4202 257.364 52.3427 257.433C51.5425 258.144 51.0609 259.146 51.0054 260.215C51 260.319 51 260.428 51 260.645V264.5C51 265.904 51 266.607 51.3371 267.111C51.483 267.33 51.6705 267.517 51.8889 267.663C52.3933 268 53.0955 268 54.5 268C55.9045 268 56.6067 268 57.1111 267.663C57.3295 267.517 57.517 267.33 57.6629 267.111C58 266.607 58 265.904 58 264.5V260.645C58 260.428 58 260.319 57.9946 260.215C57.9391 259.146 57.4574 258.144 56.6573 257.433C56.5798 257.364 56.4949 257.296 56.325 257.16C56.226 257.081 56.1765 257.041 56.1473 257.014C55.8091 256.695 55.7303 256.312 55.9159 255.886C55.932 255.849 55.9755 255.768 56.0625 255.605C57.42 253.069 55.8698 251.879 55.5537 248.999C55.4934 248.45 55.052 248 54.4997 248C53.9474 248 53.5059 248.45 53.4457 248.999Z"/><path d="M58 262H51"/><path d="M64.4457 248.999C64.1298 251.879 62.5799 253.069 63.9375 255.605C64.0245 255.768 64.068 255.849 64.0841 255.886C64.2697 256.312 64.1909 256.695 63.8527 257.014C63.8234 257.041 63.774 257.081 63.675 257.16C63.5051 257.296 63.4202 257.364 63.3427 257.433C62.5425 258.144 62.0609 259.146 62.0054 260.215C62 260.319 62 260.428 62 260.645V264.5C62 265.904 62 266.607 62.3371 267.111C62.483 267.33 62.6705 267.517 62.8889 267.663C63.3933 268 64.0955 268 65.5 268C66.9045 268 67.6067 268 68.1111 267.663C68.3295 267.517 68.517 267.33 68.6629 267.111C69 266.607 69 265.904 69 264.5V260.645C69 260.428 69 260.319 68.9946 260.215C68.9391 259.146 68.4574 258.144 67.6573 257.433C67.5798 257.364 67.4949 257.296 67.325 257.16C67.226 257.081 67.1765 257.041 67.1473 257.014C66.8091 256.695 66.7303 256.312 66.9159 255.886C66.932 255.849 66.9755 255.768 67.0625 255.605C68.42 253.069 66.8698 251.879 66.5537 248.999C66.4934 248.45 66.052 248 65.4997 248C64.9474 248 64.5059 248.45 64.4457 248.999Z"/><path d="M69 262H62"/>
        </svg>
      );

    case 'bandage':
      return (
        <svg {...commonProps} viewBox="48.0 290.0 24 24">
          <path d="M61.9525 294.841C63.1797 293.614 63.7933 293 64.5558 293C65.3183 293 65.9319 293.614 67.1592 294.841C68.3864 296.068 69 296.682 69 297.444C69 298.207 68.3864 298.82 67.1592 300.048M58.0475 309.159C56.8203 310.386 56.2067 311 55.4442 311C54.6817 311 54.0681 310.386 52.8408 309.159C51.6136 307.932 51 307.318 51 306.556C51 305.793 51.6136 305.18 52.8408 303.952"/><path d="M65.2067 302L67.1592 303.952C68.3864 305.18 69 305.793 69 306.556C69 307.318 68.3864 307.932 67.1592 309.159C65.9319 310.386 65.3183 311 64.5558 311C63.7933 311 63.1797 310.386 61.9525 309.159L60 307.207L54.7933 302L52.8408 300.048C51.6136 298.82 51 298.207 51 297.444C51 296.682 51.6136 296.068 52.8408 294.841C54.0681 293.614 54.6817 293 55.4442 293C56.2067 293 56.8203 293.614 58.0475 294.841L60 296.793M54.7933 302L60 296.793M60 296.793L65.2067 302M65.2067 302L60 307.207"/>
        </svg>
      );

    case 'blood':
      return (
        <svg {...commonProps} viewBox="48.0 334.0 24 24">
          <path d="M53.5 349.5C51.2879 348.617 50 346.433 50 344.175C50 341.246 52.317 338.351 53.9433 336.681C54.8265 335.773 56.1735 335.773 57.0567 336.681C57.5487 337.186 57.9648 337.803 58.5 338.5"/><path d="M56 348.926C56 345.37 58.9489 341.855 61.0187 339.826C62.1428 338.725 63.8572 338.725 64.9813 339.826C67.0511 341.855 70 345.37 70 348.926C70 352.413 67.3492 356 63 356C58.6508 356 56 352.413 56 348.926Z"/><path d="M66.5 349.5C66.5 351.709 65 352.5 63.5 352.5"/>
        </svg>
      );

    case 'blood-type':
      return (
        <svg {...commonProps} viewBox="48.0 378.0 24 24">
          <path d="M51.5 391.678C51.5 387.494 55.0808 383.359 57.5941 380.972C58.9591 379.676 61.0409 379.676 62.4059 380.972C64.9192 383.359 68.5 387.494 68.5 391.678C68.5 395.78 65.2812 400 60 400C54.7188 400 51.5 395.78 51.5 391.678Z"/><path d="M57 393C57 393 57.3648 392.262 57.84 391.303M57.84 391.303C58.7194 389.529 59.9768 387 60 387C60.0232 387 61.2806 389.529 62.16 391.303C62.6352 392.262 63 393 63 393M57.84 391.303H62.16"/>
        </svg>
      );

    case 'blood-pressure':
      return (
        <svg {...commonProps} viewBox="48.0 422.0 24 24">
          <path d="M57 435H57.8003C58.4304 435 58.7454 435 58.9985 435.149C59.2517 435.299 59.3926 435.568 59.6743 436.106L61.1905 439L63.2857 433L64.8018 435.894C65.0836 436.432 65.2245 436.701 65.4777 436.851C65.7308 437 66.0458 437 66.6759 437H68"/><path d="M68.5 434C67.732 430.415 64.7237 427.039 62.5241 424.972C61.1443 423.676 59.04 423.676 57.6602 424.972C55.1196 427.359 51.5 431.494 51.5 435.678C51.5 439.78 54.7537 444 60.0921 444C63.4851 444 66.0359 442.296 67.4444 440"/>
        </svg>
      );

    case 'blood-bag':
      return (
        <svg {...commonProps} viewBox="48.0 466.0 24 24">
          <path d="M53 473.372C61 469.243 59.5 476.005 67 473.372"/><path d="M53 475C53 472.191 53 470.787 53.6741 469.778C53.966 469.341 54.341 468.966 54.7777 468.674C55.7866 468 57.1911 468 60 468C62.8089 468 64.2134 468 65.2223 468.674C65.659 468.966 66.034 469.341 66.3259 469.778C67 470.787 67 472.191 67 475V477C67 479.809 67 481.213 66.3259 482.222C66.034 482.659 65.659 483.034 65.2223 483.326C64.2134 484 62.8089 484 60 484C57.1911 484 55.7866 484 54.7777 483.326C54.341 483.034 53.966 482.659 53.6741 482.222C53 481.213 53 479.809 53 477V475Z"/><path d="M60.0142 476L58.5736 477.488C57.8 478.3 57.8133 479.609 58.587 480.408C59.3739 481.207 60.6411 481.193 61.4148 480.394C62.2017 479.581 62.1884 478.273 61.4148 477.474L60.0142 476Z"/><path d="M56 488C58.2091 488 60 486.209 60 484"/>
        </svg>
      );

    case 'blood-bottle':
      return (
        <svg {...commonProps} viewBox="48.0 510.0 24 24">
          <path d="M62 515V512"/><path d="M65 512H57C54.643 512 53.4645 512 52.7322 512.732C52 513.464 52 514.643 52 517V532"/><path d="M56 521.125C56 518.667 56 517.438 56.5778 516.556C56.828 516.173 57.1494 515.845 57.5238 515.59C58.3885 515 59.5924 515 62 515C64.4076 515 65.6115 515 66.4762 515.59C66.8506 515.845 67.172 516.173 67.4222 516.556C68 517.438 68 518.667 68 521.125V522.875C68 525.333 68 526.562 67.4222 527.444C67.172 527.827 66.8506 528.155 66.4762 528.41C65.6115 529 64.4076 529 62 529C59.5924 529 58.3885 529 57.5238 528.41C57.1494 528.155 56.828 527.827 56.5778 527.444C56 526.562 56 525.333 56 522.875V521.125Z"/><path d="M56 520.372C62.8571 516.243 61.5714 523.005 68 520.372"/><path d="M59 532C60.6569 532 62 530.657 62 529"/>
        </svg>
      );

    case 'brain-01':
      return (
        <svg {...commonProps} viewBox="48.0 554.0 24 24">
          <path d="M63.1449 559.208C62.5031 558.468 61.5562 558 60.5 558C59.0033 558 57.7259 558.94 57.2256 560.261C56.8514 560.093 56.4366 560 56 560C54.3431 560 53 561.343 53 563C53 563.017 53.0001 563.033 53.0004 563.05M63.1449 559.208C63.5725 559.073 64.0278 559 64.5 559C66.9853 559 69 561.015 69 563.5C69 564.13 68.8707 564.729 68.6372 565.273M63.1449 559.208C61.7981 559.632 60.7249 560.673 60.2561 562C60.1435 562.318 60.0658 562.653 60.0275 563M57.9998 565.5C57.3927 565.956 57 566.682 57 567.5C57 567.671 57.0172 567.838 57.05 568C57.2816 569.141 58.2905 570 59.5 570C59.7548 570 59.8823 570 59.9998 570.014C60.5855 570.084 61.1107 570.408 61.4348 570.901C61.4999 571 61.5569 571.114 61.6708 571.342L63 574M57.05 568H52.5C51.1193 568 50 566.881 50 565.5C50 564.119 51.1193 563 52.5 563C52.6714 563 52.8387 563.017 53.0004 563.05M66.5 574L65.8778 572.341C65.4531 571.208 66.2904 570 67.5 570C68.8807 570 70 568.881 70 567.5C70 566.529 69.4462 565.687 68.6372 565.273C68.2961 565.098 67.9095 565 67.5 565C66.2905 565 65.2816 565.859 65.05 567M53.0004 563.05C53.0127 563.799 53.2992 564.481 53.7639 565"/>
        </svg>
      );

    case 'brain-02':
      return (
        <svg {...commonProps} viewBox="48.0 598.0 24 24">
          <path d="M52.2222 619.995V616.445C52.2222 615.174 51.8893 614.513 51.2348 613.408C50.4503 612.083 50 610.538 50 608.887C50 603.979 53.9797 600 58.8889 600C63.7981 600 67.7778 603.979 67.7778 608.887C67.7778 609.466 67.7778 609.756 67.802 609.919C67.8598 610.307 68.0411 610.641 68.2194 610.987L70 614.441L68.6006 615.14C68.195 615.343 67.9923 615.444 67.851 615.631C67.7097 615.818 67.67 616.03 67.5904 616.452L67.5826 616.493C67.4004 617.461 67.1993 618.529 66.6329 619.202C66.4329 619.44 66.1853 619.634 65.9059 619.77C65.4447 619.995 64.8777 619.995 63.7437 619.995C63.219 619.995 62.6928 620.007 62.1682 619.994C60.9247 619.964 60 618.918 60 617.704"/><path d="M62.388 608.532C61.9617 608.532 61.5729 608.37 61.2784 608.105M62.388 608.532C62.388 609.677 61.7241 610.766 60.4461 610.766C59.1681 610.766 58.5043 611.854 58.5043 613M62.388 608.532C64.5373 608.532 64.5373 605.18 62.388 605.18C62.1927 605.18 62.0053 605.214 61.8312 605.276C61.9362 602.778 58.3349 602.1 57.5192 604.44M55.9823 610.054C55.6811 610.484 55.1834 610.766 54.6205 610.766C52.613 610.766 52.4023 607.728 54.3732 607.433C53.1988 605.433 55.6674 603.19 57.5192 604.44C58.1133 604.841 58.5043 605.523 58.5043 606.297"/>
        </svg>
      );

    case 'bone-01':
      return (
        <svg {...commonProps} viewBox="48.0 642.0 24 24">
          <path d="M65.3997 647.838C65.8288 647.409 66.3665 647.155 66.9243 647.076M66.9243 647.076C67.7347 646.961 68.5874 647.215 69.2107 647.838C70.2631 648.89 70.2631 650.597 69.2107 651.649C68.3628 652.497 67.0904 652.662 66.0775 652.143C65.6635 651.931 65.1331 651.916 64.8043 652.245L58.2445 658.804C57.9156 659.133 57.9313 659.664 58.1432 660.078C58.6617 661.09 58.497 662.363 57.649 663.211C56.5967 664.263 54.8904 664.263 53.8381 663.211C53.2147 662.587 52.9606 661.735 53.0757 660.924M54.6003 660.162C54.1712 660.591 53.6335 660.845 53.0757 660.924C52.2653 661.039 51.4126 660.785 50.7893 660.162C49.7369 659.11 49.7369 657.403 50.7893 656.351C51.6372 655.503 52.9096 655.338 53.9225 655.857C54.3365 656.069 54.8669 656.084 55.1957 655.755L61.7555 649.196C62.0844 648.867 62.0687 648.336 61.8568 647.922C61.3383 646.91 61.503 645.637 62.351 644.789C63.4033 643.737 65.1096 643.737 66.1619 644.789C66.7853 645.413 67.0394 646.265 66.9243 647.076"/>
        </svg>
      );

    case 'bone-02':
      return (
        <svg {...commonProps} viewBox="48.0 686.0 24 24">
          <path d="M52.7439 708L56.2941 704.45C56.6065 704.137 57.1107 704.153 57.5075 704.348C58.4127 704.791 59.537 704.637 60.2896 703.884C61.2368 702.937 61.2368 701.401 60.2896 700.454C59.7287 699.893 58.9612 699.665 58.2319 699.768C57.7299 699.839 57.2459 700.068 56.8598 700.454M58.2319 699.768C58.2319 699.768 58.2319 699.768 58.2319 699.768ZM58.2319 699.768C58.3354 699.039 58.1067 698.271 57.5457 697.71C56.5986 696.763 55.063 696.763 54.1159 697.71C53.3632 698.463 53.2087 699.587 53.6522 700.493C53.8466 700.889 53.8626 701.394 53.5502 701.706L50 705.256"/><path d="M67.2561 688L63.7059 691.55C63.3935 691.863 62.8893 691.847 62.4925 691.652C61.5873 691.209 60.463 691.363 59.7104 692.116C58.7632 693.063 58.7632 694.599 59.7104 695.546C60.2713 696.107 61.0388 696.335 61.7681 696.232C62.2701 696.161 62.7541 695.932 63.1402 695.546M61.7681 696.232C61.6646 696.961 61.8933 697.729 62.4543 698.29C63.4014 699.237 64.937 699.237 65.8841 698.29C66.6368 697.537 66.7913 696.413 66.3478 695.507C66.1534 695.111 66.1374 694.607 66.4498 694.294L70 690.744"/><path d="M64 704V706M66 702H68"/><path d="M56 692V690M54 694H52"/>
        </svg>
      );

    case 'broken-bone':
      return (
        <svg {...commonProps} viewBox="48.0 730.0 24 24">
          <path d="M54.2827 749.233C54.1191 749.729 53.8134 750.133 53.4309 750.409M53.4309 750.409C52.8751 750.81 52.1571 750.942 51.4769 750.701C50.3284 750.295 49.7227 748.978 50.1238 747.76C50.432 746.825 51.2446 746.22 52.1254 746.174C52.5735 746.151 53.0451 745.941 53.1855 745.515L54.6729 741L56 743L58 742L56.492 746.732C56.3609 747.143 56.5953 747.575 56.9247 747.854C57.6211 748.445 57.9236 749.458 57.6097 750.411C57.2086 751.629 55.9524 752.286 54.8039 751.88C54.1237 751.639 53.6339 751.079 53.4309 750.409Z"/><path d="M66.5436 735.324C66.9979 735.073 67.5019 734.982 67.9822 735.033M67.9822 735.033C68.68 735.107 69.3277 735.48 69.7003 736.097C70.3294 737.139 69.936 738.483 68.8216 739.099C67.9517 739.579 66.8996 739.473 66.1806 738.908C65.8388 738.639 65.3635 738.498 64.9863 738.715L61 741V739L59 737.981L63.1147 735.708C63.512 735.489 63.628 734.978 63.5636 734.529C63.4401 733.668 63.8707 732.774 64.7211 732.305C65.8355 731.689 67.2488 732.035 67.8778 733.078C68.2504 733.695 68.2643 734.418 67.9822 735.033Z"/><path d="M55 738L53 738M57 736L57 734"/><path d="M61 746L61 748M63 744L65 744"/>
        </svg>
      );

    case 'caduceus':
      return (
        <svg {...commonProps} viewBox="48.0 774.0 24 24">
          <path d="M61.5 777.5C61.5 778.328 60.8284 779 60 779C59.1716 779 58.5 778.328 58.5 777.5C58.5 776.672 59.1716 776 60 776C60.8284 776 61.5 776.672 61.5 777.5Z"/><path d="M64 791.5C64 790.672 62.2091 790 60 790C57.7909 790 56 790.672 56 791.5C56 792.328 57.7909 793 60 793C61.6569 793 63 793.672 63 794.5C63 795.328 61.6569 796 60 796C58.7151 796 57.6189 795.596 57.1915 795.028"/><path d="M60 779V790"/><path d="M54.7961 785.949C52.7806 787.654 50.8339 784.742 50 782.726C50.8829 782.726 52.7205 782.172 54.429 780.227C55.175 779.377 55.548 778.952 55.7582 779.004C55.9685 779.056 56.2571 779.692 56.8344 780.963C57.7269 782.929 59.0673 783.962 60 784.338C57.6 788.205 55.5307 787.023 54.7961 785.949ZM54.7961 785.949C55.0911 785.699 55.3876 785.351 55.6823 784.886"/><path d="M65.2039 785.949C67.2194 787.654 69.1661 784.742 70 782.726C69.1171 782.726 67.2795 782.172 65.571 780.227C64.825 779.377 64.452 778.952 64.2418 779.004C64.0315 779.056 63.7429 779.692 63.1656 780.963C62.2731 782.929 60.9327 783.962 60 784.338C62.4 788.205 64.4693 787.023 65.2039 785.949ZM65.2039 785.949C64.9089 785.699 64.6124 785.351 64.3177 784.886"/>
        </svg>
      );

    case 'cardiogram-01':
      return (
        <svg {...commonProps} viewBox="48.0 818.0 24 24">
          <path d="M59 839.5C55.2503 839.5 53.3754 839.5 52.0611 838.492C51.6366 838.167 51.2633 837.772 50.9549 837.324C50 835.937 50 833.958 50 830C50 826.042 50 824.063 50.9549 822.676C51.2633 822.228 51.6366 821.833 52.0611 821.508C53.3754 820.5 55.2503 820.5 59 820.5L61 820.5C64.7497 820.5 66.6246 820.5 67.9389 821.508C68.3634 821.833 68.7367 822.228 69.0451 822.676C70 824.063 70 826.042 70 830C70 833.958 70 835.937 69.0451 837.324C68.7367 837.772 68.3634 838.167 67.9389 838.492C66.6246 839.5 64.7497 839.5 61 839.5H59Z"/><path d="M50.5 833H69.5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M55.009 836H55H55.009Z" fill={color}/><path fill-rule="evenodd" clip-rule="evenodd" d="M59 836H58.991H59Z" fill={color}/><path d="M55.009 836H55M59 836H58.991"/><path d="M65 828.2C64.5447 828.2 64.0655 828.228 63.6569 827.977C63.5011 827.881 63.3977 827.749 63.191 827.484L61.25 825L58.75 829L56.9434 827.266C56.6872 827.02 56.4375 826.77 56.0985 826.672C55.8519 826.6 55.5679 826.6 55 826.6"/>
        </svg>
      );

    case 'cardiogram-02':
      return (
        <svg {...commonProps} viewBox="48.0 862.0 24 24">
          <path d="M67.4626 865.994C64.7809 864.349 62.4404 865.011 61.0344 866.067C60.4578 866.5 60.1696 866.717 60 866.717C59.8304 866.717 59.5422 866.5 58.9656 866.067C57.5596 865.011 55.2191 864.349 52.5374 865.994C49.0181 868.152 48.2217 875.274 56.3395 881.283C57.8857 882.427 58.6588 882.999 60 882.999C61.3412 882.999 62.1143 882.427 63.6605 881.283C71.7783 875.274 70.9819 868.152 67.4626 865.994Z"/><path d="M64 875H63C62.5447 875 62.0655 875.035 61.6569 874.721C61.5011 874.602 61.3977 874.436 61.191 874.106L59.5 871L56.5 876L54.9434 873.832C54.6872 873.525 54.4375 873.213 54.0985 873.09C53.8519 873 53.5679 873 53 873H51"/>
        </svg>
      );

    case 'covid-info':
      return (
        <svg {...commonProps} viewBox="48.0 906.0 24 24">
          <circle cx="60" cy="918" r="10"/><path d="M62.5269 921.082C66.5281 918.014 65.8948 914.613 64.0422 913.519C62.5897 912.66 61.3219 913.006 60.5603 913.557C60.248 913.783 60.0919 913.896 60 913.896C59.9081 913.896 59.752 913.783 59.4397 913.557C58.6781 913.006 57.4103 912.66 55.9578 913.519C54.1119 914.609 53.649 918.114 57.6132 921.181C58.37 921.767 59.1711 922.294 60 922.771C61.7788 923.797 64.4168 925 67 925M53 925C54.5487 925 56.1172 924.567 57.5084 924"/>
        </svg>
      );

    case 'patient':
      return (
        <svg {...commonProps} viewBox="48.0 950.0 24 24">
          <path d="M68 972V969C68 966.172 68 964.757 67.1213 963.879C66.2426 963 64.8284 963 62 963H58C55.1716 963 53.7574 963 52.8787 963.879C52 964.757 52 966.172 52 969C52 969.932 52 970.398 52.1522 970.765C52.3552 971.255 52.7446 971.645 53.2346 971.848C53.6022 972 54.0681 972 55 972"/><path d="M57.5 963L60.5 972M55 963.5V972"/><path d="M60 969H62.5C63.3284 969 64 969.672 64 970.5C64 971.328 63.3284 972 62.5 972H60.5"/><path d="M63.5 956.5V955.5C63.5 953.567 61.933 952 60 952C58.067 952 56.5 953.567 56.5 955.5V956.5C56.5 958.433 58.067 960 60 960C61.933 960 63.5 958.433 63.5 956.5Z"/>
        </svg>
      );

    case 'pulse-01':
      return (
        <svg {...commonProps} viewBox="48.0 994.0 24 24">
          <path d="M50 1006H54L55.5 1002L57.5 1009L61 1000L63.5 1012L66 1006H70"/>
        </svg>
      );

    case 'pulse-02':
      return (
        <svg {...commonProps} viewBox="48.0 1038.0 24 24">
          <path d="M50 1050H53L54.5 1046L57 1053L58.5 1050H60.5L62.5 1045L64.5 1055L67 1050H70"/>
        </svg>
      );

    case 'pulse-rectangle-01':
      return (
        <svg {...commonProps} viewBox="48.0 1082.0 24 24">
          <path d="M52.318 1101.68C51 1100.36 51 1098.24 51 1094C51 1089.76 51 1087.64 52.318 1086.32C53.636 1085 55.7574 1085 60 1085C64.2426 1085 66.364 1085 67.682 1086.32C69 1087.64 69 1089.76 69 1094C69 1098.24 69 1100.36 67.682 1101.68C66.364 1103 64.2426 1103 60 1103C55.7574 1103 53.636 1103 52.318 1101.68Z"/><path d="M53.5 1094H55.5L57 1091.5L58.5 1096L60.5 1090L62.5 1098L64.5 1094H66.5"/>
        </svg>
      );

    case 'pulse-rectangle-02':
      return (
        <svg {...commonProps} viewBox="48.0 1126.0 24 24">
          <path d="M52.318 1145.68C51 1144.36 51 1142.24 51 1138C51 1133.76 51 1131.64 52.318 1130.32C53.636 1129 55.7574 1129 60 1129C64.2426 1129 66.364 1129 67.682 1130.32C69 1131.64 69 1133.76 69 1138C69 1142.24 69 1144.36 67.682 1145.68C66.364 1147 64.2426 1147 60 1147C55.7574 1147 53.636 1147 52.318 1145.68Z"/><path d="M54 1139H55.5L57 1135L58.5 1142L60 1139H61.5L63 1134L64.5 1139H66"/>
        </svg>
      );

    case 'clinic':
      return (
        <svg {...commonProps} viewBox="318.0 202.0 24 24">
          <path d="M316.351 215.213C315.998 212.916 315.822 211.768 316.256 210.749C316.69 209.731 317.654 209.034 319.581 207.641L321.021 206.6C323.418 204.867 324.617 204 326 204C327.383 204 328.582 204.867 330.979 206.6L332.419 207.641C334.346 209.034 335.31 209.731 335.744 210.749C336.178 211.768 336.002 212.916 335.649 215.213L335.348 217.172C334.847 220.429 334.597 222.057 333.429 223.029C332.261 224 330.554 224 327.139 224H324.861C321.446 224 319.739 224 318.571 223.029C317.403 222.057 317.153 220.429 316.652 217.172L316.351 215.213Z"/><path d="M326 212V218M323 215L329 215"/>
        </svg>
      );

    case 'dental-tooth':
      return (
        <svg {...commonProps} viewBox="318.0 246.0 24 24">
          <path d="M323 252C323.5 252.5 324.503 252.412 326 251.176M326 251.176C325.779 250.994 325.549 250.786 325.311 250.55C323.005 248.266 319.865 248.713 318.394 250.55C317.378 251.819 314.778 254.979 321.142 266.24C321.406 266.706 321.931 267 322.496 267C323.398 267 324.103 266.28 324.132 265.44C324.194 263.658 324.54 261.603 326 261.603C327.46 261.603 327.806 263.658 327.868 265.44C327.897 266.28 328.602 267 329.504 267C330.069 267 330.594 266.706 330.858 266.24C337.222 254.979 334.622 251.819 333.606 250.55C332.135 248.713 328.995 248.266 326.689 250.55C326.451 250.786 326.221 250.994 326 251.176Z"/>
        </svg>
      );

    case 'dental-braces':
      return (
        <svg {...commonProps} viewBox="318.0 290.0 24 24">
          <path d="M323 296C323.5 296.5 324.503 296.412 326 295.176M326 295.176C325.779 294.994 325.549 294.786 325.311 294.55C323.005 292.266 319.865 292.713 318.394 294.55C317.378 295.819 314.778 298.979 321.142 310.24C321.406 310.706 321.931 311 322.496 311C323.398 311 324.103 310.28 324.132 309.44C324.194 307.658 324.54 305.603 326 305.603C327.46 305.603 327.806 307.658 327.868 309.44C327.897 310.28 328.602 311 329.504 311C330.069 311 330.594 310.706 330.858 310.24C337.222 298.979 334.622 295.819 333.606 294.55C332.135 292.713 328.995 292.266 326.689 294.55C326.451 294.786 326.221 294.994 326 295.176Z"/><path d="M324.387 299.387C323.871 299.903 323.871 302.097 324.387 302.613C324.903 303.129 327.097 303.129 327.613 302.613C328.129 302.097 328.129 299.903 327.613 299.387C327.097 298.871 324.903 298.871 324.387 299.387Z"/><path d="M324 301H318"/><path d="M334 301H328"/>
        </svg>
      );

    case 'dental-care':
      return (
        <svg {...commonProps} viewBox="318.0 334.0 24 24">
          <path d="M328 339C327.5 339.5 326.497 339.412 325 338.176M325 338.176C325.221 337.994 325.451 337.786 325.689 337.55C327.995 335.266 331.135 335.713 332.606 337.55C333.232 338.332 334.459 339.831 333.821 343.5M325 338.176C324.779 337.994 324.549 337.786 324.311 337.55C322.005 335.266 318.865 335.713 317.394 337.55C316.378 338.819 313.778 341.979 320.142 353.24C320.406 353.706 320.931 354 321.496 354C322.398 354 323.103 353.28 323.132 352.44C323.178 351.136 323.43 349.685 324.133 349"/><path d="M330 351L330.684 351.684C330.831 351.831 330.905 351.905 330.994 351.9C331.084 351.895 331.149 351.814 331.279 351.651L333 349.5M327 349.454V349.84C327 351.042 327 351.643 327.148 352.193C327.332 352.872 327.679 353.499 328.162 354.02C328.552 354.442 329.068 354.77 330.099 355.427C330.56 355.721 330.791 355.868 331.037 355.937C331.339 356.021 331.661 356.021 331.963 355.937C332.209 355.868 332.44 355.721 332.901 355.427C333.932 354.77 334.448 354.442 334.838 354.02C335.321 353.499 335.668 352.872 335.852 352.193C336 351.643 336 351.042 336 349.84V349.454C336 348.706 336 348.332 335.858 348.016C335.771 347.821 335.645 347.644 335.489 347.496C335.236 347.255 334.877 347.124 334.159 346.861L332.685 346.322C332.099 346.107 331.806 346 331.5 346C331.194 346 330.901 346.107 330.315 346.322L328.841 346.861C328.123 347.124 327.764 347.255 327.511 347.496C327.355 347.644 327.229 347.821 327.142 348.016C327 348.332 327 348.706 327 349.454Z"/>
        </svg>
      );

    case 'dental-broken-tooth':
      return (
        <svg {...commonProps} viewBox="318.0 378.0 24 24">
          <path d="M325.977 383.176C326.197 382.994 326.427 382.786 326.664 382.55C328.964 380.266 332.095 380.713 333.563 382.55C337.168 387.064 333.131 394.144 330.822 398.24C330.559 398.706 330.035 399 329.472 399C328.572 399 327.869 398.28 327.839 397.44C327.779 395.701 327.375 393.595 326 393.5C324.625 393.595 324.174 395.701 324.114 397.44C324.085 398.28 323.381 399 322.482 399C321.918 399 321.394 398.706 321.131 398.24C317.844 392.408 316.954 388.749 317.002 386.4C319 386.5 319.992 385.5 319.992 383.7C322 384 323 382.829 323 381C324 381 324.574 381.84 325.289 382.55C325.526 382.786 325.756 382.994 325.977 383.176ZM325.977 383.176C327.469 384.412 328.5 384.5 329 384"/>
        </svg>
      );

    case 'digestion':
      return (
        <svg {...commonProps} viewBox="318.0 422.0 24 24">
          <path d="M323.485 424C323.728 425.49 324.441 426.574 326.475 425.872C330.677 424.421 333.999 428.849 333.999 432.8C333.999 436.776 331.353 440 328.089 440H327.025C324.492 440 322.276 441.632 321.453 444"/><path d="M320.006 424V424.776C320.006 428.578 325.428 431.387 323.637 435.2C322.926 436.715 318.895 439.293 318 444"/><path d="M328 429C328.958 429.297 329.711 430.049 330 431"/>
        </svg>
      );

    case 'dna':
      return (
        <svg {...commonProps} viewBox="318.0 466.0 24 24">
          <path d="M322.667 488C323.201 487.466 323.735 486.932 323.241 484M322.667 481.334C321.334 476 322.334 475 322.667 474.667C323 474.334 324 473.334 329.334 474.667M322.667 481.334C317.334 480 316.667 480.666 316 481.333M322.667 481.334C328 482.667 329 481.666 329.333 481.333C329.666 481 330.667 480 329.334 474.667M336 474.667C335.333 475.334 334.667 476 329.334 474.667M329.333 468C328.799 468.534 328.265 469.068 328.759 472"/>
        </svg>
      );

    case 'disability-01':
      return (
        <svg {...commonProps} viewBox="318.0 510.0 24 24">
          <path d="M333.5 528H332.177C331.849 528 331.685 528 331.558 527.914C331.431 527.828 331.37 527.676 331.249 527.371L330.751 526.129C330.63 525.824 330.569 525.672 330.442 525.586C330.315 525.5 330.151 525.5 329.823 525.5H327.5C327.029 525.5 326.793 525.5 326.646 525.354C326.5 525.207 326.5 524.971 326.5 524.5V520.5M326.5 518V520.5M326.5 520.5H330.389"/><path d="M326.5 516C325.395 516 324.5 515.105 324.5 514C324.5 512.895 325.395 512 326.5 512C327.605 512 328.5 512.895 328.5 514C328.5 515.105 327.605 516 326.5 516Z"/><path d="M323.558 520C320.687 520.479 318.5 522.965 318.5 525.958C318.5 529.295 321.217 532 324.57 532C326.6 532 328.398 531.007 329.5 529.483"/>
        </svg>
      );

    case 'disability-02':
      return (
        <svg {...commonProps} viewBox="318.0 554.0 24 24">
          <path d="M325.5 564L323.5 563L321 566"/><path d="M328 560C326.895 560 326 559.105 326 558C326 556.895 326.895 556 328 556C329.105 556 330 556.895 330 558C330 559.105 329.105 560 328 560Z"/><path d="M329.5 573.483C328.398 575.007 326.6 576 324.57 576C321.217 576 318.5 573.295 318.5 569.958C318.5 569.083 318.664 568.251 319 567.5"/><path d="M326.649 562L325.896 563.846C325.13 565.725 324.747 566.664 325.183 567.332C325.619 568 326.615 568 328.607 568C329.301 568 329.971 567.819 330.358 568.496L333.5 574"/>
        </svg>
      );

    case 'dropper':
      return (
        <svg {...commonProps} viewBox="318.0 598.0 24 24">
          <path d="M325.287 606L318.682 612.605C318.053 613.234 317.728 614.052 317.707 614.876C317.678 615.986 317.664 616.541 317.58 616.737C317.496 616.933 317.304 617.125 316.919 617.51L316.325 618.104C315.892 618.538 315.892 619.241 316.325 619.675C316.759 620.108 317.462 620.108 317.896 619.675L318.49 619.081C318.875 618.696 319.067 618.504 319.263 618.42C319.459 618.336 320.014 618.322 321.124 618.293C321.948 618.272 322.766 617.947 323.395 617.318L325.323 615.39M325.323 615.39L328.429 612.284L330 610.713M328.429 612.284L326.858 610.713M325.323 615.39L323.752 613.819"/><path d="M335.068 605.432L333.5 607C332.672 607.828 332.672 609.172 333.5 610L326 602.5C326.828 603.328 328.172 603.328 329 602.5L330.568 600.932C331.811 599.689 333.825 599.689 335.068 600.932C336.311 602.175 336.311 604.189 335.068 605.432Z"/>
        </svg>
      );

    case 'ear':
      return (
        <svg {...commonProps} viewBox="318.0 642.0 24 24">
          <path d="M320.077 660C320.077 662.209 321.226 664 323.308 664C325.389 664 327.077 662.5 327.615 660C327.874 658.801 328.403 658.077 329.231 657.5C331.385 656 333 653.692 333 651C333 647.134 329.866 644 326 644C322.134 644 319 647.134 319 651"/><path d="M323 657C324.385 657 325.508 655.993 325.508 654.75C325.508 653.507 324.385 652.5 323 652.5C323 650.483 323.464 648 326.009 648C327.8 648 328.85 649.374 329 651.15"/>
        </svg>
      );

    case 'eye':
      return (
        <svg {...commonProps} viewBox="318.0 686.0 24 24">
          <path d="M316 694C316 694 320.477 689 326 689C331.523 689 336 694 336 694"/><path d="M335.544 699.045C335.848 699.471 336 699.684 336 700C336 700.316 335.848 700.529 335.544 700.955C334.178 702.871 330.689 707 326 707C321.311 707 317.822 702.871 316.456 700.955C316.152 700.529 316 700.316 316 700C316 699.684 316.152 699.471 316.456 699.045C317.822 697.129 321.311 693 326 693C330.689 693 334.178 697.129 335.544 699.045Z"/><path d="M329 700C329 698.343 327.657 697 326 697C324.343 697 323 698.343 323 700C323 701.657 324.343 703 326 703C327.657 703 329 701.657 329 700Z"/>
        </svg>
      );

    case 'first-aid-kit':
      return (
        <svg {...commonProps} viewBox="318.0 730.0 24 24">
          <path d="M316 742.562C316 739.469 316 737.922 317.025 736.961C318.05 736 319.7 736 323 736H329C332.3 736 333.95 736 334.975 736.961C336 737.922 336 739.469 336 742.562V744.438C336 747.531 336 749.078 334.975 750.039C333.95 751 332.3 751 329 751H323C319.7 751 318.05 751 317.025 750.039C316 749.078 316 747.531 316 744.438V742.562Z"/><path d="M323 743.5H329M326 740.5L326 746.5"/><path d="M331 736C331 733.518 330.482 733 328 733H324C321.518 733 321 733.518 321 736"/>
        </svg>
      );

    case 'give-pill':
      return (
        <svg {...commonProps} viewBox="318.0 774.0 24 24">
          <path d="M325 781H331M325 779V783C325 784.657 326.343 786 328 786C329.657 786 331 784.657 331 783V779C331 777.343 329.657 776 328 776C326.343 776 325 777.343 325 779Z"/><path d="M318 788H320.395C320.689 788 320.979 788.066 321.242 788.194L323.284 789.182C323.547 789.309 323.837 789.375 324.131 789.375H325.174C326.183 789.375 327 790.166 327 791.142C327 791.181 326.973 791.216 326.934 791.227L324.393 791.929C323.937 792.055 323.449 792.012 323.025 791.806L320.842 790.75"/><path d="M327 790.5L331.593 789.089C332.407 788.835 333.287 789.136 333.797 789.842C334.166 790.353 334.016 791.084 333.478 791.394L325.963 795.731C325.485 796.006 324.921 796.074 324.395 795.918L318 794.02"/>
        </svg>
      );

    case 'give-blood':
      return (
        <svg {...commonProps} viewBox="318.0 818.0 24 24">
          <path d="M323 825.547C323 823.56 324.685 821.596 325.868 820.462C326.51 819.846 327.49 819.846 328.132 820.462C329.315 821.596 331 823.56 331 825.547C331 827.496 329.485 829.5 327 829.5C324.515 829.5 323 827.496 323 825.547Z"/><path d="M318 832H320.395C320.689 832 320.979 832.066 321.242 832.194L323.284 833.182C323.547 833.309 323.837 833.375 324.131 833.375H325.174C326.183 833.375 327 834.166 327 835.142C327 835.181 326.973 835.216 326.934 835.227L324.393 835.929C323.937 836.055 323.449 836.012 323.025 835.806L320.842 834.75"/><path d="M327 834.5L331.593 833.089C332.407 832.835 333.287 833.136 333.797 833.842C334.166 834.353 334.016 835.084 333.478 835.394L325.963 839.731C325.485 840.006 324.921 840.074 324.395 839.918L318 838.02"/>
        </svg>
      );

    case 'hand-sanitizer':
      return (
        <svg {...commonProps} viewBox="318.0 862.0 24 24">
          <path d="M329.656 878.162L329.312 875.942C329.209 875.28 329.158 874.949 329.079 874.666C328.532 872.708 326.844 871.272 324.808 871.034C324.513 871 324.176 871 323.5 871C322.824 871 322.487 871 322.192 871.034C320.156 871.272 318.468 872.708 317.921 874.666C317.842 874.949 317.791 875.28 317.688 875.942L317.344 878.162C317.003 880.355 316.833 881.451 317.229 882.281C317.461 882.768 317.821 883.185 318.272 883.486C319.039 884 320.159 884 322.397 884H324.603C326.841 884 327.961 884 328.728 883.486C329.179 883.185 329.539 882.768 329.771 882.281C330.167 881.451 329.997 880.355 329.656 878.162Z"/><path d="M323.5 875.5V879.5M325.5 877.5L321.5 877.5"/><path d="M326.5 871.5V871C326.5 869.586 326.5 868.879 326.061 868.439C325.621 868 324.914 868 323.5 868C322.086 868 321.379 868 320.939 868.439C320.5 868.879 320.5 869.586 320.5 871V871.5"/><path d="M325 868V865.5C325 864.672 324.328 864 323.5 864C322.672 864 322 864.672 322 865.5V868"/><path d="M325 866.219L327.717 865.495C329.229 865.093 329.985 864.891 330.686 865.06C331.387 865.228 331.833 865.718 332.726 866.698L333 867"/><path d="M335 872.5C335 873.605 334.25 874 333.5 874C332.75 874 332 873.605 332 872.5C332 871.395 333.5 870 333.5 870C333.5 870 335 871.395 335 872.5Z"/>
        </svg>
      );

    case 'health':
      return (
        <svg {...commonProps} viewBox="318.0 906.0 24 24">
          <path d="M333.463 909.994C330.781 908.349 328.44 909.011 327.034 910.067C326.458 910.5 326.17 910.717 326 910.717C325.83 910.717 325.542 910.5 324.966 910.067C323.56 909.011 321.219 908.349 318.537 909.994C315.018 912.152 314.222 919.274 322.34 925.283C323.886 926.427 324.659 926.999 326 926.999C327.341 926.999 328.114 926.427 329.66 925.283C337.778 919.274 336.982 912.152 333.463 909.994Z"/><path d="M326 915V921M323 918L329 918"/>
        </svg>
      );

    case 'doctor-01':
      return (
        <svg {...commonProps} viewBox="318.0 950.0 24 24">
          <path d="M334 972V969C334 966.172 334 964.757 333.121 963.879C332.243 963 330.828 963 328 963L326 965L324 963C321.172 963 319.757 963 318.879 963.879C318 964.757 318 966.172 318 969V972"/><path d="M330 963V968.5"/><path d="M322.5 963V967M322.5 967C323.605 967 324.5 967.895 324.5 969V970M322.5 967C321.395 967 320.5 967.895 320.5 969V970"/><path d="M329.5 956.5V955.5C329.5 953.567 327.933 952 326 952C324.067 952 322.5 953.567 322.5 955.5V956.5C322.5 958.433 324.067 960 326 960C327.933 960 329.5 958.433 329.5 956.5Z"/><path d="M330.75 969.25C330.75 969.664 330.414 970 330 970C329.586 970 329.25 969.664 329.25 969.25C329.25 968.836 329.586 968.5 330 968.5C330.414 968.5 330.75 968.836 330.75 969.25Z"/>
        </svg>
      );

    case 'doctor-02':
      return (
        <svg {...commonProps} viewBox="318.0 994.0 24 24">
          <path d="M318 1016V1015C318 1013.13 318 1012.2 318.402 1011.5C318.665 1011.04 319.044 1010.67 319.5 1010.4C320.196 1010 321.131 1010 323 1010L326 1014L329 1010C330.869 1010 331.804 1010 332.5 1010.4C332.956 1010.67 333.335 1011.04 333.598 1011.5C334 1012.2 334 1013.13 334 1015V1016"/><path d="M329.937 1002L330.955 997.864C331.188 996.917 330.483 996 329.523 996H322.477C321.517 996 320.812 996.917 321.045 997.864L322.063 1002M329.937 1002V1004C329.937 1006.21 328.175 1008 326 1008C323.825 1008 322.063 1006.21 322.063 1004V1002M329.937 1002H322.063"/><path d="M326 998V1000M327 999L325 999"/>
        </svg>
      );

    case 'doctor-03':
      return (
        <svg {...commonProps} viewBox="318.0 1038.0 24 24">
          <path d="M334 1060V1057C334 1054.17 334 1052.76 333.121 1051.88C332.243 1051 330.828 1051 328 1051L326 1053L324 1051C321.172 1051 319.757 1051 318.879 1051.88C318 1052.76 318 1054.17 318 1057V1060"/><path d="M329.5 1044.5V1043.5C329.5 1041.57 327.933 1040 326 1040C324.067 1040 322.5 1041.57 322.5 1043.5V1044.5C322.5 1046.43 324.067 1048 326 1048C327.933 1048 329.5 1046.43 329.5 1044.5Z"/><path d="M330 1054V1057M331.5 1055.5L328.5 1055.5"/>
        </svg>
      );

    case 'stethoscope-02':
      return (
        <svg {...commonProps} viewBox="318.0 1082.0 24 24">
          <path d="M320.5 1085.5H318.5C317.948 1085.5 317.5 1085.95 317.5 1086.5V1090C317.5 1093.04 319.962 1095.5 323 1095.5C326.038 1095.5 328.5 1093.04 328.5 1090V1086.5C328.5 1085.95 328.052 1085.5 327.5 1085.5H325.5"/><path d="M332.5 1097.5V1098.75C332.5 1101.37 330.373 1103.5 327.75 1103.5C325.127 1103.5 323 1101.37 323 1098.75V1095.5"/><path d="M325.5 1084.5V1086.5"/><path d="M320.5 1084.5V1086.5"/><path d="M334.5 1095.5C334.5 1096.6 333.605 1097.5 332.5 1097.5C331.395 1097.5 330.5 1096.6 330.5 1095.5C330.5 1094.4 331.395 1093.5 332.5 1093.5C333.605 1093.5 334.5 1094.4 334.5 1095.5Z"/>
        </svg>
      );

    case 'thread':
      return (
        <svg {...commonProps} viewBox="318.0 1126.0 24 24">
          <path d="M318.5 1133.5H330.5C332.386 1133.5 333.328 1133.5 333.914 1134.09C334.5 1134.67 334.5 1135.61 334.5 1137.5V1138.5M330.5 1136.5H318.5M330.5 1139.5H318.5M330.5 1142.5H318.5"/><path d="M329.5 1145.5H319.5C318.395 1145.5 317.5 1146.4 317.5 1147.5H331.5C331.5 1146.4 330.605 1145.5 329.5 1145.5Z"/><path d="M319.5 1130.5L329.5 1130.5C330.605 1130.5 331.5 1129.6 331.5 1128.5L317.5 1128.5C317.5 1129.6 318.395 1130.5 319.5 1130.5Z"/>
        </svg>
      );

    case 'healthcare':
      return (
        <svg {...commonProps} viewBox="617.0 202.0 24 24">
          <path d="M625.396 204.552C626.87 203.638 628.158 204.006 628.931 204.593C629.248 204.834 629.407 204.954 629.5 204.954C629.593 204.954 629.752 204.834 630.069 204.593C630.842 204.006 632.13 203.638 633.604 204.552C635.54 205.751 635.978 209.708 631.513 213.046C630.663 213.682 630.238 214 629.5 214C628.762 214 628.337 213.682 627.487 213.046C623.022 209.708 623.46 205.751 625.396 204.552Z"/><path d="M621 216H623.395C623.689 216 623.979 216.066 624.242 216.194L626.284 217.182C626.547 217.309 626.837 217.375 627.131 217.375H628.174C629.183 217.375 630 218.166 630 219.142C630 219.181 629.973 219.216 629.934 219.227L627.393 219.929C626.937 220.055 626.449 220.012 626.025 219.806L623.842 218.75"/><path d="M630 218.5L634.593 217.089C635.407 216.835 636.287 217.136 636.797 217.842C637.166 218.353 637.016 219.084 636.478 219.394L628.963 223.731C628.485 224.006 627.921 224.074 627.395 223.918L621 222.02"/>
        </svg>
      );

    case 'hospital-01':
      return (
        <svg {...commonProps} viewBox="617.0 246.0 24 24">
          <path d="M631 248V250M631 250V252M631 250H627M627 248V250M627 250V252"/><path d="M620 268V257.381C620 253.877 620 252.125 621.153 251.036C621.886 250.344 622.903 250.092 624.5 250M638 268V257.381C638 253.877 638 252.125 636.847 251.036C636.114 250.344 635.097 250.092 633.5 250"/><path d="M631 256H633"/><path d="M631 260H633"/><path d="M624 260H626"/><path d="M624 256H626"/><path d="M619 268H626.5M639 268H631.5"/><path d="M626.5 268V265.5C626.5 264.565 626.5 264.098 626.701 263.75C626.833 263.522 627.022 263.333 627.25 263.201C627.598 263 628.065 263 629 263C629.935 263 630.402 263 630.75 263.201C630.978 263.333 631.167 263.522 631.299 263.75C631.5 264.098 631.5 264.565 631.5 265.5V268"/>
        </svg>
      );

    case 'hospital-02':
      return (
        <svg {...commonProps} viewBox="617.0 290.0 24 24">
          <path d="M629 294.5V296M629 296V297.5M629 296H630.5M629 296H627.5"/><path d="M625.586 292.586C625 293.172 625 294.114 625 296C625 297.886 625 298.828 625.586 299.414C626.172 300 627.114 300 629 300C630.886 300 631.828 300 632.414 299.414C633 298.828 633 297.886 633 296C633 294.114 633 293.172 632.414 292.586C631.828 292 630.886 292 629 292C627.114 292 626.172 292 625.586 292.586Z"/><path d="M621 312V301.971C621 298.661 621 297.006 622.025 295.978C622.677 295.325 623.581 295.087 625 295M637 312V301.971C637 298.661 637 297.006 635.975 295.978C635.323 295.325 634.419 295.087 633 295"/><path d="M620 312H638"/><path d="M626.5 312V309.5C626.5 308.565 626.5 308.098 626.701 307.75C626.833 307.522 627.022 307.333 627.25 307.201C627.598 307 628.065 307 629 307C629.935 307 630.402 307 630.75 307.201C630.978 307.333 631.167 307.522 631.299 307.75C631.5 308.098 631.5 308.565 631.5 309.5V312"/><path d="M625.009 303H625M629 303H628.991M633.001 303H632.992"/>
        </svg>
      );

    case 'hospital-bed-01':
      return (
        <svg {...commonProps} viewBox="617.0 334.0 24 24">
          <path d="M636.59 340H621.41C621.177 340 621.06 340 620.951 340.017C620.449 340.093 619.988 340.427 619.662 340.95C619.591 341.064 619.527 341.195 619.398 341.457C619.198 341.861 619.099 342.064 619.058 342.218C618.862 342.96 619.182 343.769 619.747 343.96C619.865 344 620.044 344 620.404 344H637.596C637.956 344 638.135 344 638.253 343.96C638.818 343.769 639.138 342.96 638.942 342.218C638.901 342.064 638.802 341.861 638.602 341.457C638.473 341.195 638.409 341.064 638.338 340.95C638.012 340.427 637.551 340.093 637.049 340.017C636.94 340 636.823 340 636.59 340Z"/><path d="M623 348H635"/><path d="M621 344L622.252 345.588C622.952 346.475 623.177 347.639 622.858 348.717L622.183 351"/><path d="M637 344L635.748 345.588C635.048 346.475 634.823 347.639 635.142 348.717L635.817 351"/><path d="M624 353C624 354.105 623.105 355 622 355C620.895 355 620 354.105 620 353C620 351.895 620.895 351 622 351C623.105 351 624 351.895 624 353Z"/><path d="M638 353C638 354.105 637.105 355 636 355C634.895 355 634 354.105 634 353C634 351.895 634.895 351 636 351C637.105 351 638 351.895 638 353Z"/><path d="M623 340V338.104C623 337.386 623.611 336.859 624.243 337.033L626.243 337.585C626.688 337.708 627 338.149 627 338.655V340"/>
        </svg>
      );

    case 'hospital-bed-02':
      return (
        <svg {...commonProps} viewBox="617.0 378.0 24 24">
          <path d="M636.59 384H621.41C621.177 384 621.06 384 620.951 384.017C620.449 384.093 619.988 384.427 619.662 384.95C619.591 385.064 619.527 385.195 619.398 385.457C619.198 385.861 619.099 386.064 619.058 386.218C618.862 386.96 619.182 387.769 619.747 387.96C619.865 388 620.044 388 620.404 388H637.596C637.956 388 638.135 388 638.253 387.96C638.818 387.769 639.138 386.96 638.942 386.218C638.901 386.064 638.802 385.861 638.602 385.457C638.473 385.195 638.409 385.064 638.338 384.95C638.012 384.427 637.551 384.093 637.049 384.017C636.94 384 636.823 384 636.59 384Z"/><path d="M624.5 395.5L636 388"/><path d="M633.5 395.5L622 388"/><path d="M625 397C625 398.105 624.105 399 623 399C621.895 399 621 398.105 621 397C621 395.895 621.895 395 623 395C624.105 395 625 395.895 625 397Z"/><path d="M637 397C637 398.105 636.105 399 635 399C633.895 399 633 398.105 633 397C633 395.895 633.895 395 635 395C636.105 395 637 395.895 637 397Z"/><path d="M623 384V382.104C623 381.386 623.611 380.859 624.243 381.033L626.243 381.585C626.688 381.708 627 382.149 627 382.655V384"/>
        </svg>
      );

    case 'hospital-location':
      return (
        <svg {...commonProps} viewBox="617.0 422.0 24 24">
          <path d="M629.5 424C624.806 424 621 427.618 621 432.081C621 434.633 622.062 436.617 624.188 438.389C625.685 439.638 627.5 441.713 628.589 443.395C629.112 444.202 629.851 444.202 630.411 443.395C631.555 441.747 633.315 439.638 634.812 438.389C636.938 436.617 638 434.633 638 432.081C638 427.618 634.194 424 629.5 424Z"/><path d="M627.5 429V432M627.5 435V432M631.5 429V432M631.5 435V432M631.5 432H627.5"/>
        </svg>
      );

    case 'injection':
      return (
        <svg {...commonProps} viewBox="617.0 466.0 24 24">
          <path d="M634 468C634 468.51 634 468.765 634.068 469.002C634.105 469.133 634.157 469.259 634.223 469.377C634.343 469.593 634.523 469.773 634.884 470.134L636.866 472.116C637.227 472.477 637.407 472.657 637.623 472.777C637.741 472.843 637.867 472.895 637.998 472.932C638.235 473 638.49 473 639 473"/><path d="M628.693 473L623.765 477.928C622.7 478.993 622.168 479.525 622.041 480.163C621.986 480.439 621.986 480.723 622.041 481C622.168 481.638 622.7 482.17 623.765 483.235C624.83 484.3 625.362 484.832 626 484.959C626.277 485.014 626.561 485.014 626.837 484.959C627.475 484.832 628.007 484.3 629.072 483.235L634 478.307"/><path d="M628 472L635 479"/><path d="M625 484.637L623.831 485.473C623.36 485.809 623.125 485.977 622.866 485.997C622.766 486.005 622.666 485.997 622.568 485.972C622.317 485.91 622.113 485.705 621.704 485.296C621.295 484.887 621.09 484.683 621.028 484.432C621.003 484.334 620.995 484.234 621.003 484.134C621.023 483.875 621.191 483.64 621.527 483.169L622.363 482"/><path d="M630.5 474L635.5 470M633 476.5L637 471.5"/><path d="M621.5 485.5L619 488"/>
        </svg>
      );

    case 'kidneys':
      return (
        <svg {...commonProps} viewBox="617.0 510.0 24 24">
          <path d="M626.986 516C627.143 514.594 626.005 513 623.571 513C621.047 513 619 515.462 619 518.5C619 521.538 620.539 524 623.064 524C624.68 524 625.536 522.746 625.356 521.659"/><path d="M624 518C625.5 518 627.5 518.496 627.5 521.64C627.5 525.8 625.499 527.36 627 531M634 518C632.5 518 630.5 518.496 630.5 521.64C630.5 525.8 632.501 527.36 631 531"/><path d="M623.61 516C623.814 516.571 624.16 517.943 623.916 518.857C623.814 519.238 623.488 520 623 520"/><path d="M631.014 516C630.857 514.594 631.995 513 634.429 513C636.953 513 639 515.462 639 518.5C639 521.538 637.461 524 634.936 524C633.24 524 632.382 522.62 632.678 521.5"/><path d="M634.39 516C634.186 516.571 633.84 517.943 634.084 518.857C634.186 519.238 634.512 520 635 520"/>
        </svg>
      );

    case 'labs':
      return (
        <svg {...commonProps} viewBox="617.0 554.0 24 24">
          <path d="M634.5 575C632.567 575 631 573.433 631 571.5L631 557L638 557L638 571.5C638 573.433 636.433 575 634.5 575Z"/><path d="M639 557H630"/><path d="M634 561H631"/><path d="M627 570.875C627 573.913 625 575 623 575C621 575 619 573.913 619 570.875C619 567.837 623 564 623 564C623 564 627 567.837 627 570.875Z"/><path d="M631 566C632.083 565.134 633.297 563.878 634.771 564.763C636.001 565.501 637.034 564.724 638 564"/>
        </svg>
      );

    case 'liver':
      return (
        <svg {...commonProps} viewBox="617.0 598.0 24 24">
          <path d="M635 606.034C632.12 606.034 630.127 603.011 627 603.011C622.582 603.011 619 606.621 619 611.073C619 612.507 619.171 614.212 619.868 615.609C620.414 616.706 621.681 617.164 622.881 616.948C627.43 616.131 631 613.003 632 611.005M631 604.467C634 603.011 639 601.844 639 605.027C639 608.209 634.831 610.834 632 611.005C630.231 611.111 628 610.505 626 609.058"/>
        </svg>
      );

    case 'lungs':
      return (
        <svg {...commonProps} viewBox="617.0 642.0 24 24">
          <path d="M624.978 653C625.389 653.206 625.715 653.561 625.974 653.995M625.974 653.995C626.97 655.665 626.97 658.5 626.97 658.5C626.97 662 625.186 663 622.985 663C621.989 663 619 662.5 619 658C619 651.5 622.487 647 625.476 647C627.867 647 626.972 652 625.974 653.995Z"/><path d="M633.022 653C632.61 653.206 632.284 653.561 632.025 653.995M632.025 653.995C631.029 655.665 631.029 658.5 631.029 658.5C631.029 662 632.813 663 635.014 663C636.011 663 639 662.5 639 658C639 651.5 635.513 647 632.523 647C630.132 647 631.03 652 632.025 653.995Z"/><path d="M631 649L629 647.667M629 647.667L627 649M629 647.667V645"/>
        </svg>
      );

    case 'mask':
      return (
        <svg {...commonProps} viewBox="617.0 686.0 24 24">
          <path d="M623 695C624.466 694.387 626.611 694 629 694C631.389 694 633.534 694.387 635 695"/><path d="M626 697.5C626.94 697.176 627.949 697 629 697C630.051 697 631.06 697.176 632 697.5"/><path d="M625 701C626.177 701.636 627.543 702 629 702C630.457 702 631.823 701.636 633 701"/><path d="M623 696C623 699.257 621.169 700.942 620.057 700.999C620.022 701 619.989 700.981 619.971 700.95C619.157 699.497 619 697.788 619 696C619 692.686 619.895 690 621 690C622.105 690 623 692.686 623 696Z"/><path d="M635 696C635 699.257 636.831 700.942 637.943 700.999C637.978 701 638.011 700.981 638.029 700.95C638.843 699.497 639 697.788 639 696C639 692.686 638.105 690 637 690C635.895 690 635 692.686 635 696Z"/><path d="M638 701C636.204 703.989 632.846 706 629 706C625.154 706 621.796 703.989 620 701"/>
        </svg>
      );

    case 'mask-love':
      return (
        <svg {...commonProps} viewBox="617.0 730.0 24 24">
          <path d="M631.142 743.442C632.349 742.711 633.402 743.005 634.035 743.475C634.294 743.667 634.424 743.763 634.5 743.763C634.576 743.763 634.706 743.667 634.966 743.475C635.598 743.005 636.651 742.711 637.858 743.442C639.442 744.401 639.8 747.567 636.147 750.237C635.451 750.746 635.104 751 634.5 751C633.897 751 633.549 750.746 632.853 750.237C629.2 747.567 629.558 744.401 631.142 743.442Z"/><path d="M623 738C624.466 737.387 626.611 737 629 737C631.389 737 633.534 737.387 635 738"/><path d="M623 739C623 742.257 621.169 743.942 620.057 743.998C620.022 744 619.989 743.981 619.971 743.95C619.157 742.497 619 740.788 619 739C619 735.686 619.895 733 621 733C622.105 733 623 735.686 623 739Z"/><path d="M635.06 740.02C635.009 739.667 635 739.401 635 739C635 735.686 635.895 733 637 733C638.105 733 639 735.686 639 739C639 739.381 639 740.14 638.948 740.52"/><path d="M628 749C625.04 748.78 621.74 747.04 620 744"/>
        </svg>
      );

    case 'medicine-01':
      return (
        <svg {...commonProps} viewBox="617.0 774.0 24 24">
          <path d="M621 788H623.395C623.689 788 623.979 788.066 624.242 788.194L626.284 789.182C626.547 789.309 626.837 789.375 627.131 789.375H628.174C629.183 789.375 630 790.166 630 791.142C630 791.181 629.973 791.216 629.934 791.227L627.393 791.929C626.937 792.055 626.449 792.012 626.025 791.806L623.842 790.75"/><path d="M630 790.5L634.593 789.089C635.407 788.835 636.287 789.136 636.797 789.842C637.166 790.353 637.016 791.084 636.478 791.394L628.963 795.731C628.485 796.006 627.921 796.074 627.395 795.918L621 794.02"/><path d="M634.329 778.5C635.71 780.891 634.891 783.949 632.5 785.329C630.109 786.71 627.051 785.891 625.671 783.5M634.329 778.5C632.949 776.109 629.891 775.29 627.5 776.671C625.109 778.051 624.29 781.109 625.671 783.5M634.329 778.5L625.671 783.5"/>
        </svg>
      );

    case 'medicine-02':
      return (
        <svg {...commonProps} viewBox="617.0 818.0 24 24">
          <path d="M637.193 830.999C638.85 833.869 637.867 837.538 634.997 839.195C632.127 840.852 628.458 839.869 626.801 836.999M637.193 830.999C635.536 828.129 631.867 827.146 628.997 828.803C626.127 830.46 625.144 834.129 626.801 836.999M637.193 830.999L626.801 836.999"/><path d="M623.5 834C622.3 833.868 621.175 833.171 620.525 832.019C619.444 830.103 620.086 827.653 621.958 826.547L627.043 823.542L632.128 820.537C634 819.431 636.394 820.088 637.475 822.004C638.343 823.543 638.1 825.427 637 826.682M627.043 823.542L628.5 826"/>
        </svg>
      );

    case 'medicine-syrup':
      return (
        <svg {...commonProps} viewBox="617.0 862.0 24 24">
          <path d="M626.5 877.75C626.5 879.407 627.75 880 629 880C630.25 880 631.5 879.407 631.5 877.75C631.5 876.093 629 874 629 874C629 874 626.5 876.093 626.5 877.75Z"/><path d="M626.068 864H631.932C632.853 864 633.314 864 633.6 864.293C634.133 864.839 634.133 867.161 633.6 867.707C633.314 868 632.853 868 631.932 868H626.068C625.147 868 624.686 868 624.4 867.707C623.867 867.161 623.867 864.839 624.4 864.293C624.686 864 625.147 864 626.068 864Z"/><path d="M625 868C625.165 868.33 625.247 868.495 625.306 868.656C625.612 869.495 625.528 870.427 625.077 871.198C624.99 871.346 624.88 871.494 624.658 871.789L624.255 872.327C623.805 872.927 623.58 873.227 623.417 873.556C623.252 873.888 623.134 874.241 623.067 874.606C623 874.966 623 875.341 623 876.092V878C623 880.828 623 882.243 623.879 883.121C624.757 884 626.172 884 629 884C631.828 884 633.243 884 634.121 883.121C635 882.243 635 880.828 635 878V876.092C635 875.341 635 874.966 634.933 874.606C634.866 874.241 634.748 873.888 634.583 873.556C634.42 873.227 634.195 872.927 633.745 872.327L633.342 871.789C633.12 871.494 633.01 871.346 632.923 871.198C632.472 870.427 632.388 869.495 632.694 868.656C632.753 868.495 632.835 868.33 633 868"/>
        </svg>
      );

    case 'medicine-bottle-01':
      return (
        <svg {...commonProps} viewBox="617.0 906.0 24 24">
          <path d="M626.068 908H631.932C632.853 908 633.314 908 633.6 908.293C634.133 908.839 634.133 911.161 633.6 911.707C633.314 912 632.853 912 631.932 912H626.068C625.147 912 624.686 912 624.4 911.707C623.867 911.161 623.867 908.839 624.4 908.293C624.686 908 625.147 908 626.068 908Z"/><path d="M625 912C625.165 912.33 625.247 912.495 625.306 912.656C625.612 913.495 625.528 914.427 625.077 915.198C624.99 915.346 624.88 915.494 624.658 915.789L624.255 916.327C623.805 916.927 623.58 917.227 623.417 917.556C623.252 917.888 623.134 918.241 623.067 918.606C623 918.966 623 919.341 623 920.092V922C623 924.828 623 926.243 623.879 927.121C624.757 928 626.172 928 629 928C631.828 928 633.243 928 634.121 927.121C635 926.243 635 924.828 635 922V920.092C635 919.341 635 918.966 634.933 918.606C634.866 918.241 634.748 917.888 634.583 917.556C634.42 917.227 634.195 916.927 633.745 916.327L633.342 915.789C633.12 915.494 633.01 915.346 632.923 915.198C632.472 914.427 632.388 913.495 632.694 912.656C632.753 912.495 632.835 912.33 633 912"/><path d="M629 919V924M626.5 921.5L631.5 921.5"/>
        </svg>
      );

    case 'medicine-bottle-02':
      return (
        <svg {...commonProps} viewBox="914.0 202.0 24 24">
          <path d="M924 224C921.117 224 919.792 224 918.896 223.121C918 222.243 918 220.828 918 218V216.092C918 215.341 918 214.966 918.068 214.606C918.137 214.241 918.257 213.888 918.425 213.556C918.591 213.227 918.821 212.927 919.279 212.327L919.691 211.789C919.916 211.494 920.029 211.346 920.117 211.198C920.577 210.427 920.663 209.495 920.351 208.656C920.291 208.495 920.207 208.33 920.039 208M928.194 208C928.026 208.33 927.942 208.495 927.882 208.656C927.57 209.495 927.656 210.427 928.116 211.198C928.204 211.346 928.317 211.494 928.543 211.789C928.987 212.37 929.654 212.869 930 213.5"/><path d="M921.068 204H926.932C927.853 204 928.314 204 928.6 204.293C929.133 204.839 929.133 207.161 928.6 207.707C928.314 208 927.853 208 926.932 208H921.068C920.147 208 919.686 208 919.4 207.707C918.867 207.161 918.867 204.839 919.4 204.293C919.686 204 920.147 204 921.068 204Z"/><path d="M932.537 216.906C934.246 218.306 934.496 220.826 933.096 222.535C931.696 224.244 929.176 224.494 927.467 223.094M932.537 216.906C930.828 215.506 928.308 215.756 926.908 217.465C925.508 219.174 925.758 221.694 927.467 223.094M932.537 216.906L927.467 223.094"/>
        </svg>
      );

    case 'medical-file':
      return (
        <svg {...commonProps} viewBox="914.0 246.0 24 24">
          <path d="M933 255V253.818C933 252.125 933 251.278 932.748 250.602C932.342 249.515 931.485 248.658 930.398 248.252C929.722 248 928.875 248 927.182 248C924.219 248 922.737 248 921.554 248.441C919.651 249.151 918.151 250.651 917.441 252.554C917 253.737 917 255.219 917 258.182L917 260.727C917 263.797 917 265.331 917.798 266.397C918.026 266.702 918.298 266.974 918.603 267.202C919.669 268 921.203 268 924.273 268H925C926.17 268 928.5 268 928.5 268"/><path d="M925 260.333H925.84C926.502 260.333 926.833 260.333 927.098 260.508C927.364 260.682 927.512 260.996 927.808 261.623L929.4 265L931.6 258L933.192 261.377C933.488 262.004 933.636 262.318 933.902 262.492C934.167 262.667 934.498 262.667 935.16 262.667H936"/><path d="M917 258C917 256.159 918.492 254.667 920.333 254.667H921.444C921.961 254.667 922.219 254.667 922.431 254.61C923.007 254.456 923.456 254.007 923.61 253.431C923.667 253.219 923.667 252.961 923.667 252.444L923.667 251.333C923.667 249.492 925.159 248 927 248"/>
        </svg>
      );

    case 'mortar':
      return (
        <svg {...commonProps} viewBox="914.0 290.0 24 24">
          <path d="M918.963 302H933.037C934.014 302 934.503 302 934.805 302.375C935.107 302.751 935.014 303.162 934.828 303.984C934.286 306.376 932.788 308.408 930.753 309.66C930.361 309.901 930.194 310.398 930.406 310.804C930.689 311.35 930.291 312 929.674 312H922.326C921.709 312 921.311 311.35 921.594 310.804C921.806 310.398 921.639 309.901 921.247 309.66C919.212 308.408 917.714 306.376 917.172 303.984C916.986 303.162 916.893 302.751 917.195 302.375C917.497 302 917.986 302 918.963 302Z"/><path d="M931.459 302L933.009 298.281C933.184 297.862 933.615 297.652 934.047 297.58C934.421 297.518 934.719 297.341 934.878 297.053C935.275 296.335 934.668 295.194 933.523 294.504C932.377 293.813 931.126 293.835 930.729 294.553C930.57 294.841 930.573 295.199 930.708 295.568C930.864 295.995 930.905 296.489 930.645 296.856L927 302"/><path d="M920.502 295.502L924 299M922.601 293.403C924.146 294.949 923.76 296.442 922.601 297.601C921.442 298.76 919.949 299.146 918.403 297.601C916.857 296.055 917.004 292.004 917.004 292.004C917.004 292.004 921.055 291.857 922.601 293.403Z"/>
        </svg>
      );

    case 'nose':
      return (
        <svg {...commonProps} viewBox="914.0 334.0 24 24">
          <path d="M921 351C923 351 923.5 355 926 355C928.5 355 929 351 931 351"/><path d="M922.5 337C922.5 339.279 921.132 344.018 919.736 346.112C918.163 348.472 916.78 352.377 919.738 353.804C921.198 354.509 923 353.087 923 353.087"/><path d="M929.5 337C929.5 339.278 930.868 344.018 932.264 346.112C933.837 348.472 935.22 352.377 932.262 353.804C930.802 354.509 929 353.087 929 353.087"/>
        </svg>
      );

    case 'prescription':
      return (
        <svg {...commonProps} viewBox="914.0 378.0 24 24">
          <path d="M933 399L924 390"/><path d="M919 397V383C919 381.345 919.345 381 921 381H923.5C925.985 381 928 383.015 928 385.5C928 387.985 925.985 390 923.5 390H919"/><path d="M933 393L927 399"/>
        </svg>
      );

    case 'protection-mask':
      return (
        <svg {...commonProps} viewBox="914.0 422.0 24 24">
          <path d="M918.276 444V440.449C918.276 439.172 917.935 438.517 917.265 437.411C916.461 436.086 916 434.54 916 432.889C916 427.98 920.076 424 925.103 424C929.467 424 933.113 426.998 934 431"/><path d="M929.075 436.845L932.991 434.414C933.083 434.357 933.129 434.328 933.175 434.306C933.221 434.283 933.275 434.264 933.382 434.225C933.933 434.023 934.543 433.805 935.04 434.224C935.301 434.446 935.425 434.835 935.671 435.614C935.865 436.228 936.081 436.835 935.97 437.487C935.912 437.828 935.76 438.148 935.457 438.788L934.027 441.802C933.474 442.97 933.197 443.554 932.276 443.861C931.355 444.168 930.948 443.936 930.135 443.472C926.449 441.372 919.31 435.26 921.364 432.488C922.14 431.441 924.123 431.735 929.075 436.845ZM929.075 436.845L928.01 442.079"/>
        </svg>
      );

    case 'safe':
      return (
        <svg {...commonProps} viewBox="914.0 466.0 24 24">
          <path d="M930 483L930.21 483.21C930.579 483.579 930.763 483.763 930.986 483.751C931.209 483.738 931.372 483.535 931.698 483.127L933 481.5M927 481.454V481.84C927 483.042 927 483.643 927.148 484.193C927.332 484.872 927.679 485.499 928.162 486.02C928.552 486.442 929.068 486.77 930.099 487.427C930.56 487.721 930.791 487.868 931.037 487.937C931.339 488.021 931.661 488.021 931.963 487.937C932.209 487.868 932.44 487.721 932.901 487.427C933.932 486.77 934.448 486.442 934.838 486.02C935.321 485.499 935.668 484.872 935.852 484.193C936 483.643 936 483.042 936 481.84V481.454C936 480.706 936 480.332 935.858 480.016C935.771 479.821 935.645 479.644 935.489 479.496C935.236 479.255 934.877 479.124 934.159 478.861L932.685 478.322C932.099 478.107 931.806 478 931.5 478C931.194 478 930.901 478.107 930.315 478.322L928.841 478.861C928.123 479.124 927.764 479.255 927.511 479.496C927.355 479.644 927.229 479.821 927.142 480.016C927 480.332 927 480.706 927 481.454Z"/><path d="M930.171 473.909V475.5M930.171 473.909C930.171 473.156 930.804 472.545 931.586 472.545C932.367 472.545 933 473.156 933 473.909V475.5M930.171 473.909V471.182C930.171 470.429 929.538 469.818 928.757 469.818C927.976 469.818 927.342 470.429 927.342 471.182M927.342 471.182V475.5M927.342 471.182V469.364C927.342 468.611 926.709 468 925.928 468C925.147 468 924.514 468.611 924.514 469.364V472.091M924.514 472.091C924.514 471.338 923.88 470.727 923.099 470.727C922.318 470.727 921.685 471.338 921.685 472.091V478.638C921.685 479.054 921.152 479.251 920.862 478.943L918.571 476.504C918.182 476.044 917.523 475.888 916.957 476.122C915.949 476.539 915.712 478.01 916.367 478.858C917.489 480.31 918.638 482.291 919.565 484.039C920.824 486.41 923.309 488 926.072 488M924.514 472.091V475.5"/>
        </svg>
      );

    case 'skull':
      return (
        <svg {...commonProps} viewBox="914.0 510.0 24 24">
          <path d="M925.591 524.536C925.139 524.704 924.736 525.027 924.332 525.284C923.489 525.822 922.631 526.413 921.585 526.36C918.468 526.2 916 522.321 916 519.567C916 515.388 920.101 512 925.16 512C929.719 512 933.5 514.751 934.203 518.352C934.423 519.476 933.921 520.161 933.303 521.08L935.369 523.129C935.797 523.553 936.011 523.765 936 523.986C935.988 524.207 935.72 524.423 935.183 524.857C934.714 525.236 934.321 525.69 934.321 526.125C934.533 527.596 935.42 530.025 934.446 531.284C933.268 532.805 930.988 531.51 929.613 530.98C928.178 530.427 927.461 530.151 926.979 529.63C925.845 528.401 925.591 524.536 925.591 524.536ZM925.591 524.536C927.085 523.982 928.311 525.771 929.838 525.104C930.36 524.876 930.813 524.444 931.267 524.107"/><path d="M934.5 529C934.5 529 933 528.5 932.5 527.5"/><path d="M928 519.019C928 519.019 926.138 519.019 925.307 520.329C925.057 520.721 924.675 521.069 924.223 520.988C923.018 520.772 921.653 519.998 921 518"/>
        </svg>
      );

    case 'sperm':
      return (
        <svg {...commonProps} viewBox="914.0 554.0 24 24">
          <path d="M923.891 568.109C926.125 570.343 929.189 570.902 931.982 568.109C934.775 565.316 936.027 560.018 934.005 557.995C931.982 555.973 926.684 557.225 923.891 560.018C921.098 562.811 921.657 565.875 923.891 568.109Z"/><path d="M917 575C917.413 574.452 918.055 573.882 919.178 573.608C920.072 573.389 920.52 573.28 920.686 573.167C921.021 572.939 921.125 572.756 921.145 572.364C921.154 572.17 921.049 571.869 920.839 571.267C920.629 570.665 920.524 570.365 920.533 570.17C920.553 569.778 920.657 569.595 920.992 569.368C921.158 569.254 921.605 569.145 922.5 568.926C923.299 568.731 923.785 568.379 924 568"/>
        </svg>
      );

    case 'stethoscope':
      return (
        <svg {...commonProps} viewBox="914.0 598.0 24 24">
          <path d="M927.001 600C928.105 600 929 600.931 929 602.08C929 603.029 929.036 603.874 928.269 604.572C925.759 606.857 924.503 608 923 608C921.497 608 920.242 606.857 917.731 604.572C916.964 603.874 917 603.029 917 602.08C917 600.931 917.895 600 918.999 600"/><path d="M923 612V615.5C923 617.985 925.015 620 927.5 620C929.986 620 932.001 617.985 932.001 615.5V614"/><path d="M928 605L926.698 608.256C926.352 609.121 926.179 609.554 925.889 609.909C925.599 610.265 925.21 610.521 924.432 611.035L922.97 612L921.533 611.032C920.772 610.52 920.392 610.264 920.108 609.913C919.825 609.561 919.654 609.136 919.314 608.284L918 605"/><path d="M935 611C935 612.657 933.657 614 932 614C930.343 614 929 612.657 929 611C929 609.343 930.343 608 932 608C933.657 608 935 609.343 935 611Z"/><path d="M932.008 611L931.999 611"/>
        </svg>
      );

    case 'thermometer':
      return (
        <svg {...commonProps} viewBox="914.0 642.0 24 24">
          <path d="M927.88 657.937L934.674 650.173C935.422 649.318 935.796 648.891 935.925 648.413C936.038 647.999 936.023 647.561 935.883 647.155C935.722 646.687 935.321 646.286 934.518 645.482C933.714 644.679 933.313 644.278 932.845 644.117C932.439 643.977 932.001 643.962 931.587 644.075C931.109 644.204 930.682 644.578 929.827 645.326L922.063 652.12C921.107 652.956 920.63 653.374 920.348 653.926C920.067 654.477 920.01 655.11 919.895 656.374L919.872 656.632C919.811 657.3 919.78 657.634 919.653 657.939C919.525 658.243 919.309 658.499 918.875 659.011L916.275 662.084C915.884 662.546 915.913 663.231 916.341 663.659C916.769 664.087 917.454 664.116 917.916 663.725L920.989 661.125C921.501 660.691 921.757 660.475 922.061 660.347C922.366 660.22 922.7 660.189 923.368 660.128L923.626 660.105C924.89 659.99 925.523 659.933 926.074 659.652C926.626 659.37 927.044 658.893 927.88 657.937Z"/><path d="M921.789 651.895L923.37 652.843C923.743 653.067 923.863 653.55 923.64 653.923L923.348 654.409C922.962 655.052 923.063 655.876 923.594 656.406C924.124 656.936 924.947 657.037 925.59 656.652L926.077 656.36C926.449 656.136 926.933 656.257 927.156 656.63L928.105 658.21"/><path d="M931.263 648.737L928.105 651.895"/>
        </svg>
      );

    case 'tissue-paper':
      return (
        <svg {...commonProps} viewBox="914.0 686.0 24 24">
          <path d="M924 695.5C924 698.538 922.209 701 920 701C917.791 701 916 698.538 916 695.5C916 692.462 917.791 690 920 690C922.209 690 924 692.462 924 695.5Z"/><path d="M935.813 696.694C935.934 696.165 936 695.595 936 695C936 692.239 934.575 690 932.818 690H920C923.155 690 924.57 693.955 924.023 696.567C923.456 699.267 921.179 702.369 921.389 705.131C921.426 705.622 921.799 706 922.247 706H932.36C932.852 706 933.238 705.538 933.197 705C932.993 702.308 935.212 699.313 935.813 696.694Z"/><path d="M920.008 695.5L919.999 695.5"/>
        </svg>
      );

    case 'tongue':
      return (
        <svg {...commonProps} viewBox="914.0 730.0 24 24">
          <path d="M918.349 742C917.178 740.886 916.425 739.473 916.09 738.756C916.023 738.612 916 738.453 916 738.294C916 738.136 916.023 737.977 916.09 737.833C916.691 736.545 918.646 733 921.956 733C922.996 733 923.865 733.538 924.528 734.171C925.092 734.71 925.374 734.98 925.436 735.024C925.967 735.397 926.033 735.397 926.564 735.024C926.626 734.98 926.908 734.71 927.472 734.171C928.135 733.538 929.004 733 930.044 733C933.354 733 935.309 736.545 935.91 737.833C935.977 737.977 936 738.136 936 738.294C936 738.453 935.977 738.612 935.91 738.756C935.575 739.473 934.822 740.886 933.651 742M936 738.294H933M916 738.294H919"/><path d="M926 739L926.27 738.726C926.729 738.261 927.352 738 928.001 738C929.141 738 930.131 738.797 930.387 739.922L931.357 744.179C932.152 747.669 929.535 751 926 751C922.465 751 919.848 747.669 920.643 744.179L921.613 739.922C921.869 738.797 922.859 738 923.999 738C924.648 738 925.271 738.261 925.73 738.726L926 739ZM926 739V742"/>
        </svg>
      );

    case 'treatment':
      return (
        <svg {...commonProps} viewBox="914.0 774.0 24 24">
          <path d="M922 781.839C922 779.747 923.896 777.68 925.226 776.486C925.949 775.838 927.051 775.838 927.774 776.486C929.104 777.68 931 779.747 931 781.839C931 783.89 929.296 786 926.5 786C923.704 786 922 783.89 922 781.839Z"/><path d="M918 788H920.395C920.689 788 920.979 788.066 921.242 788.194L923.284 789.182C923.547 789.309 923.837 789.375 924.131 789.375H925.174C926.183 789.375 927 790.166 927 791.142C927 791.181 926.973 791.216 926.934 791.227L924.393 791.929C923.937 792.055 923.449 792.012 923.025 791.806L920.842 790.75"/><path d="M927 790.5L931.593 789.089C932.407 788.835 933.287 789.136 933.797 789.842C934.166 790.353 934.016 791.084 933.478 791.394L925.963 795.731C925.485 796.006 924.921 796.074 924.395 795.918L918 794.02"/>
        </svg>
      );

    case 'vaccine':
      return (
        <svg {...commonProps} viewBox="914.0 818.0 24 24">
          <path d="M931 820C931 820.51 931 820.765 931.068 821.002C931.105 821.133 931.157 821.259 931.223 821.377C931.343 821.593 931.523 821.773 931.884 822.134L933.866 824.116C934.227 824.477 934.407 824.657 934.623 824.777C934.741 824.843 934.867 824.895 934.998 824.932C935.235 825 935.49 825 936 825"/><path d="M925.693 825L920.765 829.928C919.7 830.993 919.168 831.525 919.041 832.163C918.986 832.439 918.986 832.723 919.041 833C919.168 833.638 919.7 834.17 920.765 835.235C921.83 836.3 922.362 836.832 923 836.959"/><path d="M925 824L931 830"/><path d="M922 836.637L920.831 837.472C920.36 837.809 920.125 837.977 919.866 837.997C919.766 838.005 919.666 837.997 919.568 837.972C919.317 837.91 919.113 837.705 918.704 837.296C918.295 836.887 918.09 836.683 918.028 836.432C918.003 836.334 917.995 836.234 918.003 836.133C918.023 835.875 918.191 835.64 918.527 835.17L919.363 834"/><path d="M927.5 826L932.5 822M930 828.5L934 823.5"/><path d="M918.5 837.5L916 840"/><path d="M927.4 836L927.981 836.581C928.27 836.87 928.415 837.015 928.591 837.007C928.767 836.999 928.899 836.842 929.161 836.527L930.6 834.8M933 836C933 838.209 931.209 840 929 840C926.791 840 925 838.209 925 836C925 833.791 926.791 832 929 832C931.209 832 933 833.791 933 836Z"/>
        </svg>
      );

    case 'wheelchair':
      return (
        <svg {...commonProps} viewBox="914.0 862.0 24 24">
          <path d="M926 878C926 880.761 923.761 883 921 883C918.239 883 916 880.761 916 878C916 875.239 918.239 873 921 873C923.761 873 926 875.239 926 878Z"/><path d="M932 881.5C932 882.328 931.328 883 930.5 883C929.672 883 929 882.328 929 881.5C929 880.672 929.672 880 930.5 880C931.328 880 932 880.672 932 881.5Z"/><path d="M921.008 878L920.999 878"/><path d="M920 873L919.372 867.977C919.227 866.818 919.155 866.239 918.85 865.822C918.679 865.586 918.458 865.391 918.203 865.25C917.751 865 917.167 865 916 865"/><path d="M920 869H925.5C927.857 869 929.036 869 929.768 869.732C930.5 870.464 930.5 871.643 930.5 874V880"/><path d="M926 876H930.024C930.909 876 931.351 876 931.737 876.189C931.83 876.234 931.919 876.287 932.004 876.347C932.36 876.598 932.605 877.006 933.096 877.821C933.489 878.475 933.686 878.801 933.98 878.928C934.049 878.958 934.121 878.979 934.195 878.991C934.507 879.043 934.824 878.867 935.458 878.516L936 878.216"/>
        </svg>
      );

    case 'x-ray':
      return (
        <svg {...commonProps} viewBox="914.0 906.0 24 24">
          <rect width="20" height="18" rx="5" transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 935 928)"/><path d="M926 911L926 920"/><path d="M926 920.332C925.047 920.332 924.142 920.227 923.329 920.038C922.454 919.835 921.5 920.475 921.5 921.405C921.5 921.89 921.766 922.34 922.207 922.504C922.53 922.624 922.877 922.73 923.243 922.818C923.835 922.961 924.355 923.347 924.612 923.918L924.719 924.154C924.951 924.67 925.451 925 926 925C926.549 925 927.049 924.67 927.281 924.154L927.388 923.918C927.645 923.347 928.165 922.961 928.757 922.818C929.123 922.73 929.47 922.624 929.793 922.504C930.234 922.34 930.5 921.89 930.5 921.405C930.5 920.475 929.546 919.835 928.671 920.038C927.858 920.227 926.953 920.332 926 920.332Z"/><path d="M929 913C928.613 913.619 928.084 914 927.5 914C926.916 914 926.387 913.619 926 913C925.613 913.619 925.084 914 924.5 914C923.916 914 923.387 913.619 923 913"/><path d="M921 916C921.644 916.619 922.527 917 923.5 917C924.473 917 925.356 916.619 926 916C926.644 916.619 927.527 917 928.5 917C929.473 917 930.356 916.619 931 916"/>
        </svg>
      );

    case 'acceleration':
      return (
        <svg {...commonProps} viewBox="48.0 202.0 24 24">
          <path d="M50.5 220.414V213.191C50.5 211.862 50.5 211.198 51.0987 211.033C51.6974 210.867 52.402 211.337 53.8112 212.277L66.5852 220.793C67.9944 221.732 68.699 222.202 68.451 222.601C68.203 223 67.2066 223 65.2137 223H54.3793C52.5506 223 51.6362 223 51.0681 222.621C50.5 222.243 50.5 221.633 50.5 220.414Z"/><path d="M56.5 213C58.7091 213 60.5 211.209 60.5 209C60.5 206.791 58.7091 205 56.5 205C54.2909 205 52.5 206.791 52.5 209C52.5 211.209 54.2909 213 56.5 213Z"/><path d="M63.5039 211.996L69.4074 215.38M69.4074 215.38C69.7274 215.041 69.1868 214.06 68.7302 212.728M69.4074 215.38C69.1868 215.62 68.4659 215.68 66.7658 215.998"/>
        </svg>
      );

    case 'atom-01':
      return (
        <svg {...commonProps} viewBox="48.0 246.0 24 24">
          <circle cx="60" cy="258" r="4"/><path d="M70 255H69.99M50.01 255H50M60.005 268H59.995"/><path d="M55.5556 267C52.4736 265.5 50.3768 262.528 50 259.127M64.4444 267C67.5264 265.5 69.6232 262.528 70 259.127M53.5556 250.257C57.2396 247.248 62.5382 247.248 66.2222 250.257"/>
        </svg>
      );

    case 'atom-02':
      return (
        <svg {...commonProps} viewBox="48.0 290.0 24 24">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M68.3541 293.646C66.5085 291.8 61.2722 294.045 56.6584 298.658C52.0445 303.272 49.8004 308.509 51.6459 310.354C53.4915 312.2 58.7278 309.955 63.3416 305.342C67.9555 300.728 70.1996 295.491 68.3541 293.646Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M51.6459 293.646C49.8004 295.491 52.0445 300.728 56.6584 305.342C61.2722 309.955 66.5085 312.2 68.3541 310.354C70.1996 308.509 67.9555 303.272 63.3416 298.658C58.7278 294.045 53.4915 291.8 51.6459 293.646Z"/><path d="M60.009 302H60"/>
        </svg>
      );

    case 'bacteria':
      return (
        <svg {...commonProps} viewBox="48.0 334.0 24 24">
          <circle cx="60" cy="346" r="10"/><circle cx="63" cy="342" r="2"/><path d="M54 346.5L54.2094 346.735C54.5984 347.171 55.254 347.052 55.5 346.5C55.746 345.948 56.4016 345.829 56.7906 346.265L57 346.5"/><path d="M63.8413 352L63.9521 351.655C64.1579 351.014 63.6742 350.427 63 350.5C62.3258 350.573 61.8421 349.986 62.0479 349.345L62.1587 349"/><path d="M67.009 347H67"/><path d="M57.009 351H57"/><path d="M56.009 342H56"/>
        </svg>
      );

    case 'bounding-box':
      return (
        <svg {...commonProps} viewBox="48.0 378.0 24 24">
          <path d="M54 382H58M52 388V384M60 384V388M54 390H58M62 390H66M68 392V396M60 392V396M62 398H66"/><circle cx="52" cy="382" r="2"/><circle cx="52" cy="390" r="2"/><circle cx="60" cy="382" r="2"/><circle cx="60" cy="390" r="2"/><circle cx="68" cy="390" r="2"/><circle cx="60" cy="398" r="2"/><circle cx="68" cy="398" r="2"/>
        </svg>
      );

    case 'bot':
      return (
        <svg {...commonProps} viewBox="48.0 422.0 24 24">
          <path d="M52 437.5C50.8954 437.5 50 436.605 50 435.5C50 434.395 50.8954 433.5 52 433.5"/><path d="M68 437.5C69.1046 437.5 70 436.605 70 435.5C70 434.395 69.1046 433.5 68 433.5"/><path d="M55 429L55 426"/><path d="M65 429L65 426"/><circle cx="55" cy="425" r="1"/><circle cx="65" cy="425" r="1"/><path d="M61.5 429H58.5C55.6716 429 54.2574 429 53.3787 429.909C52.5 430.818 52.5 432.281 52.5 435.207C52.5 438.133 52.5 439.596 53.3787 440.505C54.2574 441.414 55.6716 441.414 58.5 441.414H59.5253C60.3169 441.414 60.5962 441.577 61.1417 442.171C61.745 442.828 62.6791 443.705 63.5242 443.909C64.7254 444.199 64.8599 443.798 64.5919 442.653C64.5156 442.327 64.3252 441.806 64.526 441.502C64.6385 441.332 64.8259 441.29 65.2008 441.206C65.7922 441.074 66.2798 440.858 66.6213 440.505C67.5 439.596 67.5 438.133 67.5 435.207C67.5 432.281 67.5 430.818 66.6213 429.909C65.7426 429 64.3284 429 61.5 429Z"/><path d="M57.5 437C58.0701 437.607 58.9777 438 60 438C61.0223 438 61.9299 437.607 62.5 437"/><path d="M57.009 433H57"/><path d="M63.009 433H63"/>
        </svg>
      );

    case 'black-hole':
      return (
        <svg {...commonProps} viewBox="354.0 202.0 24 24">
          <path d="M372.602 214C371.641 215.165 369.048 216 366 216C362.952 216 360.359 215.165 359.398 214"/><path d="M364.063 215.5C364.022 215.34 364 215.173 364 215C364 213.895 364.895 213 366 213C367.105 213 368 213.895 368 215C368 215.173 367.978 215.34 367.937 215.5"/><path d="M360 206L363 215.5M361 222L363 220"/><path d="M371 208L369 215.5M371 222L369 220"/><path d="M366 204V213M366 224V220"/>
        </svg>
      );

    case 'cells':
      return (
        <svg {...commonProps} viewBox="354.0 246.0 24 24">
          <path d="M365.107 251.576C365.369 252.027 365.5 252.252 365.5 252.5C365.5 252.748 365.369 252.973 365.107 253.424L363.858 255.576C363.596 256.027 363.466 256.252 363.25 256.376C363.034 256.5 362.773 256.5 362.249 256.5H359.751C359.227 256.5 358.966 256.5 358.75 256.376C358.534 256.252 358.404 256.027 358.142 255.576L356.893 253.424C356.631 252.973 356.5 252.748 356.5 252.5C356.5 252.252 356.631 252.027 356.893 251.576L358.142 249.424C358.404 248.973 358.534 248.748 358.75 248.624C358.966 248.5 359.227 248.5 359.751 248.5L362.249 248.5C362.773 248.5 363.034 248.5 363.25 248.624C363.466 248.748 363.596 248.973 363.858 249.424L365.107 251.576Z"/><path d="M375.107 257.576C375.369 258.027 375.5 258.252 375.5 258.5C375.5 258.748 375.369 258.973 375.107 259.424L373.858 261.576C373.596 262.027 373.466 262.252 373.25 262.376C373.034 262.5 372.773 262.5 372.249 262.5H369.751C369.227 262.5 368.966 262.5 368.75 262.376C368.534 262.252 368.404 262.027 368.142 261.576L366.893 259.424C366.631 258.973 366.5 258.748 366.5 258.5C366.5 258.252 366.631 258.027 366.893 257.576L368.142 255.424C368.404 254.973 368.534 254.748 368.75 254.624C368.966 254.5 369.227 254.5 369.751 254.5L372.249 254.5C372.773 254.5 373.034 254.5 373.25 254.624C373.466 254.748 373.596 254.973 373.858 255.424L375.107 257.576Z"/><path d="M365.107 262.576C365.369 263.027 365.5 263.252 365.5 263.5C365.5 263.748 365.369 263.973 365.107 264.424L363.858 266.576C363.596 267.027 363.466 267.252 363.25 267.376C363.034 267.5 362.773 267.5 362.249 267.5H359.751C359.227 267.5 358.966 267.5 358.75 267.376C358.534 267.252 358.404 267.027 358.142 266.576L356.893 264.424C356.631 263.973 356.5 263.748 356.5 263.5C356.5 263.252 356.631 263.027 356.893 262.576L358.142 260.424C358.404 259.973 358.534 259.748 358.75 259.624C358.966 259.5 359.227 259.5 359.751 259.5L362.249 259.5C362.773 259.5 363.034 259.5 363.25 259.624C363.466 259.748 363.596 259.973 363.858 260.424L365.107 262.576Z"/>
        </svg>
      );

    case 'gravity':
      return (
        <svg {...commonProps} viewBox="354.0 290.0 24 24">
          <path d="M366 312C369.314 312 372 309.314 372 306C372 302.686 369.314 300 366 300C362.686 300 360 302.686 360 306C360 309.314 362.686 312 366 312Z"/><path d="M361 292V294M371 292V294"/><path d="M366.001 292V297.5M364.061 295.503C365.185 296.812 365.5 297.493 366.001 297.5C366.5 297.493 367.135 296.562 368.061 295.503"/>
        </svg>
      );

    case 'molecules':
      return (
        <svg {...commonProps} viewBox="354.0 334.0 24 24">
          <circle cx="366" cy="347" r="4"/><circle cx="366" cy="338" r="2"/><circle cx="358" cy="354" r="2"/><circle cx="374" cy="354" r="2"/><path d="M366 343V340M372.5 352.5L369 350M359.5 352.5L363 350"/>
        </svg>
      );

    case 'magnet':
      return (
        <svg {...commonProps} viewBox="354.0 378.0 24 24">
          <path d="M357.925 380.5H363.15C363.15 380.5 362.2 385.7 362.2 388.1C362.2 391.1 364.1 393.5 366 393.5C367.9 393.5 369.8 391.1 369.8 388.1C369.8 385.7 368.85 380.5 368.85 380.5H374.075C374.075 380.5 375.5 385.138 375.5 389.5C375.5 395 371.7 399.5 366 399.5C360.3 399.5 356.5 395 356.5 389.5C356.5 385.138 357.925 380.5 357.925 380.5Z"/><path d="M356.973 385.25H362.198M369.798 385.25L375.023 385.25"/>
        </svg>
      );

    case 'nano-technology':
      return (
        <svg {...commonProps} viewBox="354.0 422.0 24 24">
          <path d="M359 438L364 435M368 433L373 430M366 427V432M366 436V441M359 430L364 433M368 435L373 438"/><path d="M374.5 431V436.5M367.5 442.5L373 439.5M358.5 439.5L364.5 442.5M357.5 437V431M358.5 428.5L364.5 425.5M373.5 428.5L367.5 425.5"/><circle cx="366" cy="425.5" r="1.5"/><circle cx="366" cy="442.5" r="1.5"/><circle cx="357.5" cy="429.5" r="1.5"/><circle cx="374.5" cy="429.5" r="1.5"/><circle cx="374.5" cy="438.5" r="1.5"/><circle cx="357.5" cy="438.5" r="1.5"/><path d="M366 431.75L368 432.875V435.125L366 436.25L364 435.125V432.875L366 431.75Z"/>
        </svg>
      );

    case 'pendulum':
      return (
        <svg {...commonProps} viewBox="634.0 202.0 24 24">
          <path d="M636 205L654 205"/><path d="M640.5 205V218"/><path d="M645.5 205V218"/><circle cx="640.5" cy="220.5" r="2.5"/><circle cx="645.5" cy="220.5" r="2.5"/><circle cx="653.5" cy="220.5" r="2.5"/><path d="M653.5 218L651 205"/>
        </svg>
      );

    case 'optical-prism':
      return (
        <svg {...commonProps} viewBox="634.0 246.0 24 24">
          <path d="M649.58 254L648.987 252.85C647.664 250.283 647.002 249 646 249C644.998 249 644.336 250.283 643.013 252.85L638.591 261.427C637.311 263.908 636.672 265.148 637.168 266.074C637.665 267 638.969 267 641.578 267H650.422C653.031 267 654.335 267 654.832 266.074C655.328 265.148 654.689 263.908 653.409 261.427L653.06 260.749"/><path d="M656 262L642 256L656 253M642 256L655.462 257.5"/><path d="M642 256L636 257"/>
        </svg>
      );

    case 'pulley':
      return (
        <svg {...commonProps} viewBox="634.0 290.0 24 24">
          <path d="M637 293H655"/><circle cx="649.5" cy="300.5" r="3.5"/><circle cx="642.5" cy="307.5" r="3.5"/><path d="M639 307.5V293"/><path d="M646 307.5L646 300.5"/><path d="M649.5 297L649.5 293"/><path d="M653 307L653 300.5"/><path d="M653 307C652.286 307 651.903 307.199 651.617 307.896C651.245 308.804 650.791 310.15 651.106 310.703C651.274 311 651.66 311 652.431 311H653.569C654.34 311 654.726 311 654.894 310.703C655.209 310.15 654.755 308.804 654.383 307.896C654.11 307.232 653.742 307 653 307Z"/>
        </svg>
      );

    case 'solar-system':
      return (
        <svg {...commonProps} viewBox="634.0 334.0 24 24">
          <path d="M637.5 340.73C636.549 342.26 636 344.066 636 346C636 351.523 640.477 356 646 356C647.045 356 648.053 355.84 649 355.542M654.353 351.5C655.394 349.922 656 348.032 656 346C656 340.477 651.523 336 646 336C644.955 336 643.947 336.16 643 336.458"/><circle cx="639" cy="339" r="2"/><circle cx="653" cy="353" r="2"/><circle cx="642" cy="349" r="2"/><path d="M646 351C648.761 351 651 348.761 651 346C651 343.239 648.761 341 646 341C643.239 341 641 343.239 641 346C641 346.342 641.034 346.677 641.1 347"/><path d="M646.009 346H646"/>
        </svg>
      );

    case 'siri':
      return (
        <svg {...commonProps} viewBox="634.0 378.0 24 24">
          <circle cx="646" cy="390" r="10"/><path d="M637 385.592C643 387.32 644.5 383 653 383"/><path d="M636 390C645 390 647 383.499 652 383"/><path d="M652 397.88C646.719 399.145 640.444 390 636 390"/><path d="M638 396C644.5 396 648.686 388 655 388"/>
        </svg>
      );

    case 'submerge':
      return (
        <svg {...commonProps} viewBox="634.0 422.0 24 24">
          <circle cx="646" cy="436" r="4"/><path d="M641 424V425M641 427.5V428.5M641 431V432M651 424V425M651 427.5V428.5M651 431V432M646 424V425M646 427.5V428.5"/><path d="M636 434V438C636 440.828 636 442.243 636.879 443.121C637.757 444 639.172 444 642 444H650C652.828 444 654.243 444 655.121 443.121C656 442.243 656 440.828 656 438V434"/><path d="M636 436.872C638.264 438.786 640.174 437.729 642.022 436.833C643.597 436.069 645.126 435.422 646.79 436.833C650.047 439.546 652.909 436.753 656 436.198"/>
        </svg>
      );

    case 'test-tube':
      return (
        <svg {...commonProps} viewBox="912.0 202.0 24 24">
          <path d="M922.223 208V209.989C922.223 211.387 922.223 212.087 922.41 212.758C922.597 213.429 922.964 214.045 923.698 215.278L924.693 216.948C926.563 220.089 927.498 221.66 926.731 222.824L926.719 222.842C925.941 224 923.961 224 920 224C916.039 224 914.059 224 913.281 222.842L913.269 222.824C912.502 221.66 913.437 220.089 915.307 216.948L916.302 215.278C917.036 214.045 917.403 213.429 917.59 212.758C917.777 212.087 917.777 211.387 917.777 209.989V208"/><path d="M917 208H923"/><path d="M916.5 215.28C917.167 214.699 918.734 215.118 920.002 215.664C921.668 216.383 923.167 215.802 923.5 215.28"/><path d="M922.5 209C922.5 211 924.862 213.212 926.473 213C926.473 214.657 927.934 216 929.736 216C931.539 216 933 214.657 933 213C933 211.343 932 210 930 210C930 208 928.5 206 926.38 206C926.38 204.457 925.5 204 924.5 204C923.5 204 923 205 923 205C923 205 920 205 920 208"/>
        </svg>
      );

    case 'triangle':
      return (
        <svg {...commonProps} viewBox="912.0 246.0 24 24">
          <path d="M914 267V249L932 267H914Z"/><path d="M928.024 255.068L931.993 258.99M928.993 258.99L931.993 258.99L931.993 256.004M925.917 252.986L922.01 249.002M921.998 252.003L922.01 249.002L924.996 249.014M928.044 252.971L931.979 249.015M928.979 249.04L931.979 249.015L932.005 252.001"/><path d="M928.367 254C928.367 254.756 927.754 255.369 926.998 255.369C926.242 255.369 925.629 254.756 925.629 254C925.629 253.244 926.242 252.631 926.998 252.631C927.754 252.631 928.367 253.244 928.367 254Z"/>
        </svg>
      );

    case 'ufo':
      return (
        <svg {...commonProps} viewBox="912.0 290.0 24 24">
          <path d="M915.048 301.586L916.096 300.586C916.399 300.297 916.551 300.152 916.744 300.076C916.936 300 917.15 300 917.579 300H928.421C928.85 300 929.064 300 929.256 300.076C929.449 300.152 929.601 300.297 929.904 300.586L930.952 301.586C931.651 302.252 932 302.586 932 303C932 303.414 931.651 303.748 930.952 304.414L929.904 305.414C929.601 305.703 929.449 305.848 929.256 305.924C929.064 306 928.85 306 928.421 306H917.579C917.15 306 916.936 306 916.744 305.924C916.551 305.848 916.399 305.703 916.096 305.414L915.048 304.414C914.349 303.748 914 303.414 914 303C914 302.586 914.349 302.252 915.048 301.586Z"/><path d="M919.012 303H919M923.006 303H922.994M927 303H926.988"/><path d="M929 300C929 296.686 926.314 294 923 294C919.686 294 917 296.686 917 300"/><path d="M917 306L916.316 308.051C916.232 308.305 916.189 308.432 916.125 308.534C915.987 308.753 915.77 308.909 915.519 308.971C915.401 309 915.267 309 915 309"/><path d="M929 306L929.684 308.051C929.768 308.305 929.811 308.432 929.875 308.534C930.013 308.753 930.23 308.909 930.481 308.971C930.599 309 930.733 309 931 309"/>
        </svg>
      );

    case 'wind-turbine':
      return (
        <svg {...commonProps} viewBox="912.0 334.0 24 24">
          <path d="M924.5 345C924.5 345.828 923.828 346.5 923 346.5C922.172 346.5 921.5 345.828 921.5 345C921.5 344.172 922.172 343.5 923 343.5C923.828 343.5 924.5 344.172 924.5 345Z"/><path d="M932 344.5C931.988 344.308 931.971 344.117 931.948 343.928C931.62 341.258 930.16 338.945 928.072 337.5M917.928 337.5C915.84 338.945 914.38 341.258 914.052 343.928C914.029 344.117 914.012 344.308 914 344.5"/><path d="M923 343.5V341"/><path d="M921.199 337.99L921.351 339.507C921.407 340.066 921.434 340.345 921.57 340.551C921.663 340.692 921.791 340.807 921.94 340.885C922.158 341 922.439 341 923 341C923.561 341 923.842 341 924.06 340.885C924.209 340.807 924.337 340.692 924.43 340.551C924.566 340.345 924.593 340.066 924.649 339.507L924.801 337.99C924.884 337.163 924.925 336.749 924.733 336.455C924.675 336.366 924.604 336.287 924.521 336.22C924.247 336 923.831 336 923 336C922.169 336 921.753 336 921.479 336.22C921.396 336.287 921.325 336.366 921.267 336.455C921.075 336.749 921.116 337.163 921.199 337.99Z"/><path d="M921.7 345.75L919.535 347"/><path d="M917.831 350.065L919.069 349.175C919.525 348.847 919.753 348.683 919.863 348.463C919.938 348.312 919.975 348.144 919.968 347.975C919.958 347.729 919.818 347.486 919.537 347C919.257 346.514 919.116 346.271 918.908 346.139C918.765 346.049 918.602 345.997 918.433 345.987C918.187 345.972 917.931 346.087 917.42 346.318L916.03 346.945C915.272 347.287 914.894 347.458 914.734 347.772C914.686 347.866 914.653 347.968 914.637 348.073C914.584 348.42 914.791 348.78 915.207 349.5C915.623 350.22 915.83 350.58 916.158 350.707C916.257 350.746 916.361 350.768 916.467 350.774C916.819 350.793 917.156 350.55 917.831 350.065Z"/><path d="M924.3 345.75L926.465 347"/><path d="M929.97 346.944L928.58 346.317C928.069 346.086 927.813 345.971 927.567 345.986C927.398 345.996 927.235 346.048 927.092 346.138C926.884 346.27 926.743 346.513 926.463 346.999C926.182 347.485 926.042 347.728 926.032 347.974C926.025 348.143 926.061 348.311 926.137 348.462C926.247 348.682 926.475 348.846 926.931 349.174L928.169 350.064C928.844 350.549 929.181 350.792 929.533 350.773C929.638 350.767 929.743 350.745 929.842 350.706C930.169 350.579 930.377 350.219 930.793 349.499C931.208 348.779 931.416 348.419 931.363 348.072C931.347 347.967 931.314 347.865 931.266 347.771C931.106 347.457 930.728 347.286 929.97 346.944Z"/><path d="M923 346.5V356"/><path d="M929 356H917"/>
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

    case 'flask':
      return (
        <svg {...commonProps}>
          <path d="M10 2v7.31L4.15 19.1A2 2 0 0 0 5.86 22h12.28a2 2 0 0 0 1.71-2.9L14 9.31V2" />
          <line x1="8.5" x2="15.5" y1="2" y2="2" />
          <line x1="6.5" x2="17.5" y1="16" y2="16" />
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
