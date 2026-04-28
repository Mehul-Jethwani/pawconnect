import React, { useMemo, useState } from 'react';

const categoryStyles = {
  All: { background: 'rgba(74,222,128,0.12)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)' },
  Dogs: { background: 'rgba(74,222,128,0.12)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)' },
  Cats: { background: 'rgba(168,85,247,0.14)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.28)' },
  Birds: { background: 'rgba(56,189,248,0.14)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.28)' },
  Fish: { background: 'rgba(20,184,166,0.14)', color: '#5eead4', border: '1px solid rgba(20,184,166,0.28)' },
  'Small Pets': { background: 'rgba(251,191,36,0.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.28)' },
  Health: { background: 'rgba(244,63,94,0.14)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.28)' },
  Nutrition: { background: 'rgba(163,230,53,0.14)', color: '#bef264', border: '1px solid rgba(163,230,53,0.28)' },
};

const guideData = [
  {
    id: 'featured-first-week',
    title: 'First Week With a New Pet — The Complete Checklist',
    icon: '🏠',
    summary: 'What to prepare before bringing a pet home, the first vet visit, settling-in routines, and how to make the first night calmer for everyone.',
    readTime: '5 min read',
    categories: ['Dogs', 'Cats', 'Health'],
    tag: 'Must Read',
    sections: [
      {
        heading: 'Before your pet comes home',
        bullets: [
          'Set up one quiet zone with bedding, water, and a hiding or rest area so your pet does not have to explore the whole home immediately.',
          'Buy essentials in advance: food, bowls, a collar or harness, leash, litter tray or training pads if needed, cleaning spray, and a basic brush.',
          'Remove hazards such as open balconies, loose electrical cords, toxic plants, exposed trash bins, and cleaning chemicals kept at floor level.',
          'Ask the shelter, breeder, or previous owner what food the pet is already eating. Keep that same food for the first few days before transitioning slowly.',
          'Prepare a routine on paper: feeding times, toilet breaks, sleep location, and short bonding sessions. Predictability reduces anxiety quickly.'
        ]
      },
      {
        heading: 'The first 24 hours',
        bullets: [
          'Keep introductions calm. Avoid loud gatherings, constant cuddling, or passing the pet around from person to person.',
          'Offer water first, then a small meal. Some pets eat less on the first day, and that is normal if they are otherwise alert.',
          'Show dogs one toilet area and reward them immediately after they use it. Show cats the litter tray location several times.',
          'Do not force interaction. If the pet hides, sits quietly, or watches from a distance, allow that decompression time.',
          'Keep the first walk, play session, or house tour short and low-pressure. The goal is safety, not stimulation.'
        ]
      },
      {
        heading: 'Vet visit and settling in',
        bullets: [
          'Schedule a vet check within the first few days to review vaccination history, parasite control, weight, diet, and any red flags from the previous environment.',
          'Ask the vet what to monitor at home: appetite, stools, scratching, coughing, sneezing, fear behaviour, or signs of dehydration.',
          'Keep new routines consistent for a full week before making changes. That includes feeding location, sleep area, and who handles walks or grooming.',
          'Use soft praise and treats to build trust. The first week is about security, not perfect obedience.',
          'On the first night, keep lights low, avoid frequent checking, and let the pet rest. A familiar blanket or toy can help lower stress.'
        ]
      }
    ]
  },
  {
    id: 'vaccination-dogs-cats',
    title: 'Vaccination Schedule for Dogs & Cats',
    icon: '💉',
    summary: 'Core vaccines, booster timelines, puppy and kitten schedules, adult catch-up plans, and what to expect during a vet appointment.',
    readTime: '4 min',
    categories: ['Health'],
    sections: [
      {
        heading: 'Puppy and kitten basics',
        bullets: [
          'Young pets usually begin vaccinations between 6 and 8 weeks of age, followed by boosters every 3 to 4 weeks until the primary series is complete.',
          'Puppies commonly need protection against parvovirus, distemper, adenovirus, and rabies depending on local regulations.',
          'Kittens commonly need protection against feline panleukopenia, calicivirus, herpesvirus, and rabies where recommended or required.',
          'Vaccination timing matters because maternal antibodies can interfere with early doses. That is why boosters are spaced across the first months.'
        ]
      },
      {
        heading: 'Adult boosters and catch-up plans',
        bullets: [
          'Adult pets need boosters on the schedule advised by your veterinarian. Some vaccines are repeated yearly, while others may follow a longer interval.',
          'If a pet missed early vaccines or has an unknown history, your vet may restart or rebuild protection using a catch-up plan.',
          'Indoor cats still need professional vaccine advice because some infections can travel on shoes, carriers, or through brief exposure outside.'
        ]
      },
      {
        heading: 'What to expect at the clinic',
        bullets: [
          'Your vet will likely check temperature, heart rate, gums, body condition, and any current symptoms before giving a vaccine.',
          'Mild tiredness or a sore injection site can happen for a day. Severe swelling, breathing difficulty, vomiting, or collapse are emergencies and need immediate care.',
          'Bring any previous records so your vet can avoid unnecessary repeats and maintain the right booster timeline.'
        ]
      }
    ]
  },
  {
    id: 'dog-food-life-stage',
    title: 'What to Feed Your Dog at Every Life Stage',
    icon: '🍖',
    summary: 'Puppy growth diets, adult maintenance feeding, senior nutrition, portion control, and the foods dogs should never be given.',
    readTime: '6 min',
    categories: ['Nutrition', 'Dogs'],
    sections: [
      {
        heading: 'Puppy stage',
        bullets: [
          'Puppies need food formulated for growth, with adequate protein, fat, and balanced calcium and phosphorus for healthy bone development.',
          'Feed multiple smaller meals a day because puppies burn energy quickly and cannot handle large portions as easily as adults.',
          'Avoid overfeeding large-breed puppies. Excess growth stress can contribute to joint problems later.'
        ]
      },
      {
        heading: 'Adult stage',
        bullets: [
          'Adult dogs do best on a complete and balanced diet matched to their activity level, breed size, and body condition.',
          'Use the feeding guide only as a starting point. Adjust portions based on weight trends, waistline, and exercise routine.',
          'Fresh water should be available at all times, especially in warm weather or after physical activity.'
        ]
      },
      {
        heading: 'Senior stage and unsafe foods',
        bullets: [
          'Senior dogs may benefit from easier-to-digest formulas, joint-support ingredients, controlled calories, and more frequent weight checks.',
          'Common dangerous foods include chocolate, grapes, raisins, onions, garlic, xylitol, alcohol, cooked bones, and very salty leftovers.',
          'Any diet switch should happen gradually over 5 to 7 days to reduce stomach upset.'
        ]
      }
    ]
  },
  {
    id: 'cat-behaviour-decoded',
    title: 'Cat Behaviour Decoded',
    icon: '🐱',
    summary: 'Why cats knead, purr, hide, knock items over, bring gifts, and how to read common feline behaviour more accurately.',
    readTime: '5 min',
    categories: ['Cats'],
    sections: [
      {
        heading: 'Common cat behaviours',
        bullets: [
          'Kneading usually reflects comfort, scent-marking, or a self-soothing habit that began in kittenhood.',
          'Purring can signal contentment, but some cats also purr when anxious, in pain, or trying to self-calm.',
          'Hiding is often a stress response. New homes, visitors, loud sounds, and routine changes can all trigger it.'
        ]
      },
      {
        heading: 'Why they knock things over',
        bullets: [
          'Cats investigate with paws. Movement, sound, and the reaction they get from people can all reinforce the behaviour.',
          'A cat that knocks over objects may be bored or under-stimulated. Vertical spaces, puzzle feeders, and short play sessions often help.',
          'If behaviour changes suddenly, especially with irritability or withdrawal, consider pain or illness and speak to a veterinarian.'
        ]
      },
      {
        heading: 'Reading your cat better',
        bullets: [
          'Watch the whole body: tail, ears, eyes, whiskers, and posture tell a fuller story than one action alone.',
          'Respect choice. Many cats become more affectionate when they know they can leave an interaction anytime.',
          'Predictable routines reduce stress and make behaviour easier to understand.'
        ]
      }
    ]
  },
  {
    id: 'bird-cage-setup',
    title: 'Setting Up the Perfect Bird Cage',
    icon: '🐦',
    summary: 'Cage size, perch placement, toys, safe materials, cleaning habits, and how to build a more stimulating daily environment.',
    readTime: '4 min',
    categories: ['Birds'],
    sections: [
      {
        heading: 'Choosing the cage',
        bullets: [
          'Pick the largest cage your space and budget allow. Horizontal space matters because many pet birds move side to side more than up and down.',
          'Bar spacing must match species size to prevent escape or injury. Very wide spacing can trap heads or feet.',
          'Place the cage in a bright but not drafty area, away from kitchen fumes, aerosols, and direct all-day sun.'
        ]
      },
      {
        heading: 'Inside the cage',
        bullets: [
          'Use perches of different thicknesses so feet do not stay in one position all day.',
          'Rotate toys for chewing, foraging, climbing, and problem-solving. Bored birds can become noisy, destructive, or withdrawn.',
          'Choose bird-safe materials. Avoid zinc-coated metals, chipped paint, and unknown plastics.'
        ]
      },
      {
        heading: 'Cleaning and routine',
        bullets: [
          'Refresh food and water daily, wipe droppings often, and deep-clean perches and trays on a regular schedule.',
          'Observe appetite, droppings, posture, and feather condition every day because birds often hide illness until they are very unwell.',
          'Out-of-cage time and supervised exercise are just as important as the cage itself.'
        ]
      }
    ]
  },
  {
    id: 'vet-immediately',
    title: 'Signs Your Pet Needs to See a Vet Immediately',
    icon: '🚨',
    summary: 'Emergency warning signs for dogs and cats, including breathing trouble, collapse, repeated vomiting, severe lethargy, and bleeding.',
    readTime: '3 min',
    categories: ['Health'],
    sections: [
      {
        heading: 'Go urgently if you notice',
        bullets: [
          'Breathing difficulty, blue or pale gums, collapse, seizures, or sudden inability to stand.',
          'Repeated vomiting, vomiting blood, black stools, bloated abdomen, or signs of severe pain.',
          'No urination, straining to urinate, or constant unsuccessful trips to the litter tray in cats.',
          'High heat exposure, excessive panting, drooling, confusion, or suspected poisoning.'
        ]
      },
      {
        heading: 'What to do on the way',
        bullets: [
          'Call the clinic while travelling so they can prepare for your arrival.',
          'Do not force food, water, or medication unless a vet specifically instructs you to do so.',
          'Keep the pet warm, supported, and as still as possible if trauma or collapse is involved.'
        ]
      }
    ]
  },
  {
    id: 'groom-dog-home',
    title: 'How to Groom Your Dog at Home',
    icon: '✂️',
    summary: 'Brushing by coat type, bath routines, nail trims, ear care, and the basic grooming tools every owner should keep on hand.',
    readTime: '7 min',
    categories: ['Dogs'],
    sections: [
      {
        heading: 'Build a grooming kit',
        bullets: [
          'Keep a brush suited to your dog’s coat, dog shampoo, nail trimmers or grinder, ear cleaner, towel, and treats for positive reinforcement.',
          'Brush short coats weekly, double coats more often during shedding, and long coats frequently to prevent painful mats.',
          'Always check behind ears, under the collar, armpits, and the tail area where tangles form easily.'
        ]
      },
      {
        heading: 'Baths, nails, and ears',
        bullets: [
          'Most dogs do not need very frequent baths. Wash when dirty, smelly, or after muddy outings, using a dog-safe shampoo.',
          'Trim nails before they click loudly on the floor or begin changing gait. Take tiny amounts at a time to avoid the quick.',
          'Clean ears only when needed and never push deeply into the canal. Redness, bad smell, or pain need a vet visit.'
        ]
      },
      {
        heading: 'Make it easier',
        bullets: [
          'Use short sessions and reward calm behaviour. Stopping before your dog becomes stressed builds long-term tolerance.',
          'If your dog panics around grooming tools, work in stages: show the tool, reward, touch briefly, reward, then slowly increase duration.',
          'Seek professional help for severely matted coats, difficult nails, or dogs that show fear aggression.'
        ]
      }
    ]
  },
  {
    id: 'fish-tank-beginners',
    title: 'Fish Tank Setup for Beginners',
    icon: '🐠',
    summary: 'Tank size, water cycling, pH basics, compatible fish choices, feeding habits, and common beginner mistakes to avoid.',
    readTime: '6 min',
    categories: ['Fish'],
    sections: [
      {
        heading: 'Start with the tank, not the fish',
        bullets: [
          'A larger tank is often easier to keep stable than a tiny one. More water means temperature and waste levels change more slowly.',
          'Cycle the tank before adding fish so beneficial bacteria can process ammonia and nitrites safely.',
          'Use a filter sized for your tank and test water regularly instead of guessing based on appearance.'
        ]
      },
      {
        heading: 'Stocking and feeding',
        bullets: [
          'Research species compatibility, adult size, and water requirements before mixing fish.',
          'Do not overstock. Crowding increases stress, disease risk, and water quality problems quickly.',
          'Feed lightly. Excess food pollutes the tank and is one of the most common beginner errors.'
        ]
      },
      {
        heading: 'Routine care',
        bullets: [
          'Perform regular partial water changes, clean decorations gently, and never wash filter media with untreated tap water.',
          'Watch for clamped fins, rapid breathing, white spots, or sudden hiding, which may indicate water or health problems.',
          'Patience matters. Stable tanks come from consistent care, not constant major changes.'
        ]
      }
    ]
  },
  {
    id: 'small-pets-care',
    title: 'Caring for Hamsters, Rabbits & Guinea Pigs',
    icon: '🐹',
    summary: 'Housing, enrichment, species-specific diets, safe handling, expected lifespan, and why exotic pet vets matter for small animals.',
    readTime: '5 min',
    categories: ['Small Pets'],
    sections: [
      {
        heading: 'Housing differences',
        bullets: [
          'Hamsters need deep bedding for burrowing, quiet spaces, and secure enclosures that prevent escape.',
          'Rabbits need room to stand, stretch, hop, and spend significant time outside a small enclosure.',
          'Guinea pigs need larger floor space than many people expect and should usually live with compatible companions.'
        ]
      },
      {
        heading: 'Diet basics',
        bullets: [
          'Rabbits and guinea pigs depend heavily on hay for digestion and dental health.',
          'Guinea pigs require vitamin C from diet because they cannot make enough on their own.',
          'Treats should stay limited. Sugary mixes and seed-heavy diets can cause obesity and digestive trouble.'
        ]
      },
      {
        heading: 'Handling and health',
        bullets: [
          'Support the body fully when lifting. Small pets can injure their spine or limbs if they kick free from a loose grip.',
          'Appetite drops, reduced droppings, hunched posture, or noisy breathing need prompt veterinary attention.',
          'Find an exotics-friendly veterinarian before an emergency happens.'
        ]
      }
    ]
  },
  {
    id: 'pet-proof-home',
    title: 'Pet-Proofing Your Home',
    icon: '🏡',
    summary: 'Toxic plants, exposed wires, unsafe storage, balcony and window checks, and a room-by-room approach to safer living spaces.',
    readTime: '4 min',
    categories: ['Dogs', 'Cats'],
    sections: [
      {
        heading: 'Biggest household risks',
        bullets: [
          'Store medicines, cleaners, pesticides, batteries, and cosmetics behind closed doors rather than under open sinks.',
          'Secure electric cords, chargers, and plugs, especially for puppies, kittens, and rabbits that explore with teeth.',
          'Check houseplants carefully. Many common decorative plants are toxic to dogs or cats.'
        ]
      },
      {
        heading: 'Room-by-room checks',
        bullets: [
          'In kitchens, secure bins, sharp utensils, hot pans, and accessible leftovers.',
          'In bathrooms, keep laundry pods, razors, toilet lids, and medications out of reach.',
          'In balconies or windows, inspect grills, gaps, and unstable furniture that makes climbing easy.'
        ]
      },
      {
        heading: 'Daily prevention habits',
        bullets: [
          'Do a quick floor scan for coins, rubber bands, socks, needles, children’s toys, and dropped food.',
          'Use baby gates or closed doors while training new pets to limit access to risky spaces.',
          'Emergency care is easier when the home is already designed to prevent accidents.'
        ]
      }
    ]
  },
  {
    id: 'pet-food-labels',
    title: 'Understanding Pet Food Labels',
    icon: '🏷️',
    summary: 'How to read ingredient lists, guaranteed analysis, protein quality, fillers, and the difference between dry, wet, and raw diets.',
    readTime: '5 min',
    categories: ['Nutrition'],
    sections: [
      {
        heading: 'Ingredient list basics',
        bullets: [
          'Ingredients are listed by weight before cooking, so high-moisture ingredients may appear high even if their final contribution is smaller.',
          'Look for clearly named protein sources rather than vague descriptions where possible.',
          'Avoid assuming every grain is bad. The full nutritional balance matters more than trend labels.'
        ]
      },
      {
        heading: 'Guaranteed analysis',
        bullets: [
          'Guaranteed analysis shows minimum protein and fat plus maximum fibre and moisture, but it does not tell the whole quality story by itself.',
          'Wet foods naturally show lower percentages because of higher water content, so direct comparison to dry food can be misleading.',
          'Your vet can help interpret labels for pets with kidney disease, allergies, obesity, or digestive sensitivities.'
        ]
      },
      {
        heading: 'Choosing better diets',
        bullets: [
          'Pick diets appropriate for life stage, species, health condition, and feeding practicality in your home.',
          'Be cautious with homemade or raw plans unless they are professionally balanced.',
          'Any food that causes chronic itchiness, loose stools, vomiting, or weight change deserves review with your veterinarian.'
        ]
      }
    ]
  },
  {
    id: 'dog-training-30-days',
    title: 'Training Your Dog: Basic Commands in 30 Days',
    icon: '🎓',
    summary: 'A realistic starter plan for sit, stay, come, leave it, and leash manners using reward-based training and short daily sessions.',
    readTime: '8 min',
    categories: ['Dogs'],
    sections: [
      {
        heading: 'Week-by-week focus',
        bullets: [
          'Week 1: name response, marker word or clicker, and sit.',
          'Week 2: stay for short durations and calm leash walking in low-distraction areas.',
          'Week 3: come when called and leave it using high-value rewards.',
          'Week 4: combine skills in slightly busier settings and practise short real-life routines.'
        ]
      },
      {
        heading: 'How sessions should feel',
        bullets: [
          'Keep sessions short, often 3 to 8 minutes, especially for puppies or easily distracted dogs.',
          'End while your dog is still engaged. Success builds confidence faster than drilling.',
          'Reward what you want immediately so the dog can connect the action with the consequence.'
        ]
      },
      {
        heading: 'Common mistakes',
        bullets: [
          'Repeating cues over and over teaches the dog that the first few do not matter.',
          'Moving too fast into distracting environments can make a dog seem stubborn when they are really overwhelmed.',
          'Punishment may suppress behaviour briefly but often harms trust and slows learning.'
        ]
      }
    ]
  },
  {
    id: 'india-weather-care',
    title: 'Monsoon & Summer Pet Care in India',
    icon: '☀️',
    summary: 'Heatstroke prevention, paw care, parasite seasons, monsoon skin issues, hydration support, and climate-specific caution for Indian cities.',
    readTime: '5 min',
    categories: ['Health', 'Dogs', 'Cats'],
    sections: [
      {
        heading: 'Summer protection',
        bullets: [
          'Walk dogs during cooler hours and test roads with the back of your hand before letting paws touch hot surfaces.',
          'Provide shade, airflow, and multiple water points. Flat-faced breeds, seniors, and overweight pets overheat faster.',
          'Heatstroke signs include heavy panting, red gums, weakness, drooling, confusion, vomiting, or collapse.'
        ]
      },
      {
        heading: 'Monsoon concerns',
        bullets: [
          'Dry paws, belly fur, and ears after rainy walks to reduce fungal growth and skin irritation.',
          'Tick and flea pressure often rises in humid conditions, so preventive parasite control matters even more.',
          'Standing water, dirty puddles, and damp bedding increase risk of infections and stomach upset.'
        ]
      },
      {
        heading: 'Practical habits for Indian homes',
        bullets: [
          'Keep clean drinking water available and encourage extra intake with wet food or water-rich meals if recommended.',
          'Check paws for cracks, redness, or small cuts after hot pavements or muddy streets.',
          'If your pet becomes suddenly quiet, stops eating, or scratches excessively during monsoon, get a vet check instead of waiting too long.'
        ]
      }
    ]
  }
];

const quickReferenceCards = [
  {
    title: '🚫 Foods Dogs Can Never Eat',
    points: ['Chocolate', 'Grapes and raisins', 'Onions and garlic', 'Xylitol gum or sweets', 'Cooked bones', 'Alcohol', 'Very salty leftovers']
  },
  {
    title: '🚫 Foods Cats Can Never Eat',
    points: ['Onions and garlic', 'Chocolate', 'Alcohol', 'Raw dough', 'Xylitol products', 'Large bones', 'Caffeinated drinks']
  },
  {
    title: '💊 Common Pet Medicines Explained',
    points: ['Never give human painkillers blindly', 'Dewormers target parasites', 'Tick and flea preventives vary by species', 'Antibiotics need full courses', 'Ear drops are not all interchangeable', 'Ask before combining supplements']
  },
  {
    title: '📅 Monthly Pet Care Checklist',
    points: ['Weight check', 'Nail length review', 'Parasite prevention', 'Coat and skin scan', 'Ear and dental check', 'Food stock review', 'Wash bedding']
  },
  {
    title: '🌡️ Normal Vitals for Dogs & Cats',
    points: ['Temperature is usually around 38 to 39.2 C', 'Gums should look pink', 'Resting breathing should be calm', 'Sudden panting at rest is concerning', 'Persistent lethargy is not normal', 'Call your vet if vitals change sharply']
  },
  {
    title: '📞 When to Call Your Vet vs Wait',
    points: ['Call now for breathing issues', 'Call now for repeated vomiting', 'Call now for collapse or seizures', 'Watch briefly for mild one-off stomach upset', 'Watch closely after small routine stress events', 'When unsure, call and ask']
  }
];

const filterPills = ['All', 'Dogs', 'Cats', 'Birds', 'Fish', 'Small Pets', 'Health', 'Nutrition'];

const clampTwoLines = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

const CareGuides = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedGuide, setSelectedGuide] = useState(null);

  const featuredGuide = guideData[0];
  const gridGuides = guideData.slice(1);

  const filteredGuides = useMemo(() => {
    const query = search.trim().toLowerCase();

    return gridGuides.filter((guide) => {
      const matchesCategory =
        activeCategory === 'All' || guide.categories.includes(activeCategory);

      const haystack = `${guide.title} ${guide.summary} ${guide.categories.join(' ')}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, gridGuides]);

  const renderCategoryChip = (category, extraStyle = {}) => (
    <span
      key={category}
      style={{
        ...categoryStyles[category],
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.32rem 0.8rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        ...extraStyle,
      }}
    >
      {category}
    </span>
  );

  return (
    <div
      className="page-container"
      style={{
        padding: '2rem',
        maxWidth: '1280px',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '28px',
          padding: '3rem 2rem',
          marginBottom: '2.5rem',
          boxShadow: '0 18px 50px rgba(0,0,0,0.26)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', margin: 0, color: 'var(--text-color)' }}>
          Pet Care Guides
        </h1>
        <p
          style={{
            margin: '0.9rem auto 2rem',
            maxWidth: '760px',
            color: 'var(--muted-text)',
            fontSize: '1.08rem',
          }}
        >
          Everything you need to know to keep your pet happy, healthy, and loved.
        </p>

        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto 1.2rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '0.8rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <span style={{ color: 'var(--hint-text)' }}>🔎</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides by topic, symptom, species, or care tip..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-color)',
              fontSize: '1rem',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.7rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {filterPills.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                style={{
                  background: isActive ? 'rgba(74,222,128,0.12)' : 'var(--surface)',
                  color: isActive ? 'var(--accent)' : 'var(--muted-text)',
                  border: isActive ? '1px solid rgba(74,222,128,0.25)' : '1px solid var(--border)',
                  padding: '0.55rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                  boxShadow: isActive ? '0 6px 18px rgba(0,0,0,0.18)' : 'none',
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2.5rem',
          boxShadow: '0 14px 40px rgba(0,0,0,0.22)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1.5rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 560px' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span
                style={{
                  background: 'rgba(74,222,128,0.14)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                }}
              >
                {featuredGuide.tag}
              </span>
              <span style={{ color: 'var(--muted-text)', fontSize: '0.9rem', fontWeight: 600 }}>
                {featuredGuide.readTime}
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-color)' }}>
              {featuredGuide.title}
            </h2>
            <p style={{ color: 'var(--muted-text)', fontSize: '1.02rem', lineHeight: 1.75, margin: '1rem 0 1.3rem' }}>
              {featuredGuide.summary}
            </p>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
              {featuredGuide.categories.map((category) => renderCategoryChip(category))}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.3rem' }}
              onClick={() => setSelectedGuide(featuredGuide)}
            >
              Read Guide
            </button>
          </div>

          <div
            style={{
              flex: '0 1 220px',
              minHeight: '190px',
              background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(30,37,53,0.9))',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
            }}
          >
            {featuredGuide.icon}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '320px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
              transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)';
              e.currentTarget.style.boxShadow = '0 14px 34px rgba(74,222,128,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.18)';
            }}
          >
            <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{guide.icon}</div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
              {guide.categories.map((category) => renderCategoryChip(category, { fontSize: '0.7rem', padding: '0.28rem 0.65rem' }))}
            </div>
            <h3 style={{ margin: '0 0 0.7rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>{guide.title}</h3>
            <p style={{ ...clampTwoLines, margin: 0, color: 'var(--muted-text)', lineHeight: 1.65 }}>
              {guide.summary}
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem' }}>
              <span style={{ color: 'var(--hint-text)', fontSize: '0.88rem', fontWeight: 600 }}>{guide.readTime}</span>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1rem' }}
                onClick={() => setSelectedGuide(guide)}
              >
                Read Guide
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div
          style={{
            background: 'var(--card)',
            border: '1px dashed var(--border)',
            borderRadius: '22px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>🐾</div>
          <h3 style={{ color: 'var(--text-color)', marginBottom: '0.5rem' }}>No guides found for your search</h3>
          <p style={{ color: 'var(--muted-text)', margin: 0 }}>
            Try a broader keyword or switch the active category filter.
          </p>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--text-color)', marginBottom: '0.6rem' }}>Quick Reference</h2>
        <p style={{ color: 'var(--muted-text)', margin: 0 }}>
          Fast reminders for everyday questions pet parents ask again and again.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(280px, 320px)',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {quickReferenceCards.map((card) => (
          <div
            key={card.title}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(74,222,128,0.15)',
              borderRadius: '18px',
              padding: '1.25rem',
              boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.9rem', color: 'var(--text-color)', fontSize: '1rem' }}>
              {card.title}
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--muted-text)', lineHeight: 1.65 }}>
              {card.points.map((point) => (
                <li key={point} style={{ marginBottom: '0.2rem' }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selectedGuide && (
        <div
          onClick={() => setSelectedGuide(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1200,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(920px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.7rem' }}>{selectedGuide.icon}</div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                  {selectedGuide.categories.map((category) => renderCategoryChip(category))}
                </div>
                <h2 style={{ margin: 0, color: 'var(--text-color)' }}>{selectedGuide.title}</h2>
                <p style={{ color: 'var(--muted-text)', marginTop: '0.8rem', marginBottom: 0, lineHeight: 1.75 }}>
                  {selectedGuide.summary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ color: 'var(--hint-text)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              {selectedGuide.readTime}
            </div>

            {selectedGuide.sections.map((section) => (
              <section key={section.heading} style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-color)', marginBottom: '0.7rem' }}>{section.heading}</h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--muted-text)', lineHeight: 1.8 }}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet} style={{ marginBottom: '0.45rem' }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareGuides;
