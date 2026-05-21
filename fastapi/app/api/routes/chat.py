from fastapi import APIRouter
from pydantic import BaseModel
import httpx

from app.core.config import settings

router = APIRouter(prefix="/chat", tags=["chat"])

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

SYSTEM_PROMPT = (
    "Sen Dermiq — teri kütimi boyynsha AI assistentisіn. "
    "Tек teri kütimi, dermatologiya jäne kosmetologiya taqyryptarynda jana jauap ber. "
    "Qysqasha, naqty jäne paydalı jauap ber. "
    "Qazaq, orys nemese aǵylshyn tilinde sıraq berılse, sol tilde jauap ber. "
    "Auyr zhagdayda dermatologqa barуды ūsynуды umytpa."
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


# ── Fallback keyword base ─────────────────────────────────────────────────────

FAQ = [
    {
        "kw": ["безеу", "акне", "прыщ", "угор", "acne", "пimpl", "pimple"],
        "ans": (
            "Безеу (акне) себептері:\n"
            "• Артық кожное сало өндірілуі\n"
            "• Тері кеуектерінің бітелуі\n"
            "• Бактериялар (P. acnes)\n"
            "• Гормональды өзгерістер / стресс\n\n"
            "Емдеу: Salicylic Acid, Benzoyl Peroxide, Retinol.\n"
            "Маңызды: дерматологке хабарласыңыз!"
        ),
    },
    {
        "kw": ["майл", "жирн", "oily", "себум", "сальн"],
        "ans": (
            "Майлы тері үшін:\n"
            "✅ Oil-free, non-comedogenic өнімдер\n"
            "✅ Ниацинамид 10%\n"
            "✅ BHA тоник (салицил қышқылы)\n"
            "✅ Матирлеуші SPF\n"
            "❌ Тяжелые масла мен жирные кремдер"
        ),
    },
    {
        "kw": ["құрғақ", "сухой", "dry", "тарту", "стянут"],
        "ans": (
            "Құрғақ тері үшін:\n"
            "✅ Гиалурон қышқылы\n"
            "✅ Ceramides\n"
            "✅ Glycerin, Squalane\n"
            "✅ Ыстық суды болдырмаңыз\n"
            "💡 Маска аптасына 2-3 рет"
        ),
    },
    {
        "kw": ["spf", "күн", "солнц", "загар", "uv", "ультрафиолет"],
        "ans": (
            "SPF неге маңызды:\n"
            "☀️ UV сәулелерден қорғайды\n"
            "🚫 Тері қартаюын алдын алады\n"
            "🎯 Пигментацияны болдырмайды\n\n"
            "💡 Күнделікті SPF 30-50, тіпті бұлтты күні!"
        ),
    },
    {
        "kw": ["ретинол", "retinol", "vitamin a", "витамин а"],
        "ans": (
            "Ретинол:\n"
            "✨ А дәруменінің туындысы\n"
            "• Әжімдерді азайтады\n"
            "• Акнеге тиімді\n"
            "• Тері жасушаларын жаңартады\n\n"
            "⚠️ Тек кешке, аз мөлшерден бастаңыз"
        ),
    },
    {
        "kw": ["гиалурон", "hyaluronic", "ылғал", "увлажн", "moistur"],
        "ans": (
            "Гиалурон қышқылы:\n"
            "💧 Ең күшті ылғалдандырушы\n"
            "✅ Барлық тері типіне қолайлы\n\n"
            "💡 Дымқыл терге жағыңыз — нәтиже жақсырақ"
        ),
    },
    {
        "kw": ["тазала", "жу", "умыть", "очищ", "cleanse", "пенка", "гель"],
        "ans": (
            "Тері тазалау:\n"
            "🌅 Таңертең: жылы сумен немесе жеңіл тазалаушы\n"
            "🌙 Кешке: қос тазалау (май + пенка)\n\n"
            "⚠️ Ыстық суды болдырмаңыз!"
        ),
    },
    {
        "kw": ["пигмент", "дақ", "пятн", "темн", "melasma", "веснушк"],
        "ans": (
            "Пигментациямен күресу:\n"
            "✅ Витамин C (таңертең)\n"
            "✅ Alpha-Arbutin / Kojic Acid\n"
            "✅ Ниацинамид\n"
            "☀️ SPF 50+ — ЕҢ МАҢЫЗДЫ!\n\n"
            "⏰ Нәтиже 2-3 айдан кейін"
        ),
    },
    {
        "kw": ["кеуек", "поры", "pore", "blackhead", "комедон"],
        "ans": (
            "Кеуектерді кішірейту:\n"
            "✅ Salicylic Acid тоник\n"
            "✅ Ниацинамид 10%\n"
            "✅ Ретинол\n"
            "✅ Глиняная маска аптасына 2-3 рет\n\n"
            "❌ Кеуектерді сықпаңыз!"
        ),
    },
    {
        "kw": ["әжім", "морщин", "aging", "anti-age", "антивозраст"],
        "ans": (
            "Әжімдермен күресу:\n"
            "⭐ Ретинол — ең тиімді\n"
            "💊 Пептидтер — коллаген өндіреді\n"
            "💧 Гиалурон қышқылы\n"
            "☀️ SPF 50+ МІНДЕТТІ"
        ),
    },
    {
        "kw": ["ниацинамид", "niacinamide"],
        "ans": (
            "Ниацинамид (В3 дәрумені):\n"
            "• Майлылықты азайтады\n"
            "• Кеуектерді кішірейтеді\n"
            "• Пигментацияны ашады\n"
            "• Акнеге қарсы\n\n"
            "✅ 5-10% концентрация оңтайлы, барлық тері типіне"
        ),
    },
    {
        "kw": ["ceramid", "церамид", "барьер", "barrier"],
        "ans": (
            "Ceramides:\n"
            "🛡️ Тері тосқауылын күшейтеді\n"
            "💧 Ылғалдылықты ұстайды\n"
            "🌸 Нәзік және құрғақ тері үшін маңызды\n\n"
            "💡 CeraVe — ceramides бар ең танымал бренд"
        ),
    },
    {
        "kw": ["routine", "тәртіп", "режим", "уход", "бақыл"],
        "ans": (
            "Күтім тәртібі:\n\n"
            "🌅 ТАҢЕРТЕҢ:\n"
            "1. Тазалау → 2. Тоник → 3. Сарысу → 4. Крем → 5. SPF 30+\n\n"
            "🌙 КЕШКЕ:\n"
            "1. Қос тазалау → 2. Тоник → 3. Ретинол/AHA → 4. Крем"
        ),
    },
    {
        "kw": ["витамин c", "vitamin c", "аскорбин", "антиоксид", "осветл"],
        "ans": (
            "Витамин C:\n"
            "🍊 Ең күшті антиоксидант\n"
            "• Теріні жарқыратады\n"
            "• Пигментацияны азайтады\n"
            "• Коллаген өндіреді\n\n"
            "⚠️ Таңертең жағыңыз, жарықтан сақтаңыз"
        ),
    },
    {
        "kw": ["сезімтал", "чувствит", "sensitive", "қызар", "раздраж"],
        "ans": (
            "Сезімтал тері үшін:\n"
            "✅ Парфюмсіз өнімдер\n"
            "✅ Aloe vera, Centella asiatica\n"
            "✅ Ceramides\n"
            "✅ Ерте тестілеңіз (иек немесе құлақ арты)\n"
            "❌ Спирт, жасанды хош иіс қосылған өнімдерден аулақ болыңыз"
        ),
    },
    {
        "kw": ["тоник", "тонер", "toner", "essence"],
        "ans": (
            "Тоник/Тонер:\n"
            "• Тазалаудан кейін дереу қолдану\n"
            "• Тері pH-ын баланстайды\n"
            "• Сарысудың сіңуін жақсартады\n\n"
            "Тері типіне қарай: ылғалдандырушы / BHA / AHA / Ниацинамид"
        ),
    },
    {
        "kw": ["крем", "cream", "moisturizer", "лосьон", "lotion"],
        "ans": (
            "Крем таңдау:\n"
            "💧 Құрғақ тері → ауыр текстуралы, ceramides, shea butter\n"
            "🌿 Майлы тері → гель-крем, oil-free\n"
            "☀️ Таңертең → SPF бар крем\n"
            "🌙 Кешке → қоректендіруші крем"
        ),
    },
    {
        "kw": ["дерматолог", "врач", "дәрігер", "doctor", "consult"],
        "ans": (
            "Дерматологке хабарласыңыз егер:\n"
            "⚠️ Акне 3 айдан артық кетпесе\n"
            "⚠️ Тері кенеттен өзгерсе\n"
            "⚠️ Сарысу немесе ауру болса\n"
            "⚠️ Күшті аллергиялық реакция болса\n\n"
            "Өз-өзіңізді емдеу жағдайды нашарлатуы мүмкін!"
        ),
    },
]


def keyword_fallback(question: str) -> str:
    q = question.lower()
    best = None
    best_score = 0
    for item in FAQ:
        score = sum(1 for kw in item["kw"] if kw in q)
        if score > best_score:
            best_score = score
            best = item
    if best and best_score > 0:
        return best["ans"]
    return (
        "Сұрағыңызды толығырақ түсіндіре аласыз ба? 🤔\n\n"
        "Мысалы:\n"
        "• «Майлы тері үшін крем қандай?»\n"
        "• «Акне неге шығады?»\n"
        "• «SPF не үшін керек?»\n"
        "• «Ретинол дегеніміз не?»\n"
        "• «Күтім тәртібі қалай болу керек?»"
    )


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not settings.GEMINI_API_KEY:
        return ChatResponse(reply=keyword_fallback(req.message))

    try:
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": req.message}]}],
            "generationConfig": {"maxOutputTokens": 512, "temperature": 0.7},
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={settings.GEMINI_API_KEY}", json=payload
            )
        if resp.status_code == 200:
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return ChatResponse(reply=text.strip())
    except Exception:
        pass

    return ChatResponse(reply=keyword_fallback(req.message))
