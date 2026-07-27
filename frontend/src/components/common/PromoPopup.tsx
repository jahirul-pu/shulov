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
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
        onClick={dismiss}
      />

      {/* Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg transition-all duration-300 ${
          closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ animation: closing ? undefined : 'popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Close Button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-md transition-all hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Popup counter */}
        {popups.length > 1 && (
          <div className="absolute top-3 left-3 z-10 bg-black/50 text-white text-[10px] font-extrabold px-2 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {popups.length}
          </div>
        )}

        {/* Image */}
        <div className="h-64 bg-slate-100 overflow-hidden">
          <img
            src={popup.image}
            alt="Promotional offer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Coupon Code */}
          {popup.couponCode && (
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">Promo Code</p>
                  <p className="text-sm font-extrabold text-amber-800 tracking-widest">{popup.couponCode}</p>
                </div>
              </div>
              <button
                onClick={() => copyCode(popup.couponCode!)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
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

          {/* CTA Button */}
          <div className="flex gap-2">
            <Link
              to={popup.ctaLink}
              onClick={dismiss}
              className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm group"
            >
              <span>{popup.ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {hasMore && (
              <button
                onClick={goNext}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors"
              >
                Next →
              </button>
            )}
          </div>

          {/* Dots indicator */}
          {popups.length > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              {popups.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`rounded-full transition-all ${
                    i === currentIndex ? 'w-5 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-slate-200'
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
