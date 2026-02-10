import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "munchies" | "gallery" | "collection";

export interface Strain {
  id: string;
  name: string;
  type: "sativa" | "indica" | "hybrid";
  color: string;
  glowColor: string;
  particleColor: string;
  effect: string;
  description: string;
  unlocked: boolean;
  rarity: "common" | "rare" | "legendary";
}

export interface VibeSettings {
  lightingPreset: "sunset" | "neon" | "chill" | "cosmic" | "forest";
  roomTheme: "apartment" | "rooftop" | "forest" | "space" | "beach";
  musicTrack: number;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalSessions: number;
  strainsCollected: number;
  munchiesEaten: number;
  highScore: number;
  streak: number;
}

interface GameState {
  phase: GamePhase;
  vibeLevel: number;
  currentStrain: Strain | null;
  strains: Strain[];
  vibeSettings: VibeSettings;
  stats: PlayerStats;
  tripIntensity: number;
  munchieScore: number;
  screenshots: string[];

  setPhase: (phase: GamePhase) => void;
  setVibeLevel: (level: number) => void;
  setCurrentStrain: (strain: Strain | null) => void;
  unlockStrain: (id: string) => void;
  setVibeSettings: (settings: Partial<VibeSettings>) => void;
  addXP: (amount: number) => void;
  setTripIntensity: (intensity: number) => void;
  incrementSessions: () => void;
  setMunchieScore: (score: number) => void;
  addMunchiesEaten: (count: number) => void;
  addScreenshot: (url: string) => void;
  resetMunchieGame: () => void;
}

const DEFAULT_STRAINS: Strain[] = [
  {
    id: "og-kush",
    name: "OG Kush",
    type: "hybrid",
    color: "#4a7c3f",
    glowColor: "#7fff00",
    particleColor: "#90EE90",
    effect: "Balanced vibes with golden haze",
    description: "The classic. A perfect balance of relaxation and euphoria.",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "purple-haze",
    name: "Purple Haze",
    type: "sativa",
    color: "#9370DB",
    glowColor: "#BA55D3",
    particleColor: "#DDA0DD",
    effect: "Psychedelic purple swirls",
    description: "Inspired by Hendrix. Trippy purple visuals and creative energy.",
    unlocked: true,
    rarity: "common",
  },
  {
    id: "blue-dream",
    name: "Blue Dream",
    type: "hybrid",
    color: "#4169E1",
    glowColor: "#00BFFF",
    particleColor: "#87CEEB",
    effect: "Dreamy blue mist with sparkles",
    description: "Float through a cerulean dreamscape. Gentle and uplifting.",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "northern-lights",
    name: "Northern Lights",
    type: "indica",
    color: "#00FA9A",
    glowColor: "#00FF7F",
    particleColor: "#98FB98",
    effect: "Aurora borealis wave patterns",
    description: "Watch the northern lights dance across your ceiling.",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "golden-goat",
    name: "Golden Goat",
    type: "sativa",
    color: "#D4AF37",
    glowColor: "#FFD700",
    particleColor: "#FAFAD2",
    effect: "Golden sunshine rays with warmth",
    description: "Pure golden sunshine. Everything feels warm and bright.",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "alien-og",
    name: "Alien OG",
    type: "hybrid",
    color: "#00FF00",
    glowColor: "#39FF14",
    particleColor: "#ADFF2F",
    effect: "Extraterrestrial geometric patterns",
    description: "Out of this world. See geometric patterns from another dimension.",
    unlocked: false,
    rarity: "legendary",
  },
  {
    id: "galaxy-brain",
    name: "Galaxy Brain",
    type: "sativa",
    color: "#8B00FF",
    glowColor: "#9400D3",
    particleColor: "#E6E6FA",
    effect: "Cosmic nebula expansion with stars",
    description: "Your mind becomes the universe. Stars and nebulae everywhere.",
    unlocked: false,
    rarity: "legendary",
  },
  {
    id: "lava-cake",
    name: "Lava Cake",
    type: "indica",
    color: "#FF4500",
    glowColor: "#FF6347",
    particleColor: "#FFA07A",
    effect: "Warm lava flow with ember particles",
    description: "Melting warmth flows through you. Cozy and decadent.",
    unlocked: false,
    rarity: "legendary",
  },
];

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    vibeLevel: 0,
    currentStrain: DEFAULT_STRAINS[0],
    strains: DEFAULT_STRAINS,
    vibeSettings: {
      lightingPreset: "sunset",
      roomTheme: "apartment",
      musicTrack: 0,
    },
    stats: {
      level: 1,
      xp: 0,
      xpToNext: 100,
      totalSessions: 0,
      strainsCollected: 2,
      munchiesEaten: 0,
      highScore: 0,
      streak: 0,
    },
    tripIntensity: 0,
    munchieScore: 0,
    screenshots: [],

    setPhase: (phase) => set({ phase }),

    setVibeLevel: (level) => set({ vibeLevel: Math.min(Math.max(level, 0), 100) }),

    setCurrentStrain: (strain) => set({ currentStrain: strain }),

    unlockStrain: (id) =>
      set((state) => {
        const strains = state.strains.map((s) =>
          s.id === id ? { ...s, unlocked: true } : s
        );
        const strainsCollected = strains.filter((s) => s.unlocked).length;
        return {
          strains,
          stats: { ...state.stats, strainsCollected },
        };
      }),

    setVibeSettings: (settings) =>
      set((state) => ({
        vibeSettings: { ...state.vibeSettings, ...settings },
      })),

    addXP: (amount) =>
      set((state) => {
        let newXP = state.stats.xp + amount;
        let newLevel = state.stats.level;
        let newXPToNext = state.stats.xpToNext;

        while (newXP >= newXPToNext) {
          newXP -= newXPToNext;
          newLevel++;
          newXPToNext = Math.floor(newXPToNext * 1.5);

          const lockedStrains = state.strains.filter((s) => !s.unlocked);
          if (lockedStrains.length > 0 && newLevel % 3 === 0) {
            const randomStrain = lockedStrains[Math.floor(Math.random() * lockedStrains.length)];
            get().unlockStrain(randomStrain.id);
          }
        }

        return {
          stats: {
            ...state.stats,
            level: newLevel,
            xp: newXP,
            xpToNext: newXPToNext,
          },
        };
      }),

    setTripIntensity: (intensity) =>
      set({ tripIntensity: Math.min(Math.max(intensity, 0), 1) }),

    incrementSessions: () =>
      set((state) => ({
        stats: {
          ...state.stats,
          totalSessions: state.stats.totalSessions + 1,
        },
      })),

    setMunchieScore: (score) =>
      set((state) => ({
        munchieScore: score,
        stats: {
          ...state.stats,
          highScore: Math.max(state.stats.highScore, score),
        },
      })),

    addMunchiesEaten: (count) =>
      set((state) => ({
        stats: {
          ...state.stats,
          munchiesEaten: state.stats.munchiesEaten + count,
        },
      })),

    addScreenshot: (url) =>
      set((state) => ({
        screenshots: [...state.screenshots, url].slice(-20),
      })),

    resetMunchieGame: () => set({ munchieScore: 0 }),
  }))
);
