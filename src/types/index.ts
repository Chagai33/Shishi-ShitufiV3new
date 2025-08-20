// src/types/index.ts

/**
 * מייצג משתמש רשום במערכת (מארגן אירועים).
 */
export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email?: string;
  createdAt: number;
}

/**
 * מייצג את פרטי הליבה של אירוע, כפי שהם נשמרים תחת event.details.
 */
export interface EventDetails {
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  isActive: boolean;
  allowUserItems?: boolean; // האם לאפשר למשתתפים להוסיף פריטים
  userItemLimit?: number;   // מה המגבלה למשתמש
}

// --- START OF CHANGES ---

/**
 * מייצג פריט בתפריט של אירוע ספציפי.
 * פריט מייצג "צורך" עם כמות ויחידת מידה, ומספר משתמשים יכולים להירשם אליו.
 */
export interface MenuItem {
  id: string;
  eventId: string;
  name: string;
  category: 'starter' | 'main' | 'dessert' | 'drink' | 'other' | 'equipment';
  notes?: string;
  isRequired: boolean;
  creatorId: string;
  creatorName: string;
  createdAt: number;
  
  // שדות הכמות החדשים
  quantityRequired: number; // שינוי שם מ-quantity
  unitType: 'units' | 'grams' | 'servings'; // שדה חדש לסוג היחידה
  totalAssignedQuantity: number; // שדה חדש לסכימת הכמות ששובצה
  
  // ⛔️ שדות שהוסרו מכיוון שהם תומכים בשיבוץ יחיד בלבד
  // assignedTo?: string;
  // assignedToName?: string;
  // assignedAt?: number;
}

// --- END OF CHANGES ---


/**
 * מייצג שיבוץ של משתמש לפריט.
 */
export interface Assignment {
  id: string;
  eventId: string;
  menuItemId: string;
  userId: string;
  userName: string;
  quantity: number; // הכמות שהמשתמש הספציפי מביא (בהתאם ל-unitType של הפריט)
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed';
  assignedAt: number;
  updatedAt?: number;
}


/**
 * מייצג משתתף שנרשם לאירוע.
 */
export interface Participant {
    id: string; // Firebase Auth UID (יכול להיות גם של משתמש אנונימי)
    name: string;
    joinedAt: number;
}

/**
 * מייצג את האובייקט המלא של אירוע, כפי שהוא מאוחסן בבסיס הנתונים.
 */
export interface ShishiEvent {
  id: string;
  organizerId: string;
  organizerName: string;
  createdAt: number;
  updatedAt?: number;
  details: EventDetails;
  menuItems: { [key: string]: Omit<MenuItem, 'id' | 'eventId'> };
  assignments: { [key: string]: Omit<Assignment, 'id' | 'eventId'> };
  participants: { [key: string]: Omit<Participant, 'id'> };
  userItemCounts?: { [key: string]: number };
}

// טיפוסים עבור ה-Store הגלובלי (Zustand)
export interface AppState {
  user: User | null;
  organizerEvents: ShishiEvent[];
  currentEvent: ShishiEvent | null;
  isLoading: boolean;
}