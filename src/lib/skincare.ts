/**
 * Curated skin & hair care products widely available and popular in India,
 * plus the pure routine builder. No React here — tested in skincare.test.ts.
 */

export const SKIN_TYPES = ["oily", "dry", "combination", "normal", "sensitive"] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const CONCERNS = [
  "acne",
  "acne_marks",
  "pigmentation",
  "dark_circles",
  "tan",
  "dullness",
  "uneven_texture",
  "open_pores",
  "fine_lines",
  "redness",
  "dryness",
  "excess_oil",
  "blackheads",
] as const;
export type Concern = (typeof CONCERNS)[number];

export const CONCERN_LABEL: Record<Concern, string> = {
  acne: "Acne / pimples",
  acne_marks: "Acne marks",
  pigmentation: "Pigmentation",
  dark_circles: "Dark circles",
  tan: "Sun tan",
  dullness: "Dullness",
  uneven_texture: "Uneven texture",
  open_pores: "Open pores",
  fine_lines: "Fine lines",
  redness: "Redness",
  dryness: "Dry patches",
  excess_oil: "Excess oil",
  blackheads: "Blackheads",
};

export type Step = "cleanser" | "toner" | "serum" | "treatment" | "moisturizer" | "sunscreen" | "eye" | "mask";

export const STEP_LABEL: Record<Step, string> = {
  cleanser: "Cleanser",
  toner: "Toner",
  serum: "Serum",
  treatment: "Treatment",
  moisturizer: "Moisturiser",
  sunscreen: "Sunscreen",
  eye: "Under-eye",
  mask: "Face mask",
};

export interface Product {
  id: string;
  brand: string;
  name: string;
  step: Step;
  skinTypes: SkinType[];
  concerns: Concern[];
  when: "AM" | "PM" | "AM & PM" | "Weekly";
  keyIngredient: string;
  howTo: string;
  frequency: string;
  /** Typical weeks before visible change: [from, to] */
  resultsWeeks: [number, number];
  /** Strong actives — kept away from sensitive skin and beginners */
  strong?: boolean;
  caution?: string;
}

const ALL: SkinType[] = ["oily", "dry", "combination", "normal", "sensitive"];

export const PRODUCTS: Product[] = [
  // ---------- Cleansers ----------
  {
    id: "cetaphil-gentle",
    brand: "Cetaphil",
    name: "Gentle Skin Cleanser",
    step: "cleanser",
    skinTypes: ["dry", "sensitive", "normal"],
    concerns: ["dryness", "redness"],
    when: "AM & PM",
    keyIngredient: "Glycerin, niacinamide",
    howTo: "Massage a coin-sized amount onto damp skin for 30 seconds, rinse with lukewarm water and pat dry.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "cerave-foaming",
    brand: "CeraVe",
    name: "Foaming Facial Cleanser",
    step: "cleanser",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["excess_oil", "open_pores"],
    when: "AM & PM",
    keyIngredient: "Ceramides, niacinamide",
    howTo: "Lather a small amount with water, massage for 30–60 seconds, rinse well.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "minimalist-sa-cleanser",
    brand: "Minimalist",
    name: "2% Salicylic Acid + LHA Cleanser",
    step: "cleanser",
    skinTypes: ["oily", "combination"],
    concerns: ["acne", "blackheads", "open_pores", "excess_oil"],
    when: "AM & PM",
    keyIngredient: "Salicylic acid, LHA",
    howTo: "Massage onto damp skin for 60 seconds so the acid can work, then rinse.",
    frequency: "Once or twice daily",
    resultsWeeks: [3, 6],
    caution: "May feel drying at first — start once a day.",
  },
  {
    id: "himalaya-neem",
    brand: "Himalaya",
    name: "Purifying Neem Face Wash",
    step: "cleanser",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["acne", "excess_oil"],
    when: "AM & PM",
    keyIngredient: "Neem, turmeric",
    howTo: "Wet face, work into a lather, massage gently for 30 seconds and rinse.",
    frequency: "Twice daily",
    resultsWeeks: [2, 4],
  },
  {
    id: "simple-refreshing",
    brand: "Simple",
    name: "Kind to Skin Refreshing Facial Wash",
    step: "cleanser",
    skinTypes: ALL,
    concerns: ["redness"],
    when: "AM & PM",
    keyIngredient: "Pro-vitamin B5, vitamin E",
    howTo: "Apply to wet skin, massage gently and rinse with water. Soap-free and fragrance-free.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "mamaearth-ubtan-wash",
    brand: "Mamaearth",
    name: "Ubtan Face Wash",
    step: "cleanser",
    skinTypes: ["normal", "combination", "dry"],
    concerns: ["tan", "dullness"],
    when: "AM & PM",
    keyIngredient: "Turmeric, saffron",
    howTo: "Massage onto wet face in circular motions for 30 seconds, rinse.",
    frequency: "Twice daily",
    resultsWeeks: [3, 4],
  },
  // ---------- Toner ----------
  {
    id: "plum-green-tea-toner",
    brand: "Plum",
    name: "Green Tea Alcohol-Free Toner",
    step: "toner",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["open_pores", "excess_oil"],
    when: "AM & PM",
    keyIngredient: "Green tea, glycolic acid",
    howTo: "After cleansing, pat a few drops into skin with palms or a cotton pad.",
    frequency: "Twice daily",
    resultsWeeks: [3, 4],
  },
  // ---------- Serums ----------
  {
    id: "minimalist-niacinamide",
    brand: "Minimalist",
    name: "10% Niacinamide Face Serum",
    step: "serum",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["open_pores", "excess_oil", "acne_marks", "acne", "uneven_texture"],
    when: "AM & PM",
    keyIngredient: "Niacinamide 10%, zinc",
    howTo: "Apply 2–3 drops on clean, dry skin. Let it absorb for a minute before moisturiser.",
    frequency: "Once or twice daily",
    resultsWeeks: [4, 8],
  },
  {
    id: "minimalist-vitc",
    brand: "Minimalist",
    name: "10% Vitamin C Face Serum",
    step: "serum",
    skinTypes: ["oily", "combination", "normal", "dry"],
    concerns: ["dullness", "tan", "pigmentation", "acne_marks"],
    when: "AM",
    keyIngredient: "Ethyl ascorbic acid",
    howTo: "Apply 3–4 drops on clean skin in the morning, then moisturiser and sunscreen.",
    frequency: "Every morning",
    resultsWeeks: [4, 8],
    caution: "Always follow with sunscreen.",
  },
  {
    id: "dermaco-vitc",
    brand: "The Derma Co",
    name: "10% Vitamin C Face Serum",
    step: "serum",
    skinTypes: ["normal", "combination", "dry"],
    concerns: ["dullness", "tan", "pigmentation"],
    when: "AM",
    keyIngredient: "Vitamin C, hyaluronic acid",
    howTo: "Apply 2–3 drops to face and neck in the morning before moisturiser.",
    frequency: "Every morning",
    resultsWeeks: [4, 8],
  },
  {
    id: "minimalist-alpha-arbutin",
    brand: "Minimalist",
    name: "2% Alpha Arbutin Serum",
    step: "treatment",
    skinTypes: ALL,
    concerns: ["pigmentation", "acne_marks", "tan"],
    when: "PM",
    keyIngredient: "Alpha arbutin, hyaluronic acid",
    howTo: "At night, apply 2–3 drops on dark spots and the whole face after cleansing.",
    frequency: "Every night",
    resultsWeeks: [8, 12],
  },
  {
    id: "minimalist-sa-serum",
    brand: "Minimalist",
    name: "2% Salicylic Acid Serum",
    step: "treatment",
    skinTypes: ["oily", "combination"],
    concerns: ["acne", "blackheads", "open_pores"],
    when: "PM",
    keyIngredient: "Salicylic acid (BHA)",
    howTo: "At night apply 2–3 drops on dry skin, focusing on T-zone and breakouts. Follow with moisturiser.",
    frequency: "3× a week, then nightly if tolerated",
    resultsWeeks: [4, 6],
    strong: true,
    caution: "Don't use with retinol on the same night.",
  },
  {
    id: "minimalist-retinol",
    brand: "Minimalist",
    name: "Retinol 0.3% Face Serum",
    step: "treatment",
    skinTypes: ["normal", "combination", "oily", "dry"],
    concerns: ["fine_lines", "uneven_texture", "acne_marks", "open_pores"],
    when: "PM",
    keyIngredient: "Retinol 0.3%",
    howTo: "At night, apply a pea-sized amount on fully dry skin, avoiding eyes and lips. Moisturise after.",
    frequency: "2× a week, slowly build to alternate nights",
    resultsWeeks: [8, 12],
    strong: true,
    caution: "Mild peeling is normal at first. Avoid during pregnancy. Sunscreen is a must.",
  },
  {
    id: "minimalist-tranexamic",
    brand: "Minimalist",
    name: "Tranexamic 3% Face Serum",
    step: "treatment",
    skinTypes: ALL,
    concerns: ["pigmentation", "redness", "acne_marks"],
    when: "PM",
    keyIngredient: "Tranexamic acid, niacinamide",
    howTo: "Apply 2–3 drops at night after cleansing, before moisturiser.",
    frequency: "Every night",
    resultsWeeks: [8, 12],
  },
  {
    id: "ordinary-ha",
    brand: "The Ordinary",
    name: "Hyaluronic Acid 2% + B5",
    step: "serum",
    skinTypes: ["dry", "normal", "sensitive", "combination"],
    concerns: ["dryness", "fine_lines"],
    when: "AM & PM",
    keyIngredient: "Hyaluronic acid, vitamin B5",
    howTo: "Apply a few drops to slightly damp skin, then seal with moisturiser.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "garnier-vitc",
    brand: "Garnier",
    name: "Bright Complete Vitamin C Serum",
    step: "serum",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["dullness", "tan", "acne_marks"],
    when: "AM & PM",
    keyIngredient: "Vitamin C, niacinamide",
    howTo: "Apply 3–4 drops all over the face after cleansing.",
    frequency: "Twice daily",
    resultsWeeks: [3, 6],
  },
  // ---------- Spot treatment ----------
  {
    id: "benzac-ac",
    brand: "Benzac",
    name: "AC 2.5% Gel (spot treatment)",
    step: "treatment",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["acne"],
    when: "PM",
    keyIngredient: "Benzoyl peroxide 2.5%",
    howTo: "Dab a thin layer only on active pimples at night. Wash off in the morning.",
    frequency: "Only on active pimples",
    resultsWeeks: [1, 4],
    strong: true,
    caution: "Can bleach pillowcases and towels. Stop if it burns. See a dermatologist for painful or cystic acne.",
  },
  // ---------- Moisturisers ----------
  {
    id: "cetaphil-cream",
    brand: "Cetaphil",
    name: "Moisturising Cream",
    step: "moisturizer",
    skinTypes: ["dry", "sensitive"],
    concerns: ["dryness", "redness"],
    when: "AM & PM",
    keyIngredient: "Sweet almond oil, glycerin",
    howTo: "Apply a pea-sized amount for the face over serum, massaging upward.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "neutrogena-hydro-boost",
    brand: "Neutrogena",
    name: "Hydro Boost Water Gel",
    step: "moisturizer",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["excess_oil", "dryness"],
    when: "AM & PM",
    keyIngredient: "Hyaluronic acid",
    howTo: "Smooth a small amount over face and neck after serum. Feels like water, no greasiness.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "ponds-super-light",
    brand: "Pond's",
    name: "Super Light Gel",
    step: "moisturizer",
    skinTypes: ["oily", "combination"],
    concerns: ["excess_oil"],
    when: "AM & PM",
    keyIngredient: "Hyaluronic acid, vitamin E",
    howTo: "Dot over the face and spread evenly after cleansing/serum.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "reequil-ceramide",
    brand: "Re'equil",
    name: "Ceramide & Hyaluronic Acid Moisturiser",
    step: "moisturizer",
    skinTypes: ["dry", "normal", "sensitive", "combination"],
    concerns: ["dryness", "redness", "fine_lines"],
    when: "AM & PM",
    keyIngredient: "Ceramides, hyaluronic acid",
    howTo: "Apply evenly over face after serum, morning and night.",
    frequency: "Twice daily",
    resultsWeeks: [2, 3],
  },
  {
    id: "minimalist-sepicalm",
    brand: "Minimalist",
    name: "Sepicalm 3% + Oat Moisturiser",
    step: "moisturizer",
    skinTypes: ["sensitive", "oily", "combination", "normal"],
    concerns: ["redness", "acne"],
    when: "AM & PM",
    keyIngredient: "Sepicalm, oat extract",
    howTo: "Apply a small amount to face and neck after cleansing/serum.",
    frequency: "Twice daily",
    resultsWeeks: [2, 3],
  },
  {
    id: "nivea-soft",
    brand: "Nivea",
    name: "Soft Light Moisturising Cream",
    step: "moisturizer",
    skinTypes: ["normal", "dry", "combination"],
    concerns: ["dryness"],
    when: "AM & PM",
    keyIngredient: "Jojoba oil, vitamin E",
    howTo: "Apply on face and body after bathing or washing.",
    frequency: "Twice daily",
    resultsWeeks: [1, 2],
  },
  {
    id: "plum-green-tea-moist",
    brand: "Plum",
    name: "Green Tea Oil-Free Moisturiser",
    step: "moisturizer",
    skinTypes: ["oily", "combination"],
    concerns: ["excess_oil", "acne"],
    when: "AM & PM",
    keyIngredient: "Green tea, hyaluronic acid",
    howTo: "Massage a small amount onto clean face until absorbed.",
    frequency: "Twice daily",
    resultsWeeks: [2, 3],
  },
  // ---------- Sunscreens ----------
  {
    id: "reequil-ultra-matte",
    brand: "Re'equil",
    name: "Ultra Matte Dry Touch Sunscreen SPF 50",
    step: "sunscreen",
    skinTypes: ["oily", "combination"],
    concerns: ["excess_oil", "tan", "pigmentation"],
    when: "AM",
    keyIngredient: "SPF 50 PA++++",
    howTo: "Apply two finger-lengths for face and neck as the last morning step. Reapply every 2–3 hours outdoors.",
    frequency: "Every morning, even indoors",
    resultsWeeks: [2, 4],
  },
  {
    id: "minimalist-spf50",
    brand: "Minimalist",
    name: "SPF 50 Sunscreen",
    step: "sunscreen",
    skinTypes: ALL,
    concerns: ["tan", "pigmentation", "fine_lines"],
    when: "AM",
    keyIngredient: "Broad spectrum SPF 50 PA++++",
    howTo: "Apply two finger-lengths 15 minutes before stepping out. Reapply every 2–3 hours in the sun.",
    frequency: "Every morning",
    resultsWeeks: [2, 4],
  },
  {
    id: "lakme-sun-expert",
    brand: "Lakmé",
    name: "Sun Expert SPF 50 Ultra Matte Gel",
    step: "sunscreen",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["tan", "excess_oil"],
    when: "AM",
    keyIngredient: "SPF 50 PA+++",
    howTo: "Apply generously on face, neck and arms 15 minutes before going out.",
    frequency: "Every morning",
    resultsWeeks: [2, 4],
  },
  {
    id: "dermaco-ha-sunscreen",
    brand: "The Derma Co",
    name: "1% Hyaluronic Sunscreen Aqua Gel SPF 50",
    step: "sunscreen",
    skinTypes: ["dry", "normal", "combination", "sensitive"],
    concerns: ["dryness", "tan"],
    when: "AM",
    keyIngredient: "Hyaluronic acid, SPF 50",
    howTo: "Apply two finger-lengths as the last step of your morning routine. Reapply outdoors.",
    frequency: "Every morning",
    resultsWeeks: [2, 4],
  },
  {
    id: "aqualogica-dewy",
    brand: "Aqualogica",
    name: "Glow+ Dewy Sunscreen SPF 50",
    step: "sunscreen",
    skinTypes: ["dry", "normal"],
    concerns: ["dullness", "tan"],
    when: "AM",
    keyIngredient: "Papaya, vitamin C, SPF 50",
    howTo: "Apply evenly on face and neck as the final step; gives a natural glow.",
    frequency: "Every morning",
    resultsWeeks: [2, 4],
  },
  // ---------- Eye ----------
  {
    id: "mcaffeine-eye",
    brand: "mCaffeine",
    name: "Coffee Under Eye Cream",
    step: "eye",
    skinTypes: ALL,
    concerns: ["dark_circles"],
    when: "AM & PM",
    keyIngredient: "Caffeine, cocoa butter",
    howTo: "Tap a rice-grain amount under each eye with your ring finger. Don't rub.",
    frequency: "Twice daily",
    resultsWeeks: [4, 8],
  },
  {
    id: "dotkey-eye",
    brand: "Dot & Key",
    name: "Vitamin C + E Under Eye Cream",
    step: "eye",
    skinTypes: ALL,
    concerns: ["dark_circles", "fine_lines"],
    when: "PM",
    keyIngredient: "Vitamin C, peptides",
    howTo: "At night, gently pat a small amount around the eye area.",
    frequency: "Every night",
    resultsWeeks: [4, 8],
  },
  // ---------- Masks ----------
  {
    id: "mamaearth-ubtan-mask",
    brand: "Mamaearth",
    name: "Ubtan Face Mask",
    step: "mask",
    skinTypes: ["normal", "combination", "dry", "oily"],
    concerns: ["tan", "dullness"],
    when: "Weekly",
    keyIngredient: "Turmeric, saffron",
    howTo: "Apply an even layer on clean skin, leave for 10–15 minutes, rinse with water.",
    frequency: "2× a week",
    resultsWeeks: [3, 4],
  },
  {
    id: "himalaya-clay-mask",
    brand: "Himalaya",
    name: "Purifying Neem Mask",
    step: "mask",
    skinTypes: ["oily", "combination"],
    concerns: ["excess_oil", "acne", "blackheads", "open_pores"],
    when: "Weekly",
    keyIngredient: "Neem, fuller's earth (multani mitti)",
    howTo: "Apply on face avoiding eyes, leave until semi-dry (10 min), rinse with water.",
    frequency: "1–2× a week",
    resultsWeeks: [2, 4],
  },
];

export interface RoutineStep {
  step: Step;
  product: Product;
  alternatives: Product[];
}

export interface Routine {
  am: RoutineStep[];
  pm: RoutineStep[];
  weekly: RoutineStep[];
  /** Earliest → latest week by which the whole routine should show results */
  resultsWeeks: [number, number];
}

function score(p: Product, type: SkinType, concerns: Concern[], focus?: Concern[]) {
  if (!p.skinTypes.includes(type)) return -1;
  if (type === "sensitive" && p.strong) return -1;
  let s = p.skinTypes.length === ALL.length ? 1 : 3;
  for (const c of p.concerns) if (concerns.includes(c)) s += 2;
  if (focus) for (const c of p.concerns) if (focus.includes(c)) s += 3;
  return s;
}

function pick(
  step: Step,
  type: SkinType,
  concerns: Concern[],
  opts: { slot: "AM" | "PM" | "Weekly"; exclude?: Set<string>; focus?: Concern[]; requireConcern?: boolean },
): RoutineStep | null {
  const fitsSlot = (p: Product) =>
    opts.slot === "Weekly" ? p.when === "Weekly" : p.when === opts.slot || p.when === "AM & PM";
  const ranked = PRODUCTS.filter((p) => p.step === step && fitsSlot(p) && !opts.exclude?.has(p.id))
    .map((p) => ({ p, s: score(p, type, concerns, opts.focus) }))
    .filter((x) => x.s >= 0)
    .filter((x) => !opts.requireConcern || x.p.concerns.some((c) => concerns.includes(c)))
    .sort((a, b) => b.s - a.s);
  const first = ranked[0];
  if (!first) return null;
  return { step, product: first.p, alternatives: ranked.slice(1, 3).map((x) => x.p) };
}

/**
 * Builds a simple AM / PM / weekly routine for a skin type and concerns.
 * Rules: sunscreen every morning; strong actives only at night and never for
 * sensitive skin; at most one night-time treatment so actives don't clash.
 */
export function buildRoutine(type: SkinType, concerns: Concern[]): Routine {
  const used = new Set<string>();
  const take = (s: RoutineStep | null) => {
    if (s) used.add(s.product.id);
    return s;
  };

  const am: (RoutineStep | null)[] = [];
  am.push(take(pick("cleanser", type, concerns, { slot: "AM" })));
  const brightening = concerns.some((c) => c === "dullness" || c === "tan" || c === "pigmentation");
  am.push(
    take(
      pick("serum", type, concerns, {
        slot: "AM",
        exclude: used,
        focus: brightening ? ["dullness", "tan"] : ["open_pores", "excess_oil", "dryness"],
      }),
    ),
  );
  am.push(take(pick("moisturizer", type, concerns, { slot: "AM", exclude: used })));
  am.push(take(pick("sunscreen", type, concerns, { slot: "AM", exclude: used })));

  const pm: (RoutineStep | null)[] = [];
  const amCleanser = am[0];
  // same cleanser at night keeps it simple
  if (amCleanser) pm.push(amCleanser);
  const focus: Concern[] = concerns.includes("acne")
    ? ["acne", "blackheads"]
    : concerns.includes("pigmentation") || concerns.includes("acne_marks")
      ? ["pigmentation", "acne_marks"]
      : concerns.includes("fine_lines") || concerns.includes("uneven_texture")
        ? ["fine_lines", "uneven_texture"]
        : concerns;
  pm.push(
    take(
      pick("treatment", type, concerns, {
        slot: "PM",
        exclude: new Set([...used, "benzac-ac"]),
        focus,
        requireConcern: true,
      }),
    ),
  );
  if (concerns.includes("acne") && type !== "sensitive") {
    const spot = PRODUCTS.find((p) => p.id === "benzac-ac");
    if (spot && spot.skinTypes.includes(type)) pm.push({ step: "treatment", product: spot, alternatives: [] });
  }
  if (concerns.includes("dark_circles")) pm.push(take(pick("eye", type, concerns, { slot: "PM", exclude: used })));
  const amMoist = am.find((s) => s?.step === "moisturizer");
  if (amMoist) pm.push(amMoist);

  const weekly: (RoutineStep | null)[] = [];
  if (concerns.some((c) => ["tan", "dullness", "excess_oil", "blackheads", "open_pores"].includes(c))) {
    weekly.push(pick("mask", type, concerns, { slot: "Weekly", requireConcern: true }));
  }

  const clean = (xs: (RoutineStep | null)[]) => xs.filter((x): x is RoutineStep => !!x);
  const all = [...clean(am), ...clean(pm), ...clean(weekly)];
  const from = Math.min(...all.map((s) => s.product.resultsWeeks[0]));
  const to = Math.max(...all.map((s) => s.product.resultsWeeks[1]));
  return { am: clean(am), pm: clean(pm), weekly: clean(weekly), resultsWeeks: [from, to] };
}

export function formatWeeks([a, b]: [number, number]) {
  const days = (w: number) => w * 7;
  if (b <= 2) return `${days(a)}–${days(b)} days`;
  return `${a}–${b} weeks (${days(a)}–${days(b)} days)`;
}

// ---------- Hair care ----------
export const HAIR_CONCERNS = ["hair_fall", "dandruff", "frizz", "dryness", "oily_scalp", "styling"] as const;
export type HairConcern = (typeof HAIR_CONCERNS)[number];
export const HAIR_CONCERN_LABEL: Record<HairConcern, string> = {
  hair_fall: "Hair fall / thinning",
  dandruff: "Dandruff",
  frizz: "Frizz",
  dryness: "Dry hair",
  oily_scalp: "Oily scalp",
  styling: "Styling & hold",
};

export interface HairProduct {
  id: string;
  brand: string;
  name: string;
  concerns: HairConcern[];
  howTo: string;
  frequency: string;
  resultsWeeks: [number, number];
  caution?: string;
}

export const HAIR_PRODUCTS: HairProduct[] = [
  {
    id: "mamaearth-onion-oil",
    brand: "Mamaearth",
    name: "Onion Hair Oil",
    concerns: ["hair_fall", "dryness"],
    howTo: "Massage into scalp with fingertips for 5 minutes, leave 1–2 hours or overnight, then shampoo.",
    frequency: "2× a week",
    resultsWeeks: [8, 12],
  },
  {
    id: "indulekha-bringha",
    brand: "Indulekha",
    name: "Bringha Ayurvedic Hair Oil",
    concerns: ["hair_fall"],
    howTo: "Apply to scalp using the comb applicator, massage gently, wash after at least 1 hour.",
    frequency: "2–3× a week",
    resultsWeeks: [8, 16],
  },
  {
    id: "parachute-coconut",
    brand: "Parachute",
    name: "Pure Coconut Oil",
    concerns: ["dryness", "frizz"],
    howTo: "Warm slightly, massage into scalp and lengths, leave 1 hour before washing.",
    frequency: "1–2× a week",
    resultsWeeks: [2, 4],
  },
  {
    id: "head-shoulders",
    brand: "Head & Shoulders",
    name: "Anti-Dandruff Shampoo",
    concerns: ["dandruff", "oily_scalp"],
    howTo: "Lather into wet scalp, leave for 2–3 minutes, rinse well.",
    frequency: "2–3× a week",
    resultsWeeks: [2, 4],
  },
  {
    id: "loreal-hyaluron",
    brand: "L'Oréal Paris",
    name: "Hyaluron Moisture Shampoo",
    concerns: ["dryness", "frizz"],
    howTo: "Massage into wet hair, rinse; follow with conditioner on lengths only.",
    frequency: "2–3× a week",
    resultsWeeks: [1, 3],
  },
  {
    id: "livon-serum",
    brand: "Livon",
    name: "Hair Serum",
    concerns: ["frizz"],
    howTo: "Rub 2–3 drops between palms and smooth over towel-dried lengths, avoiding the scalp.",
    frequency: "After every wash",
    resultsWeeks: [0, 1],
  },
  {
    id: "minimalist-hair-growth",
    brand: "Minimalist",
    name: "Maleic Bond Repair / Hair Growth Actives 18%",
    concerns: ["hair_fall"],
    howTo: "Apply 1 ml to dry scalp with the dropper, massage gently, don't rinse.",
    frequency: "Daily at night",
    resultsWeeks: [12, 16],
    caution: "Sudden or patchy hair loss needs a doctor, not a serum.",
  },
  {
    id: "setwet-gel",
    brand: "Set Wet",
    name: "Cool Hold Hair Gel",
    concerns: ["styling"],
    howTo: "Apply a coin-sized amount to damp hair and style with comb or fingers.",
    frequency: "As needed",
    resultsWeeks: [0, 0],
  },
  {
    id: "beardo-wax",
    brand: "Beardo",
    name: "Hair Wax (Strong Hold)",
    concerns: ["styling"],
    howTo: "Warm a pea-sized amount between palms, work through dry hair from roots to tips.",
    frequency: "As needed",
    resultsWeeks: [0, 0],
  },
];
