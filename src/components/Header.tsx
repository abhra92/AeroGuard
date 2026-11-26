'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wind,
  MapPin,
  SlidersHorizontal,
  Navigation,
  Layers,
  HeartHandshake,
  MessageSquare,
  Shield,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PRESET_SMOG_HOTSPOTS } from '@/lib/aqi-utils';
import { ApiKeyModal } from './ApiKeyModal';

export function Header() {
  const pathname = usePathname();
  const { currentLocation, setLocation, apiKeys } = useAppStore();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const hasKey = Boolean(apiKeys.geminiKey || apiKeys.groqKey);

  const navLinks = [
    { href: '/', label: 'Telemetry', mobileLabel: 'Live', icon: Wind },
    { href: '/routines', label: 'Daily Routine', mobileLabel: 'Routine', icon: Shield },
    { href: '/iaq-lab', label: 'DIY Filter Lab', mobileLabel: 'Filter', icon: Layers },
    { href: '/community', label: 'Community', mobileLabel: 'Community', icon: HeartHandshake },
    { href: '/assistant', label: 'Air Advisor', mobileLabel: 'Advisor', icon: MessageSquare },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLocDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.county ||
            'Local Neighborhood';
          const country = data.address?.country || '';

          setLocation({
            name: city,
            country,
            lat: Number(latitude.toFixed(4)),
            lon: Number(longitude.toFixed(4)),
          });
          setIsLocDropdownOpen(false);
        } catch {
          setLocation({
            name: 'Local GPS Position',
            country: '',
            lat: Number(latitude.toFixed(4)),
            lon: Number(longitude.toFixed(4)),
          });
          setIsLocDropdownOpen(false);
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        alert(`Location access unavailable (${err.message}). Using preset hotspot.`);
      }
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 header-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Product Name */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 focus-ring rounded-[2px] py-1"
          >
            <span className="w-6 h-6 rounded-[2px] bg-[#141414] flex items-center justify-center text-white shrink-0">
              <Wind className="w-3.5 h-3.5" />
            </span>
            <span className="font-medium text-[15px] tracking-tight text-[#141414]">
              AeroGuard
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono-tech text-[#7d7d7d] pl-1 border-l border-black/10">
              IAQ
            </span>
          </Link>

          {/* Centered Public Navigation Links */}
          <nav className="hidden items-center gap-5 lg:flex" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1 text-[14px] leading-[1.4] font-normal rounded-[2px] transition-colors focus-ring ${
                    isActive
                      ? 'text-[#2200ff]'
                      : 'text-[#141414] hover:text-[#2200ff]'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Location Selector (Outlined Utility Button) */}
            <div className="relative">
              <button
                onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isLocDropdownOpen}
                aria-label="Select location"
                className="btn-outlined inline-flex min-h-11 items-center gap-1.5 text-[14px] leading-[1.4] focus-ring lg:min-h-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2200ff] shrink-0" />
                <span className="hidden max-w-[150px] truncate sm:inline-block lg:max-w-[96px] xl:max-w-[150px]">
                  {currentLocation.name}
                </span>
                <ChevronDown className="w-3 h-3 text-[#7d7d7d] shrink-0" />
              </button>

              {isLocDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 w-72 rounded-[16px] bg-[#f7f6f5] border border-black/10 p-2 z-50"
                  style={{ boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                >
                  <div className="p-2 border-b border-black/10 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#7d7d7d] uppercase tracking-wider">
                      Select Urban Area
                    </span>
                    <button
                      onClick={handleDetectGPS}
                      disabled={isDetectingGps}
                      className="text-[11px] text-[#2200ff] hover:underline flex items-center gap-1 font-normal focus-ring rounded-[2px]"
                    >
                      <Navigation className="w-3 h-3" />
                      {isDetectingGps ? 'Locating...' : 'Use GPS'}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                    {PRESET_SMOG_HOTSPOTS.map((spot) => {
                      const isSelected = spot.name === currentLocation.name;
                      return (
                        <button
                          key={spot.name}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setLocation({
                              name: spot.name,
                              country: spot.country,
                              lat: spot.lat,
                              lon: spot.lon,
                            });
                            setIsLocDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-[8px] text-[13px] flex items-center justify-between focus-ring transition-colors ${
                            isSelected
                              ? 'bg-[#efefef] text-[#141414] font-medium'
                              : 'text-[#141414] hover:bg-[#efefef]'
                          }`}
                        >
                          <div>
                            <div className="text-[#141414]">{spot.name}</div>
                            <div className="text-[11px] text-[#7d7d7d]">{spot.country}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#2200ff] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* AI Provider Config Button (Carbon Compact Button) */}
            <button
              onClick={() => setIsKeyModalOpen(true)}
              aria-label="Configure AI settings"
              className="btn-carbon inline-flex min-h-11 items-center gap-1.5 text-[14px] leading-[1.4] focus-ring lg:min-h-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">
                {hasKey ? 'Key Active' : 'Model Settings'}
              </span>
              <span className="xl:hidden">Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="grid grid-cols-5 gap-1 px-2 py-1.5 border-t border-black/10 bg-[#f7f6f5] text-[11px] lg:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-w-0 min-h-12 flex-col items-center justify-center gap-0.5 px-0.5 rounded-[2px] focus-ring ${
                  isActive ? 'text-[#2200ff] font-medium' : 'text-[#141414]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="max-w-full truncate text-center text-[10px] leading-3 sm:text-[11px]">
                  {link.mobileLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </header>

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
}
