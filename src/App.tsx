import React from "react";
import { Stage } from "./Stage";
import { InitialData } from "@chub-ai/stages-ts";

const dummyData = {
  characters: {},
  users: {},
  config: null,
  messageState: null,
  environment: "development",
  initState: null,
  chatState: null,
} as InitialData<any, any, any, any>;

export default function App() {
  const stage = new Stage(dummyData);
  return stage.render();
}
