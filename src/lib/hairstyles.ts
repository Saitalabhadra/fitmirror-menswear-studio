import texturedCrop from "@/assets/hair/textured-crop.jpg";
import pompadour from "@/assets/hair/pompadour-quiff.jpg";
import sidePart from "@/assets/hair/classic-side-part.jpg";
import buzzFade from "@/assets/hair/buzz-fade.jpg";
import curlyTop from "@/assets/hair/curly-top-fade.jpg";
import longFlow from "@/assets/hair/long-flow.jpg";
import slickBack from "@/assets/hair/slick-back-undercut.jpg";
import longLayers from "@/assets/hair/long-layers.jpg";
import lob from "@/assets/hair/lob.jpg";
import curtainBangs from "@/assets/hair/curtain-bangs.jpg";

export const FACE_SHAPES = ["oval", "round", "square", "heart", "oblong", "diamond", "triangle"] as const;
export type FaceShape = (typeof FACE_SHAPES)[number];
export const HAIR_TYPES = ["straight", "wavy", "curly", "coily"] as const;
export type HairType = (typeof HAIR_TYPES)[number];

export interface Hairstyle {
  id: string;
  name: string;
  gender: "men" | "women";
  img: string;
  faceShapes: FaceShape[];
  hairTypes: HairType[];
  length: "short" | "medium" | "long";
  description: string;
  askBarber: string;
  styling: string;
  maintenance: string;
  styleTime: string;
}

export const HAIRSTYLES: Hairstyle[] = [
  {
    id: "textured-crop",
    name: "Textured Crop",
    gender: "men",
    img: texturedCrop,
    faceShapes: ["oval", "round", "square", "oblong", "diamond", "heart"],
    hairTypes: ["straight", "wavy"],
    length: "short",
    description: "Short, choppy top with a short fringe and faded sides. Low effort, very modern.",
    askBarber: "Mid skin fade on the sides, 2–3 inches on top, point-cut for texture, short blunt fringe.",
    styling: "Towel-dry, rub a pea-sized amount of matte clay or wax between palms, push forward and scrunch.",
    maintenance: "Trim every 3–4 weeks",
    styleTime: "3 min",
  },
  {
    id: "pompadour-quiff",
    name: "Modern Quiff",
    gender: "men",
    img: pompadour,
    faceShapes: ["round", "square", "oval", "diamond"],
    hairTypes: ["straight", "wavy"],
    length: "medium",
    description: "Volume swept up and back at the front — adds height, which slims round faces.",
    askBarber: "Taper fade on the sides, keep 4–5 inches at the front graduating shorter to the crown.",
    styling: "Blow-dry upward with a round brush, then lock with a small amount of strong-hold pomade or gel.",
    maintenance: "Trim every 4 weeks",
    styleTime: "8 min",
  },
  {
    id: "classic-side-part",
    name: "Classic Side Part",
    gender: "men",
    img: sidePart,
    faceShapes: ["oval", "square", "oblong", "heart", "diamond"],
    hairTypes: ["straight", "wavy"],
    length: "short",
    description: "Clean, office-ready look with a defined part. Balances longer faces.",
    askBarber: "Scissor cut, 2–3 inches on top, tapered sides, hard part line on your natural parting side.",
    styling: "Comb damp hair to the side, apply a light cream or gel, define the parting with a fine comb.",
    maintenance: "Trim every 3–4 weeks",
    styleTime: "4 min",
  },
  {
    id: "buzz-fade",
    name: "Buzz Cut with Fade",
    gender: "men",
    img: buzzFade,
    faceShapes: ["oval", "square", "diamond", "oblong"],
    hairTypes: ["straight", "wavy", "curly", "coily"],
    length: "short",
    description: "Zero-effort, sharp and great for hot weather. Also disguises thinning hair.",
    askBarber: "No. 2 or 3 guard on top, skin fade on the sides, sharp line-up at the hairline.",
    styling: "No styling needed. Use a light moisturiser on the scalp and sunscreen if it's very short.",
    maintenance: "Trim every 2–3 weeks",
    styleTime: "0 min",
  },
  {
    id: "curly-top-fade",
    name: "Curly Top Fade",
    gender: "men",
    img: curlyTop,
    faceShapes: ["round", "oval", "square", "oblong", "heart"],
    hairTypes: ["curly", "coily", "wavy"],
    length: "short",
    description: "Lets natural curls shine on top while the faded sides keep it neat.",
    askBarber: "Low taper fade, keep curls 2–4 inches on top, dry-cut the curls to shape.",
    styling: "On wet hair apply curl cream or leave-in, scrunch, then air-dry. Don't brush once dry.",
    maintenance: "Trim every 4 weeks",
    styleTime: "5 min",
  },
  {
    id: "long-flow",
    name: "Medium Flow",
    gender: "men",
    img: longFlow,
    faceShapes: ["oval", "oblong", "square", "heart", "diamond"],
    hairTypes: ["wavy", "straight"],
    length: "long",
    description: "Relaxed, layered length past the ears. Softens strong jaws.",
    askBarber: "Grow out evenly; add long layers and thin the bulk, keep length just below the ears.",
    styling: "Sea-salt spray on damp hair, blow-dry back with fingers, finish with a drop of hair serum.",
    maintenance: "Trim ends every 8 weeks",
    styleTime: "6 min",
  },
  {
    id: "slick-back-undercut",
    name: "Slick Back Undercut",
    gender: "men",
    img: slickBack,
    faceShapes: ["oval", "square", "diamond", "heart"],
    hairTypes: ["straight", "wavy"],
    length: "medium",
    description: "Sharp contrast between a glossy combed-back top and short sides — great for events.",
    askBarber: "Disconnected undercut, 4–5 inches on top, leave length to comb back.",
    styling: "Apply water-based pomade to damp hair, comb straight back, smooth with palms.",
    maintenance: "Trim every 3–4 weeks",
    styleTime: "5 min",
  },
  {
    id: "long-layers",
    name: "Long Face-Framing Layers",
    gender: "women",
    img: longLayers,
    faceShapes: ["round", "square", "oval", "heart", "diamond"],
    hairTypes: ["straight", "wavy"],
    length: "long",
    description: "Soft layers starting at the cheekbones add movement and slim the face.",
    askBarber: "Keep length, add long layers with the shortest at the cheekbones, feather the ends.",
    styling: "Blow-dry with a round brush turning ends away from the face; finish with a light serum.",
    maintenance: "Trim every 8–10 weeks",
    styleTime: "10 min",
  },
  {
    id: "lob",
    name: "Long Bob (Lob)",
    gender: "women",
    img: lob,
    faceShapes: ["oval", "oblong", "heart", "square"],
    hairTypes: ["straight", "wavy"],
    length: "medium",
    description: "Shoulder-grazing, sleek and fresh — easy to manage in humid weather.",
    askBarber: "Blunt cut just above or at the shoulders, slightly longer at the front.",
    styling: "Straighten or flat-iron waves, finish with a heat-protect serum.",
    maintenance: "Trim every 6–8 weeks",
    styleTime: "8 min",
  },
  {
    id: "curtain-bangs",
    name: "Curtain Bangs with Waves",
    gender: "women",
    img: curtainBangs,
    faceShapes: ["oblong", "heart", "oval", "square", "diamond"],
    hairTypes: ["wavy", "straight", "curly"],
    length: "medium",
    description: "Middle-parted bangs that sweep both ways — shortens long faces and softens foreheads.",
    askBarber: "Curtain bangs starting at nose length, blended into face-framing layers.",
    styling: "Blow-dry bangs with a round brush away from the face; loose waves with a curling wand.",
    maintenance: "Bang trim every 3–4 weeks",
    styleTime: "10 min",
  },
];

export function findHairstyle(id: string) {
  return HAIRSTYLES.find((h) => h.id === id);
}

/** Ranks styles for a face shape + hair type. Face-shape fit matters most. */
export function rankHairstyles(
  gender: "men" | "women",
  faceShape: FaceShape | null,
  hairType: HairType | null,
): Hairstyle[] {
  return HAIRSTYLES.filter((h) => h.gender === gender)
    .map((h) => ({
      h,
      score: (faceShape && h.faceShapes.includes(faceShape) ? 10 : 0) + (hairType && h.hairTypes.includes(hairType) ? 4 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.h);
}

export const FACE_SHAPE_TIPS: Record<FaceShape, string> = {
  oval: "Balanced proportions — almost every style works. Keep hair off the forehead to show it off.",
  round: "Add height on top and keep the sides short to make the face look longer.",
  square: "Strong jaw — textured or slightly longer tops soften the angles.",
  heart: "Wider forehead, narrow chin — fringes and side-swept styles balance it.",
  oblong: "Longer face — avoid too much height; fringes and fuller sides work best.",
  diamond: "Wide cheekbones — add fullness at the forehead and chin, keep it textured.",
  triangle: "Wider jaw — volume on top and at the temples balances the lower face.",
};
