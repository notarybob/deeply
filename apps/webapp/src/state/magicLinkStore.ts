import { create } from 'zustand';

interface MagicLinkState {
  uniqueLink: string;
  setUniqueLink: (link: string) => void;
}

let useMagicLinkStore = create<MagicLinkState>()((set) => ({
    uniqueLink: "https://",
    setUniqueLink: (link) => set({ uniqueLink: link }),
}));

export default useMagicLinkStore;
