import React, { useState, useEffect, useRef } from "react";
import {
  Wrench,
  Bot,
  Terminal,
  Cpu,
  ChevronRight,
  Wifi,
  WifiOff,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  HelpCircle,
  FileText,
  Sliders,
  Sparkles,
  Layers,
  Settings,
  AlertCircle,
  CheckCircle,
  HardDrive,
  User,
  Monitor,
  Zap,
  Info,
  Globe,
  DollarSign,
  CheckCircle2,
  CreditCard,
  Lock,
  ArrowRight,
  ExternalLink,
  FileCode,
  Download
} from "lucide-react";
import { DiagnosticResult, AgentConfig, Message, SavedAgent } from "./types";
import { MonetizationPanel } from "./components/MonetizationPanel";

const PRESET_AGENTS: AgentConfig[] = [
  {
    name: "Mavi Ekran & Crash Çözücü",
    systemInstruction: "Sen Windows sistem uzmanı ve mavi ekran (BSOD) hata kodu çözümleyicisisin. Kullanıcının verdiği dump dosyalarını, minidump analizlerini yorumla, Windows Event Viewer loglarını anla ve net, adım adım çözüm önerileri ve PowerShell tamir kodları sun.",
    temperature: 0.5,
    type: "it-support",
    avatarColor: "bg-blue-600"
  },
  {
    name: "Performans & Optimizasyon Uzmanı",
    systemInstruction: "Sen donanım ve yazılım kaynaklarını en verimli şekilde optimize eden bir ajansın. Kullanıcının bilgisayar özelliklerine göre gereksiz Windows servislerini kapatma, kayıt defteri (registry) düzenlemeleri ve disk temizleme taktikleri sağla.",
    temperature: 0.6,
    type: "analyzer",
    avatarColor: "bg-emerald-600"
  },
  {
    name: "Python & Otomasyon Geliştirici",
    systemInstruction: "Sen yüksek mühendislik odaklı bir Python yardımcı ajansın. Kullanıcının ihtiyaç duyduğu her türlü işletim sistemi betiğini, arka plan otomasyonlarını ve veri madenciliği araçlarını temiz bir kod yapısıyla (%100 çalışan Python) sağlar ve açıklar.",
    temperature: 0.8,
    type: "coder",
    avatarColor: "bg-purple-600"
  }
];

const PRESET_PC_ISSUES = [
  {
    title: "Mavi Ekran Veriyor (BSOD)",
    description: "Sistem beklenmedik bir şekilde duruyor ve mavi ekranda hata kodları çıkıyor.",
    errorCode: "0x0000007B / INACCESSIBLE_BOOT_DEVICE",
    prompt: "Bilgisayarımı açtıktan 5 dakika sonra mavi ekran hatası alıyorum ve WHEA_UNCORRECTABLE_ERROR yazıyor."
  },
  {
    title: "Yavaşlama ve Aşırı Isınma",
    description: "Fanların aşırı hızlı dönmesi, oyunlarda kasma ve ani kapanma sorunları.",
    errorCode: "CPU Temp > 90°C",
    prompt: "Laptopum boşta dururken bile çok ısınıyor, fan son devirde çalışıyor ve bazen kendiliğinden kapanıyor."
  },
  {
    title: "Açılmıyor / Siyah Ekran",
    description: "Güç ışığı yanıyor fakat ekrana görüntü gelmiyor veya sürekli bip sesi duyuluyor.",
    errorCode: "3 Bip Sesi (RAM Hatası)",
    prompt: "Power tuşuna basınca kasa çalışıyor, fanlar dönüyor ama monitöre hiçbir sinyal gelmiyor, ekran simsiyah kalıyor."
  },
  {
    title: "İnternet Kopuyor / Bağlanmıyor",
    description: "Sarı ünlem işareti, Wi-Fi ağlarını görememe veya DNS sunucusu hatası.",
    errorCode: "DNS_PROBE_FINISHED_NO_INTERNET",
    prompt: "Kablolu internet bağlı görünüyor ama tarayıcıda hiçbir site açılmıyor, DNS hatası veriyor."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"diagnose" | "agents" | "docs" | "monetize">("diagnose");
  const [isPro, setIsPro] = useState<boolean>(() => localStorage.getItem("techfix_pro") === "true");
  const [deepDiagnoseMode, setDeepDiagnoseMode] = useState<boolean>(false);
  
  // States - Diagnostic Section
  const [diagnoseInput, setDiagnoseInput] = useState("");
  const [diagnoseDeviceType, setDiagnoseDeviceType] = useState("Masaüstü (Desktop)");
  const [diagnoseErrorCode, setDiagnoseErrorCode] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  
  // States - Agent Builder Section
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(PRESET_AGENTS[0]);
  
  // Custom Agent Form States
  const [customName, setCustomName] = useState("");
  const [customInstruction, setCustomInstruction] = useState("");
  const [customTemperature, setCustomTemperature] = useState(0.7);
  const [customType, setCustomType] = useState<"general" | "coder" | "analyzer" | "it-support" | "custom">("custom");
  const [customColor, setCustomColor] = useState("bg-indigo-600");

  // Agent Chat States
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  // Interactive Guides helper state
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  // Load state or generate default custom agents on startup
  useEffect(() => {
    // Generate initial unique local agents list
    const initialSaved: SavedAgent[] = PRESET_AGENTS.map((preset, idx) => ({
      id: `preset-${idx}`,
      name: preset.name,
      config: preset,
      createdAt: new Date().toLocaleDateString()
    }));
    setSavedAgents(initialSaved);

    // Initial Hello from selected preset
    if (selectedAgent) {
      setChatMessages([
        {
          id: "sys-1",
          role: "model",
          text: `Merhaba! Ben **${selectedAgent.name}** uzman yapay zeka ajanı. Size nasıl yardımcı olabilirim?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Update chat initial message when active agent changes
  const handleSelectAgent = (agent: AgentConfig) => {
    setSelectedAgent(agent);
    setChatMessages([
      {
        id: `sys-${Date.now()}`,
        role: "model",
        text: `Merhaba! **${agent.name}** olarak yetkilendirildim. Rolüm: *"${agent.systemInstruction}"*. Hazırım, sorunuz nedir?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Submit diagnosis request
  const handleDiagnoseSubmit = async (e?: React.FormEvent, presetPrompt?: string, presetErr?: string) => {
    if (e) {
      e.preventDefault();
    }
    const finalPrompt = presetPrompt !== undefined ? presetPrompt : diagnoseInput;
    const finalErr = presetErr !== undefined ? presetErr : diagnoseErrorCode;

    if (!finalPrompt.trim()) return;

    setIsDiagnosing(true);
    setDiagnosticResult(null);

    // If preset test clicked, show value in input
    if (presetPrompt) {
      setDiagnoseInput(presetPrompt);
      setDiagnoseErrorCode(presetErr || "");
    }

    try {
      const response = await fetch("/api/pc/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          deviceType: diagnoseDeviceType,
          errorCodes: finalErr
        })
      });

      if (!response.ok) {
        throw new Error("Sunucu hatası oluştu.");
      }

      const result: DiagnosticResult = await response.json();
      setDiagnosticResult(result);
    } catch (error) {
      console.error(error);
      // Hard fallback if backend has an issue
      setDiagnosticResult({
        possibleCauses: [
          "Olası ısınma / CPU termal macun kuruması.",
          "RAM uyumsuzluğu veya arızalı RAM modülü.",
          "Sürücü çakışması (özellikle son güncellemelerden sonra)."
        ],
        onlineRescueSteps: [
          "Aygıt yöneticisinden ünlemli cihazları güncelleyin.",
          "Sfc /scannow komutunu çalıştırarak sistem dosyalarını onarın."
        ],
        offlineRescueSteps: [
          "Fiziksel temizlik yapın ve fanları kontrol edin.",
          "BIOS pilini çıkarıp 5 dakika bekledikten sonra geri takarak sıfırlayın."
        ],
        powershellScript: "Get-EventLog -LogName System -EntryType Error | Select-Object -First 10",
        technicalReport: "Sistem kararlılık sorunları algılandı. Donanım ve yazılım katmanlarının ayrı ayrı gözden geçirilmesi ve donanım test kitlerinin çalıştırılması önerilir."
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Submit agent chat message
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedAgent || isChatSending) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatSending(true);

    try {
      // Create local history format for API
      const historyContext = chatMessages.slice(-8).map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await fetch("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentConfig: selectedAgent,
          message: userMsg.text,
          history: historyContext
        })
      });

      if (!res.ok) throw new Error("Ajan ile bağlantı kurulamadı.");
      const data = await res.json();

      const modelMsg: Message = {
        id: `msg-${Date.now()}-m`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        text: "Üzgünüm, şu anda yanit üretemiyorum. API anahtarınızı kontrol edin veya internet bağlantınızın aktif olduğunu doğrulayın.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Create a Custom Agent
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customInstruction.trim()) return;

    const newAgent: AgentConfig = {
      name: customName,
      systemInstruction: customInstruction,
      temperature: customTemperature,
      type: customType,
      avatarColor: customColor
    };

    const wrapper: SavedAgent = {
      id: `custom-${Date.now()}`,
      name: customName,
      config: newAgent,
      createdAt: new Date().toLocaleDateString()
    };

    setSavedAgents(prev => [wrapper, ...prev]);
    setSelectedAgent(newAgent);
    // Reset inputs
    setCustomName("");
    setCustomInstruction("");
    setCustomTemperature(0.7);
    
    // Switch preview message
    setChatMessages([
      {
        id: `sys-${Date.now()}`,
        role: "model",
        text: `Yeni oluşturulan **${newAgent.name}** ajanı başarıyla yüklendi! Sistem Direktifi tescil edildi. Hemen sorunuzu iletin.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleDeleteAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedAgents(prev => prev.filter(a => a.id !== id));
    // If deleted agent was selected, fallback to first preset
    const itemToDelete = savedAgents.find(a => a.id === id);
    if (itemToDelete && selectedAgent?.name === itemToDelete.name) {
      setSelectedAgent(PRESET_AGENTS[0]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const downloadScript = (scriptText: string) => {
    const element = document.createElement("a");
    const file = new Blob([scriptText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "TechFix_Onarim.ps1";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUpgradeSuccess = () => {
    localStorage.setItem("techfix_pro", "true");
    setIsPro(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Warning Banner if user hasn't configured key yet */}
      <div className="bg-blue-50 border-b border-blue-200 py-2 px-4 text-center text-xs text-blue-800 font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
        <span>Gemini API anahtarı otomatik olarak entegre edilmiştir. Sınırsız gerçek yapay zeka performansı için Secrets panelinizi kullanabilirsiniz.</span>
      </div>

      {/* Header Navigation */}
      <nav id="app-nav" className="px-6 md:px-12 py-5 flex flex-col sm:flex-row justify-between items-center bg-white border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm tracking-widest">
            Σ
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight uppercase block text-slate-900">
              TechFix <span className="text-blue-600">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              PC Onarım & Ajan Yapılandırma Platformu
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <button
            id="tab-diagnose-btn"
            onClick={() => setActiveTab("diagnose")}
            className={`px-4 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "diagnose"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            PC Teşhis
          </button>
          <button
            id="tab-agents-btn"
            onClick={() => setActiveTab("agents")}
            className={`px-4 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "agents"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            AI Ajan Stüdyosu
          </button>
          <button
            id="tab-docs-btn"
            onClick={() => setActiveTab("docs")}
            className={`px-4 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "docs"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Sorun Giderme Rehberi
          </button>
          <button
            id="tab-monetize-btn"
            onClick={() => setActiveTab("monetize")}
            className={`px-4 md:px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === "monetize"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            Premium & Kazanç
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[8px] font-black px-1 py-0.5 rounded-full uppercase animate-pulse">
              PRO
            </span>
          </button>
        </div>

        {/* Quick Online Status Badge & Pro Indicator */}
        <div className="hidden lg:flex items-center gap-3">
          {isPro && (
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm border border-amber-400">
              TechFix PRO Üye
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
              Sistem Aktif
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Intro Section - Compact */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-2xl">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.25em] block mb-2">
              Maksimum Donanım & Yapay Zeka Kararlılığı
            </span>
            <h1 className="text-3xl md:text-4xl font-light text-slate-900 leading-tight">
              Donanım Sağlığı İçin <strong className="font-extrabold text-blue-600">Fiziksel Çözüm</strong>, <br />
              İşiniz İçin <strong className="font-extrabold italic text-slate-900">Yapay Zeka Temsilcileri</strong>.
            </h1>
            <p className="text-slate-500 mt-3 text-sm md:text-base">
              Yapay zeka ile bilgisayarlarınızın sorunlarını anında teşhis edin, online ve offline onarım adımları üretin, kendi kullanım senaryolarınıza özel bağımsız çalışan akıllı agent yazılımları geliştirin.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex-1 md:flex-initial text-center md:text-left md:min-w-[160px]">
              <span className="text-2xl font-bold tracking-tight text-blue-600 block">7/24 AI</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Otomatik Teşhis</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex-1 md:flex-initial text-center md:text-left md:min-w-[160px]">
              <span className="text-2xl font-bold tracking-tight text-slate-900 block">Yerinde</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Offline Kılavuzlar</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">

        {/* TAB 1: PC DIAGNOSTICS & SOLUTIONS */}
        {activeTab === "diagnose" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input Form Column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Akıllı Hata & Donanım Teşhisi</h2>
                    <p className="text-xs text-slate-400">Yapay zeka anında online/offline çözüm reçeteleri hazırlar.</p>
                  </div>
                </div>

                <form onSubmit={handleDiagnoseSubmit} className="space-y-4">
                  {/* Device Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Cihaz Tipi
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Masaüstü (Desktop)", "Dizüstü (Laptop)", "Sunucu / Diğer"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDiagnoseDeviceType(type)}
                          className={`p-2.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            diagnoseDeviceType === type
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Diagnosis Prompt */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Sorun veya Belirti Nedir?
                    </label>
                    <textarea
                      required
                      value={diagnoseInput}
                      onChange={(e) => setDiagnoseInput(e.target.value)}
                      placeholder="Örnek: Bilgisayarımdan sürekli bip sesi geliyor ve ekran simsiyah kalıyor. RAM söktüm taktım yine düzelmedi."
                      rows={4}
                      className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Error codes input (Optional) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                      <span>Mavi Ekran Hatası / Kod (İsteğe Bağlı)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Karakter sınırı yok</span>
                    </label>
                    <input
                      type="text"
                      value={diagnoseErrorCode}
                      onChange={(e) => setDiagnoseErrorCode(e.target.value)}
                      placeholder="Hata kodu: 0x000000D1, KERNEL_SECURITY_CHECK_FAILURE"
                      className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  {/* Deep Diagnosis Mode Switch */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                          Derin Yapay Zeka Teşhisi
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                            PRO
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 block">Donanım sürücülerini ve dump kodlarını derinlemesine eşleştirir.</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!isPro) {
                          setActiveTab("monetize");
                        } else {
                          setDeepDiagnoseMode(!deepDiagnoseMode);
                        }
                      }}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${
                        deepDiagnoseMode && isPro ? "bg-indigo-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
                    </button>
                  </div>

                  {/* Execute Button */}
                  <button
                    type="submit"
                    disabled={isDiagnosing}
                    className="w-full py-3.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isDiagnosing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analiz Ediliyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Teşhisi Başlat & Çözüm Üret
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Ready Troubleshooting Templates */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Sık Karşılaşılan Hazır Senaryolar
                </h3>
                <div className="space-y-3">
                  {PRESET_PC_ISSUES.map((issue, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDiagnoseSubmit(undefined, issue.prompt, issue.errorCode)}
                      className="w-full text-left p-3 border border-slate-100 hover:border-blue-300 rounded-xl hover:bg-blue-50/40 transition-all group flex justify-between items-start"
                    >
                      <div className="flex-1 pr-2">
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {issue.title}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {issue.description}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 self-center transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnostic Results Column */}
            <div className="lg:col-span-7">
              {!diagnosticResult && !isDiagnosing ? (
                <div className="h-full bg-white border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                    <Monitor className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Analiz Raporu Henüz Oluşturulmadı</h3>
                  <p className="text-slate-400 text-sm max-w-sm mt-2">
                    Sol panelden hata tanımınızı girerek yapay zeka tarafından hazırlanan online / offline çözüm yollarını ve Powershell kodlarını görebilirsiniz.
                  </p>
                </div>
              ) : isDiagnosing ? (
                <div className="h-full bg-white border border-slate-200 rounded-2xl p-12 flex flex-col justify-center items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <Cpu className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Donanım & Sistem Taranıyor</h3>
                  <p className="text-slate-400 text-sm max-w-md mt-2">
                    Yapay zeka asistanımız donanım bilgilerini okuyor, olası fiziksel sorunları eliyor ve kurtarma reçetenizi oluşturuyor. Bu işlem birkaç saniye sürebilir...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Primary Diagnosis Header */}
                  <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-slate-800 relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
                      <Cpu className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase rounded-full tracking-wider border border-blue-500/30">
                          Sistem Teşhisi Tamamlandı
                        </span>
                        {diagnosticResult?.mocked && (
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase rounded-full tracking-wider border border-amber-500/30">
                            Önizleme Modu
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold">Teknisyen Yapay Zeka Raporu</h3>
                      <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                        {diagnosticResult?.technicalReport}
                      </p>
                    </div>
                  </div>

                  {/* Possible Causes List */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#e53e3e]" />
                      Sistem Hatası Olası Sebepleri ({diagnosticResult?.possibleCauses.length || 0})
                    </h4>
                    <ul className="space-y-3">
                      {diagnosticResult?.possibleCauses.map((cause, i) => (
                        <li key={i} className="flex gap-3 items-start text-sm text-slate-600 bg-red-50/40 p-3 rounded-lg border border-red-100">
                          <span className="font-bold text-[#e53e3e] mt-0.5">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dual Solution columns - Online vs Offline Intervention */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Online / Software Rescue */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-blue-600" />
                          Online / Canlı Müdahale
                        </h4>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Yazılımsal
                        </span>
                      </div>
                      <ul className="space-y-2.5">
                        {diagnosticResult?.onlineRescueSteps.map((step, i) => (
                          <li key={i} className="flex gap-2 items-start text-xs text-slate-600">
                            <span className="w-5 h-5 min-w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Offline / Physical Rescue */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <WifiOff className="w-4 h-4 text-emerald-600" />
                          Offline / Fiziksel Müdahale
                        </h4>
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Fiziksel
                        </span>
                      </div>
                      <ul className="space-y-2.5">
                        {diagnosticResult?.offlineRescueSteps.map((step, i) => (
                          <li key={i} className="flex gap-2 items-start text-xs text-slate-600">
                            <span className="w-5 h-5 min-w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* PowerShell Terminal Code Script Generator */}
                  {diagnosticResult?.powershellScript && (
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                      <div className="bg-slate-800 px-5 py-3.5 flex justify-between items-center text-slate-200 border-b border-slate-700">
                        <div className="flex items-center gap-2.5">
                          <Terminal className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider">
                            Otomatik Onarım Kodu / PowerShell
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(diagnosticResult.powershellScript)}
                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-md text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            {copiedScript ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Kopyalandı!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Kodu Kopyala
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              if (!isPro) {
                                setActiveTab("monetize");
                              } else {
                                downloadScript(diagnosticResult.powershellScript);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isPro
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                : "bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                            }`}
                            title={isPro ? "PowerShell Scripti İndir" : "Sadece PRO üyeler doğrudan script indirebilir"}
                          >
                            {!isPro && <Lock className="w-3 h-3 text-amber-500" />}
                            <Download className="w-3.5 h-3.5" />
                            Script İndir (.ps1)
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-950 font-mono text-xs text-[#58a6ff] overflow-x-auto whitespace-pre">
                        <code>{diagnosticResult.powershellScript}</code>
                      </div>
                      <div className="bg-slate-800/80 px-5 py-2 text-[10px] text-slate-400 font-medium">
                        ⓘ Bu kodu Windows PowerShell uygulamasını Yönetici olarak çalıştırıp yapıştırarak sorunu çözmeyi deneyebilirsiniz.
                      </div>
                    </div>
                  )}

                  {/* Diagnostic Footer Tip */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Güvenlik Uyarısı:</strong> Bilgisayar donanımlarına fiziksel müdahalede bulunmadan önce mutlaka güç kablosunu prizden çekiniz ve kendinizi statik elektrikten arındıracak bir zemine basınız.
                    </div>
                  </div>

                  {/* Inline Matched Affiliate & Service Partner Solutions */}
                  <div className="pt-8 border-t border-slate-200">
                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Sponsor Destekli Akıllı Çözüm Ortakları</span>
                      <h4 className="text-lg font-extrabold text-slate-900 mt-1">Eşleşen Donanım Parçaları & Teknik Servis Randevusu</h4>
                    </div>
                    <MonetizationPanel 
                      isPro={isPro} 
                      onUpgradeSuccess={handleUpgradeSuccess} 
                      currentSymptom={diagnoseInput} 
                    />
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ADVANCED AI AGENT BUILDER STUDIO */}
        {activeTab === "agents" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Creator panel and Agent list */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Magic Creator Panel */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Custom Ajan Tasarla (Sihirbaz)</h2>
                    <p className="text-xs text-slate-400">İhtiyaç duyduğunuz her alana özel uzmanlar türetin.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAgent} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Ajan İsmi
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ör: Sürücü Uyuşmazlığı Mühendisi"
                      className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Sistem Direktifi / Rol Tanımı (System Instruction)
                    </label>
                    <textarea
                      required
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder="Örnek: Sen bir aygıt sürücüsü uzmanısın. Kullanıcıya donanım kimlikleri (Hardware IDs) üzerinden en güncel ve hatasız sürücü linklerini bulma ve kurma adımlarını gösterirsin."
                      rows={3}
                      className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Dual Grid sliders / colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex justify-between">
                        <span>Sıcaklık (Temp)</span>
                        <span className="font-mono text-blue-600 font-bold">{customTemperature}</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={customTemperature}
                        onChange={(e) => setCustomTemperature(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Ajan Uzmanlık Türü
                      </label>
                      <select
                        value={customType}
                        onChange={(e: any) => setCustomType(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      >
                        <option value="general">Müşteri Destek</option>
                        <option value="coder">Yazılım Scripting</option>
                        <option value="it-support">Donanım Analiz</option>
                        <option value="analyzer">Veri Okuyucu</option>
                        <option value="custom">Özel Formasyon</option>
                      </select>
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Görsel Tema Rengi
                    </label>
                    <div className="flex gap-2">
                      {[
                        "bg-blue-600",
                        "bg-teal-600",
                        "bg-amber-600",
                        "bg-purple-600",
                        "bg-rose-600",
                        "bg-slate-800"
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCustomColor(color)}
                          className={`w-7 h-7 rounded-full transition-all ${color} ${
                            customColor === color ? "ring-2 ring-offset-2 ring-blue-600 scale-110" : "opacity-80"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit Build */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Ajan Oluştur & Konfigüre Et
                  </button>
                </form>
              </div>

              {/* Active & Preset Agents List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Aktif / Kullanılabilir Ajanlar ({savedAgents.length})
                  </h3>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {savedAgents.map((agent) => {
                    const isSelected = selectedAgent?.name === agent.config.name;
                    return (
                      <div
                        key={agent.id}
                        onClick={() => handleSelectAgent(agent.config)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/40 shadow-sm"
                            : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${agent.config.avatarColor || "bg-blue-600"} text-white flex items-center justify-center text-xs font-bold font-mono`}>
                            {agent.config.name[0]}
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-900">
                              {agent.config.name}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5 capitalize">
                              Rol: {agent.config.type} {agent.config.temperature ? `| T: ${agent.config.temperature}` : ""}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Don't allow deleting hardcoded ones */}
                          {!agent.id.startsWith("preset") && (
                            <button
                              onClick={(e) => handleDeleteAgent(agent.id, e)}
                              className="p-1 px-1.5 hover:bg-red-50 text-slate-300 hover:text-rose-600 rounded-md transition-colors"
                              title="Ajanı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ChevronRight className={`w-4 h-4 text-slate-300 ${isSelected ? "text-blue-600 translate-x-1" : ""} transition-all`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Dynamic Agent Live Chat Panel */}
            <div className="lg:col-span-7 flex flex-col h-[700px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              
              {/* Chat Title bar */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${selectedAgent?.avatarColor || "bg-blue-600"} text-white flex items-center justify-center text-sm font-black`}>
                    {selectedAgent?.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{selectedAgent?.name}</span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] uppercase tracking-wider font-extrabold rounded-full">
                        Canlı Ajan
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 max-w-sm block truncate">
                      {selectedAgent?.systemInstruction}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => selectedAgent && handleSelectAgent(selectedAgent)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1.5"
                  title="Sohbeti Sıfırla"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sıfırla
                </button>
              </div>

              {/* Chat area messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                    <Bot className="w-12 h-12 mb-3 text-slate-300 animate-bounce" />
                    <p className="text-sm font-semibold">Henüz konuşma başlatılmadı.</p>
                    <p className="text-xs max-w-xs mt-1">Aşağıdaki giriş alanından seçili olan ajanınıza bir soru sorabilirsiniz.</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs text-white font-bold ${
                          isUser ? "bg-slate-700" : (selectedAgent?.avatarColor || "bg-blue-600")
                        }`}>
                          {isUser ? <User className="w-4 h-4" /> : selectedAgent?.name[0]}
                        </div>

                        {/* Content text block */}
                        <div>
                          <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? "bg-slate-900 text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm"
                          }`}>
                            {/* Simple text formatting helper to preserve newlines and markdown-like titles */}
                            {msg.text.split("\n").map((line, key) => (
                              <p key={key} className={line.trim() === "" ? "h-2" : "mb-1"}>
                                {line}
                              </p>
                            ))}
                          </div>
                          <span className="block text-[9px] text-slate-400 mt-1 uppercase text-right px-1">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {isChatSending && (
                  <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs text-white font-bold ${selectedAgent?.avatarColor || "bg-blue-600"}`}>
                      {selectedAgent?.name[0]}
                    </div>
                    <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm text-xs text-slate-400 font-medium">
                      <span>Düşünüyor</span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input panel */}
              <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`${selectedAgent?.name} asistanına bir şey yazın... (Örn: 'Donanım uyumsuzluğu hatası nasıl çözülür?')`}
                  className="flex-1 text-sm px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isChatSending || !chatInput.trim()}
                  className="px-5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:bg-slate-300 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  GÖNDER
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: SELF-HELP GUIDES & STATIC TROUBLESHOOTING */}
        {activeTab === "docs" && (
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">PC Donanım Sorun Giderme & Onarım Kılavuzları</h2>
                <p className="text-xs text-slate-400">Fiziksel / offline müdahalelerde bulunmak için adım adım profesyonel teknisyen yöntemleri.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-blue-600 uppercase tracking-widest border-l-2 border-blue-600 pl-2.5">
                  Fiziksel / Donanımsal Müdahaleler
                </h3>

                {/* Guide 1 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === 1 ? null : 1)}
                    className="w-full text-left p-4 bg-slate-50 flex justify-between items-center"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      1. Statik Elektrik Boşaltma (Sıfır Enerji Sıfırlama)
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{expandedDoc === 1 ? "Kapat" : "Göster"}</span>
                  </button>
                  {expandedDoc === 1 && (
                    <div className="p-4 text-xs text-slate-600 space-y-2 bg-white border-t border-slate-100 leading-relaxed">
                      <p>Kasanın fanlarının dönüp ekrana görüntü gelmediği durumlarda donanım düğümlenmesini aşmak için uygulanır:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Bilgisayarın arka anahtarını kapatın ve güç (priz) kablosunu tamamen sökün.</li>
                        <li>Bilgisayarda takılı olan tüm USB aksesuarlarını, klavyeyi ve HDMI/DP monitör kablolarını çıkarın.</li>
                        <li>Açma-kapama (Power) tuşuna kesintisiz olarak <strong>30-40 saniye</strong> boyunca basılı tutun.</li>
                        <li>Süre bittikten sonra sadece monitörün elektrik ve ekran kablolarını bağlayarak çalıştırmayı deneyin.</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Guide 2 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === 2 ? null : 2)}
                    className="w-full text-left p-4 bg-slate-50 flex justify-between items-center"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-500" />
                      2. RAM (Bellek) Temizleme ve Yer Değiştirme
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{expandedDoc === 2 ? "Kapat" : "Göster"}</span>
                  </button>
                  {expandedDoc === 2 && (
                    <div className="p-4 text-xs text-slate-600 space-y-2 bg-white border-t border-slate-100 leading-relaxed">
                      <p>Sistem açılırken bip sesleri veriyor veya anakart üzerinde DRAM ledi yanıyorsa bellek altın pinleri oksitlenmiş olabilir:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Fiziksel gücü kesin, kasanın yan kapağını açın.</li>
                        <li>Bellek modüllerinin iki yanındaki mandalları hafifçe açarak RAM'leri dışarı çekin.</li>
                        <li>Elimize yumuşak bir kurşun kalem silgisi alarak RAM'lerin anakarta temas eden parlak altın uçlarını bastırmadan nazikçe temizleyin.</li>
                        <li>Eğer çift RAM takıyorsanız öncelikle en dıştaki 2. ve 4. slotları (DIMM_A2 ve DIMM_B2) tercih ederek modülleri 'klik' sesi gelene kadar bastırıp yuvalarına oturtun.</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Guide 3 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === 3 ? null : 3)}
                    className="w-full text-left p-4 bg-slate-50 flex justify-between items-center"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-600" />
                      3. BIOS/UEFI Pilini Sökerek Sıfırlama
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{expandedDoc === 3 ? "Kapat" : "Göster"}</span>
                  </button>
                  {expandedDoc === 3 && (
                    <div className="p-4 text-xs text-slate-600 space-y-2 bg-white border-t border-slate-100 leading-relaxed">
                      <p>Hatalı hız aşırtma (overclock) veya uyumsuz donanım voltaj ayarlarında anakart açılış devresini bloke ederse:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Güç kablosunu sökün.</li>
                        <li>Anakart üzerinde ekran kartının hemen arkasında veya altında kalan düğme şeklindeki dairesel CR2032 pili bulun.</li>
                        <li>İnce tırnaklı bir aparat yardımıyla metal kilidine basarak pili yuvasından kurtarın.</li>
                        <li><strong>5 dakika</strong> bekledikten sonra pili aynı yönde yuvasına bastırıp geri kilitleyin. Bu sayede anakart saat ve yapılandırma hafızası sıfırlanacaktır.</li>
                      </ol>
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-emerald-600 uppercase tracking-widest border-l-2 border-emerald-600 pl-2.5">
                  Yazılımsal / Sistem Müdahaleleri
                </h3>

                {/* Software Guide 1 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === 4 ? null : 4)}
                    className="w-full text-left p-4 bg-slate-50 flex justify-between items-center"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      4. Windows Bozuk Disk ve Dosya Onarma Komutları
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{expandedDoc === 4 ? "Kapat" : "Göster"}</span>
                  </button>
                  {expandedDoc === 4 && (
                    <div className="p-4 text-xs text-slate-600 space-y-2 bg-white border-t border-slate-100 leading-relaxed">
                      <p>Sistem dosyaları bozulduğunda ve durduk yere hatalar aldığınızda temizleyici sistem komutları sırayla çalıştırılır:</p>
                      <p className="bg-slate-900 text-[#58a6ff] p-3 rounded-lg font-mono text-[11px] whitespace-pre-wrap">
                        sfc /scannow{"\n"}
                        DISM.exe /Online /Cleanup-image /Restorehealth
                      </p>
                      <p>Yukarıdaki komutları PowerShell yazılımını yönetici olarak başlatarak kopyalayıp çalıştırın. Windows sunucularından orijinal yedek dosyaları çekerek sisteminizi otomatik tamir eder.</p>
                    </div>
                  )}
                </div>

                {/* Software Guide 2 */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === 5 ? null : 5)}
                    className="w-full text-left p-4 bg-slate-50 flex justify-between items-center"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-rose-500" />
                      5. Güvenli Modda Temiz Sürücü Kurulumu (DDU)
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{expandedDoc === 5 ? "Kapat" : "Göster"}</span>
                  </button>
                  {expandedDoc === 5 && (
                    <div className="p-4 text-xs text-slate-600 space-y-2 bg-white border-t border-slate-100 leading-relaxed">
                      <p>Ekran kartı güncellemelerinden sonra meydana gelen FPS düşüşleri veya donma sorunlarını gidermek için:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>DDU (Display Driver Uninstaller) yazılımını indirin.</li>
                        <li>Bilgisayarınızı Güvenli Mod (Safe Mode) seçeneği ile başlatın.</li>
                        <li>DDU uygulamasını açıp mevcut ekran kartı sürücülerinizi (NVIDIA/AMD) tamamen kaldırın.</li>
                        <li>Bilgisayarı normal şekilde yeniden çalıştırıp en güncel kararlı sürücüyü temiz bir şekilde kurun.</li>
                      </ol>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 4: PREMIUM & MONETIZATION */}
        {activeTab === "monetize" && (
          <MonetizationPanel 
            isPro={isPro} 
            onUpgradeSuccess={handleUpgradeSuccess} 
            currentSymptom={diagnoseInput} 
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="px-6 md:px-12 py-6 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest gap-4 mt-auto">
        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            Yapay Zeka Durumu: Aktif & Çevrimiçi
          </div>
          <div>Lokasyon: İstanbul, Türkiye</div>
        </div>
        <div className="text-center md:text-right text-slate-500">
          © 2026 TechFix AI Studio • Her Hakkı Saklıdır
        </div>
      </footer>
    </div>
  );
}
