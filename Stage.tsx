import { ReactElement } from "react";
import { StageBase, StageResponse, InitialData, Message } from "@chub-ai/stages-ts";
import { LoadResponse } from "@chub-ai/stages-ts/dist/types/load";

type MessageStateType = any;
type ConfigType = any;
type InitStateType = any;
type ChatStateType = any;

interface InventoryItem {
  id: string;
  name: string;
  owner: string; // character name or "house"
  status: "worn" | "stored";
  location: string; // room or "on person"
  notes?: string;
}

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
}

interface CharacterState {
  name: string;
  role: string;
  location: string;
  desire: "low" | "medium" | "high" | "extreme";
  orgasms: number;
  cum: "none" | "light" | "moderate" | "full" | "overflowing";
  outfit: string;
  outfitImage?: string;
  marks: string;
  mood: string;
  notes: string;
}

export class Stage extends StageBase<InitStateType, ChatStateType, MessageStateType, ConfigType> {
  private day: number = 1;
  private date: string = new Date().toISOString().slice(0, 10);
  private characters: CharacterState[] = [
    {
      name: "Natalie",
      role: "first_mate",
      location: "Master Bedroom",
      desire: "medium",
      orgasms: 0,
      cum: "none",
      outfit: "Grey-blue leather collar (Natalie / Victor + blue gem V), Deep v-neck brown sweater, Short jean shorts, White panties",
      marks: "none",
      mood: "",
      notes: "Warm tsundere, fully open, first mate."
    },
    {
      name: "Vesper",
      role: "pack",
      location: "Home",
      desire: "low",
      orgasms: 0,
      cum: "none",
      outfit: "—",
      marks: "none",
      mood: "",
      notes: ""
    },
    {
      name: "Mira",
      role: "pack",
      location: "Home",
      desire: "low",
      orgasms: 0,
      cum: "none",
      outfit: "—",
      marks: "none",
      mood: "",
      notes: ""
    }
  ];

  private inventory: InventoryItem[] = [
    { id: "collar-nat", name: "Grey-blue leather collar (Natalie / Victor + blue gem V)", owner: "Natalie", status: "worn", location: "on person" },
    { id: "sweater-nat", name: "Deep v-neck brown sweater", owner: "Natalie", status: "worn", location: "on person" },
    { id: "shorts-nat", name: "Short jean shorts", owner: "Natalie", status: "worn", location: "on person" },
    { id: "panties-nat", name: "White panties", owner: "Natalie", status: "worn", location: "on person" }
  ];

  private events: CalendarEvent[] = [];

  private rooms = ["Entryway", "Living Room", "Kitchen", "Dining Room", "Master Bedroom", "Master Bath", "Natalie's Room", "Basement (Man Cave)", "Garden"];

  private outfitOptions = [
    "Grey-blue leather collar (Natalie / Victor + blue gem V), Deep v-neck brown sweater, Short jean shorts, White panties",
    "Periwinkle sheer blouse + dusty rose pleated skirt",
    "Navy knee-length dress with slit",
    "Victor's shirt + jean shorts",
    "Nude under open robe",
    "—"
  ];

  private desireLevels: Array<"low" | "medium" | "high" | "extreme"> = ["low", "medium", "high", "extreme"];

  constructor(data: InitialData<InitStateType, ChatStateType, MessageStateType, ConfigType>) {
    super(data);
    this.day = data.messageState?.day ?? 1;
    this.date = data.messageState?.date ?? this.date;
    if (data.messageState?.characters) this.characters = data.messageState.characters;
    if (data.messageState?.inventory) this.inventory = data.messageState.inventory;
    if (data.messageState?.events) this.events = data.messageState.events;
  }

  async load(): Promise<Partial<LoadResponse<InitStateType, ChatStateType, MessageStateType>>> {
    return {
      success: true,
      error: null,
      data: this.getMessageState()
    };
  }

  async beforePrompt(userMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    const status = this.buildStatusBlock();
    return {
      stageDirections: `<HouseStatus>\n${status}\n</HouseStatus>`,
      messageState: this.getMessageState()
    };
  }

  async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    return {
      messageState: this.getMessageState()
    };
  }

  async onSwipe(message: Message, isBot: boolean): Promise<Partial<StageResponse<ChatStateType, MessageStateType>>> {
    return { messageState: this.getMessageState() };
  }

  private getMessageState(): MessageStateType {
    return {
      day: this.day,
      date: this.date,
      characters: this.characters,
      inventory: this.inventory,
      events: this.events
    };
  }

  private buildStatusBlock(): string {
    const lines: string[] = [];
    lines.push(`Day ${this.day} — ${this.date}`);
    lines.push("");
    lines.push("CHARACTERS:");
    this.characters.forEach(c => {
      lines.push(`- ${c.name} (${c.role}): ${c.location} | Desire: ${c.desire} | Orgasms: ${c.orgasms} | Cum: ${c.cum} | Outfit: ${c.outfit} | Marks: ${c.marks}`);
    });
    lines.push("");
    lines.push("INVENTORY (worn):");
    this.inventory.filter(i => i.status === "worn").forEach(i => {
      lines.push(`- ${i.name} (${i.owner})`);
    });
    if (this.events.length) {
      lines.push("");
      lines.push("EVENTS:");
      this.events.slice(-3).forEach(e => lines.push(`- ${e.date}: ${e.title}`));
    }
    return lines.join("\n");
  }

  private updateCharacter(name: string, field: keyof CharacterState, value: any) {
    const c = this.characters.find(x => x.name === name);
    if (c) (c as any)[field] = value;
  }

  private addInventoryItem(item: InventoryItem) {
    this.inventory.push(item);
  }

  private addEvent(event: CalendarEvent) {
    this.events.push(event);
  }

  render(): ReactElement {
    return (
      <div style={{ padding: "12px", fontFamily: "system-ui, sans-serif", color: "#e0e0e0", background: "#1a1a1a", height: "100%", overflow: "auto" }}>
        <h3 style={{ margin: "0 0 8px 0" }}>House Status</h3>
        <div style={{ marginBottom: "12px" }}>Day {this.day} — {this.date}</div>

        <div style={{ marginBottom: "12px" }}>
          <strong>Quick set Natalie location</strong>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
            {this.rooms.map(r => (
              <button
                key={r}
                onClick={() => { this.updateCharacter("Natalie", "location", r); this.forceUpdate?.(); }}
                style={{ padding: "4px 8px", background: "#333", color: "#fff", border: "1px solid #555", borderRadius: "4px", cursor: "pointer", fontSize: "0.85em" }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>Characters</strong>
          {this.characters.map(c => (
            <div key={c.name} style={{ border: "1px solid #444", borderRadius: "6px", padding: "8px", marginTop: "8px" }}>
              <div><strong>{c.name}</strong> ({c.role})</div>

              <div style={{ marginTop: "6px" }}>Location:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                {this.rooms.map(r => (
                  <button
                    key={r}
                    onClick={() => { c.location = r; this.forceUpdate?.(); }}
                    style={{
                      padding: "2px 6px",
                      background: c.location === r ? "#4a7" : "#333",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "0.85em"
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "6px" }}>Desire:</div>
              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                {this.desireLevels.map(d => (
                  <button
                    key={d}
                    onClick={() => { c.desire = d; this.forceUpdate?.(); }}
                    style={{
                      padding: "2px 8px",
                      background: c.desire === d ? "#a47" : "#333",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "0.85em"
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "6px" }}>Outfit:</div>
              <select
                value={c.outfit}
                onChange={e => { c.outfit = e.target.value; this.forceUpdate?.(); }}
                style={{ width: "100%", background: "#222", color: "#fff", border: "1px solid #444", padding: "4px", marginTop: "4px" }}
              >
                {this.outfitOptions.map(o => (
                  <option key={o} value={o}>{o.length > 60 ? o.slice(0, 57) + "..." : o}</option>
                ))}
              </select>

              {c.outfitImage && (
                <img src={c.outfitImage} alt="outfit" style={{ maxWidth: "100%", maxHeight: "120px", marginTop: "6px", borderRadius: "4px" }} />
              )}

              <div style={{ marginTop: "6px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        c.outfitImage = reader.result as string;
                        this.forceUpdate?.();
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ fontSize: "0.8em" }}
                />
              </div>

              <div style={{ marginTop: "6px" }}>Orgasms: {c.orgasms} | Cum: {c.cum}</div>
              <div>Marks: {c.marks}</div>
              <div>Mood</div>
              <input
                value={c.mood}
                onChange={e => { c.mood = e.target.value; }}
                style={{ width: "100%", background: "#222", color: "#fff", border: "1px solid #444", padding: "4px" }}
              />
              <div>Notes</div>
              <input
                value={c.notes}
                onChange={e => { c.notes = e.target.value; }}
                style={{ width: "100%", background: "#222", color: "#fff", border: "1px solid #444", padding: "4px" }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <strong>Inventory</strong>
          <div style={{ marginTop: "6px" }}>
            {this.inventory.map(item => (
              <div key={item.id} style={{ fontSize: "0.9em", marginBottom: "4px" }}>
                {item.status === "worn" ? "●" : "○"} {item.name} — {item.owner} ({item.location})
              </div>
            ))}
          </div>
          <div style={{ marginTop: "8px" }}>
            <input id="newItemName" placeholder="New item name" style={{ width: "60%", background: "#222", color: "#fff", border: "1px solid #444", padding: "4px" }} />
            <button
              onClick={() => {
                const input = document.getElementById("newItemName") as HTMLInputElement;
                if (input?.value) {
                  this.addInventoryItem({
                    id: Date.now().toString(),
                    name: input.value,
                    owner: "Natalie",
                    status: "stored",
                    location: "Master Bedroom"
                  });
                  input.value = "";
                  this.forceUpdate?.();
                }
              }}
              style={{ marginLeft: "6px", padding: "4px 8px", background: "#444", color: "#fff", border: "none", borderRadius: "4px" }}
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <strong>Calendar / Events</strong>
          <div style={{ marginTop: "6px" }}>
            {this.events.length === 0 && <div style={{ opacity: 0.6 }}>No events yet.</div>}
            {this.events.map(e => (
              <div key={e.id} style={{ fontSize: "0.9em", marginBottom: "4px" }}>
                {e.date}: {e.title}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "8px" }}>
            <input id="newEventDate" type="date" style={{ background: "#222", color: "#fff", border: "1px solid #444", padding: "4px" }} />
            <input id="newEventTitle" placeholder="Event title" style={{ marginLeft: "6px", background: "#222", color: "#fff", border: "1px solid #444", padding: "4px" }} />
            <button
              onClick={() => {
                const dateInput = document.getElementById("newEventDate") as HTMLInputElement;
                const titleInput = document.getElementById("newEventTitle") as HTMLInputElement;
                if (dateInput?.value && titleInput?.value) {
                  this.addEvent({
                    id: Date.now().toString(),
                    date: dateInput.value,
                    title: titleInput.value
                  });
                  titleInput.value = "";
                  this.forceUpdate?.();
                }
              }}
              style={{ marginLeft: "6px", padding: "4px 8px", background: "#444", color: "#fff", border: "none", borderRadius: "4px" }}
            >
              Add Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Simple force update helper for React class component
  private forceUpdate?: () => void;
  componentDidMount() {
    this.forceUpdate = () => this.setState({});
  }
}
