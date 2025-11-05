// Centralized service data for search functionality
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryRoute: string;
  keywords: string[]; // For better search matching
}

export const allServices: ServiceItem[] = [
  // Electrical Services
  {
    id: "electrical-1",
    title: "House Wiring Installation",
    description: "Installing new electrical wiring systems in houses, including outlets, switches, lighting, and circuit breakers.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["wiring", "installation", "electrical", "outlets", "switches", "lighting", "circuit breakers", "house"]
  },
  {
    id: "electrical-2",
    title: "Outlet and Switch Installation",
    description: "Adding or relocating power outlets and switches to improve household convenience and safety.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["outlet", "switch", "installation", "power", "electrical", "safety", "convenience"]
  },
  {
    id: "electrical-3",
    title: "Lighting Fixture Installation and Repair",
    description: "Setting up ceiling lights, chandeliers, LED fixtures, outdoor lighting, and replacing defective bulbs or wirings.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["lighting", "fixture", "ceiling", "chandelier", "LED", "outdoor", "bulbs", "repair"]
  },
  {
    id: "electrical-4",
    title: "Electrical System Troubleshooting and Repair",
    description: "Identifying faults such as short circuits, tripped breakers, or faulty switches and repairing them safely.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["troubleshooting", "repair", "short circuit", "breaker", "switch", "fault", "electrical"]
  },
  {
    id: "electrical-5",
    title: "Preventive Electrical Maintenance",
    description: "Inspecting electrical systems for loose connections, damaged wires, or overloaded circuits to avoid accidents.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["maintenance", "preventive", "inspection", "electrical", "safety", "wires", "circuits"]
  },

  // Plumbing Services
  {
    id: "plumbing-1",
    title: "Pipe Fitting & Leak Repair",
    description: "Leaking or burst pipes, low water pressure, clogged pipelines, rusted or corroded pipes, improper pipe connections, water supply interruptions, dripping joints, noisy water flow.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["pipe", "leak", "repair", "plumbing", "water", "pressure", "clogged", "burst", "fitting"]
  },
  {
    id: "plumbing-2",
    title: "Fixture Installation",
    description: "Leaking or dripping faucets, broken or loose toilets, clogged sinks or toilets, misaligned or unstable fixtures, poor drainage, faulty flush mechanisms, replacement of old or damaged fixtures.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["fixture", "faucet", "toilet", "sink", "installation", "drainage", "flush", "plumbing"]
  },
  {
    id: "plumbing-3",
    title: "Shower & Water Heater Installation",
    description: "Weak or inconsistent water flow, no hot water, faulty water heater connection, fluctuating water temperature, leaking showerheads, improper shower setup, electrical or plumbing issues affecting heaters.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["shower", "water heater", "hot water", "temperature", "installation", "plumbing", "heater"]
  },
  {
    id: "plumbing-4",
    title: "Leak Detection and Repair",
    description: "Locating and fixing water leaks in supply lines, drains, or fittings to prevent water damage and wastage.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["leak", "detection", "repair", "water", "damage", "plumbing", "drain"]
  },
  {
    id: "plumbing-5",
    title: "Outdoor and Auxiliary Plumbing Works",
    description: "Installing garden faucets, irrigation or sprinkler systems, and outdoor kitchen/laundry water connections.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["outdoor", "garden", "irrigation", "sprinkler", "faucet", "plumbing", "water"]
  },

  // Carpentry Services
  {
    id: "carpentry-1",
    title: "House Framing and Structural Carpentry",
    description: "Building or repairing wooden frameworks for walls, partitions, ceilings, doors, and windows.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["framing", "structural", "carpentry", "wood", "walls", "partitions", "ceiling", "framework"]
  },
  {
    id: "carpentry-2",
    title: "Cabinet and Furniture Making",
    description: "Constructing or repairing built-in cabinets, wardrobes, shelves, tables, and other wooden furniture.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["cabinet", "furniture", "wardrobe", "shelves", "tables", "carpentry", "wood"]
  },
  {
    id: "carpentry-3",
    title: "Door and Window Installation/Repair",
    description: "Installing wooden doors, jambs, and window frames; repairing misaligned or damaged panels.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["door", "window", "installation", "repair", "frame", "jamb", "carpentry", "wood"]
  },
  {
    id: "carpentry-4",
    title: "Flooring and Ceiling Works",
    description: "Installing wooden or laminated flooring, ceiling panels, and moldings to enhance interior finishes.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["flooring", "ceiling", "laminate", "wood", "panels", "molding", "carpentry", "interior"]
  },
  {
    id: "carpentry-5",
    title: "Finishing and Woodworks",
    description: "Sanding, varnishing, and refinishing wooden surfaces for furniture, doors, and flooring to improve durability and aesthetics.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["finishing", "sanding", "varnishing", "refinishing", "wood", "carpentry", "furniture"]
  },

  // Appliances Services
  {
    id: "appliances-1",
    title: "Television Installation and Repair",
    description: "Setting up LED/LCD/Smart TVs, wall-mounting, troubleshooting display issues, and repairing power or sound defects.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["television", "TV", "LED", "LCD", "smart TV", "installation", "repair", "wall mount"]
  },
  {
    id: "appliances-2",
    title: "Repairing/Troubleshooting Audio, Video Equipment",
    description: "Installing, configuring, and repairing speakers, amplifiers, and surround sound systems.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["audio", "video", "speakers", "amplifier", "sound system", "repair", "equipment"]
  },
  {
    id: "appliances-3",
    title: "Repair / Maintenance of Domestic Electronic Appliances",
    description: "Servicing common household electronic appliances such as rice cookers, electric fans, induction cookers, blenders, and similar devices, including replacing minor components and general maintenance.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["domestic", "electronic", "appliances", "rice cooker", "fan", "induction", "blender", "maintenance"]
  },
  {
    id: "appliances-4",
    title: "Mobile and Gadget Repair (Basic)",
    description: "Performing minor repairs on mobile phones, tablets, and electronic devices such as charging port or battery issues.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["mobile", "gadget", "phone", "tablet", "repair", "charging", "battery"]
  },
  {
    id: "appliances-5",
    title: "Small Electronics Repair",
    description: "Servicing household gadgets like electric fans, rice cookers, blenders, and induction cookers.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["electronics", "repair", "fan", "rice cooker", "blender", "induction", "household"]
  },
  {
    id: "appliances-6",
    title: "Home Electronics Installation and Setup",
    description: "Installing Wi-Fi routers, CCTV systems, set-top boxes, or entertainment systems for household use.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["home electronics", "wifi", "router", "CCTV", "set-top box", "installation", "entertainment"]
  },

  // Computer Services
  {
    id: "computer-1",
    title: "Computer System Assembly/Setup",
    description: "Assembling desktop PCs from parts, installing operating systems, and setting up basic applications for home use.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["computer", "assembly", "setup", "desktop", "PC", "operating system", "installation"]
  },
  {
    id: "computer-2",
    title: "PC Troubleshooting",
    description: "Diagnosing and fixing hardware issues (e.g., faulty power supply, RAM, hard drives) and basic software errors.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["PC", "troubleshooting", "hardware", "software", "power supply", "RAM", "hard drive", "repair"]
  },
  {
    id: "computer-3",
    title: "Network Installation (Wi-Fi, printer sharing)",
    description: "Setting up home Wi-Fi routers, LAN connections, and small home networks for internet sharing and device connectivity.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["network", "wifi", "router", "LAN", "printer", "installation", "internet", "connectivity"]
  },
  {
    id: "computer-4",
    title: "Repair unit/gadget hardware related problem",
    description: "Installing and configuring printers, scanners, webcams, and external storage devices.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["repair", "hardware", "printer", "scanner", "webcam", "storage", "gadget"]
  },
  {
    id: "computer-5",
    title: "Backup, Recovery, & Data Protection",
    description: "Helping homeowners back up important files and recovering data from damaged or formatted drives.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["backup", "recovery", "data", "protection", "files", "computer", "storage"]
  },
  {
    id: "computer-6",
    title: "Virus Removal and System Maintenance",
    description: "Installing antivirus software, removing malware, optimizing system performance, and performing regular check-ups.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["virus", "malware", "antivirus", "maintenance", "optimization", "computer", "security"]
  },

  // Aircon Services
  {
    id: "aircon-1",
    title: "Install domestic refrigeration and air-conditioning units",
    description: "For homeowners who need assistance in installing domestic refrigeration and AC units such as Window-type, Package-type (PACU), and Commercial (CACU).",
    category: "Aircon",
    categoryRoute: "/pages/aircon",
    keywords: ["aircon", "AC", "installation", "refrigeration", "window type", "package type", "unit"]
  },
  {
    id: "aircon-2",
    title: "Service & maintain domestic refrigeration and air-conditioning units",
    description: "A service that covers the maintenance of domestic refrigeration and air-conditioning units, including cleaning, maintaining fan motor assembly, servicing evaporator/condenser, and servicing electrical power/control circuits.",
    category: "Aircon",
    categoryRoute: "/pages/aircon",
    keywords: ["aircon", "AC", "service", "maintenance", "cleaning", "refrigeration", "evaporator", "condenser"]
  },
  {
    id: "aircon-3",
    title: "Troubleshoot & repair domestic refrigeration and air-conditioning systems",
    description: "Diagnosing and fixing issues such as refrigerant leaks, compressor failures, thermostat malfunctions, electrical faults, or unusual noises in domestic air-conditioning and refrigeration units.",
    category: "Aircon",
    categoryRoute: "/pages/aircon",
    keywords: ["aircon", "AC", "troubleshoot", "repair", "refrigerant", "compressor", "thermostat", "refrigeration"]
  },

  // Painting Services
  {
    id: "painting-1",
    title: "Surface Sanding",
    description: "Preparing walls before painting.",
    category: "Painting",
    categoryRoute: "/pages/painting",
    keywords: ["sanding", "surface", "preparation", "walls", "painting"]
  },
  {
    id: "painting-2",
    title: "Retouch/Repaint",
    description: "Fixing spots, touching up areas with detected defects, and matching colors.",
    category: "Painting",
    categoryRoute: "/pages/painting",
    keywords: ["retouch", "repaint", "touch up", "color", "painting", "defects"]
  },
  {
    id: "painting-3",
    title: "Wall Painting",
    description: "Properly applying paint to the wall in any color of preference.",
    category: "Painting",
    categoryRoute: "/pages/painting",
    keywords: ["wall", "painting", "color", "interior", "exterior"]
  },
  {
    id: "painting-4",
    title: "Mixing/Tinting Paints",
    description: "Exactly matching color, preparing custom tints, mixing according to preferred color.",
    category: "Painting",
    categoryRoute: "/pages/painting",
    keywords: ["mixing", "tinting", "color", "paint", "custom", "matching"]
  },

  // Welding Services
  {
    id: "welding-1",
    title: "Welding & Metal Works",
    description: "Rusty or corroded gates, broken or detached metal hinges, cracked or weak welds on railings, bent or misaligned frames, holes or gaps in metal surfaces, damaged window grills, unstable or wobbly metal furniture, need for reinforcement welding, fabrication of custom metal parts, replacement of worn-out metal joints.",
    category: "Welding",
    categoryRoute: "/pages/welding",
    keywords: ["welding", "metal", "gates", "railings", "frames", "grills", "fabrication", "repair"]
  },
  {
    id: "welding-2",
    title: "Metal Furniture Repair",
    description: "Loose or broken metal joints, cracked or weak welds on chairs and tables, bent or misaligned metal frames, rusty or corroded surfaces, unstable or wobbly legs, damaged hinges or latches, dents or holes in panels, peeling paint or finish, need for reinforcement welding, replacement of broken metal parts.",
    category: "Welding",
    categoryRoute: "/pages/welding",
    keywords: ["metal", "furniture", "repair", "welding", "chairs", "tables", "frames", "joints"]
  },

  // Masonry Services
  {
    id: "masonry-1",
    title: "Block/Brick Layering",
    description: "Constructing or repairing walls, partitions, fences, and small structures using hollow blocks or bricks.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["block", "brick", "layering", "walls", "partitions", "fence", "masonry", "construction"]
  },
  {
    id: "masonry-2",
    title: "Plaster Wall/Surface Finishing",
    description: "Applying plaster (mortar/cement) over masonry or concrete walls to have a smooth/semi-smooth surface.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["plaster", "finishing", "walls", "surface", "mortar", "cement", "masonry"]
  },
  {
    id: "masonry-3",
    title: "Repair of Cracked Walls and Surfaces",
    description: "Restoring damaged masonry surfaces, filling gaps, and reinforcing weak areas.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["repair", "cracked", "walls", "surfaces", "masonry", "restoration", "gaps"]
  },
  {
    id: "masonry-4",
    title: "Stone Works for Landscaping",
    description: "Installing garden stone pathways, decorative stone walls, or outdoor stone cladding.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["stone", "landscaping", "garden", "pathways", "walls", "outdoor", "masonry"]
  },
  {
    id: "masonry-5",
    title: "Repair of Defective Concrete",
    description: "Installing or repairing concrete floors, driveways, walkways, and outdoor pavements.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["concrete", "repair", "floors", "driveways", "walkways", "pavements", "masonry"]
  },

  // Tile Services
  {
    id: "tile-1",
    title: "Surface Preparation & Finishing",
    description: "Leveling and smoothing surfaces; mixing adhesive/mortar correctly; cleaning surfaces; making sure substrate is appropriate.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["surface", "preparation", "finishing", "leveling", "adhesive", "mortar", "tile"]
  },
  {
    id: "tile-2",
    title: "Tiling Corners",
    description: "Proper installation at corners: ensuring internal corners (inside corners) and external corners are neat.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["tiling", "corners", "installation", "internal", "external", "tile"]
  },
  {
    id: "tile-3",
    title: "Installing Tiles on Curved Surfaces",
    description: "Laying ceramic, porcelain, or natural stone tiles on indoor and outdoor floors with proper leveling and alignment.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["tiles", "curved", "surfaces", "ceramic", "porcelain", "stone", "installation"]
  },
  {
    id: "tile-4",
    title: "Tile Repair / Maintenance",
    description: "Replacing cracked, chipped, or misaligned tiles while ensuring consistent color and pattern.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["tile", "repair", "maintenance", "cracked", "chipped", "replacement"]
  },
  {
    id: "tile-5",
    title: "Wall Tiling",
    description: "Installing wall tiles in kitchens, bathrooms, and other interior/exterior walls for protection and aesthetics.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["wall", "tiling", "kitchen", "bathroom", "installation", "tile", "interior"]
  },
  {
    id: "tile-6",
    title: "Tile Installation on Floors",
    description: "Working on curved or irregular surfaces (e.g. rounded pillars, curved walls or niches).",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["tile", "installation", "floors", "curved", "irregular", "surfaces"]
  },
  {
    id: "tile-7",
    title: "Grouting",
    description: "Applying grout, sealants, and polishing tiles to enhance durability and appearance.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["grouting", "grout", "sealant", "polishing", "tile", "durability"]
  }
];

// Search function
export const searchServices = (query: string): ServiceItem[] => {
  if (!query.trim()) {
    return [];
  }

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  return allServices.filter(service => {
    const searchableText = [
      service.title,
      service.description,
      service.category,
      ...service.keywords
    ].join(' ').toLowerCase();

    return searchTerms.every(term => 
      searchableText.includes(term)
    );
  });
};

// Get services by category
export const getServicesByCategory = (category: string): ServiceItem[] => {
  return allServices.filter(service => 
    service.category.toLowerCase() === category.toLowerCase()
  );
};

// Get all categories
export const getAllCategories = (): string[] => {
  return [...new Set(allServices.map(service => service.category))];
};