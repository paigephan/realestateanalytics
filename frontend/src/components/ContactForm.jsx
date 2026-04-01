import { useState} from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID  = "service_ad089up";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "template_3ji5mvp";  // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY  = "rWDrO8x_g_yOsOCx1";   // e.g. "aBcDeFgHiJkLmNoP"

export default function ContactForm() {
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus]   = useState("idle"); // "idle" | "sending" | "success" | "error"

  const handleSubmit = async () => {
    if (!email || !message) return;
    setStatus("sending");

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { 
          name: email,        // you don't have a name field, so using email as the sender identity
          time: new Date().toLocaleString(),   // current timestamp
          message: message,   // ← rename message_content back to message
         },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setEmail("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ap-email" className="text-xs font-medium tracking-wider uppercase text-[#8C7B6B]">
          Email Address
        </label>
        <input
          id="ap-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-sm font-light text-[#1A1714] bg-[#FDFAF7] border border-[#DDD5CC] rounded-lg px-4 py-3 outline-none focus:border-[#C45B3A] transition-colors w-full"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ap-message" className="text-xs font-medium tracking-wider uppercase text-[#8C7B6B]">
          Message
        </label>
        <textarea
          id="ap-message"
          placeholder="Feedback, bugs, feature ideas, or just a hello…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="text-sm font-light text-[#1A1714] bg-[#FDFAF7] border border-[#DDD5CC] rounded-lg px-4 py-3 outline-none focus:border-[#C45B3A] transition-colors resize-none w-full"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={status === "sending"}
        className="self-start text-xs font-medium tracking-widest uppercase text-white bg-[#C45B3A] hover:bg-[#B04E30] disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px rounded-lg px-6 py-3 transition-all duration-200"
      >
        {status === "sending" ? "Sending…" : "Send message →"}
      </button>

      {status === "success" && (
        <p className="text-sm text-[#7A8C6E]">✓ Message sent! Thanks for reaching out.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-400">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}