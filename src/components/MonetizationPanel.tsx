import React, { useState } from "react";
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Star,
  Clock,
  Sparkles,
  Phone,
  AlertCircle,
  ShoppingBag,
  Zap,
  Check,
  ChevronRight,
  UserCheck
} from "lucide-react";

interface MonetizationPanelProps {
  isPro: boolean;
  onUpgradeSuccess: () => void;
  currentSymptom?: string;
}

const MOCK_PARTNERS = [
  {
    city: "İstanbul",
    district: "Kadıköy",
    name: "Mavi Ekran Kadıköy Teknoloji",
    address: "Osmanağa Mah. Söğütlüçeşme Cad. No:142, Kadıköy",
    rating: 4.9,
    reviews: 148,
    phone: "0 (216) 555 43 21",
    workingHours: "09:00 - 19:00",
    sponsored: true
  },
  {
    city: "Ankara",
    district: "Çankaya",
    name: "Çankaya Profesyonel Bilişim & Onarım",
    address: "Tunalı Hilmi Cad. Kuğulu Pasajı No:45, Çankaya",
    rating: 4.8,
    reviews: 96,
    phone: "0 (312) 444 12 34",
    workingHours: "09:00 - 18:30",
    sponsored: true
  },
  {
    city: "İzmir",
    district: "Karşıyaka",
    name: "Ege Bilgisayar Onarım & Donanım Test",
    address: "Cemal Gürsel Cad. No:88/A, Karşıyaka",
    rating: 4.7,
    reviews: 112,
    phone: "0 (232) 333 98 76",
    workingHours: "08:30 - 19:30",
    sponsored: true
  },
  {
    city: "Bursa",
    district: "Nilüfer",
    name: "Nilüfer Donanım Vadisi",
    address: "Fatih Sultan Mehmet Bulvarı, No:210, Nilüfer",
    rating: 4.9,
    reviews: 74,
    phone: "0 (224) 222 45 90",
    workingHours: "09:00 - 19:00",
    sponsored: true
  }
];

const RECOMMENDED_PRODUCTS = [
  {
    category: "overheating",
    title: "Sıcaklık & Isınma Çözümleri",
    items: [
      {
        name: "Arctic MX-6 Yüksek Performanslı Termal Macun",
        desc: "İşlemci sıcaklığını 10-15°C düşüren yüksek yoğunluklu karbon dolgulu macun.",
        price: "₺320",
        originalPrice: "₺399",
        link: "https://www.amazon.com.tr",
        badge: "En Çok Satan",
        provider: "Amazon Sponsoru"
      },
      {
        name: "Noctua NH-D15 Çift Fanlı Premium CPU Soğutucu",
        desc: "Sıvı soğutma performansında, tamamen sessiz çalışan çift kule hava soğutucu.",
        price: "₺3,450",
        originalPrice: "₺3,800",
        link: "https://www.trendyol.com",
        badge: "Öneri",
        provider: "Trendyol Sponsoru"
      }
    ]
  },
  {
    category: "ram_bsod",
    title: "Mavi Ekran & Bellek Yükseltme",
    items: [
      {
        name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4 RAM",
        desc: "3200MHz CL16 yüksek uyumluluk testli performans bellek kiti.",
        price: "₺1,420",
        originalPrice: "₺1,650",
        link: "https://www.amazon.com.tr",
        badge: "Fiyat/Performans",
        provider: "Amazon Sponsoru"
      }
    ]
  },
  {
    category: "slow_disk",
    title: "Hızlandırma & Depolama Çözümleri",
    items: [
      {
        name: "Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 SSD",
        desc: "7000MB/s okuma hızı ile donmaları ve açılış yavaşlıklarını tamamen çözen premium disk.",
        price: "₺2,850",
        originalPrice: "₺3,200",
        link: "https://www.hepsiburada.com",
        badge: "Editörün Seçimi",
        provider: "Hepsiburada Sponsoru"
      }
    ]
  },
  {
    category: "general",
    title: "Güç & Stabilite Donanımları",
    items: [
      {
        name: "Corsair RM750x 750W 80+ Gold Güç Kaynağı",
        desc: "Ani kapanmaları ve voltaj dalgalanması kaynaklı mavi ekranları önleyen üst seviye PSU.",
        price: "₺4,100",
        originalPrice: "₺4,600",
        link: "https://www.amazon.com.tr",
        badge: "Gold Sertifikalı",
        provider: "Amazon Sponsoru"
      }
    ]
  }
];

export function MonetizationPanel({ isPro, onUpgradeSuccess, currentSymptom }: MonetizationPanelProps) {
  // Checkout States
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Consultant Booking States
  const [selectedCity, setSelectedCity] = useState("İstanbul");
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Helper to normalize input symptoms to product categories
  const getProductCategory = () => {
    if (!currentSymptom) return RECOMMENDED_PRODUCTS[3]; // General
    const promptLower = currentSymptom.toLowerCase();
    if (promptLower.includes("isınma") || promptLower.includes("sıcak") || promptLower.includes("fan") || promptLower.includes("kapanma")) {
      return RECOMMENDED_PRODUCTS[0]; // Overheating
    }
    if (promptLower.includes("mavi ekran") || promptLower.includes("bsod") || promptLower.includes("ram") || promptLower.includes("bip")) {
      return RECOMMENDED_PRODUCTS[1]; // RAM
    }
    if (promptLower.includes("yavaş") || promptLower.includes("disk") || promptLower.includes("ssd") || promptLower.includes("kasıyor")) {
      return RECOMMENDED_PRODUCTS[2]; // SSD/Slow
    }
    return RECOMMENDED_PRODUCTS[3]; // General
  };

  const productSet = getProductCategory();

  // Payment Form Submit Handler
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setPaymentError("Lütfen 16 haneli geçerli bir kart numarası giriniz.");
      return;
    }
    if (!cardName.trim()) {
      setPaymentError("Kart üzerindeki isim alanı boş olamaz.");
      return;
    }
    if (expiry.length !== 5 || !expiry.includes("/")) {
      setPaymentError("Geçerli bir SKT giriniz (AA/YY).");
      return;
    }
    if (cvc.length < 3) {
      setPaymentError("Lütfen 3 haneli CVC kodunu giriniz.");
      return;
    }

    setIsProcessing(true);
    // Simulate API request
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onUpgradeSuccess();
      }, 1500);
    }, 2000);
  };

  // Randevu Al Submit Handler
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate) return;

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingName("");
      setBookingPhone("");
      setBookingDate("");
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: PRO UPGRADE ENGINE (Simulated Monetization) */}
      {!isPro ? (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl text-white p-6 md:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {paymentSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center animate-bounce">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-emerald-400">Ödeme Onaylandı!</h3>
              <p className="text-slate-200 max-w-sm text-sm">
                Tebrikler! TechFix AI Pro sürümünüz başarıyla aktif edildi. Şimdi sınırsız teşhis ve premium araçların keyfini çıkarın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
              {/* Product Pitch Column */}
              <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bireysel & Profesyonel Kazanç Odaklı
                  </div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">
                    TechFix <span className="text-indigo-400">Pro</span> ile <br />
                    Teşhis Gücünüzü Paraya Dönüştürün!
                  </h3>
                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                    Premium plana geçerek sadece kendi bilgisayarlarınızı onarmakla kalmayın; çevrenizdeki insanlara ve müşterilerinize ücretli bilgisayar onarım ve AI analiz hizmeti sunun.
                  </p>
                </div>

                {/* Benefits checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Sınırsız Teşhis & Derin AI Analizi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Özel PowerShell (.ps1) Dosya İndirme</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Sınırsız Custom AI Ajanı Kaydetme</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>7/24 Teknik Öncelikli Destek Kanalları</span>
                  </div>
                </div>

                {/* Plan selector */}
                <div className="bg-slate-950/60 p-1.5 rounded-2xl border border-indigo-500/20 flex gap-2 w-fit">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("monthly")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedPlan === "monthly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Aylık Pro • ₺149 / ay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("yearly")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                      selectedPlan === "yearly" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Yıllık Pro • ₺999 / yıl
                    <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                      %45 Tasarruf
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkout Form Column */}
              <div className="lg:col-span-5 bg-white text-slate-900 p-5 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                    Sanal Güvenli Ödeme
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    SSL 256-bit
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-3">
                  {/* Card Name */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Kart Üzerindeki İsim
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ad Soyad"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Kart Numarası
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        placeholder="4444 5555 6666 7777"
                        value={cardNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s?/g, "").replace(/(\d{4})/g, "$1 ").trim();
                          setCardNumber(val);
                        }}
                        className="w-full text-xs p-2.5 pl-8.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Son Kullanma (AA/YY)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) {
                            val = val.substring(0, 2) + "/" + val.substring(2, 4);
                          }
                          setExpiry(val);
                        }}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Güvenlik Kodu (CVC)
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="***"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none text-center"
                      />
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-600 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Sandbox Notification */}
                  <p className="text-[9px] text-slate-400 text-center italic mt-1 leading-tight">
                    🔒 Bu bir test simülasyonudur. Gerçek kredi kartı bilgisi girmenize gerek yoktur. Geçerli formatta 16 haneli herhangi bir numara ile test edebilirsiniz.
                  </p>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin text-amber-400" />
                        Güvenli İşlem Başlatıldı...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        ŞİMDİ PRO'YA YÜKSELT
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl text-white p-6 shadow-md border border-emerald-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <UserCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">
                Aktif Abonelik
              </span>
              <h3 className="font-extrabold text-lg">TechFix AI PRO Ayrıcalıkları Açıldı!</h3>
              <p className="text-emerald-200 text-xs mt-0.5">
                Sınırsız donanım analizi, PowerShell script indirmeleri ve özel robotik asistan yapılandırması şu an aktif.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-400/20 rounded-xl text-xs font-bold text-emerald-300 uppercase tracking-wider text-center">
            Destek Ekibi Çevrimiçi
          </div>
        </div>
      )}

      {/* SECTION 2: DYNAMIC AFFILIATE HARDWARE SHOP (Sponsorlu Donanım Önerileri) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Sponsorlu Donanım & Çözüm Mağazası</h3>
              <p className="text-xs text-slate-400">Yapay zekanın teşhis sonuçlarına göre eşleşen orijinal yedek parçalar.</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
            Gelir Ortaklığı (Affiliate)
          </span>
        </div>

        {/* Dynamic Warning if no diagnosis yet */}
        {!currentSymptom && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 mb-6 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Bilgisayar Teşhis sekmesinde bir tarama başlattığınızda, burası o soruna uygun donanım ve parça önerileriyle anında güncellenecektir.</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Mevcut Teşhis Semptomuna Göre Parça Önerileri</span>
              {currentSymptom && <span className="bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded-md text-[9px]">GÜNCELLENDİ</span>}
            </h4>
            <span className="block text-sm font-extrabold text-slate-800 border-l-2 border-indigo-500 pl-2">
              {productSet.title}
            </span>

            <div className="space-y-3">
              {productSet.items.map((item, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all bg-slate-50/40 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        {item.badge}
                      </span>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-1.5">{item.name}</h5>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 line-through block">{item.originalPrice}</span>
                      <span className="text-sm font-black text-indigo-600 block">{item.price}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium">{item.provider}</span>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer referrer"
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                    >
                      Satın Al
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: SPONSOR REPAIR SHOPS (Yerel Teknisyen Ortaklığı) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sponsorlu Fiziksel Teknik Servis Randevusu
            </h4>
            <span className="block text-sm font-extrabold text-slate-800 border-l-2 border-emerald-500 pl-2">
              Evde Onarılamayan Arızalar İçin Destek Alın
            </span>

            {/* City Selector */}
            <div className="grid grid-cols-4 gap-2">
              {["İstanbul", "Ankara", "İzmir", "Bursa"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setBookingSuccess(false);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${
                    selectedCity === city
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Selected Partner Details */}
            {(() => {
              const partner = MOCK_PARTNERS.find((p) => p.city === selectedCity) || MOCK_PARTNERS[0];
              return (
                <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{partner.name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Resmi Sponsor
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{partner.address}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-500 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="text-xs font-black">{partner.rating}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold">{partner.reviews} Değerlendirme</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-600 border-t border-b border-emerald-100/50 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{partner.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{partner.workingHours}</span>
                    </div>
                  </div>

                  {/* Consultation Booking Form */}
                  {bookingSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-400/30 p-3.5 rounded-xl text-center space-y-1">
                      <h5 className="font-extrabold text-emerald-700 text-xs flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Randevu Talebiniz Alındı!
                      </h5>
                      <p className="text-[10px] text-emerald-600 font-medium">
                        Sponsor teknik servis ekibimiz en geç 15 dakika içinde sizi telefonla arayacaktır.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleBookingSubmit} className="space-y-2.5">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Ücretsiz Telefon Danışmanlığı Randevusu
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Adınız Soyadınız"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="05xx xxx xx xx"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-400 flex-1"
                        />
                        <button
                          type="submit"
                          className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                        >
                          Randevu Al
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
