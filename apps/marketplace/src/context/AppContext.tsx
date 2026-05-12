import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, productsService, sessionsService, ordersService, apiClient } from '../shared/api';
import { suggestionsService } from '../shared/api/suggestions';
import type { Suggestion as ApiSuggestion } from '../shared/api/suggestions';
import type { Product } from '../shared/api/products';
import type { Session, UserSessionPoints } from '../shared/api/sessions';
import type { Order } from '../shared/api/orders';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

type Suggestion = ApiSuggestion;

interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // Sessions & Points
  sessions: Session[];
  activeSession: Session | null;
  userPoints: UserSessionPoints[];
  currentSessionPoints: number;
  switchSession: (sessionId: string) => void | Promise<void>;

  // Products
  products: Product[];
  isLoadingProducts: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  checkout: () => Promise<void>;

  // Orders
  orders: Order[];
  isLoadingOrders: boolean;

  // Navigation
  currentPage: string;
  setCurrentPage: (page: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Suggestions
  suggestions: Suggestion[];
  isLoadingSuggestions: boolean;
  addSuggestion: (title: string, description: string, imageUrl?: string) => Promise<void>;
  toggleVote: (id: string) => Promise<void>;

  // Loading & Errors
  error: string | null;
  clearError: () => void;

  // Toast notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Data State
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [userPoints, setUserPoints] = useState<UserSessionPoints[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Cart State (local)
  const [cart, setCart] = useState<CartItem[]>([]);

  // UI State
  const [currentPage, setCurrentPage] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  // Check if user is already logged in (token exists)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsLoggedIn(true);
          await loadUserData();
        } catch (err) {
          // Token invalid or expired
          localStorage.removeItem('access_token');
          setIsLoggedIn(false);
        }
      }
    };
    checkAuth();
  }, []);

  // Load user data after login
  const loadUserData = async () => {
    try {
      // Load user points first (this works for all users)
      const pointsData = await sessionsService.getUserPoints();
      setUserPoints(pointsData);

      // Try to load all sessions (might fail for non-admin users)
      let resolvedSessions: Session[] = [];
      try {
        const sessionsData = await sessionsService.getAll();
        setSessions(sessionsData);
        resolvedSessions = sessionsData;
      } catch (err) {
        // For regular users: extract real session objects from their points data
        // (backend includes session in the getUserPoints response)
        const userSessions: Session[] = pointsData
          .filter(p => p.session)
          .map(p => p.session as Session);

        // Fallback to minimal placeholder only if session wasn't included
        const fallback: Session[] = pointsData
          .filter(p => !p.session)
          .map(p => ({
            id: p.sessionId,
            name: `Session ${p.sessionId.slice(0, 8)}`,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

        resolvedSessions = [...userSessions, ...fallback];
        setSessions(resolvedSessions);
      }

      // Set active session — prefer the one marked isActive, else first
      let initialSession: Session | undefined;
      if (resolvedSessions.length > 0) {
        initialSession = resolvedSessions.find(s => s.isActive) || resolvedSessions[0];
        setActiveSession(initialSession);
      }

      // Load products filtered to the active session
      await loadProducts(initialSession?.id);

      // Load orders
      await loadOrders();

      // Load suggestions (top 10 demand chart)
      await loadSuggestions(initialSession?.id);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const loadProducts = async (sessionId?: string) => {
    setIsLoadingProducts(true);
    try {
      const productsData = await productsService.getAll(sessionId ? { sessionId } : undefined);
      setProducts(productsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const ordersData = await ordersService.getMyOrders();
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Auth Functions
  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, tokens } = await authService.login({ email, password });
      apiClient.setToken(tokens.accessToken);
      setUser(loggedInUser);
      setIsLoggedIn(true);
      await loadUserData();
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setSessions([]);
    setActiveSession(null);
    setUserPoints([]);
    setProducts([]);
    setOrders([]);
    setCart([]);
    setCurrentPage('marketplace');
    setSearchQuery('');
  };

  // Session Functions
  const switchSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSession(session);
      showToast(`Switched to ${session.name}`, 'info');
      // Reload everything scoped to this session
      loadProducts(session.id);
      loadSuggestions(session.id);
      // Re-fetch points in case admin allocated new points after last login
      try {
        const fresh = await sessionsService.getUserPoints();
        setUserPoints(fresh);
      } catch (_) {}
    }
  };

  const currentSessionPoints = userPoints.find(
    p => p.sessionId === activeSession?.id
  )?.remainingPoints || 0;

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, {
        id: `cart_${Date.now()}`,
        productId: product.id,
        product,
        quantity
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.pointsPrice * item.quantity,
    0
  );

  const checkout = async () => {
    if (!activeSession) {
      setError('No active session');
      throw new Error('No active session');
    }

    if (cart.length === 0) {
      setError('Cart is empty');
      throw new Error('Cart is empty');
    }

    if (cartTotal > currentSessionPoints) {
      setError('Insufficient points');
      throw new Error('Insufficient points');
    }

    try {
      await ordersService.create({
        sessionId: activeSession.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });

      // Reload data after successful checkout
      await loadUserData();
      clearCart();
      showToast('Your order has been placed successfully! 🎉');
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
      throw err;
    }
  };

  // Suggestion Functions
  const loadSuggestions = async (sessionId?: string) => {
    setIsLoadingSuggestions(true);
    try {
      const data = await suggestionsService.getTopRanking(sessionId);
      setSuggestions(data);
    } catch (err: any) {
      // Non-fatal — suggestions failing shouldn't break the app
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addSuggestion = async (title: string, description: string, imageUrl?: string) => {
    if (!activeSession) throw new Error('No active session');
    const created = await suggestionsService.create({
      title,
      description,
      sessionId: activeSession.id,
      imageUrl,
    });
    setSuggestions(prev => [created, ...prev].slice(0, 10));
    showToast('Suggestion submitted successfully!');
  };

  const toggleVote = async (id: string) => {
    const result = await suggestionsService.toggleVote(id);
    setSuggestions(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, voteCount: result.voteCount, hasVoted: !s.hasVoted }
          : s
      )
    );
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        sessions,
        activeSession,
        userPoints,
        currentSessionPoints,
        switchSession,
        products,
        isLoadingProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        checkout,
        orders,
        isLoadingOrders,
        currentPage,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
        suggestions,
        isLoadingSuggestions,
        addSuggestion,
        toggleVote,
        error,
        clearError,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
