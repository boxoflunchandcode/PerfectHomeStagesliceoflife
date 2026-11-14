import { ReactElement } from "react";
import { StageBase, StageResponse, InitialData, Message } from "@chub-ai/stages-ts";
import { LoadResponse } from "@chub-ai/stages-ts/dist/types/load";

type MessageStateType = {
  day?: number;
  date?: string;
  characters?: Character[];
  inventory?: InventoryItem[];
  events?: CalendarEvent[];
};

type ConfigType = any;
type InitStateType = any;
type ChatStateType = any;

interface Character {
  name: string;
  desire: number;
  orgasms: number;
  cum: number;
  outfit: string;
  marks: string[];
  mood: string;
}

interface InventoryItem {
  name: string;
  location: string;
  notes?: string;
}

interface CalendarEvent {
  title: string;
  date: string;
  notes?: string;
}

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  day: number = 1;
  date: string = new Date().toISOString().slice(0, 10);
  characters: Character[] = [
    { name: "Natalie", desire: 40, orgasms: 0, cum: 0, outfit: "Victor's shirt", marks: [], mood: "content" },
    { name: "Vesper", desire: 20, orgasms: 0, cum: 0, outfit: "teal dress", marks: [], mood: "elegant" },
    { name: "Mira", desire: 30, orgasms: 0, cum: 0, outfit: "spats + socks", marks: [], mood: "calm" },
  ];
  inventory: InventoryItem[] = [
    { name: "Cinnamon bites", location: "kitchen" },
    { name: "Garden tools", location: "garage" },
  ];
  events: CalendarEvent[] = [];

  constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
    super(data);
    const { messageState } = data;
    if (messageState) {
      this.day = messageState.day ?? this.day;
      this.date = messageState.date ?? this.date;
      this.characters = messageState.characters ?? this.characters;
      this.inventory = messageState.inventory ?? this.inventory;
      this.events = messageState.events ?? this.events;
    }
  }

  async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
    return {
      success: true,
      error: null,
      initState: null,
      chatState: null,
    };
  }

  async setState(state: MessageStateType): Promise<void> {
    if (state != null) {
      this.day = state.day ?? this.day;
      this.date = state.date ?? this.date;
      if (state.characters) this.characters = state.characters;
      if (state.inventory) this.inventory = state.inventory;
      if (state.events) this.events = state.events;
    }
  }

  async beforePrompt(inputMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    return {
      stageDirections: null,
      messageState: {
        day: this.day,
        date: this.date,
        characters: this.characters,
        inventory: this.inventory,
        events: this.events,
      },
      modifiedMessage: null,
      systemMessage: null,
      error: null,
      chatState: null,
    };
  }

  async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    return {
      stageDirections: null,
      messageState: {
        day: this.day,
        date: this.date,
        characters: this.characters,
        inventory: this.inventory,
        events: this.events,
      },
      modifiedMessage: null,
      systemMessage: null,
      error: null,
      chatState: null,
    };
  }

  render(): ReactElement {
    return (
      <div style={{ padding: 16, fontFamily: "sans-serif" }}>
        <h2>House Status — Day {this.day}</h2>
        <p>Date: {this.date}</p>
        <h3>Pack</h3>
        <ul>
          {this.characters.map((c) => (
            <li key={c.name}>
              {c.name} — desire {c.desire}, mood: {c.mood}, outfit: {c.outfit}
            </li>
          ))}
        </ul>
        <h3>Inventory</h3>
        <ul>
          {this.inventory.map((i) => (
            <li key={i.name}>{i.name} ({i.location})</li>
          ))}
        </ul>
      </div>
    );
  }
}
