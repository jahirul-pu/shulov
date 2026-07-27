import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Tag, Copy, Check, ArrowRight } from 'lucide-react';

interface PopupData {
  id: string;
  image: string;
  couponCode: string | null;
  ctaLabel: string;
  ctaLink: string;
}

const SESSION_KEY = 'shulov_popup_seen';

export const PromoPopup: React.FC = () => {
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Don't show if already seen this session
    if (sessionStorage.getItem(SESSION_KEY)) return;

    fetch('http://localhost:5000/api/popups')
      .then((r) => r.json())
      .then((d) => {
        if (d.popups && d.popups.length > 0) {
          setPopups(d.popups);
          // Show after 2.5s delay
          setTimeout(() => setIsVisible(true), 2500);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 300);
  };

  const goNext = () => {
    if (currentIndex < popups.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      dismiss();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible || popups.length === 0) return null;

  const popup = popups[currentIndex];
  const hasMore = currentIndex < popups.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={dismiss}
      />

      {/* Card — Tight seamless image container with zero outer borders */}
      <div
        className={`relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group ${
          closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ animation: closing ? undefined : 'popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Main Image */}
        <img
          src={popup.image}
          alt="Promotional offer"
          className="w-full h-auto block rounded-3xl object-cover"
        />

        {/* Close Button — Overlaid top right */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all hover:scale-110 border border-white/20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Counter Badge — Overlaid top left */}
        {popups.length > 1 && (
          <div className="absolute top-3 left-3 z-20 bg-black/60 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-md">
            {currentIndex + 1} / {popups.length}
          </div>
        )}

        {/* Bottom Overlay Controls (Gradient backdrop over image bottom) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent space-y-3 pt-10">
          {/* Coupon Code Pill */}
          {popup.couponCode && (
            <div className="flex items-center justify-between bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-3.5 py-2 text-white shadow-md">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-[9px] text-amber-200 font-bold uppercase tracking-wider">Promo Code</p>
                  <p className="text-xs font-extrabold text-white tracking-widest">{popup.couponCode}</p>
                </div>
              </div>
              <button
                onClick={() => copyCode(popup.couponCode!)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-900'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex gap-2 items-center justify-center">
            <Link
              to={popup.ctaLink}
              onClick={dismiss}
              className="px-4 py-2 bg-white/20 hover:bg-white/35 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all backdrop-blur-md border border-white/40 shadow-md group/btn"
            >
              <span>{popup.ctaLabel}</span>
              <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>

            {hasMore && (
              <button
                onClick={goNext}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/30 text-white font-extrabold text-[11px] rounded-xl transition-colors backdrop-blur-md border border-white/30 shadow-md"
              >
                Next →
              </button>
            )}
          </div>

          {/* Dots Indicator */}
          {popups.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {popups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
