/**
 * Narrative content for the story-driven sections.
 *
 * The copy describes the traditional Hyderabadi dum method in general terms.
 * Before launch, have the restaurant confirm anything presented as *their* practice
 * (ingredients, timings, family recipes) — and edit freely.
 */

export type StoryScene = {
  id: string;
  index: string;
  label: string;
  title: string;
  body: string;
  image: string;
  alt: string;
  /** Small arch-framed close-ups shown beside the main image. */
  insets?: { image: string; alt: string }[];
  tags?: string[];
  steam?: boolean;
  /** CSS object-position for the main image. */
  focus?: string;
};

export const storyScenes: StoryScene[] = [
  {
    id: "ingredients",
    index: "01",
    label: "The Ingredients",
    title: "It begins with the grain.",
    body: "Long-grain basmati, threads of saffron, whole spices, fresh mint and coriander, and onions fried slowly to a deep, sweet gold.",
    image: "/images/story-spices.jpg",
    alt: "Whole and ground spices arranged across a dark surface",
    insets: [
      { image: "/images/story-saffron.jpg", alt: "Close-up of deep red saffron threads" },
      { image: "/images/story-rice.jpg", alt: "Long grains of uncooked basmati rice" },
    ],
    tags: ["Basmati", "Saffron", "Mint", "Birista"],
    focus: "50% 50%",
  },
  {
    id: "preparation",
    index: "02",
    label: "The Preparation",
    title: "Patience, layer by layer.",
    body: "Meat or vegetables rest in yoghurt and spice. The rice is part-cooked, then layered over them with saffron milk, herbs, ghee and fried onions.",
    image: "/images/story-flame.jpg",
    alt: "A cook working over a high flame in a busy kitchen",
    focus: "50% 40%",
  },
  {
    id: "dum",
    index: "03",
    label: "The Dum",
    title: "Sealed. Then left alone.",
    body: "The handi is closed tight and set over gentle heat, so everything cooks in its own steam. Nothing escapes — not the aroma, not the flavour.",
    image: "/images/story-dum.jpg",
    alt: "A covered handi of biryani resting on a wooden tray in low light",
    steam: true,
    focus: "50% 72%",
  },
  {
    id: "reveal",
    index: "04",
    label: "The Reveal",
    title: "The seal breaks.",
    body: "The lid lifts, steam pours out and the layers appear: saffron gold, pearl white and the deep colour of slow-cooked spice.",
    image: "/images/story-reveal.jpg",
    alt: "Golden biryani seen from above in a black pan, scattered with fried onions and whole spices",
    focus: "50% 70%",
  },
  {
    id: "first-bite",
    index: "05",
    label: "The First Bite",
    title: "Then, the first bite.",
    body: "Served from the handi with mirchi ka salan and raita — the way Hyderabad has always shared it.",
    image: "/images/story-first-bite.jpg",
    alt: "A spoonful of biryani lifted from a bowl, steam rising",
    focus: "50% 45%",
  },
];

export type DumStep = {
  title: string;
  body: string;
  image: string;
  alt: string;
};

export const dumSteps: DumStep[] = [
  {
    title: "Marinate",
    body: "Yoghurt, ginger-garlic, chilli and whole spices work into the meat.",
    image: "/images/story-spices.jpg",
    alt: "Spices laid out for a marinade",
  },
  {
    title: "Layer",
    body: "Part-cooked basmati goes over the marinade with saffron, mint and birista.",
    image: "/images/story-rice.jpg",
    alt: "Long-grain basmati rice",
  },
  {
    title: "Seal",
    body: "The handi is closed tight — traditionally with a ring of dough.",
    image: "/images/story-dum.jpg",
    alt: "A handi of biryani in low light",
  },
  {
    title: "Dum",
    body: "Gentle, patient heat. The biryani cooks in its own fragrant steam.",
    image: "/images/biryani-bowl-dark.jpg",
    alt: "Biryani resting in a wooden bowl",
  },
  {
    title: "Serve",
    body: "The seal is broken at the table's moment — and served straight from the handi.",
    image: "/images/biryani-mutton-dum.jpg",
    alt: "Biryani served in a brass bowl",
  },
];

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  /** Grid footprint on desktop. */
  span: "tall" | "wide" | "square";
};

export const gallery: GalleryImage[] = [
  {
    src: "/images/hero-interior.jpg",
    alt: "A warmly lit dining room with pendant lamps and an open kitchen behind patterned tiles",
    caption: "Pendant light and an open kitchen",
    span: "tall",
  },
  {
    src: "/images/dining-copper.jpg",
    alt: "Copper and brass serving vessels on a table set with many dishes",
    caption: "Copper and brass at the table",
    span: "wide",
  },
  {
    src: "/images/dining-spread.jpg",
    alt: "Biryani served in a pan beside bowls of vegetables and accompaniments",
    caption: "A feast for the table",
    span: "square",
  },
  {
    src: "/images/dining-warm.jpg",
    alt: "A cosy restaurant interior laid for dinner",
    caption: "Set for the evening",
    span: "square",
  },
  {
    src: "/images/dining-chefs.jpg",
    alt: "Cooks working side by side at the stoves of a busy kitchen",
    caption: "The kitchen at full flame",
    span: "square",
  },
  {
    src: "/images/dining-kitchen-copper.jpg",
    alt: "A copper cooking pot in a rustic kitchen",
    caption: "Copper, flame and patience",
    span: "tall",
  },
  {
    src: "/images/dining-table.jpg",
    alt: "Brass and copper vessels arranged on wooden shelves above a counter",
    caption: "Brass, copper and carved wood",
    span: "wide",
  },
  {
    src: "/images/heritage-charminar.jpg",
    alt: "The Charminar in Hyderabad, its four minarets against the sky",
    caption: "From the city of the Charminar",
    span: "square",
  },
];

export type Reason = {
  title: string;
  body: string;
  icon: "spice" | "hands" | "handi" | "celebration";
};

export const reasons: Reason[] = [
  {
    title: "Authentic Hyderabadi Flavours",
    body: "Built around the spice, saffron and slow-cooked character Hyderabadi biryani is loved for — fragrant rather than fiery, layered rather than mixed.",
    icon: "spice",
  },
  {
    title: "Made With Care",
    body: "Biryani layered and finished on dum, with accompaniments made to go with it. Ask us about today's preparation — we're happy to share.",
    icon: "hands",
  },
  {
    title: "Generous Portions",
    body: "Single, full and family portions, so a quiet lunch for one and a table of six can order from the same menu.",
    icon: "handi",
  },
  {
    title: "Made for Every Occasion",
    body: "Everyday meals, family gatherings, office lunches and celebrations — with packs and platters designed for sharing.",
    icon: "celebration",
  },
];
