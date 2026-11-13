import { ReactElement } from "react";
import { StageBase, StageResponse, InitialData, Message } from "@chub-ai/stages-ts";
import { LoadResponse } from "@chub-ai/stages-ts/dist/types/load";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

export type DesireLevel = "low" | "medium" | "high" | "extreme";
export type CumLevel = "none" | "light" | "moderate" | "full" | "overflowing";

export interface EquippedItem {
  id: string;
  name: string;
  slot: "collar" | "top" | "bottom" | "underwear" | "accessory" | "jewelry" | "phone" | "other";
  description?: string;
  wornSince?: string; // ISO date
}

export interface InventoryItem extends EquippedItem {
  quantity: number;
  location?: string; // "worn", "bedroom closet", "kitchen drawer", etc.
}

export interface CharacterState {
  name: string;
  role: "first_mate" | "pack" | "other";
  location: string; // room name
  currentOutfit: EquippedItem[];
  desire: DesireLevel;
  orgasmsToday: number;
  cumLevel: CumLevel;
  marks: { type: string; location: string; notes?: string; since: string }[];
  notes: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  description?: string;
  characters?: string[];
  completed?: boolean;
}

export interface MessageStateType {
  day: number;
  date: string; // YYYY-MM-DD
  characters: Record<string, CharacterState>;
  inventory: Record<string, InventoryItem>;
  rooms: Record<string, string[]>; // room -> character names currently there
  events: CalendarEvent[];
  lastUpdated: string;
}

export type ChatStateType = {
  houseName?: string;
};

export type InitStateType = {
  started: string;
};

export type ConfigType = {
  showDesire: boolean;
  showInventory: boolean;
  compactInjection: boolean;
};

// ────────────────────────────────────────────────
// Stage
// ────────────────────────────────────────────────

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  public currentState: MessageStateType;
  public config: ConfigType;

  constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
    super(data);
    const { config, messageState } = data;

    this.config = {
      showDesire: config?.showDesire !== false,
      showInventory: config?.showInventory !== false,
      compactInjection: config?.compactInjection !== false,
    };

    this.currentState = messageState || this.getDefaultState();
  }

  private getDefaultState(): MessageStateType {
    const today = new Date().toISOString().split("T")[0];
    return {
      day: 1,
      date: today,
      characters: {
        Natalie: {
          name: "Natalie",
          role: "first_mate",
          location: "Master Bedroom",
          currentOutfit: [
            { id: "collar", name: "Grey-blue leather collar (Natalie / Victor + blue gem V)", slot: "collar" },
            { id: "sweater", name: "Deep v-neck brown sweater", slot: "top" },
            { id: "shorts", name: "Short jean shorts", slot: "bottom" },
            { id: "panties", name: "White panties", slot: "underwear" },
          ],
          desire: "medium",
          orgasmsToday: 0,
          cumLevel: "none",
          marks: [],
          notes: "Warm tsundere, fully open, first mate.",
        },
      },
      inventory: {},
      rooms: {
        "Master Bedroom": ["Natalie"],
        "Kitchen": [],
        "Living Room": [],
        "Garden": [],
        "Basement (Man Cave)": [],
      },
      events: [],
      lastUpdated: new Date().toISOString(),
    };
  }

  async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
    return {
      success: true,
      error: null,
      initState: { started: new Date().toISOString() },
      chatState: {},
    };
  }

  async setState(state: MessageStateType): Promise<void> {
    if (state) {
      this.currentState = { ...this.getDefaultState(), ...state };
      // Ensure required fields exist
      if (!this.currentState.characters.Natalie) {
        this.currentState.characters.Natalie = this.getDefaultState().characters.Natalie;
      }
    }
  }

  // ──────────────────────────────────────────────
  // Prompt injection (every turn)
  // ──────────────────────────────────────────────

  async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    const injection = this.buildStatusInjection();

    return {
      stageDirections: injection,
      messageState: this.currentState,
    };
  }

  private buildStatusInjection(): string {
    const s = this.currentState;
    const lines: string[] = [];

    lines.push(`[HOUSE STATUS — Day ${s.day} (${s.date})]`);

    // Characters
    for (const char of Object.values(s.characters)) {
      const outfit = char.currentOutfit.map(i => i.name).join(", ") || "nothing notable";
      lines.push(
        `${char.name} (${char.role}): ${char.location} | Outfit: ${outfit} | Desire: ${char.desire} | Orgasms today: ${char.orgasmsToday} | Cum: ${char.cumLevel}`
      );
      if (char.marks.length) {
        lines.push(`  Marks: ${char.marks.map(m => `${m.type} on ${m.location}`).join("; ")}`);
      }
    }

    // Upcoming events (next 3)
    const upcoming = s.events
      .filter(e => !e.completed && e.date >= s.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
    if (upcoming.length) {
      lines.push("Upcoming: " + upcoming.map(e => `${e.date}${e.time ? " " + e.time : ""} — ${e.title}`).join(" | "));
    }

    lines.push("[End status]");
    return lines.join("\n");
  }

  // ──────────────────────────────────────────────
  // Simple helpers the UI or you can call
  // ──────────────────────────────────────────────

  updateCharacter(name: string, partial: Partial<CharacterState>) {
    if (!this.currentState.characters[name]) return;
    this.currentState.characters[name] = { ...this.currentState.characters[name], ...partial };
    this.currentState.lastUpdated = new Date().toISOString();
  }

  addEvent(event: Omit<CalendarEvent, "id">) {
    const id = "evt_" + Date.now();
    this.currentState.events.push({ ...event, id });
  }

  // ──────────────────────────────────────────────
  // Render (minimal for now — expand BaseScreen as needed)
  // ──────────────────────────────────────────────

  render(): ReactElement {
    return (
      <div style={{ fontFamily: "system-ui", padding: "8px", fontSize: "13px", color: "#e0e0e0", background: "#1a1a1a" }}>
        <div style={{ fontWeight: "bold", marginBottom: "6px" }}>House Status</div>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{this.buildStatusInjection()}</pre>
        <div style={{ marginTop: "8px", opacity: 0.7, fontSize: "11px" }}>
          Full panels (inventory, calendar, rooms, desire) can be expanded in BaseScreen.
        </div>
      </div>
    );
  }
}
