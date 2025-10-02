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
    title: "Wiring & Connections",
    description: "Exposed or faulty wiring, frequent short circuits, tripped breakers, loose outlets or switches, flickering lights, sparking connections, overheating wires, and unsafe electrical joints.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["wiring", "connections", "electrical", "circuits", "outlets", "switches", "lights", "sparking"]
  },
  {
    id: "electrical-2",
    title: "Fixture Installation",
    description: "Installation of light fixtures, ceiling fans, outlets, switches, and circuit breakers; fixing misaligned or malfunctioning fixtures; ensuring proper grounding and safe operation.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["fixture", "installation", "lights", "ceiling fans", "outlets", "switches", "electrical"]
  },
  {
    id: "electrical-3",
    title: "Circuit & Breaker Repair",
    description: "Power outages in certain areas, breaker tripping frequently, overloaded circuits, burnt smells near panels, buzzing sounds, faulty breakers needing replacement, or fuse box upgrades.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["circuit", "breaker", "power", "electrical", "fuse box", "panel"]
  },
  {
    id: "electrical-4",
    title: "Appliance Wiring & Repair",
    description: "Appliances not powering on, faulty or damaged cords, incorrect wiring setups, sparks when plugged in, grounding issues, or need for proper installation and repair of electrical appliances.",
    category: "Electrical",
    categoryRoute: "/pages/electrical",
    keywords: ["appliance", "wiring", "repair", "electrical", "cords", "grounding"]
  },

  // Plumbing Services
  {
    id: "plumbing-1",
    title: "Pipe Fitting & Leak Repair",
    description: "Leaking or burst pipes, low water pressure, clogged pipelines, rusted or corroded pipes, improper pipe connections, water supply interruptions, dripping joints, noisy water flow.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["pipe", "leak", "plumbing", "water", "pressure", "clogged", "burst pipes"]
  },
  {
    id: "plumbing-2",
    title: "Fixture Installation",
    description: "Leaking or dripping faucets, broken or loose toilets, clogged sinks or toilets, misaligned or unstable fixtures, poor drainage, faulty flush mechanisms, replacement of old or damaged fixtures.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["fixture", "faucets", "toilets", "sinks", "plumbing", "drainage", "installation"]
  },
  {
    id: "plumbing-3",
    title: "Shower & Water Heater Installation",
    description: "Weak or inconsistent water flow, no hot water, faulty water heater connection, fluctuating water temperature, leaking showerheads, improper shower setup, electrical or plumbing issues affecting heaters.",
    category: "Plumbing",
    categoryRoute: "/pages/plumbing",
    keywords: ["shower", "water heater", "hot water", "temperature", "plumbing", "installation"]
  },

  // Carpentry Services
  {
    id: "carpentry-1",
    title: "Furniture Repair & Assembly",
    description: "Broken or wobbly furniture, loose joints, damaged wood surfaces, furniture assembly, cabinet door alignment, drawer repairs, and restoration of wooden items.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["furniture", "repair", "assembly", "wood", "cabinet", "drawer", "carpentry"]
  },
  {
    id: "carpentry-2",
    title: "Custom Woodwork",
    description: "Custom shelving, built-in storage, wooden partitions, custom furniture design, wood paneling, decorative woodwork, and bespoke carpentry solutions.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["custom", "woodwork", "shelving", "storage", "furniture", "carpentry", "wood"]
  },
  {
    id: "carpentry-3",
    title: "Door & Window Installation",
    description: "Installing new doors and windows, fixing stuck or misaligned doors, window frame repairs, weather stripping, lock installation, and hardware replacement.",
    category: "Carpentry",
    categoryRoute: "/pages/carpentry",
    keywords: ["door", "window", "installation", "frame", "lock", "hardware", "carpentry"]
  },

  // Appliances Services
  {
    id: "appliances-1",
    title: "Refrigerator Repair",
    description: "Refrigerator not cooling, freezer issues, strange noises, water leakage, ice maker problems, temperature fluctuations, and compressor repair.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["refrigerator", "cooling", "freezer", "ice maker", "appliance", "repair"]
  },
  {
    id: "appliances-2",
    title: "Washing Machine Repair",
    description: "Washing machine not draining, excessive vibration, not spinning, water leakage, electrical issues, drum problems, and installation services.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["washing machine", "draining", "spinning", "vibration", "appliance", "repair"]
  },
  {
    id: "appliances-3",
    title: "Kitchen Appliance Repair",
    description: "Microwave, oven, dishwasher, and other kitchen appliance repairs. Issues with heating, electrical connections, and general appliance maintenance.",
    category: "Appliances",
    categoryRoute: "/pages/appliances",
    keywords: ["kitchen", "microwave", "oven", "dishwasher", "appliance", "repair", "heating"]
  },

  // Computer Services
  {
    id: "computer-1",
    title: "Hardware Repair",
    description: "Computer not turning on, hardware upgrades, component replacement, motherboard issues, RAM problems, hard drive repair, and power supply issues.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["hardware", "computer", "repair", "motherboard", "RAM", "hard drive", "power supply"]
  },
  {
    id: "computer-2",
    title: "Software & Virus Removal",
    description: "Operating system issues, virus removal, software installation, system optimization, data recovery, and computer maintenance services.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["software", "virus", "operating system", "computer", "data recovery", "maintenance"]
  },
  {
    id: "computer-3",
    title: "Network & Internet Setup",
    description: "WiFi setup, network configuration, internet connectivity issues, router installation, network security, and troubleshooting connection problems.",
    category: "Computer",
    categoryRoute: "/pages/computer",
    keywords: ["network", "internet", "wifi", "router", "connectivity", "computer", "setup"]
  },

  // Aircon Services
  {
    id: "aircon-1",
    title: "AC Repair & Maintenance",
    description: "Air conditioning not cooling, refrigerant leaks, compressor issues, filter replacement, general AC maintenance, and energy efficiency improvements.",
    category: "Aircon",
    categoryRoute: "/pages/aircon",
    keywords: ["aircon", "AC", "cooling", "refrigerant", "compressor", "filter", "maintenance"]
  },
  {
    id: "aircon-2",
    title: "AC Installation",
    description: "New air conditioning unit installation, ducting work, electrical connections, proper sizing consultation, and post-installation testing.",
    category: "Aircon",
    categoryRoute: "/pages/aircon",
    keywords: ["aircon", "AC", "installation", "ducting", "electrical", "unit"]
  },

  // Painting Services
  {
    id: "painting-1",
    title: "Interior Painting",
    description: "Wall painting, ceiling painting, room makeovers, color consultation, surface preparation, primer application, and interior design painting.",
    category: "Painting",
    categoryRoute: "/pages/painting",
    keywords: ["interior", "painting", "wall", "ceiling", "room", "color", "design"]
  },
  {
    id: "painting-2",
    title: "Exterior Painting",
    description: "House exterior painting, fence painting, weather protection, surface cleaning, primer application, and long-lasting paint solutions.",
    category: "Painting",
    categoryRoute: "/pages/painting",
    keywords: ["exterior", "painting", "house", "fence", "weather", "protection"]
  },

  // Welding Services
  {
    id: "welding-1",
    title: "Metal Fabrication",
    description: "Custom metal work, steel fabrication, iron gates, metal furniture, structural welding, and decorative metalwork.",
    category: "Welding",
    categoryRoute: "/pages/welding",
    keywords: ["metal", "fabrication", "steel", "iron", "gates", "welding", "structural"]
  },
  {
    id: "welding-2",
    title: "Repair Welding",
    description: "Metal repair work, broken metal fixtures, automotive welding, machinery repair, and emergency welding services.",
    category: "Welding",
    categoryRoute: "/pages/welding",
    keywords: ["repair", "welding", "metal", "automotive", "machinery", "fixtures"]
  },

  // Masonry Services
  {
    id: "masonry-1",
    title: "Wall Construction",
    description: "Brick work, concrete blocks, stone walls, retaining walls, foundation work, and structural masonry construction.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["wall", "construction", "brick", "concrete", "stone", "foundation", "masonry"]
  },
  {
    id: "masonry-2",
    title: "Repair & Restoration",
    description: "Crack repair, mortar replacement, brick restoration, waterproofing, and general masonry maintenance.",
    category: "Masonry",
    categoryRoute: "/pages/masonry",
    keywords: ["repair", "restoration", "crack", "mortar", "brick", "waterproofing", "masonry"]
  },

  // Tile Services
  {
    id: "tile-1",
    title: "Tile Installation",
    description: "Floor tiling, wall tiling, bathroom tiles, kitchen backsplash, ceramic and porcelain tile installation, and grouting services.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["tile", "installation", "floor", "wall", "bathroom", "kitchen", "ceramic", "porcelain"]
  },
  {
    id: "tile-2",
    title: "Tile Repair & Replacement",
    description: "Cracked tile replacement, re-grouting, loose tile fixing, water damage repair, and tile restoration services.",
    category: "Tile Setting",
    categoryRoute: "/pages/tile",
    keywords: ["tile", "repair", "replacement", "grout", "cracked", "water damage", "restoration"]
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