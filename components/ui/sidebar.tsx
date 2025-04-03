'use client';

import { useRouter } from 'next/navigation';
import { Home, Wallet, History, Send, Coins } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

interface SidebarIconProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}

const SidebarIcon = ({ icon, text, onClick, disabled }: SidebarIconProps) => (
  <div 
    className={`sidebar-icon group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={disabled ? undefined : onClick}
  >
    {icon}
    <span className="sidebar-tooltip group-hover:scale-100">
      {disabled ? 'Connect wallet first' : text}
    </span>
  </div>
);

export function Sidebar() {
  const router = useRouter();
  const { connected } = useWallet();

  return (
    <div className="fixed left-0 h-screen w-16 m-0 flex flex-col items-center
                    bg-accent/20 backdrop-blur-sm border-r border-accent/30">
      <SidebarIcon 
        icon={<Home size={28} />} 
        text="Home"
        onClick={() => router.push('/')}
      />
      <SidebarIcon 
        icon={<Wallet size={28} />} 
        text="Dashboard"
        onClick={() => router.push('/dashboard')}
        disabled={!connected}
      />
      <SidebarIcon 
        icon={<Send size={28} />} 
        text="Send"
        onClick={() => router.push('/dashboard')}
        disabled={!connected}
      />
      <SidebarIcon 
        icon={<Coins size={28} />} 
        text="Mint Tokens"
        onClick={() => router.push('/token')}
        disabled={!connected}
      />
      <SidebarIcon 
        icon={<History size={28} />} 
        text="History"
        onClick={() => router.push('/dashboard')}
        disabled={!connected}
      />
      <div className="mt-auto mb-4">
      </div>
    </div>
  );
}