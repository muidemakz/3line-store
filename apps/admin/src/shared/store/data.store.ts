import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nairaToPoints } from '@/shared/utils/points';
import { deriveSessionStatus } from '@/shared/utils/session';
import type { SessionStatus } from '@/shared/utils/session';
import type { OrderStatus } from '@/shared/utils/order';

export interface SessionItem {
  id: string;
  title: string;
  startDate: string;      // ISO
  endDate: string;        // ISO
  status: SessionStatus;  // 'upcoming' | 'active' | 'completed'
  enrolledUserIds: string[]; // users who received point allocations for this session
}

export interface StoreItem {
  id: string;
  title: string;
  brand: string;
  unit: string;
  amountNaira: number;
  amountPoints: number;
  status: 'active' | 'inactive';
  createdAt: string; // ISO
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  userType: string;
  gradeLevel: string;
  status: 'active' | 'inactive';
  createdAt: string; // ISO
  points: number;
}

export interface OrderItem {
  id: string;
  sessionId: string;
  userId: string;
  // userName omitted — join from users at display time
  items: {
    itemId: string;
    // title omitted — join from items at display time
    qty: number;
    points: number; // price snapshot at time of order
  }[];
  totalPoints: number;
  status: OrderStatus;
  createdAt: string; // ISO
}

export interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  userId: string;
  category: string;
  progress: string;
  status: 'open' | 'approved' | 'declined';
  createdAt: string; // ISO
}

export interface GradeLevel {
  id: string;
  name: string;
  points: number;
}

export interface PointSettings {
  nairaPerPoint: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'allocation' | 'deduction';
  points: number;
  balanceAfter: number;
  reason: string;
  sessionId?: string;
  orderId?: string;
  createdAt: string; // ISO
}

interface DataStoreState {
  sessions: SessionItem[];
  items: StoreItem[];
  users: UserItem[];
  suggestions: SuggestionItem[];
  orders: OrderItem[];
  transactions: PointTransaction[];
  settings: PointSettings;
  gradeLevels: GradeLevel[];

  // Actions
  /** Status and enrolledUserIds are derived/computed — do not pass them. */
  addSession: (session: Omit<SessionItem, 'id' | 'status' | 'enrolledUserIds'>) => void;
  addItem: (item: Omit<StoreItem, 'id' | 'createdAt' | 'amountPoints'>) => void;
  addUser: (user: Omit<UserItem, 'id' | 'createdAt' | 'points'>) => void;
  addSuggestion: (suggestion: Omit<SuggestionItem, 'id' | 'createdAt'>) => void;
  /** Throws if session is not active or user has insufficient points. */
  addOrder: (order: Omit<OrderItem, 'id' | 'createdAt'>) => void;
  updateSettings: (settings: Partial<PointSettings>) => void;
  deleteSession: (id: string) => void;
  deleteItem: (id: string) => void;
  deleteUser: (id: string) => void;
  deleteSuggestion: (id: string) => void;
  /** Sets status → 'approved'. No point change (points already deducted at creation). */
  approveOrder: (id: string) => void;
  /** Sets status → 'cancelled' and refunds totalPoints to the user. */
  cancelOrder: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  toggleItemStatus: (id: string) => void;
  /**
   * Cycles session status:
   * active → completed (manual stop, no point change)
   * upcoming/completed → active (allocates grade-level points to all active users)
   */
  toggleSessionStatus: (id: string) => void;
  setGradeLevels: (levels: GradeLevel[]) => void;
}

function allocatePointsToUsers(
  users: UserItem[],
  gradeLevels: GradeLevel[],
  sessionId: string,
): { users: UserItem[]; transactions: PointTransaction[]; enrolledUserIds: string[] } {
  const now = new Date().toISOString();
  const updatedUsers: UserItem[] = [];
  const transactions: PointTransaction[] = [];
  const enrolledUserIds: string[] = [];

  for (const user of users) {
    if (user.status !== 'active') {
      updatedUsers.push(user);
      continue;
    }
    const grade = gradeLevels.find(g => g.name === user.gradeLevel);
    if (!grade) {
      updatedUsers.push(user);
      continue;
    }
    const newBalance = user.points + grade.points;
    updatedUsers.push({ ...user, points: newBalance });
    enrolledUserIds.push(user.id);
    transactions.push({
      id: `${Date.now()}-${user.id}`,
      userId: user.id,
      type: 'allocation',
      points: grade.points,
      balanceAfter: newBalance,
      reason: 'Session allocation',
      sessionId,
      createdAt: now,
    });
  }

  return { users: updatedUsers, transactions, enrolledUserIds };
}

export const useDataStore = create<DataStoreState>()(
  persist(
    (set, get) => ({
      sessions: [
        {
          id: '1',
          title: 'Morning Session',
          startDate: '2025-10-01T00:00:00.000Z',
          endDate: '2025-10-30T00:00:00.000Z',
          status: 'completed',
          enrolledUserIds: ['1'],
        },
        {
          id: '2',
          title: 'Afternoon Batch',
          startDate: '2025-10-02T00:00:00.000Z',
          endDate: '2025-10-31T00:00:00.000Z',
          status: 'active',
          enrolledUserIds: ['1'],
        },
      ],
      items: [
        { id: '1', title: 'Noodles 20X45g', brand: 'Indomie', unit: 'Carton', amountNaira: 5000, amountPoints: 50, status: 'active', createdAt: '2025-10-01T00:00:00.000Z' },
      ],
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', userType: 'Admin', gradeLevel: 'Level 1', status: 'active', createdAt: '2025-10-01T00:00:00.000Z', points: 1000 },
      ],
      suggestions: [
        { id: '1', title: 'Milo refill', description: '', userId: '1', category: 'Product Request', progress: '—', status: 'open', createdAt: '2025-10-01T00:00:00.000Z' },
      ],
      orders: [],
      transactions: [],
      settings: { nairaPerPoint: 0 },
      gradeLevels: [],

      addSession: (session) => set((state) => {
        if (!session.title.trim()) return {};

        const status = deriveSessionStatus(session.startDate, session.endDate);
        const id = Date.now().toString();

        if (status !== 'active') {
          return {
            sessions: [...state.sessions, { ...session, id, status, enrolledUserIds: [] }],
          };
        }

        const { users, transactions, enrolledUserIds } = allocatePointsToUsers(
          state.users, state.gradeLevels, id,
        );
        return {
          sessions: [...state.sessions, { ...session, id, status, enrolledUserIds }],
          users,
          transactions: [...state.transactions, ...transactions],
        };
      }),

      addItem: (item) => set((state) => {
        if (!item.title.trim() || item.amountNaira <= 0) return {};
        return {
          items: [...state.items, {
            ...item,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            amountPoints: nairaToPoints(item.amountNaira, state.settings.nairaPerPoint),
          }],
        };
      }),

      addUser: (user) => set((state) => {
        const grade = state.gradeLevels.find(g => g.name === user.gradeLevel);
        return {
          users: [...state.users, {
            ...user,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            points: grade?.points ?? 0,
          }],
        };
      }),

      addSuggestion: (suggestion) => set((state) => ({
        suggestions: [...state.suggestions, {
          ...suggestion,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }],
      })),

      addOrder: (order) => {
        const state = get();
        const session = state.sessions.find(s => s.id === order.sessionId);
        if (!session || session.status !== 'active') {
          throw new Error('Orders can only be placed under an active session.');
        }
        const user = state.users.find(u => u.id === order.userId);
        if (!user) throw new Error('User not found.');
        if (user.points < order.totalPoints) {
          throw new Error(`Insufficient points. ${user.name} has ${user.points}PT but this order requires ${order.totalPoints}PT.`);
        }

        const now = new Date().toISOString();
        const orderId = `#${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        const newBalance = user.points - order.totalPoints;

        set((s) => ({
          orders: [...s.orders, { ...order, id: orderId, createdAt: now }],
          users: s.users.map(u =>
            u.id === order.userId ? { ...u, points: newBalance } : u
          ),
          transactions: [...s.transactions, {
            id: `${Date.now()}-${user.id}`,
            userId: user.id,
            type: 'deduction' as const,
            points: order.totalPoints,
            balanceAfter: newBalance,
            reason: `Order ${orderId}`,
            sessionId: order.sessionId,
            orderId,
            createdAt: now,
          }],
        }));
      },

      updateSettings: (newSettings) => set((state) => {
        if (newSettings.nairaPerPoint !== undefined && newSettings.nairaPerPoint < 0) return {};
        return { settings: { ...state.settings, ...newSettings } };
      }),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
      })),

      deleteItem: (id) => set((state) => {
        const hasPendingOrder = state.orders.some(
          o => o.status === 'pending' && o.items.some(i => i.itemId === id)
        );
        if (hasPendingOrder) return {};
        return { items: state.items.filter(i => i.id !== id) };
      }),

      deleteUser: (id) => set((state) => {
        const hasPendingOrder = state.orders.some(
          o => o.status === 'pending' && o.userId === id
        );
        if (hasPendingOrder) return {};
        return { users: state.users.filter(u => u.id !== id) };
      }),

      deleteSuggestion: (id) => set((state) => ({
        suggestions: state.suggestions.filter(s => s.id !== id),
      })),

      approveOrder: (id) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (!order || order.status !== 'pending') return {};
        return {
          orders: state.orders.map(o =>
            o.id === id ? { ...o, status: 'approved' as const } : o
          ),
        };
      }),

      cancelOrder: (id) => set((state) => {
        const order = state.orders.find(o => o.id === id);
        if (!order || order.status === 'cancelled') return {};
        const user = state.users.find(u => u.id === order.userId);
        if (!user) return {};
        const newBalance = user.points + order.totalPoints;
        const now = new Date().toISOString();
        return {
          orders: state.orders.map(o =>
            o.id === id ? { ...o, status: 'cancelled' as const } : o
          ),
          users: state.users.map(u =>
            u.id === order.userId ? { ...u, points: newBalance } : u
          ),
          transactions: [...state.transactions, {
            id: `${Date.now()}-${user.id}`,
            userId: user.id,
            type: 'allocation' as const,
            points: order.totalPoints,
            balanceAfter: newBalance,
            reason: `Refund for order ${order.id}`,
            sessionId: order.sessionId,
            orderId: order.id,
            createdAt: now,
          }],
        };
      }),

      toggleUserStatus: (id) => set((state) => ({
        users: state.users.map(u =>
          u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
        ),
      })),

      toggleItemStatus: (id) => set((state) => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i
        ),
      })),

      toggleSessionStatus: (id) => set((state) => {
        const session = state.sessions.find(s => s.id === id);
        if (!session) return {};

        // Deactivate: active → completed
        if (session.status === 'active') {
          return {
            sessions: state.sessions.map(s =>
              s.id === id ? { ...s, status: 'completed' as const } : s
            ),
          };
        }

        // Activate: upcoming/completed → active, allocate points
        const { users, transactions, enrolledUserIds } = allocatePointsToUsers(
          state.users, state.gradeLevels, id,
        );
        return {
          sessions: state.sessions.map(s =>
            s.id === id
              ? {
                  ...s,
                  status: 'active' as const,
                  // merge without duplicates in case of reactivation
                  enrolledUserIds: [...new Set([...s.enrolledUserIds, ...enrolledUserIds])],
                }
              : s
          ),
          users,
          transactions: [...state.transactions, ...transactions],
        };
      }),

      setGradeLevels: (levels) => set(() => {
        const seen = new Set<string>();
        for (const l of levels) {
          const key = l.name.trim().toLowerCase();
          if (!key || l.points <= 0 || seen.has(key)) return {};
          seen.add(key);
        }
        return { gradeLevels: levels };
      }),
    }),
    { name: 'admin-portal-data-v2' }
  )
);
