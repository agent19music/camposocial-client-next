// Google Analytics 4 utility functions

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if GA is configured
export const isGAConfigured = (): boolean => {
    return !!GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
};

// Define gtag types
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js' | 'set',
            targetId: string | Date,
            config?: Record<string, unknown>
        ) => void;
        dataLayer: unknown[];
    }
}

// Log page views
export const pageview = (url: string): void => {
    if (!isGAConfigured()) return;

    window.gtag('config', GA_MEASUREMENT_ID!, {
        page_path: url,
    });
};

// Log specific events
export const event = ({
    action,
    category,
    label,
    value,
}: {
    action: string;
    category: string;
    label?: string;
    value?: number;
}): void => {
    if (!isGAConfigured()) return;

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};

// Common event helpers for your app
export const trackEvent = {
    // User actions
    signUp: (method: string) => event({ action: 'sign_up', category: 'engagement', label: method }),
    login: (method: string) => event({ action: 'login', category: 'engagement', label: method }),

    // Social features
    createYap: () => event({ action: 'create_yap', category: 'social' }),
    likeYap: () => event({ action: 'like_yap', category: 'social' }),
    replyYap: () => event({ action: 'reply_yap', category: 'social' }),
    shareYap: () => event({ action: 'share_yap', category: 'social' }),

    // Marketplace
    viewProduct: (productId: string) => event({ action: 'view_item', category: 'marketplace', label: productId }),
    addToCart: (productId: string, value?: number) => event({ action: 'add_to_cart', category: 'marketplace', label: productId, value }),
    purchase: (value: number) => event({ action: 'purchase', category: 'marketplace', value }),

    // Events
    viewEvent: (eventId: string) => event({ action: 'view_event', category: 'events', label: eventId }),
    rsvpEvent: (eventId: string) => event({ action: 'rsvp_event', category: 'events', label: eventId }),

    // Friends
    sendFriendRequest: () => event({ action: 'send_friend_request', category: 'social' }),
    acceptFriendRequest: () => event({ action: 'accept_friend_request', category: 'social' }),

    // Chat
    sendMessage: () => event({ action: 'send_message', category: 'messaging' }),
};
