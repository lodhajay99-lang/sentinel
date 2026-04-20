'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface GroupMember {
  id: string;
  name: string;
  location: string;
  phone: string;
}

export interface TicketGroup {
  id: string;
  familyName: string;
  members: GroupMember[];
}

interface GroupContextType {
  activeGroup: TicketGroup | null;
  setActiveGroup: (group: TicketGroup | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [activeGroup, setActiveGroup] = useState<TicketGroup | null>(null);

  return (
    <GroupContext.Provider value={{ activeGroup, setActiveGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroupContext() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroupContext must be used within a GroupProvider');
  }
  return context;
}
