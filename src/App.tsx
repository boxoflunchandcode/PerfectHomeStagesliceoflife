import React from "react";
import { Stage } from "./Stage";
import { InitialData } from "@chub-ai/stages-ts";

// Minimal dummy data so the stage can be constructed in dev
const dummyData: InitialData<any, any, any, any> = {
  characters: {},
  users: {},
  config: null,
  messageState: null,
  environment: "development",
  initState: null,
  chatState: null,
  token: "",
  id: 0,
};

export default function App() {
  const stage = new Stage(dummyData);
  return stage.render();
}
