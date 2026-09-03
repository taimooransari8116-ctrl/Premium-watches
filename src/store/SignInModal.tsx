import { useState } from "react";
import { Customer } from "./types";

interface SignInModalProps {
  onClose: () => void;
  onSignedIn: (customer: Customer) => void;
  initial?: Customer | null;
}

export function SignInModal({ onClose, onSignedIn, initial }: SignInModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Naam, phone number, aur address teeno bharo.");
      return;
    }
    if (phone.trim().replace(/\D/g, "").length < 10) {
      setError("Phone number check karo — 10 digit ka hona chahiye.");
      return;
    }
    onSignedIn({ name: name.trim(), phone: phone.trim(), address: address.trim() });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-sm bg-[#0a0a0a] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white text-[18px] font-medium">Sign in</h2>
        <p className="text-white/40 text-[12px] -mt-2">
          Bas naam, number, aur address — order deliver karne ke liye.
        </p>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          type="tel"
          className="h-11 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30"
        />
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery address"
          rows={3}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[14px] outline-none focus:border-white/30 resize-none"
        />

        {error && <p className="text-red-400 text-[12px]">{error}</p>}

        <div className="flex gap-3 mt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-lg border border-white/15 text-white/70 text-[13px]">
            Cancel
          </button>
          <button onClick={submit} className="flex-1 h-11 rounded-lg bg-white text-black text-[13px] font-medium">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignInModal;
