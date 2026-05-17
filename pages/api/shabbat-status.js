import { HebrewCalendar, Location } from "@hebcal/core";
import { readJson } from "../../lib/serverData";

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatIsrael(date) {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: "Asia/Jerusalem",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

function getEventTime(event) {
  if (event.eventTime) return new Date(event.eventTime);
  if (typeof event.getDate === "function") {
    const d = event.getDate();
    if (d && typeof d.greg === "function") return d.greg();
  }
  return null;
}

function desc(event) {
  try { return event.getDesc(); } catch { return ""; }
}

function findWindow(now = new Date()) {
  const settings = readJson("settings").shabbatMode || {};
  const location = Location.lookup(settings.city || "Jerusalem") || Location.lookup("Jerusalem");

  const start = addMinutes(now, -8 * 24 * 60);
  const end = addMinutes(now, 14 * 24 * 60);

  const events = HebrewCalendar.calendar({
    start,
    end,
    isHebrewYear: false,
    candlelighting: true,
    location,
    il: true,
    sedrot: false,
    omer: false,
    noHolidays: false
  });

  const candles = [];
  const havdalahs = [];

  for (const ev of events) {
    const d = desc(ev);
    const time = getEventTime(ev);
    if (!time) continue;
    if (/Candle lighting|הדלקת נרות/i.test(d)) candles.push({ time, desc: d });
    if (/Havdalah|צאת/i.test(d)) havdalahs.push({ time, desc: d });
  }

  candles.sort((a,b)=>a.time-b.time);
  havdalahs.sort((a,b)=>a.time-b.time);

  let active = null;

  for (const c of candles) {
    const h = havdalahs.find(x => x.time > c.time && x.time < addMinutes(c.time, 60 * 36));
    if (!h) continue;

    const closeAt = addMinutes(c.time, Number(settings.closeMinutesBeforeCandleLighting || 0) * -1);
    const openAt = addMinutes(h.time, Number(settings.openMinutesAfterHavdalah || 0));

    if (now >= closeAt && now <= openAt) {
      active = { candleLighting: c.time, havdalah: h.time, closeAt, openAt };
      break;
    }
  }

  const nextCandle = candles.find(x => x.time > now);
  const nextHavdalah = havdalahs.find(x => x.time > now);

  return { active, nextCandle, nextHavdalah };
}

export default function handler(req, res) {
  try {
    const settings = readJson("settings").shabbatMode || {};
    if (settings.forceClosed) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      return res.json({
        enabled:true,
        closed:true,
        manual:true,
        message: settings.message || "האתר סגור זמנית לצורך תחזוקה.",
        title: settings.title || "האתר סגור כעת לכבוד שבת",
        badge: settings.badge || "שבת שלום",
        saleText: settings.saleText || "אחרי שבת כל האתר עד 50% הנחה — תחזרו מהר!",
        smallText: settings.smallText || "תודה על ההבנה. נשמח לראותכם שוב לאחר צאת השבת.",
        image: settings.image || "",
        logo: settings.logo || "/logo-nabet.png"
      });
    }
    if (!settings.enabled) {
      return res.json({ closed: false, enabled: false });
    }

    const { active, nextCandle, nextHavdalah } = findWindow(new Date());

    res.setHeader("Cache-Control", "no-store, max-age=0");

    if (active) {
      return res.json({
        enabled: true,
        closed: true,
        message: settings.message || "האתר סגור כעת לכבוד שבת וייפתח בצאת השבת.",
        title: settings.title || "האתר סגור כעת לכבוד שבת",
        badge: settings.badge || "שבת שלום",
        saleText: settings.saleText || "אחרי שבת כל האתר עד 50% הנחה — תחזרו מהר!",
        smallText: settings.smallText || "תודה על ההבנה. נשמח לראותכם שוב לאחר צאת השבת.",
        image: settings.image || "",
        logo: settings.logo || "/logo-nabet.png",
        candleLighting: active.candleLighting.toISOString(),
        havdalah: active.havdalah.toISOString(),
        closeAt: active.closeAt.toISOString(),
        openAt: active.openAt.toISOString(),
        opensAtText: formatIsrael(active.openAt),
        havdalahText: formatIsrael(active.havdalah)
      });
    }

    return res.json({
      enabled: true,
      closed: false,
      nextCandleLighting: nextCandle?.time?.toISOString() || null,
      nextHavdalah: nextHavdalah?.time?.toISOString() || null,
      nextCandleLightingText: nextCandle ? formatIsrael(nextCandle.time) : null,
      nextHavdalahText: nextHavdalah ? formatIsrael(nextHavdalah.time) : null
    });
  } catch (e) {
    return res.status(200).json({ closed: false, enabled: false, error: e.message });
  }
}