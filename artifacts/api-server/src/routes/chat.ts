import { Router, type IRouter } from "express";
import { PostChatBody } from "@workspace/api-zod";

const router: IRouter = Router();

const KEYWORDS: Array<{ match: RegExp; reply: string }> = [
  { match: /breakfast|brunch/i, reply: "Breakfast is served from 7:00 AM to 10:30 AM in the main dining hall on the ground floor." },
  { match: /\bspa\b|massage|sauna/i, reply: "Our spa is on Floor 2 and is open 9:00 AM – 9:00 PM. Reservations can be made at reception." },
  { match: /wifi|wi-fi|internet|password/i, reply: "Complimentary WiFi is available throughout the property. The network name and password are printed on the keycard sleeve at reception." },
  { match: /pool|swim/i, reply: "The rooftop pool is open from 6:00 AM to 10:00 PM. Towels are provided poolside." },
  { match: /gym|fitness|workout/i, reply: "The fitness center is on Floor 3 and is accessible 24/7 with your room keycard." },
  { match: /checkout|check-out|check out/i, reply: "Check-out is at 11:00 AM. Late check-out can be arranged at reception, subject to availability." },
  { match: /check-in|check in|checkin/i, reply: "Check-in is from 3:00 PM. Early check-in is subject to availability." },
  { match: /restaurant|dinner|dining|menu/i, reply: "Our restaurant is open for dinner from 6:00 PM to 11:00 PM. The bar serves light fare until midnight." },
  { match: /room service|food.*room/i, reply: "Room service is available 24 hours. Please dial 0 from your room phone to place an order." },
  { match: /taxi|cab|transport|airport/i, reply: "We can arrange a taxi or airport transfer at any time. Please contact the concierge or the front desk." },
  { match: /parking|valet|garage/i, reply: "Valet parking is available at the main entrance. Self-parking is in the underground garage on B1." },
  { match: /housekeeping|clean|towels?/i, reply: "Housekeeping can be reached by dialing 1 from your room phone, or we can dispatch fresh towels right away." },
  { match: /emergency|fire|smoke|evacuat/i, reply: "If this is an emergency, please use the red Emergency button. Our team and emergency services are notified instantly." },
  { match: /hello|hi |hey|good (morning|afternoon|evening)/i, reply: "Hello! How can the concierge assist you today?" },
  { match: /thank/i, reply: "You're very welcome. Please let us know if there's anything else we can do." },
];

const FALLBACK = "Our staff will assist you shortly. For anything urgent, please use the Call Staff button.";

router.post("/chat", (req, res) => {
  const { message } = PostChatBody.parse(req.body);
  const hit = KEYWORDS.find((k) => k.match.test(message));
  res.json({ reply: hit ? hit.reply : FALLBACK });
});

export default router;
