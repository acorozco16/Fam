/**
 * Orlando Family Travel Intelligence
 * The ultimate family destination - Disney World capital
 */

export interface OrlandoRecommendation {
  attractions: Array<{
    name: string;
    category: 'theme-park' | 'water-park' | 'entertainment' | 'nature' | 'shopping' | 'museum' | 'sports';
    location: string;
    bestForAges: string;
    timeNeeded: string;
    cost: string;
    insider: string[];
    avoid: string[];
  }>;
  restaurants: Array<{
    name: string;
    cuisine: string;
    location: string;
    neighborhood: string;
    priceLevel: 'budget' | 'mid-range' | 'expensive' | 'luxury';
    kidFriendly: number; // 1-10
    reservationDifficulty: 'easy' | 'moderate' | 'hard' | 'impossible';
    mustTry: string[];
    insider: string[];
  }>;
  neighborhoods: Array<{
    name: string;
    vibe: string;
    bestFor: string[];
    attractions: string[];
    restaurants: string[];
    hotels: string[];
    transport: string[];
  }>;
  itineraries: Array<{
    duration: string;
    theme: string;
    pace: 'relaxed' | 'moderate' | 'packed';
    days: Array<{
      day: number;
      focus: string;
      morning: string[];
      afternoon: string[];
      evening: string[];
      meals: string[];
      tips: string[];
    }>;
  }>;
  realTimeSuggestions: Array<{
    condition: string;
    suggestions: string[];
  }>;
  dayTrips: Array<{
    destination: string;
    distance: string;
    duration: string;
    highlights: string[];
    bestFor: string[];
    avoid: string[];
  }>;
  seasonal: Array<{
    season: string;
    months: string[];
    events: string[];
    weather: string;
    crowdLevel: 'low' | 'moderate' | 'high' | 'insane';
    pros: string[];
    cons: string[];
  }>;
  rainyDay: Array<{
    activity: string;
    location: string;
    duration: string;
    cost: string;
    ages: string;
    why: string;
  }>;
  hotels: Array<{
    name: string;
    category: 'value' | 'moderate' | 'deluxe' | 'villa';
    location: string;
    familyPerks: string[];
    pools: string[];
    dining: string[];
    transport: string[];
  }>;
}

export const ORLANDO_INTELLIGENCE: OrlandoRecommendation = {
  attractions: [
    // Theme Parks
    {
      name: "Magic Kingdom",
      category: "theme-park",
      location: "Walt Disney World",
      bestForAges: "2-12 years (but all ages love it)",
      timeNeeded: "1-2 full days",
      cost: "$109-189/day per person",
      insider: [
        "Rope drop strategy: Arrive 30 mins before opening, head straight to Seven Dwarfs or Space Mountain",
        "Take afternoon break 1-4pm when crowds peak and kids are tired",
        "Mobile order lunch to skip lines",
        "Fireworks viewing: Main Street or hub grass areas 30 mins early",
        "Genie+ essential here - book at 7am day of visit"
      ],
      avoid: [
        "Stitch's Great Escape (closed but scary for young kids)",
        "Swiss Family Treehouse (lots of stairs, little payoff)",
        "Lunch at peak times (11:30am-1:30pm) without mobile order"
      ]
    },
    {
      name: "EPCOT",
      category: "theme-park",
      location: "Walt Disney World",
      bestForAges: "8+ years (educational focus)",
      timeNeeded: "1 full day",
      cost: "$109-189/day per person",
      insider: [
        "Start with Frozen Ever After at rope drop",
        "World Showcase opens at 11am - plan accordingly",
        "Kids love passport stamps at each country",
        "Festival food booths are great for adventurous eaters",
        "Remy's Ratatouille Adventure uses virtual queue"
      ],
      avoid: [
        "Walking entire World Showcase with tired kids",
        "Mission: SPACE orange (intense for many)",
        "Skipping hydration on hot days"
      ]
    },
    {
      name: "Hollywood Studios",
      category: "theme-park",
      location: "Walt Disney World",
      bestForAges: "6+ years (Star Wars heavy)",
      timeNeeded: "1 full day",
      cost: "$109-189/day per person",
      insider: [
        "Rise of the Resistance: Buy Individual Lightning Lane at 7am",
        "Toy Story Land gets hot - go early or late",
        "Mickey's Runaway Railway great for all ages",
        "Shows provide AC breaks: Frozen, Indiana Jones, Beauty & Beast",
        "Star Wars fans: budget 3+ hours for Galaxy's Edge"
      ],
      avoid: [
        "Midday in Toy Story Land (no shade)",
        "Tower of Terror with kids under 8",
        "Rock 'n' Roller Coaster if motion sensitive"
      ]
    },
    {
      name: "Animal Kingdom",
      category: "theme-park",
      location: "Walt Disney World",
      bestForAges: "4+ years (lots of walking)",
      timeNeeded: "1 full day",
      cost: "$109-189/day per person",
      insider: [
        "Flight of Passage: Rope drop or Individual Lightning Lane",
        "Safari first thing - animals most active",
        "Expedition Everest single rider line saves time",
        "Festival of the Lion King is must-see",
        "Park closes earliest - plan accordingly"
      ],
      avoid: [
        "Dinosaur with young kids (very scary)",
        "Kali River Rapids without ponchos",
        "Missing the trails - they're beautiful"
      ]
    },
    {
      name: "Universal Studios Florida",
      category: "theme-park",
      location: "Universal Orlando Resort",
      bestForAges: "8+ years",
      timeNeeded: "1 full day",
      cost: "$119-154/day per person",
      insider: [
        "Express Pass worth it during peak times",
        "Diagon Alley is incredible - budget 2+ hours",
        "E.T. Adventure classic for all ages",
        "Single rider lines: Gringotts, Mummy, MIB",
        "Horror Make-Up Show surprisingly family-friendly"
      ],
      avoid: [
        "Hollywood Rip Ride Rockit (very rough)",
        "Most rides if kids under 48 inches",
        "Assuming it's just for older kids"
      ]
    },
    {
      name: "Islands of Adventure",
      category: "theme-park",
      location: "Universal Orlando Resort", 
      bestForAges: "8+ years (height restrictions)",
      timeNeeded: "1 full day",
      cost: "$119-154/day per person",
      insider: [
        "Hagrid's Motorbike: Rope drop essential",
        "Velocicoaster: Best coaster in Orlando",
        "Seuss Landing perfect for younger kids",
        "Spider-Man still holds up after 20+ years",
        "Water rides will soak you - bring ponchos"
      ],
      avoid: [
        "Assuming small kids can't enjoy (Seuss Landing!)",
        "Pteranodon Flyers (terrible capacity)",
        "Dudley Do-Right without change of clothes"
      ]
    },
    {
      name: "LEGOLAND Florida",
      category: "theme-park",
      location: "Winter Haven (45 mins from Orlando)",
      bestForAges: "2-12 years",
      timeNeeded: "1 full day",
      cost: "$84-109/day per person",
      insider: [
        "Perfect for kids intimidated by Disney crowds",
        "Water park included with admission",
        "Miniland USA is incredible",
        "Driving school huge hit with kids",
        "Much more relaxed pace than Disney"
      ],
      avoid: [
        "Going with only teenagers",
        "Weekend crowds (locals love it)",
        "Forgetting swimsuits for water park"
      ]
    },
    {
      name: "SeaWorld Orlando",
      category: "theme-park",
      location: "International Drive area",
      bestForAges: "5+ years",
      timeNeeded: "1 full day",
      cost: "$79-109/day per person",
      insider: [
        "Orca show still spectacular",
        "Mako, Kraken, Manta: world-class coasters",
        "Quick Queue worth it for coasters",
        "Antarctica exhibit great for hot days",
        "Educational programs excellent"
      ],
      avoid: [
        "Sitting in splash zones unprepared",
        "Missing animal feeding times",
        "Assuming it's just shows"
      ]
    },
    
    // Water Parks
    {
      name: "Volcano Bay",
      category: "water-park",
      location: "Universal Orlando Resort",
      bestForAges: "6+ years",
      timeNeeded: "1 full day",
      cost: "$80-90/day per person",
      insider: [
        "TapuTapu wristband eliminates physical lines",
        "Arrive at opening for shortest waits",
        "Premium seating worth it for families",
        "Krakatau Aqua Coaster is unique",
        "Wave pool gets very crowded afternoons"
      ],
      avoid: [
        "Going without water shoes",
        "Leaving valuables in regular lockers",
        "Underestimating walking distances"
      ]
    },
    {
      name: "Blizzard Beach",
      category: "water-park",
      location: "Walt Disney World",
      bestForAges: "5+ years",
      timeNeeded: "4-6 hours",
      cost: "$69-79/day per person",
      insider: [
        "Summit Plummet: 120ft drop, not for faint-hearted",
        "Teamboat Springs: family raft ride",
        "Cross Country Creek: relaxing lazy river",
        "Ski patrol training camp great for tweens",
        "Arrive early for chair spots"
      ],
      avoid: [
        "Going on very hot days without reserved seating",
        "Summit Plummet with fear of heights",
        "Assuming little kids can't enjoy"
      ]
    },
    {
      name: "Typhoon Lagoon",
      category: "water-park",
      location: "Walt Disney World",
      bestForAges: "3+ years",
      timeNeeded: "4-6 hours",
      cost: "$69-79/day per person",
      insider: [
        "Surf pool has real waves - surfing lessons available",
        "Crush 'n' Gusher: water coaster",
        "Ketchakiddee Creek perfect for toddlers",
        "Lazy river most relaxing in Disney",
        "Shark Reef snorkeling unique experience"
      ],
      avoid: [
        "Wave pool with non-swimmers",
        "Missing the surfing demonstrations",
        "Going without reef-safe sunscreen"
      ]
    },
    {
      name: "Aquatica",
      category: "water-park",
      location: "Near SeaWorld",
      bestForAges: "5+ years",
      timeNeeded: "5-6 hours",
      cost: "$59-69/day per person",
      insider: [
        "Dolphin Plunge: slide through dolphin habitat",
        "Ihu's Breakaway Falls: trapdoor drops",
        "Two lazy rivers - one fast, one slow",
        "Less crowded than Disney water parks",
        "Cabana rentals good value"
      ],
      avoid: [
        "Forgetting to watch feeding times",
        "Missing animal encounters",
        "Going on coldish days (under 75°F)"
      ]
    },
    
    // Entertainment & Shows
    {
      name: "Disney Springs",
      category: "entertainment",
      location: "Walt Disney World",
      bestForAges: "All ages",
      timeNeeded: "3-4 hours",
      cost: "Free (shops/dining extra)",
      insider: [
        "World of Disney: largest Disney store on earth",
        "LEGO Store has play areas for kids",
        "Amphicars unique boat/car ride experience",
        "Live music most evenings",
        "Parking free after 6pm"
      ],
      avoid: [
        "Weekend evenings (very crowded)",
        "Thinking it's just shopping",
        "Missing the free entertainment"
      ]
    },
    {
      name: "Icon Park",
      category: "entertainment",
      location: "International Drive",
      bestForAges: "8+ years",
      timeNeeded: "2-3 hours",
      cost: "$20-40 per attraction",
      insider: [
        "The Wheel: 400ft observation wheel",
        "Madame Tussauds + SEA LIFE combo ticket",
        "Multiple restaurants with wheel views",
        "Evening visits for lit-up views",
        "Parking can be validated"
      ],
      avoid: [
        "Going in bad weather",
        "Missing sunset from The Wheel",
        "Paying for individual attractions vs combo"
      ]
    },
    {
      name: "Medieval Times",
      category: "entertainment",
      location: "Kissimmee",
      bestForAges: "5+ years",
      timeNeeded: "2.5 hours",
      cost: "$65-75 per person",
      insider: [
        "Knights compete while you feast",
        "Eat with your hands (medieval style)",
        "Arrive 45 mins early for best experience",
        "Birthday celebrations are special",
        "Royalty upgrade worth it for kids"
      ],
      avoid: [
        "Going with picky eaters",
        "Missing the pre-show",
        "Sitting in back rows with small kids"
      ]
    },
    {
      name: "Cirque du Soleil: Drawn to Life",
      category: "entertainment",
      location: "Disney Springs",
      bestForAges: "8+ years",
      timeNeeded: "2 hours",
      cost: "$75-145 per person",
      insider: [
        "Disney collaboration with Cirque",
        "Animation comes to life theme",
        "Best seats: center orchestra",
        "Pre-show starts 30 mins before",
        "Parking validated at Disney Springs"
      ],
      avoid: [
        "Taking very young children",
        "Far side seats (limited view)",
        "Missing pre-show activities"
      ]
    },
    
    // Nature & Wildlife
    {
      name: "Gatorland",
      category: "nature",
      location: "South Orlando",
      bestForAges: "5+ years",
      timeNeeded: "3-4 hours",
      cost: "$29-39 per person",
      insider: [
        "Screamin' Gator Zip Line over alligators",
        "Gator feeding shows throughout day",
        "Trainer for a Day program available",
        "Much less crowded than theme parks",
        "Real Florida wildlife experience"
      ],
      avoid: [
        "Missing the gator jumparoo show",
        "Hot midday hours in summer",
        "Assuming it's just a roadside attraction"
      ]
    },
    {
      name: "Central Florida Zoo",
      category: "nature",
      location: "Sanford (30 mins north)",
      bestForAges: "2-12 years",
      timeNeeded: "3-4 hours",
      cost: "$19-24 per person",
      insider: [
        "ZOOm Air Adventure (aerial course)",
        "Giraffe feeding experiences",
        "Train ride around zoo",
        "Splash pad for cooling off",
        "Much calmer than theme parks"
      ],
      avoid: [
        "Midday in summer heat",
        "Missing animal encounter times",
        "Rushing through too quickly"
      ]
    },
    {
      name: "Wild Florida Airboats",
      category: "nature",
      location: "Kenansville (45 mins south)",
      bestForAges: "5+ years",
      timeNeeded: "2-3 hours",
      cost: "$30-65 per person",
      insider: [
        "30-min or 1-hour airboat tours",
        "Gator park included with tour",
        "Animal encounters available",
        "Real Everglades experience",
        "Less touristy than other airboat rides"
      ],
      avoid: [
        "Going without ear protection",
        "Missing the gator feeding",
        "Forgetting bug spray"
      ]
    },
    {
      name: "Wekiwa Springs State Park",
      category: "nature",
      location: "Apopka (30 mins north)",
      bestForAges: "6+ years",
      timeNeeded: "3-5 hours",
      cost: "$6 per vehicle",
      insider: [
        "Natural spring stays 72°F year-round",
        "Canoe/kayak rentals available",
        "Great hiking trails",
        "Popular weekend swimming spot",
        "Real Florida nature escape"
      ],
      avoid: [
        "Weekends without early arrival",
        "Forgetting water shoes",
        "Missing manatees in winter"
      ]
    },
    
    // Museums & Education
    {
      name: "Kennedy Space Center",
      category: "museum",
      location: "Cape Canaveral (1 hour east)",
      bestForAges: "8+ years",
      timeNeeded: "Full day",
      cost: "$57-75 per person",
      insider: [
        "Real Space Shuttle Atlantis",
        "Astronaut encounter experiences",
        "IMAX films included",
        "Bus tour to launch pads",
        "Check for actual launch dates"
      ],
      avoid: [
        "Rushing through exhibits",
        "Missing the bus tour",
        "Going with kids under 6"
      ]
    },
    {
      name: "Orlando Science Center",
      category: "museum",
      location: "Downtown Orlando",
      bestForAges: "4-14 years",
      timeNeeded: "3-4 hours",
      cost: "$21-29 per person",
      insider: [
        "Four floors of hands-on exhibits",
        "Live science demonstrations",
        "Planetarium shows included",
        "KidsTown for ages 7 and under",
        "Great rainy day option"
      ],
      avoid: [
        "Missing live science shows",
        "Skipping the observatory",
        "Going during field trip hours"
      ]
    },
    {
      name: "Crayola Experience",
      category: "museum",
      location: "Florida Mall",
      bestForAges: "3-10 years",
      timeNeeded: "2-3 hours",
      cost: "$24-29 per person",
      insider: [
        "25 hands-on attractions",
        "Make your own crayon",
        "Indoor playground when hot",
        "Located in mall (food options)",
        "Annual passes available"
      ],
      avoid: [
        "Going with only teenagers",
        "Missing crayon making demo",
        "Wearing nice clothes"
      ]
    },
    {
      name: "WonderWorks",
      category: "museum",
      location: "International Drive",
      bestForAges: "8+ years",
      timeNeeded: "2-3 hours",
      cost: "$33-39 per person",
      insider: [
        "Upside-down building you can't miss",
        "100+ interactive exhibits",
        "Ropes course and laser tag",
        "Educational but fun focus",
        "Combo tickets with other I-Drive attractions"
      ],
      avoid: [
        "Going if prone to motion sickness",
        "Missing the basement exhibits",
        "Paying full price (look for coupons)"
      ]
    },
    
    // Shopping
    {
      name: "Orlando Premium Outlets",
      category: "shopping",
      location: "International Drive & Vineland",
      bestForAges: "10+ years",
      timeNeeded: "2-4 hours",
      cost: "Free (shopping extra)",
      insider: [
        "Two locations: Vineland (nicer) and I-Drive",
        "Disney Character Warehouse for discounted merch",
        "VIP Shopper Club for extra discounts",
        "Covered walkways at Vineland location",
        "Food court and restaurants on-site"
      ],
      avoid: [
        "Weekend crowds",
        "International Drive traffic",
        "Shopping without comfortable shoes"
      ]
    },
    {
      name: "Mall at Millenia",
      category: "shopping",
      location: "South Orlando",
      bestForAges: "12+ years",
      timeNeeded: "2-3 hours",
      cost: "Free (shopping extra)",
      insider: [
        "High-end shopping: Apple, Microsoft stores",
        "Cheesecake Factory, P.F. Chang's dining",
        "Indoor mall (AC relief)",
        "Less touristy than outlets",
        "Good teen hangout spot"
      ],
      avoid: [
        "Going just for Disney merchandise",
        "Missing the dining options",
        "Holiday season crowds"
      ]
    },
    
    // Sports & Active
    {
      name: "TopGolf Orlando",
      category: "sports",
      location: "Multiple locations",
      bestForAges: "8+ years",
      timeNeeded: "2-3 hours",
      cost: "$30-60 per hour per bay",
      insider: [
        "Climate-controlled bays",
        "Kids play free Sunday mornings",
        "Full menu and bar service",
        "No golf experience needed",
        "Reserve bays in advance"
      ],
      avoid: [
        "Prime time without reservation",
        "Going with kids under 8",
        "Missing happy hour pricing"
      ]
    },
    {
      name: "iFLY Indoor Skydiving",
      category: "sports",
      location: "International Drive",
      bestForAges: "4+ years",
      timeNeeded: "1-2 hours",
      cost: "$69-89 per person",
      insider: [
        "Real skydiving experience indoors",
        "Kids as young as 3 can fly",
        "Video packages worth it",
        "Book first flight of day",
        "Watch others for free"
      ],
      avoid: [
        "Loose jewelry or items",
        "Going right after eating",
        "Missing the training video"
      ]
    },
    {
      name: "Orlando Tree Trek",
      category: "sports",
      location: "Kissimmee",
      bestForAges: "7+ years",
      timeNeeded: "2-3 hours",
      cost: "$35-55 per person",
      insider: [
        "Aerial obstacle courses in trees",
        "Multiple difficulty levels",
        "Zip lines included",
        "Great for active families",
        "Less crowded than theme parks"
      ],
      avoid: [
        "Going in rain",
        "Wearing flip-flops",
        "Underestimating physical demands"
      ]
    }
  ],

  restaurants: [
    // Theme Park Dining
    {
      name: "Be Our Guest",
      cuisine: "French-inspired",
      location: "Magic Kingdom",
      neighborhood: "Fantasyland",
      priceLevel: "expensive",
      kidFriendly: 9,
      reservationDifficulty: "impossible",
      mustTry: ["Grey Stuff dessert", "French Onion Soup", "Filet de Boeuf"],
      insider: [
        "Lunch is quick-service (easier to get)",
        "Dinner is signature dining experience",
        "Beast meets guests at dinner only",
        "West Wing room most atmospheric"
      ]
    },
    {
      name: "Chef Mickey's",
      cuisine: "American Buffet",
      location: "Contemporary Resort",
      neighborhood: "Magic Kingdom Resort Area",
      priceLevel: "expensive",
      kidFriendly: 10,
      reservationDifficulty: "impossible",
      mustTry: ["Mickey Waffles", "Breakfast Pizza", "Character interactions"],
      insider: [
        "Breakfast easier to book than dinner",
        "Characters: Mickey, Minnie, Donald, Goofy, Pluto",
        "Request window table for monorail views",
        "Bring autograph books and fat markers"
      ]
    },
    {
      name: "Ohana",
      cuisine: "Polynesian",
      location: "Polynesian Resort",
      neighborhood: "Magic Kingdom Resort Area",
      priceLevel: "expensive",
      kidFriendly: 9,
      reservationDifficulty: "impossible",
      mustTry: ["Ohana Bread Pudding", "Grilled Shrimp", "Pot Stickers"],
      insider: [
        "All-you-care-to-eat family style",
        "Kids love coconut races",
        "Request window for fireworks views",
        "Breakfast has Lilo & Stitch characters"
      ]
    },
    {
      name: "Tusker House",
      cuisine: "African-inspired Buffet",
      location: "Animal Kingdom",
      neighborhood: "Africa",
      priceLevel: "expensive",
      kidFriendly: 8,
      reservationDifficulty: "moderate",
      mustTry: ["Curry Chicken", "Spit-Roasted Meats", "Zebra Domes dessert"],
      insider: [
        "Donald's Safari character meal",
        "Less crowded than other character dining",
        "Breakfast before park opens available",
        "Most adventurous Disney buffet"
      ]
    },
    {
      name: "Space 220",
      cuisine: "Contemporary American",
      location: "EPCOT",
      neighborhood: "Future World",
      priceLevel: "luxury",
      kidFriendly: 8,
      reservationDifficulty: "hard",
      mustTry: ["Blue Moon Cauliflower", "Duck Breast", "Chocolate Cheesecake"],
      insider: [
        "Simulated space elevator experience",
        "Prix fixe menu only",
        "Lunch cheaper than dinner",
        "Kids menu more flexible"
      ]
    },
    {
      name: "Sci-Fi Dine-In",
      cuisine: "American",
      location: "Hollywood Studios",
      neighborhood: "Commissary Lane",
      priceLevel: "mid-range",
      kidFriendly: 10,
      reservationDifficulty: "moderate",
      mustTry: ["Milkshakes", "Drive-In BBQ Burger", "Fried Pickles"],
      insider: [
        "Eat in cars watching B-movies",
        "Dark atmosphere (good for naps)",
        "Food average but experience great",
        "Request car front row"
      ]
    },
    {
      name: "Mythos",
      cuisine: "Global Fusion",
      location: "Islands of Adventure",
      neighborhood: "Lost Continent",
      priceLevel: "mid-range",
      kidFriendly: 7,
      reservationDifficulty: "easy",
      mustTry: ["Pad Thai", "Mezze Platter", "Chocolate Banana Gooey Cake"],
      insider: [
        "Best theme park restaurant (awards)",
        "Cave-like atmosphere",
        "Less crowded than Harry Potter areas",
        "Great value for quality"
      ]
    },
    {
      name: "Three Broomsticks",
      cuisine: "British Pub",
      location: "Islands of Adventure",
      neighborhood: "Hogsmeade",
      priceLevel: "mid-range",
      kidFriendly: 9,
      reservationDifficulty: "easy",
      mustTry: ["Fish and Chips", "Butterbeer", "Shepherd's Pie"],
      insider: [
        "Mobile order to skip lines",
        "Butterbeer comes hot, cold, or frozen",
        "Great Hall atmosphere upstairs",
        "Breakfast less crowded"
      ]
    },
    
    // Disney Springs
    {
      name: "T-REX Cafe",
      cuisine: "American",
      location: "Disney Springs",
      neighborhood: "Marketplace",
      priceLevel: "mid-range",
      kidFriendly: 10,
      reservationDifficulty: "moderate",
      mustTry: ["Prehistoric Pasta", "Meteor Bites", "Chocolate Extinction"],
      insider: [
        "Animatronic dinosaurs every 15 mins",
        "Ice cave room coolest (literally)",
        "Build-A-Dino workshop attached",
        "Very loud - sensory consideration"
      ]
    },
    {
      name: "Rainforest Cafe",
      cuisine: "American",
      location: "Disney Springs/Animal Kingdom",
      neighborhood: "Marketplace/Park Entrance",
      priceLevel: "mid-range",
      kidFriendly: 10,
      reservationDifficulty: "easy",
      mustTry: ["Volcano Dessert", "Coconut Shrimp", "Safari Fries"],
      insider: [
        "Thunderstorms every 30 minutes",
        "Animal Kingdom location outside park",
        "Shop doesn't require dining",
        "Another loud environment option"
      ]
    },
    {
      name: "Biergarten",
      cuisine: "German Buffet",
      location: "EPCOT",
      neighborhood: "Germany Pavilion",
      priceLevel: "expensive",
      kidFriendly: 7,
      reservationDifficulty: "moderate",
      mustTry: ["Bratwurst", "Schnitzel", "Apple Strudel", "Pretzel Bread"],
      insider: [
        "Live oompah band entertainment",
        "Communal seating (meet other families)",
        "All-you-care-to-eat buffet",
        "Kids dance with band"
      ]
    },
    
    // International Drive
    {
      name: "Cafe Tu Tu Tango",
      cuisine: "International Tapas",
      location: "International Drive",
      neighborhood: "I-Drive",
      priceLevel: "mid-range",
      kidFriendly: 8,
      reservationDifficulty: "easy",
      mustTry: ["Guava BBQ Ribs", "Cajun Chicken Egg Rolls", "Chocolate Lava Cake"],
      insider: [
        "Artists paint while you dine",
        "Small plates perfect for sharing",
        "Great for picky eaters (variety)",
        "Happy hour 4-7pm daily"
      ]
    },
    {
      name: "Yard House",
      cuisine: "American Fusion",
      location: "International Drive",
      neighborhood: "I-Drive",
      priceLevel: "mid-range",
      kidFriendly: 8,
      reservationDifficulty: "easy",
      mustTry: ["Poke Nachos", "Street Tacos", "Mini Burgers"],
      insider: [
        "World's largest selection of draft beer",
        "Great kids menu options",
        "Half-price appetizers late night",
        "Located at Icon Park"
      ]
    },
    
    // Local Favorites
    {
      name: "4 Rivers Smokehouse",
      cuisine: "BBQ",
      location: "Multiple locations",
      neighborhood: "Various",
      priceLevel: "budget",
      kidFriendly: 9,
      reservationDifficulty: "easy",
      mustTry: ["Brisket", "Burnt Ends", "Fried Pickles", "Bread Pudding"],
      insider: [
        "Local chain started in Orlando",
        "Kids eat free Mondays",
        "Six Shooter portion perfect for families",
        "Sweet Shop bakery items amazing"
      ]
    },
    {
      name: "Se7en Bites",
      cuisine: "Southern Comfort",
      location: "Milk District",
      neighborhood: "Downtown Orlando",
      priceLevel: "budget",
      kidFriendly: 7,
      reservationDifficulty: "easy",
      mustTry: ["Chicken & Biscuit", "Mac & Cheese", "Daily Pie Selection"],
      insider: [
        "Breakfast/lunch only (closes 5pm)",
        "Oprah called it best Southern food",
        "Small space, go off-peak",
        "Everything made from scratch"
      ]
    },
    {
      name: "Domu",
      cuisine: "Ramen",
      location: "Multiple locations",
      neighborhood: "East End Market/Dr. Phillips",
      priceLevel: "budget",
      kidFriendly: 7,
      reservationDifficulty: "moderate",
      mustTry: ["Tonkotsu Ramen", "Wings", "Bao Buns"],
      insider: [
        "No reservations, expect wait",
        "Kids ramen portions available",
        "East End Market location original",
        "Late night menu after 10pm"
      ]
    },
    {
      name: "The Boathouse",
      cuisine: "Seafood",
      location: "Disney Springs",
      neighborhood: "The Landing",
      priceLevel: "expensive",
      kidFriendly: 8,
      reservationDifficulty: "moderate",
      mustTry: ["Lobster Roll", "Key Lime Pie", "Baked Crab Cake"],
      insider: [
        "Amphicar rides available ($125)",
        "Great views of Disney Springs",
        "Raw bar extensive selection",
        "Dream boat collection to view"
      ]
    },
    {
      name: "Homecomin'",
      cuisine: "Southern",
      location: "Disney Springs",
      neighborhood: "The Landing",
      priceLevel: "mid-range",
      kidFriendly: 8,
      reservationDifficulty: "moderate",
      mustTry: ["Fried Chicken", "Church Lady Deviled Eggs", "Shine Cake"],
      insider: [
        "Chef Art Smith's restaurant",
        "Moonshine cocktails for adults",
        "Kids love the fried chicken",
        "Brunch on weekends"
      ]
    },
    {
      name: "Victoria & Albert's",
      cuisine: "Fine Dining",
      location: "Grand Floridian Resort",
      neighborhood: "Magic Kingdom Resort Area",
      priceLevel: "luxury",
      kidFriendly: 1,
      reservationDifficulty: "hard",
      mustTry: ["Chef's Tasting Menu", "Wine Pairing"],
      insider: [
        "Adults only (no kids)",
        "Dress code enforced",
        "Special occasion destination",
        "Book 60 days in advance"
      ]
    },
    
    // Quick Service Favorites
    {
      name: "Dole Whip",
      cuisine: "Dessert",
      location: "Multiple parks",
      neighborhood: "Various",
      priceLevel: "budget",
      kidFriendly: 10,
      reservationDifficulty: "easy",
      mustTry: ["Classic Pineapple", "Swirl", "Float with Rum (adults)"],
      insider: [
        "Locations: MK, Poly Resort, DS",
        "Mobile order available",
        "Dairy-free option",
        "Instagram famous treat"
      ]
    },
    {
      name: "Casey's Corner",
      cuisine: "Hot Dogs",
      location: "Magic Kingdom",
      neighborhood: "Main Street U.S.A.",
      priceLevel: "budget",
      kidFriendly: 9,
      reservationDifficulty: "easy",
      mustTry: ["Chili Cheese Dog", "Corn Dog Nuggets", "Plaza Ice Cream"],
      insider: [
        "Pianist plays Disney tunes",
        "Mobile order recommended",
        "Great parade viewing spot",
        "Corn dog nuggets kid favorite"
      ]
    },
    {
      name: "Flame Tree Barbecue",
      cuisine: "BBQ",
      location: "Animal Kingdom",
      neighborhood: "Discovery Island",
      priceLevel: "budget",
      kidFriendly: 8,
      reservationDifficulty: "easy",
      mustTry: ["Ribs & Chicken Combo", "Pulled Pork", "Watermelon Salad"],
      insider: [
        "Best quick service in park",
        "Covered seating areas",
        "Find seating near water",
        "Mobile order essential"
      ]
    },
    
    // Character Dining
    {
      name: "Crystal Palace",
      cuisine: "Buffet",
      location: "Magic Kingdom",
      neighborhood: "Main Street U.S.A.",
      priceLevel: "expensive",
      kidFriendly: 10,
      reservationDifficulty: "hard",
      mustTry: ["Puffed French Toast", "Carved Meats", "Sundae Bar"],
      insider: [
        "Winnie the Pooh & Friends",
        "Victorian glass architecture",
        "Less chaotic than Chef Mickey's",
        "Good allergy accommodations"
      ]
    },
    {
      name: "Garden Grill",
      cuisine: "American Family-Style",
      location: "EPCOT",
      neighborhood: "The Land Pavilion",
      priceLevel: "expensive",
      kidFriendly: 9,
      reservationDifficulty: "moderate",
      mustTry: ["Chip's Sticky Bun", "Harvest-inspired Fare", "Berry Shortcake"],
      insider: [
        "Restaurant slowly rotates",
        "Mickey, Pluto, Chip & Dale",
        "Ingredients from Living with Land",
        "All-you-care-to-enjoy"
      ]
    },
    {
      name: "Topolino's Terrace",
      cuisine: "French/Italian",
      location: "Riviera Resort",
      neighborhood: "Disney Skyliner Resorts",
      priceLevel: "luxury",
      kidFriendly: 8,
      reservationDifficulty: "hard",
      mustTry: ["Quiche Gruyère", "Wood-fired Butcher's Steak", "Sour Cream Waffle"],
      insider: [
        "Breakfast: Mickey, Minnie, Donald, Daisy in artist outfits",
        "Rooftop views spectacular",
        "No characters at dinner",
        "Skyliner transportation included"
      ]
    }
  ],

  neighborhoods: [
    {
      name: "Walt Disney World Resort Area",
      vibe: "Total Disney immersion with convenient transportation",
      bestFor: ["Disney-focused trips", "Families wanting magic 24/7", "Those avoiding rental cars"],
      attractions: ["Magic Kingdom", "EPCOT", "Hollywood Studios", "Animal Kingdom", "Disney Springs"],
      restaurants: ["California Grill", "Ohana", "Chef Mickey's", "Victoria & Albert's"],
      hotels: ["Grand Floridian", "Polynesian", "Contemporary", "Wilderness Lodge"],
      transport: ["Monorail", "Boats", "Buses", "Skyliner", "Walking paths"]
    },
    {
      name: "International Drive",
      vibe: "Tourist central with attractions, dining, and entertainment",
      bestFor: ["Non-Disney trips", "Variety seekers", "Convention attendees"],
      attractions: ["Universal Studios", "SeaWorld", "Icon Park", "Aquatica", "WonderWorks"],
      restaurants: ["Yard House", "Cafe Tu Tu Tango", "Eddie V's", "Texas de Brazil"],
      hotels: ["Hyatt Regency Grand Cypress", "Hilton Orlando", "Rosen Shingle Creek"],
      transport: ["I-Ride Trolley", "Uber/Lyft abundant", "Walkable in sections"]
    },
    {
      name: "Lake Buena Vista",
      vibe: "Close to Disney without being on-property",
      bestFor: ["Disney visitors wanting hotel variety", "Outlet shopping", "Lower prices"],
      attractions: ["Disney Springs walking distance", "Orlando Vineland Premium Outlets"],
      restaurants: ["Olive Garden", "Red Lobster", "Bahama Breeze", "Bonefish Grill"],
      hotels: ["Marriott Village", "Hilton Orlando Lake Buena Vista", "Holiday Inn Orlando"],
      transport: ["Hotel shuttles to Disney", "Car recommended", "Close to I-4"]
    },
    {
      name: "Universal Resort Area",
      vibe: "Universal-centric with CityWalk entertainment",
      bestFor: ["Universal focus", "Harry Potter fans", "Older kids/teens"],
      attractions: ["Universal Studios", "Islands of Adventure", "Volcano Bay", "CityWalk"],
      restaurants: ["Mythos", "Three Broomsticks", "Vivo Italian Kitchen", "Antojitos"],
      hotels: ["Portofino Bay", "Hard Rock Hotel", "Cabana Bay", "Endless Summer"],
      transport: ["Water taxis", "Walking paths", "Resort buses", "Express Pass with deluxe hotels"]
    },
    {
      name: "Kissimmee",
      vibe: "Budget-friendly with Old Florida charm",
      bestFor: ["Budget travelers", "Vacation homes", "Longer stays"],
      attractions: ["Old Town", "Fun Spot America", "Gatorland", "Medieval Times"],
      restaurants: ["Columbia Restaurant", "Savion's Place", "El Tapatio", "Azteca's"],
      hotels: ["Gaylord Palms", "Vacation rental homes", "Budget chains"],
      transport: ["Car essential", "Some hotel shuttles", "Less walkable"]
    },
    {
      name: "Downtown Orlando",
      vibe: "Local scene with culture and nightlife",
      bestFor: ["Adults", "Foodies", "Art lovers", "Escaping tourist crowds"],
      attractions: ["Orlando Science Center", "Dr. Phillips Performing Arts", "Lake Eola"],
      restaurants: ["Se7en Bites", "Domu", "The Ravenous Pig", "Kadence"],
      hotels: ["Grand Bohemian", "Aloft Downtown", "Embassy Suites"],
      transport: ["LYMMO bus free", "Lime scooters", "Walkable downtown", "Parking can be challenging"]
    },
    {
      name: "Winter Park",
      vibe: "Upscale suburb with boutique shopping",
      bestFor: ["Couples", "Shopping", "Fine dining", "Museum lovers"],
      attractions: ["Park Avenue shopping", "Morse Museum", "Winter Park Scenic Boat Tour"],
      restaurants: ["Prato", "Hillstone", "Bulla Gastrobar", "The Wine Room"],
      hotels: ["The Alfond Inn", "Park Plaza Hotel", "Limited options"],
      transport: ["Free golf cart service on Park Ave", "Car needed from theme parks", "SunRail station"]
    },
    {
      name: "Celebration",
      vibe: "Disney-designed planned community",
      bestFor: ["Quiet stays near Disney", "Families wanting neighborhood feel"],
      attractions: ["Downtown Celebration", "Farmers Market Sundays", "Walking trails"],
      restaurants: ["Columbia Restaurant", "Celebration Town Tavern", "Kilwin's"],
      hotels: ["Bohemian Hotel Celebration", "Vacation rentals"],
      transport: ["Car needed", "Golf carts in town", "15 mins to Disney"]
    }
  ],

  itineraries: [
    {
      duration: "5 days",
      theme: "First Disney Trip with Young Kids",
      pace: "relaxed",
      days: [
        {
          day: 1,
          focus: "Magic Kingdom Classics",
          morning: [
            "Rope drop arrival (30 mins before open)",
            "Fantasyland: Seven Dwarfs, Peter Pan, Small World",
            "Mobile order lunch at Pinocchio Village Haus"
          ],
          afternoon: [
            "Hotel break 1-4pm (nap/pool time)",
            "Return for Pirates, Haunted Mansion, Jungle Cruise",
            "Dole Whip break in Adventureland"
          ],
          evening: [
            "Dinner at Crystal Palace (Pooh characters)",
            "Watch fireworks from hub grass (get spot 30 mins early)",
            "Exit during fireworks to beat crowds"
          ],
          meals: ["Quick breakfast at hotel", "Pinocchio Village Haus lunch", "Crystal Palace dinner"],
          tips: [
            "Use Genie+ for popular rides",
            "Bring stroller even for 5-6 year olds",
            "Pack ponchos for afternoon rain"
          ]
        },
        {
          day: 2,
          focus: "Animal Kingdom Adventure",
          morning: [
            "Rope drop to Flight of Passage OR Safari",
            "Kilimanjaro Safari (animals active morning)",
            "Gorilla Falls Exploration Trail"
          ],
          afternoon: [
            "Lunch at Tusker House (Donald's Safari)",
            "Festival of the Lion King show",
            "DinoLand for younger kids OR Everest for older"
          ],
          evening: [
            "Early dinner at Flame Tree BBQ",
            "Head back to hotel (park closes early)",
            "Evening swim at hotel pool"
          ],
          meals: ["Hotel breakfast", "Tusker House lunch", "Flame Tree BBQ dinner"],
          tips: [
            "This park requires most walking",
            "Na'vi River Journey good for all ages",
            "Don't miss the walking trails"
          ]
        },
        {
          day: 3,
          focus: "Resort Day & Disney Springs",
          morning: [
            "Sleep in and big hotel breakfast",
            "Resort pool time until lunch",
            "Resort activities (many free for guests)"
          ],
          afternoon: [
            "Late lunch at resort",
            "Head to Disney Springs around 3pm",
            "LEGO Store, World of Disney shopping"
          ],
          evening: [
            "Dinner at T-REX Cafe (dinosaurs!)",
            "Amphicar ride if weather nice",
            "Disney Springs entertainment"
          ],
          meals: ["Hotel breakfast", "Resort lunch", "T-REX Cafe dinner"],
          tips: [
            "This rest day prevents meltdowns",
            "Disney Springs parking free",
            "Many free activities for kids"
          ]
        },
        {
          day: 4,
          focus: "Hollywood Studios Highlights",
          morning: [
            "Rope drop to Toy Story Land",
            "Slinky Dog, Toy Story Mania, Alien Swirling Saucers",
            "Mickey & Minnie's Runaway Railway"
          ],
          afternoon: [
            "Lunch at Sci-Fi Dine-In (cars!)",
            "Frozen Sing-Along show (AC break)",
            "Star Wars: Rise of Resistance (Lightning Lane)"
          ],
          evening: [
            "Explore Galaxy's Edge",
            "Quick dinner at Docking Bay 7",
            "Fantasmic show (get reserved seating)"
          ],
          meals: ["Hotel breakfast", "Sci-Fi Dine-In lunch", "Docking Bay 7 dinner"],
          tips: [
            "Book Rise of Resistance at 7am",
            "Shows provide needed breaks",
            "Blue/Green milk fun treat"
          ]
        },
        {
          day: 5,
          focus: "EPCOT Exploration",
          morning: [
            "Rope drop to Frozen Ever After",
            "Seas with Nemo, Turtle Talk with Crush",
            "Spaceship Earth before crowds"
          ],
          afternoon: [
            "World Showcase opens 11am",
            "Lunch at Biergarten (entertainment)",
            "Kidcot Fun Stops around World Showcase"
          ],
          evening: [
            "Remy's Ratatouille Adventure",
            "Dinner in Mexico (inside pyramid)",
            "EPCOT Forever fireworks"
          ],
          meals: ["Hotel breakfast", "Biergarten lunch", "San Angel Inn dinner"],
          tips: [
            "World Showcase better afternoon",
            "Let kids collect stamps/stickers",
            "Many playground areas hidden"
          ]
        }
      ]
    },
    {
      duration: "7 days",
      theme: "Universal & Disney Combo",
      pace: "moderate",
      days: [
        {
          day: 1,
          focus: "Universal Studios",
          morning: [
            "Early entry to Diagon Alley (hotel guests)",
            "Gringotts, Ollivanders, explore shops",
            "Hogwarts Express to Islands of Adventure"
          ],
          afternoon: [
            "Three Broomsticks lunch in Hogsmeade",
            "Flight of the Hippogriff, Castle tour",
            "Back to Universal via Hogwarts Express"
          ],
          evening: [
            "E.T., Men in Black, Simpsons rides",
            "Dinner at Finnegan's Bar",
            "Return to hotel"
          ],
          meals: ["Hotel breakfast", "Three Broomsticks lunch", "Finnegan's dinner"],
          tips: [
            "2-Park ticket essential for Hogwarts Express",
            "Express Pass worth it if not staying deluxe",
            "Interactive wands work in both parks"
          ]
        },
        {
          day: 2,
          focus: "Islands of Adventure",
          morning: [
            "Rope drop to Hagrid's Motorbike Adventure",
            "Velocicoaster OR Seuss Landing (age dependent)",
            "Spider-Man, Hulk if time"
          ],
          afternoon: [
            "Lunch at Mythos",
            "Water rides (bring ponchos)",
            "Jurassic Park River Adventure"
          ],
          evening: [
            "Return to Hogsmeade evening atmosphere",
            "Dinner at Three Broomsticks",
            "Night rides different experience"
          ],
          meals: ["Hotel breakfast", "Mythos lunch", "Three Broomsticks dinner"],
          tips: [
            "Seuss Landing perfect for young kids",
            "Single rider lines save time",
            "Pteranodon Flyers has height maximum"
          ]
        },
        {
          day: 3,
          focus: "Magic Kingdom Full Day",
          morning: [
            "Rope drop strategy for shortest waits",
            "Hit major attractions with Genie+",
            "Mobile order lunch to save time"
          ],
          afternoon: [
            "Continue attractions",
            "Character meet & greets",
            "Snack breaks (Dole Whip, popcorn)"
          ],
          evening: [
            "Dinner reservation at Be Our Guest",
            "Evening attractions (shorter lines)",
            "Fireworks spectacular"
          ],
          meals: ["Hotel breakfast", "Mobile order lunch", "Be Our Guest dinner"],
          tips: [
            "Genie+ essential for Magic Kingdom",
            "Evening extra magic hours if available",
            "Photo Pass for character meets"
          ]
        },
        {
          day: 4,
          focus: "Resort Day & SeaWorld",
          morning: [
            "Sleep in and leisurely breakfast",
            "Hotel pool and lazy river",
            "Early lunch at hotel"
          ],
          afternoon: [
            "Arrive SeaWorld 2pm",
            "Orca encounter show",
            "Antarctica: Empire of Penguin"
          ],
          evening: [
            "Mako, Kraken coasters (if age appropriate)",
            "Dinner at Sharks Underwater Grill",
            "Sea Lion show before close"
          ],
          meals: ["Hotel brunch", "Light snacks", "Sharks Underwater Grill dinner"],
          tips: [
            "SeaWorld less crowded afternoons",
            "Quick Queue for coasters worth it",
            "Educational programs excellent"
          ]
        },
        {
          day: 5,
          focus: "EPCOT World Tour",
          morning: [
            "Future World attractions",
            "Test Track, Mission: SPACE",
            "The Seas pavilion"
          ],
          afternoon: [
            "World Showcase lunch tour",
            "Sample foods from different countries",
            "Kidcot Fun Stops activities"
          ],
          evening: [
            "Ratatouille ride in France",
            "Dinner at Teppan Edo (Japan)",
            "Harmonious nighttime show"
          ],
          meals: ["Hotel breakfast", "World Showcase grazing", "Teppan Edo dinner"],
          tips: [
            "Festival booths if during event",
            "Drink around the world (adults)",
            "Cultural representatives great for kids"
          ]
        },
        {
          day: 6,
          focus: "Hollywood Studios Star Wars",
          morning: [
            "Rope drop to Rise of Resistance",
            "Millennium Falcon: Smugglers Run",
            "Build lightsaber or droid (reservation needed)"
          ],
          afternoon: [
            "Lunch at Docking Bay 7",
            "Tower of Terror, Rock 'n' Roller Coaster",
            "Animation Courtyard experiences"
          ],
          evening: [
            "Return to Galaxy's Edge at night",
            "Oga's Cantina reservation",
            "Fantasmic show"
          ],
          meals: ["Hotel breakfast", "Docking Bay 7 lunch", "Oga's Cantina snacks"],
          tips: [
            "Galaxy's Edge more atmospheric at night",
            "PhotoPass photographers everywhere",
            "Mobile order essential"
          ]
        },
        {
          day: 7,
          focus: "Animal Kingdom Finale",
          morning: [
            "Flight of Passage at rope drop",
            "Pandora exploration",
            "Safari second ride (different animals)"
          ],
          afternoon: [
            "Lunch at Yak & Yeti",
            "Kali River Rapids (get soaked)",
            "Finding Nemo show"
          ],
          evening: [
            "Dinner at Tiffins",
            "Evening safari (if offered)",
            "Tree of Life illuminations"
          ],
          meals: ["Hotel breakfast", "Yak & Yeti lunch", "Tiffins dinner"],
          tips: [
            "Pandora at night is magical",
            "Conservation Station worth visit",
            "Rivers of Light if showing"
          ]
        }
      ]
    },
    {
      duration: "3 days",
      theme: "Orlando Beyond Theme Parks",
      pace: "relaxed",
      days: [
        {
          day: 1,
          focus: "Nature & Wildlife",
          morning: [
            "Early arrival at Gatorland",
            "Gator feeding shows",
            "Screamin' Gator Zip Line"
          ],
          afternoon: [
            "Lunch at Pearl's Smokehouse (in park)",
            "Trainer for a Day experience",
            "Drive to Wekiwa Springs"
          ],
          evening: [
            "Late afternoon swimming at springs",
            "Dinner at Whisper Creek (Gaylord Palms)",
            "See alligators at hotel"
          ],
          meals: ["Hotel breakfast", "Pearl's BBQ lunch", "Whisper Creek dinner"],
          tips: [
            "Wekiwa Springs stays 72°F year-round",
            "Bring water shoes for springs",
            "Gaylord Palms worth exploring"
          ]
        },
        {
          day: 2,
          focus: "Kennedy Space Center",
          morning: [
            "Drive to Cape Canaveral (1 hour)",
            "Arrival for opening",
            "Space Shuttle Atlantis exhibit"
          ],
          afternoon: [
            "Lunch with an Astronaut experience",
            "Bus tour to launch pads",
            "IMAX films"
          ],
          evening: [
            "Return to Orlando",
            "Dinner on International Drive",
            "TopGolf or iFLY evening activity"
          ],
          meals: ["Quick breakfast", "Lunch with Astronaut", "Yard House dinner"],
          tips: [
            "Check launch schedule before visiting",
            "Bus tour essential part of experience",
            "Allow full day despite drive"
          ]
        },
        {
          day: 3,
          focus: "Local Orlando",
          morning: [
            "Breakfast at Se7en Bites",
            "Orlando Science Center",
            "Hands-on experiments"
          ],
          afternoon: [
            "Lunch at East End Market",
            "Lake Eola swan boats",
            "Playground and fountains"
          ],
          evening: [
            "Early dinner at Domu (ramen)",
            "Orlando City Soccer game (if in season)",
            "OR downtown Orlando walk"
          ],
          meals: ["Se7en Bites breakfast", "East End Market lunch", "Domu dinner"],
          tips: [
            "Sunday farmer's market at Lake Eola",
            "Science Center great rainy day option",
            "Downtown very different from tourist areas"
          ]
        }
      ]
    },
    {
      duration: "10 days",
      theme: "Ultimate Orlando Family Experience",
      pace: "moderate",
      days: [
        {
          day: 1,
          focus: "Arrival & Disney Springs",
          morning: ["Arrive Orlando, check into hotel", "Grocery run for snacks/breakfast items"],
          afternoon: ["Late lunch at Disney Springs", "Shopping and exploration", "Pin trading station start"],
          evening: ["Dinner at Homecomin'", "Amphicar ride at sunset", "Early bed for tomorrow"],
          meals: ["Travel snacks", "Light lunch", "Homecomin' dinner"],
          tips: ["Don't overdo first day", "Get parking validated", "Pick up celebration buttons"]
        },
        {
          day: 2,
          focus: "Magic Kingdom Day 1",
          morning: ["Rope drop to Fantasyland", "Classic rides: Small World, Peter Pan", "Mobile order lunch"],
          afternoon: ["Hotel pool break 1-4pm", "Return for Frontierland/Liberty Square", "Thunder Mountain, Haunted Mansion"],
          evening: ["Dinner at Liberty Tree Tavern", "Evening rides shorter lines", "Fireworks from bridge to Tomorrowland"],
          meals: ["Hotel breakfast", "Pecos Bill lunch", "Liberty Tree dinner"],
          tips: ["Two days allows relaxed pace", "Save Tomorrowland for Day 2", "Bring autograph books"]
        },
        {
          day: 3,
          focus: "Universal Studios",
          morning: ["Early entry to Diagon Alley", "Gringotts, wand shopping", "Explore every shop detail"],
          afternoon: ["Leaky Cauldron lunch", "Hogwarts Express to Islands", "Hogsmeade exploration"],
          evening: ["Return to Studios side", "Dinner at Lombard's Seafood", "Night rides different feel"],
          meals: ["Hotel breakfast", "Leaky Cauldron lunch", "Lombard's dinner"],
          tips: ["Interactive wand worth it", "Single rider saves time", "Photo package good value"]
        },
        {
          day: 4,
          focus: "Animal Kingdom",
          morning: ["Rope drop to Pandora", "Flight of Passage first", "Explore Pandora details"],
          afternoon: ["Lunch at Satuli Canteen", "Safari (different animals than morning)", "Gorilla Falls trail"],
          evening: ["Festival of Lion King", "Dinner at Yak & Yeti", "Evening Pandora (if energy)"],
          meals: ["Hotel breakfast", "Satuli Canteen lunch", "Yak & Yeti dinner"],
          tips: ["Most walking of any park", "Safari different each time", "Pandora at night magical"]
        },
        {
          day: 5,
          focus: "Rest Day Activities",
          morning: ["Sleep in!", "Big breakfast at hotel", "Resort hop via monorail"],
          afternoon: ["Lunch at Grand Floridian Cafe", "Resort pool time", "Mini golf at Fantasia Gardens"],
          evening: ["Early dinner at 4 Rivers BBQ", "Return to hotel", "Movie under stars at resort"],
          meals: ["Hotel big breakfast", "Grand Floridian lunch", "4 Rivers dinner"],
          tips: ["Rest day crucial for 10 days", "Resort hopping free and fun", "Check resort activity schedule"]
        },
        {
          day: 6,
          focus: "EPCOT Discovery",
          morning: ["Rope drop to Frozen", "Future World East attractions", "Seas pavilion with Nemo"],
          afternoon: ["World Showcase lunch crawl", "Start in Mexico, work around", "Kidcot Fun Stops"],
          evening: ["Dinner in Morocco", "Ratatouille at sunset", "Harmonious from Italy"],
          meals: ["Hotel breakfast", "World Showcase snacks", "Spice Road Table dinner"],
          tips: ["Pace yourself around World", "Stay hydrated", "Festival booths if available"]
        },
        {
          day: 7,
          focus: "Islands of Adventure",
          morning: ["Rope drop Hagrid's", "Velocicoaster if brave", "Seuss Landing for young ones"],
          afternoon: ["Mythos lunch", "Water rides (bring dry clothes)", "Jurassic Park exploration"],
          evening: ["Return to Hogsmeade", "Dinner at Three Broomsticks", "Night rides in Marvel"],
          meals: ["Hotel breakfast", "Mythos lunch", "Three Broomsticks dinner"],
          tips: ["Lockers for water rides", "Seuss often overlooked gem", "Park hopper allows flexibility"]
        },
        {
          day: 8,
          focus: "Hollywood Studios",
          morning: ["Rope drop Toy Story Land", "All Toy Story attractions", "Mickey & Minnie's Railway"],
          afternoon: ["Lunch at 50's Prime Time", "Shows for AC breaks", "Tower of Terror/Rockin' Roller"],
          evening: ["Galaxy's Edge at night", "Dinner at Oga's Cantina", "Fantasmic (reserved seat)"],
          meals: ["Hotel breakfast", "50's Prime Time lunch", "Oga's Cantina dinner"],
          tips: ["Shows underrated here", "Galaxy's Edge needs time", "Fantasmic worth staying for"]
        },
        {
          day: 9,
          focus: "Magic Kingdom Day 2",
          morning: ["Rope drop Tomorrowland", "Space Mountain, Buzz Lightyear", "Carousel of Progress (AC)"],
          afternoon: ["Lunch at Columbia Harbour House", "Anything missed Day 1", "Character meet & greets"],
          evening: ["Dinner at Chef Mickey's", "Return for favorite rides", "Fireworks from different spot"],
          meals: ["Hotel breakfast", "Columbia Harbour lunch", "Chef Mickey's dinner"],
          tips: ["Hit favorites again", "Different fireworks viewing spot", "Buy souvenirs tonight"]
        },
        {
          day: 10,
          focus: "Departure Day Options",
          morning: ["Pack up and check out", "Brunch at Disney Springs", "Last minute shopping"],
          afternoon: ["Airport OR extend with:", "- Gatorland (3 hours)", "- Icon Park (2 hours)"],
          evening: ["Evening flight home"],
          meals: ["Hotel breakfast", "Wolfgang Puck brunch", "Airport dinner"],
          tips: ["Don't overbook last day", "Account for traffic", "Magical Express discontinued"]
        }
      ]
    }
  ],

  realTimeSuggestions: [
    {
      condition: "Rainy afternoon at Magic Kingdom",
      suggestions: [
        "Head to Pirates of the Caribbean (covered queue)",
        "Carousel of Progress (long show in AC)",
        "Country Bear Jamboree (indoor show)",
        "Shop in Emporium on Main Street",
        "Mickey's PhilharMagic (indoor theater)",
        "Haunted Mansion (mostly covered)",
        "Lunch at Columbia Harbour House (indoor seating upstairs)"
      ]
    },
    {
      condition: "Unexpected 2-hour wait at popular ride",
      suggestions: [
        "Leave and return with Genie+ later",
        "Check single rider line if available",
        "Do nearby less popular attractions",
        "Take snack/bathroom break",
        "Send one adult to wait while others do kid rides",
        "Check if ride breaks down often (may clear)",
        "Use time for mobile food ordering"
      ]
    },
    {
      condition: "Toddler meltdown at park",
      suggestions: [
        "Find Baby Care Center immediately",
        "Cool down with Dole Whip or ice cream",
        "Find quiet spot (Tom Sawyer Island at MK)",
        "Watch ducks/fish at quiet water areas",
        "Return to hotel for nap if possible",
        "Stroller ride to calm down",
        "Find indoor show with AC"
      ]
    },
    {
      condition: "Forgot stroller at Disney park",
      suggestions: [
        "Rent at park entrance ($15-31/day)",
        "Buy umbrella stroller at gift shop",
        "Use rider swap for attractions",
        "Take more frequent breaks",
        "Use transport between lands",
        "Consider leaving early",
        "Baby wearing if infant"
      ]
    },
    {
      condition: "Restaurant reservation cancelled",
      suggestions: [
        "Check OpenTable for nearby options",
        "Mobile order in park",
        "Walk up to podium (sometimes available)",
        "Disney Springs has many walk-up options",
        "Resort quick service often overlooked",
        "Check for same-day reservations on app",
        "Food trucks at Disney Springs"
      ]
    },
    {
      condition: "Park at capacity",
      suggestions: [
        "Park hop if you have tickets",
        "Disney Springs always available",
        "Resort hop via transportation",
        "Book restaurant at resort for access",
        "Water parks usually have capacity",
        "Return after 2pm when locals leave",
        "Check other parks' availability"
      ]
    },
    {
      condition: "Ride breaks down while in line",
      suggestions: [
        "Stay in line (often reopens quickly)",
        "Ask for return time from Cast Member",
        "Get Lightning Lane for later",
        "Use time to rest/snack",
        "Play games with kids in line",
        "Check wait times for plan B",
        "Take photos in themed queue"
      ]
    },
    {
      condition: "Lost child at theme park",
      suggestions: [
        "Alert nearest Cast Member immediately",
        "One parent stay at last seen spot",
        "Check nearest attraction they wanted",
        "Baby Care Centers are meeting points",
        "Have photo on phone to show",
        "Write phone number on child's arm",
        "Security is very experienced with this"
      ]
    },
    {
      condition: "Sunburn/heat exhaustion",
      suggestions: [
        "First Aid stations in every park",
        "Buy aloe at gift shops",
        "Indoor attractions immediate priority",
        "Baby Care Centers have AC/quiet",
        "Lots of free ice water at QS locations",
        "Consider leaving for the day",
        "Resort pools for remainder of day"
      ]
    },
    {
      condition: "Fireworks cancelled due to weather",
      suggestions: [
        "Sometimes delayed not cancelled",
        "Check tomorrow's schedule",
        "Watch from resort if visible",
        "Use time for extra rides",
        "Many rides better at night",
        "Character meets often extended",
        "Plan to stay late tomorrow"
      ]
    }
  ],

  dayTrips: [
    {
      destination: "Kennedy Space Center",
      distance: "60 miles east",
      duration: "Full day (8-10 hours)",
      highlights: [
        "Real Space Shuttle Atlantis",
        "Astronaut encounters",
        "Launch pad bus tour",
        "IMAX space films",
        "Rocket garden"
      ],
      bestFor: ["Space enthusiasts", "Kids 8+", "Educational experience"],
      avoid: ["Children under 6", "Motion sickness prone (simulators)", "Rushing the experience"]
    },
    {
      destination: "LEGOLAND Florida",
      distance: "45 miles southwest",
      duration: "Full day",
      highlights: [
        "Built for ages 2-12",
        "Water park included",
        "Miniland USA",
        "Driving school",
        "Much calmer than Disney"
      ],
      bestFor: ["LEGO fans", "Young children", "Families wanting slower pace"],
      avoid: ["Teenagers only", "Peak summer (very hot)", "Without swimsuits"]
    },
    {
      destination: "Clearwater Beach",
      distance: "90 miles west",
      duration: "Full day",
      highlights: [
        "Top-rated beach",
        "Pier 60 sunset festival",
        "Beach activities",
        "Clearwater Marine Aquarium",
        "Fresh seafood"
      ],
      bestFor: ["Beach lovers", "Sunset seekers", "Seafood fans"],
      avoid: ["Weekend traffic", "Spring break season", "Without sun protection"]
    },
    {
      destination: "Crystal River Manatees",
      distance: "80 miles northwest",
      duration: "Full day",
      highlights: [
        "Swim with manatees (winter)",
        "Three Sisters Springs",
        "Glass-bottom boat tours",
        "Wildlife viewing",
        "Old Florida charm"
      ],
      bestFor: ["Wildlife lovers", "Winter visits (Nov-Mar)", "Unique experiences"],
      avoid: ["Summer (no manatees)", "Cold-sensitive swimmers", "Expecting theme park pace"]
    },
    {
      destination: "St. Augustine",
      distance: "110 miles northeast",
      duration: "Very long day or overnight",
      highlights: [
        "Oldest city in US",
        "Castillo de San Marcos",
        "Historic district",
        "Ghost tours",
        "Beaches nearby"
      ],
      bestFor: ["History buffs", "Older kids", "Architecture lovers"],
      avoid: ["Single day trip (too far)", "Summer heat walking tours", "Young children only"]
    },
    {
      destination: "Blue Spring State Park",
      distance: "35 miles north",
      duration: "Half day",
      highlights: [
        "Manatee viewing (winter)",
        "Swimming in spring",
        "Hiking trails",
        "Picnic areas",
        "Less crowded than Wekiwa"
      ],
      bestFor: ["Nature lovers", "Manatee season", "Quick escapes"],
      avoid: ["Peak manatee season weekends", "Without arriving early", "Expecting amenities"]
    },
    {
      destination: "Mount Dora",
      distance: "30 miles northwest",
      duration: "Half day",
      highlights: [
        "Antique shopping",
        "Lake views",
        "Historic downtown",
        "Scenic boat tours",
        "Festivals year-round"
      ],
      bestFor: ["Antique lovers", "Couples", "Slower pace seekers"],
      avoid: ["Young children only", "Expecting attractions", "Hot summer afternoons"]
    },
    {
      destination: "Bok Tower Gardens",
      distance: "55 miles southwest",
      duration: "Half day",
      highlights: [
        "Singing Tower carillon",
        "Beautiful gardens",
        "Nature trails",
        "Pinewood Estate tour",
        "Peaceful setting"
      ],
      bestFor: ["Garden enthusiasts", "Photography", "Quiet escapes"],
      avoid: ["Active kids only", "Expecting theme park excitement", "Mobility issues"]
    }
  ],

  seasonal: [
    {
      season: "Summer",
      months: ["June", "July", "August"],
      events: ["None - off season"],
      weather: "Hot (90s), humid, daily afternoon thunderstorms",
      crowdLevel: "high",
      pros: ["School vacation flexibility", "Long park hours", "Water parks ideal"],
      cons: ["Extreme heat", "Highest crowds", "Peak prices", "Hurricane season"]
    },
    {
      season: "Fall",
      months: ["September", "October", "November"],
      events: [
        "Halloween Horror Nights (Universal)",
        "Mickey's Not-So-Scary Halloween",
        "EPCOT Food & Wine Festival",
        "SeaWorld's Halloween Spooktacular"
      ],
      weather: "Warm (80s), less humid, occasional rain",
      crowdLevel: "moderate",
      pros: ["Special events", "Better weather", "Halloween decorations"],
      cons: ["Event nights = early closures", "Hurricane season peak", "Extra event tickets needed"]
    },
    {
      season: "Winter",
      months: ["December", "January", "February"],
      events: [
        "Mickey's Very Merry Christmas Party",
        "EPCOT Festival of the Holidays",
        "Grinchmas at Universal",
        "Now Snowing nightly at Magic Kingdom"
      ],
      weather: "Cool (60s-70s), dry, perfect",
      crowdLevel: "insane",
      pros: ["Best weather", "Holiday decorations", "Special shows", "No hurricanes"],
      cons: ["Highest crowds at holidays", "Most expensive time", "Book everything early"]
    },
    {
      season: "Spring",
      months: ["March", "April", "May"],
      events: [
        "EPCOT Flower & Garden Festival",
        "Mardi Gras at Universal",
        "Star Wars events",
        "Easter celebrations"
      ],
      weather: "Warm (70s-80s), low humidity",
      crowdLevel: "high",
      pros: ["Perfect weather", "Beautiful flowers", "Spring break energy"],
      cons: ["Spring break crowds", "Higher prices", "Book far in advance"]
    }
  ],

  rainyDay: [
    {
      activity: "Orlando Science Center",
      location: "Downtown Orlando",
      duration: "3-4 hours",
      cost: "$21-29",
      ages: "3+",
      why: "Four floors of hands-on science exhibits, planetarium shows, and live demonstrations all indoors"
    },
    {
      activity: "Crayola Experience",
      location: "Florida Mall",
      duration: "2-3 hours",
      cost: "$24-29",
      ages: "3-10",
      why: "25 colorful activities including making your own crayon, located in mall for food options"
    },
    {
      activity: "SEA LIFE Orlando",
      location: "Icon Park",
      duration: "1-2 hours",
      cost: "$25-35",
      ages: "All ages",
      why: "Indoor aquarium with 360-degree ocean tunnel, touching pools, and feeding demonstrations"
    },
    {
      activity: "Disney Springs Shopping & Dining",
      location: "Lake Buena Vista",
      duration: "3-5 hours",
      cost: "Free entry",
      ages: "All ages",
      why: "Covered walkways, indoor shops, restaurants, and entertainment plus LEGO Store play area"
    },
    {
      activity: "iFLY Indoor Skydiving",
      location: "International Drive",
      duration: "1-2 hours",
      cost: "$69-89",
      ages: "3+",
      why: "Unique indoor flying experience that's weather-independent and thrilling for all ages"
    },
    {
      activity: "Universal CityWalk Movies",
      location: "Universal Orlando",
      duration: "2-3 hours",
      cost: "$12-15",
      ages: "Varies by film",
      why: "20-screen theater with IMAX, reclining seats, and full dining/shopping complex attached"
    },
    {
      activity: "WonderWorks",
      location: "International Drive",
      duration: "2-3 hours",
      cost: "$33-39",
      ages: "6+",
      why: "100+ interactive science exhibits in upside-down building, includes ropes course and laser tag"
    },
    {
      activity: "Chocolate Kingdom",
      location: "Kissimmee",
      duration: "1 hour",
      cost: "$16-18",
      ages: "4+",
      why: "Interactive chocolate factory tour where kids make their own chocolate bar"
    },
    {
      activity: "Dezerland Park",
      location: "International Drive",
      duration: "2-4 hours",
      cost: "$15-40",
      ages: "All ages",
      why: "Indoor entertainment complex with bowling, arcade, go-karts, and Florida's largest arcade"
    },
    {
      activity: "Madame Tussauds",
      location: "Icon Park",
      duration: "1-2 hours",
      cost: "$25-35",
      ages: "8+",
      why: "Wax museum with photo ops, Justice League 4D experience, and fully indoor experience"
    },
    {
      activity: "Escapology Escape Rooms",
      location: "International Drive",
      duration: "1 hour",
      cost: "$35-40",
      ages: "8+",
      why: "Themed escape rooms perfect for families, multiple locations, great teen activity"
    },
    {
      activity: "Indoor Ice Skating",
      location: "RDV Sportsplex",
      duration: "2 hours",
      cost: "$11-15",
      ages: "4+",
      why: "Full-size indoor ice rink, skate rentals available, surprising Florida activity"
    }
  ],

  hotels: [
    {
      name: "Disney's Grand Floridian Resort",
      category: "deluxe",
      location: "Magic Kingdom Resort Area",
      familyPerks: [
        "Monorail to Magic Kingdom",
        "Character dining (1900 Park Fare)",
        "Kids club activities",
        "Beach with movie nights",
        "Victorian elegance appeals to princess fans"
      ],
      pools: ["Beach Pool with waterslide", "Courtyard Pool (quiet)"],
      dining: ["Victoria & Albert's", "Citricos", "1900 Park Fare", "Gasparilla Island Grill"],
      transport: ["Monorail to MK and EPCOT", "Boat to MK", "Bus to other parks"]
    },
    {
      name: "Disney's Art of Animation Resort",
      category: "value",
      location: "Disney Skyliner Area",
      familyPerks: [
        "Family suites sleep 6",
        "Best themed pools at Disney",
        "Finding Nemo, Cars, Lion King theming",
        "Skyliner to EPCOT/Hollywood Studios",
        "Animation classes"
      ],
      pools: ["Big Blue Pool (largest at Disney)", "Cozy Cone Pool", "Flippin' Fins Pool"],
      dining: ["Landscape of Flavors food court"],
      transport: ["Skyliner to EPCOT/HS", "Bus to MK/AK"]
    },
    {
      name: "Universal's Portofino Bay Hotel",
      category: "deluxe",
      location: "Universal Resort Area",
      familyPerks: [
        "FREE Universal Express Passes",
        "Italian Riviera theming",
        "Water taxi to parks",
        "Nightly piazza entertainment",
        "Kids club with activities"
      ],
      pools: ["Beach Pool with waterslide", "Villa Pool", "Hillside Pool (quiet)"],
      dining: ["Bice Ristorante", "Mama Della's", "Trattoria del Porto", "Sal's Market Deli"],
      transport: ["Water taxi to parks", "Walking paths", "Shuttle buses"]
    },
    {
      name: "Disney's Wilderness Lodge",
      category: "deluxe",
      location: "Magic Kingdom Resort Area",
      familyPerks: [
        "Pacific Northwest theming",
        "Geyser erupts every hour",
        "Boat to Magic Kingdom",
        "Hidden Mickey hunt throughout",
        "Movies under the stars"
      ],
      pools: ["Boulder Ridge Pool with waterslide", "Copper Creek Springs Pool"],
      dining: ["Whispering Canyon Cafe", "Story Book Dining", "Geyser Point Bar & Grill"],
      transport: ["Boat to MK", "Bus to other parks", "Walking to Fort Wilderness"]
    },
    {
      name: "Universal's Cabana Bay Beach Resort",
      category: "moderate",
      location: "Universal Resort Area",
      familyPerks: [
        "Retro 1950s/60s theme",
        "Family suites available",
        "Bowling alley on-site",
        "Walking distance to Volcano Bay",
        "Lower price than deluxe"
      ],
      pools: ["Two zero-entry pools", "Waterslide", "Lazy river"],
      dining: ["Bayliner Diner food court", "Galaxy Bowl restaurant", "Swizzle Lounge"],
      transport: ["Walking to Volcano Bay", "Buses to theme parks"]
    },
    {
      name: "Disney's Polynesian Village Resort",
      category: "deluxe",
      location: "Magic Kingdom Resort Area",
      familyPerks: [
        "Monorail to two parks",
        "Lilo & Stitch character breakfast",
        "Beach to watch MK fireworks",
        "Trader Sam's Grog Grotto",
        "DVC bungalows over water"
      ],
      pools: ["Lava Pool with waterslide", "Quiet Pool"],
      dining: ["Ohana", "Kona Cafe", "Captain Cook's", "Trader Sam's"],
      transport: ["Monorail to MK/EPCOT", "Boat to MK", "Walking to TTC"]
    },
    {
      name: "Gaylord Palms Resort",
      category: "deluxe",
      location: "Kissimmee",
      familyPerks: [
        "Florida-themed atriums",
        "On-site water park",
        "ICE! holiday event",
        "Alligator habitat",
        "Multiple pools and activities"
      ],
      pools: ["Cypress Springs Water Park", "South Beach Pool", "Adult-only pool"],
      dining: ["Villa de Flora", "MOOR", "Old Hickory Steakhouse", "SandBar"],
      transport: ["Shuttle to Disney (fee)", "Car recommended", "Uber readily available"]
    },
    {
      name: "Disney's Animal Kingdom Lodge",
      category: "deluxe",
      location: "Animal Kingdom Resort Area",
      familyPerks: [
        "African savanna views",
        "200+ animals on property",
        "Cultural activities daily",
        "Night vision goggles for animals",
        "Storytelling by the fire"
      ],
      pools: ["Uzima Pool with waterslide", "Samawati Springs Pool"],
      dining: ["Boma", "Jiko", "Sanaa", "The Mara"],
      transport: ["Bus to all parks", "No skyliner/monorail"]
    },
    {
      name: "Hyatt Regency Grand Cypress",
      category: "deluxe",
      location: "Lake Buena Vista",
      familyPerks: [
        "21-acre lake with beach",
        "Rock climbing wall",
        "Pitch & putt golf",
        "Kayaking and bikes",
        "Camp Cypress kids program"
      ],
      pools: ["Grotto Pool with slides", "Adult pool", "Splash pad"],
      dining: ["Hemingway's", "LakeHouse", "On The Rocks"],
      transport: ["Shuttle to Disney", "Car recommended", "10 mins to Disney Springs"]
    },
    {
      name: "Disney's Contemporary Resort",
      category: "deluxe",
      location: "Magic Kingdom Resort Area",
      familyPerks: [
        "Walk to Magic Kingdom",
        "Monorail through hotel",
        "Chef Mickey's character dining",
        "Modern Disney style",
        "Bay Lake Tower DVC"
      ],
      pools: ["Feature Pool with waterslide", "Bay Lake Pool"],
      dining: ["California Grill", "Chef Mickey's", "The Wave", "Contempo Cafe"],
      transport: ["Walk to MK", "Monorail to EPCOT", "Bus to other parks"]
    }
  ]
};

/**
 * Generate Orlando-specific pre-trip tasks based on family profile
 */
export function generateOrlandoTasks(familyProfile: any, daysUntilTrip: number) {
  const tasks = [];
  const kids = familyProfile.kids || [];
  const tripPurpose = familyProfile.tripPurpose;
  
  // ESSENTIAL: Disney tasks only for theme park focused trips
  if (tripPurpose === 'theme-parks' || tripPurpose === 'family-vacation') {
    // Disney Dining Reservations (most critical deadline)
    if (daysUntilTrip >= 60) {
      tasks.push({
        id: 'disney-dining-reservations',
        title: 'Disney Dining Reservations Open at 60 Days',
        subtitle: 'Character meals book instantly at 6am EST - Be Our Guest, Chef Mickey\'s, Ohana',
        category: 'essential',
        status: 'incomplete',
        urgent: daysUntilTrip <= 65,
        isCustom: false,
        priority: 'high',
        daysBeforeTrip: 60,
        intelligence: {
          reasoning: [
            '📅 Opens exactly 60 days before at 6am EST',
            '🏆 Most popular: Be Our Guest, Chef Mickey\'s, Ohana',
            '⚡ Character dining sells out in minutes',
            '💡 Set alarms - this is the #1 Orlando mistake'
          ].join('\n'),
          source: 'Disney booking essentials'
        }
      });
    }

    // Genie+ Strategy (saves hours of waiting)
    tasks.push({
      id: 'disney-genie-plus-strategy',
      title: 'Understand Genie+ Before Your Trip',
      subtitle: 'Saves 2-3 hours per day at Magic Kingdom/Hollywood Studios - worth every penny',
      category: 'essential',
      status: 'incomplete',
      urgent: false,
      isCustom: false,
      priority: 'high',
      daysBeforeTrip: 7,
      intelligence: {
        reasoning: [
          '⏰ Purchase at 7am on day of visit ($15-30/person)',
          '🎢 Essential for Magic Kingdom & Hollywood Studios',
          '📱 Book first Lightning Lane exactly at 7am',
          '💰 Saves hours = worth the cost for families'
        ].join('\n'),
        source: 'Disney efficiency essentials'
      }
    });
  }

  return tasks;
}
