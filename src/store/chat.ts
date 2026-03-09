import { create } from 'zustand';

interface ChatState {
  isOpen: boolean;
  selectedConversationId: number | null;
  pendingListingId: number | null;
  pendingSellerId: number | null;
  openChat: () => void;
  closeChat: () => void;
  openChatWithSeller: (listingId: number, sellerId: number) => void;
  selectConversation: (conversationId: number) => void;
  clearPending: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  selectedConversationId: null,
  pendingListingId: null,
  pendingSellerId: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false, selectedConversationId: null }),
  openChatWithSeller: (listingId, sellerId) => set({ 
    isOpen: true, 
    pendingListingId: listingId,
    pendingSellerId: sellerId 
  }),
  selectConversation: (conversationId) => set({ selectedConversationId: conversationId }),
  clearPending: () => set({ pendingListingId: null, pendingSellerId: null })
}));
