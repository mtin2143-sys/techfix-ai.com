export interface AgentConfig {
  name: string;
  systemInstruction: string;
  temperature: number;
  type: "general" | "coder" | "analyzer" | "it-support" | "custom";
  avatarColor: string;
}

export interface Message {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
}

export interface DiagnosticResult {
  possibleCauses: string[];
  onlineRescueSteps: string[];
  offlineRescueSteps: string[];
  powershellScript: string;
  technicalReport: string;
  mocked?: boolean;
}

export interface SavedAgent {
  id: string;
  name: string;
  config: AgentConfig;
  createdAt: string;
}
