// src/services/firebaseService.ts

import { ref, push, set, get, onValue, off, remove, update, query, equalTo, orderByChild } from 'firebase/database';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { database, auth } from '../lib/firebase';
import { ShishiEvent, MenuItem, Assignment, User, EventDetails, PresetList, PresetItem } from '../types'; // <--- עדכון: נוספו טיפוסים חדשים
import { toast } from 'react-hot-toast'; // <--- עדכון: נוסף import עבור התראות

/**
 * שירות Firebase מותאם למודל שטוח (Flat Model)
 * כל פעולה מתבצעת על אוספים גלובליים עם סינון לפי eventId או organizerId
 */
export class FirebaseService {
  
  // ===============================
  // פונקציות עזר פנימיות
  // ===============================
  
  /**
   * מוודא שלאירוע יש את כל המבנים הנדרשים
   */
  private static async ensureEventStructure(eventId: string): Promise<void> {
    console.group('🔧 FirebaseService.ensureEventStructure');
    console.log('📥 Input parameters:', { eventId });
    console.log('🔗 Event path:', `events/${eventId}`);
    
    try {
      const eventRef = ref(database, `events/${eventId}`);
      const snapshot = await get(eventRef);
      
      if (snapshot.exists()) {
        const eventData = snapshot.val();
        const updates: { [key: string]: any } = {};
        
        // וידוא שכל המבנים הנדרשים קיימים
        if (!eventData.menuItems) {
          console.log('➕ Adding missing menuItems structure');
          updates[`events/${eventId}/menuItems`] = {};
        }
        if (!eventData.assignments) {
          console.log('➕ Adding missing assignments structure');
          updates[`events/${eventId}/assignments`] = {};
        }
        if (!eventData.participants) {
          console.log('➕ Adding missing participants structure');
          updates[`events/${eventId}/participants`] = {};
        }
        
        if (Object.keys(updates).length > 0) {
          console.log('💾 Applying structure updates:', updates);
          await update(ref(database), updates);
          console.log('✅ Structure updates applied');
        } else {
          console.log('✅ Event structure is already complete');
        }
      } else {
        console.warn('⚠️ Event does not exist:', `events/${eventId}`);
      }
      
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in ensureEventStructure:', error);
      console.groupEnd();
      throw error;
    }
  }

  // ===============================
  // ניהול מארגנים (Organizers)
  // ===============================

  /**
   * יוצר מארגן חדש במערכת
   */
  static async createOrganizer(email: string, password: string, displayName: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    
    // עדכון פרופיל ב-Firebase Auth
    await updateProfile(newUser, { displayName });
    
    // יצירת פרופיל משתמש ב-Database
    const userObject: User = {
      id: newUser.uid,
      name: displayName,
      email: newUser.email || '',
      createdAt: Date.now()
    };
    
    await set(ref(database, `users/${newUser.uid}`), userObject);
    return userObject;
  }

  // ===============================
  // ניהול אירועים (Events)
  // ===============================

  /**
   * יוצר אירוע חדש עבור מארגן ספציפי
   */
  static async createEvent(organizerId: string, eventDetails: EventDetails): Promise<string> {
    console.group('📅 FirebaseService.createEvent');
    console.log('📥 Input parameters:', { organizerId, eventDetails });
    
    try {
      // קבלת שם המארגן
      const organizerSnapshot = await get(ref(database, `users/${organizerId}/name`));
      const organizerName = organizerSnapshot.val() || 'מארגן';
      console.log('👤 Organizer name:', organizerName);

      // יצירת אירוע חדש באוסף הגלובלי
      const newEventRef = push(ref(database, 'events'));
      const newEventId = newEventRef.key!;
      console.log('🆔 Generated event ID:', newEventId);

      const fullEventData: Omit<ShishiEvent, 'id'> = {
        organizerId,
        organizerName,
        createdAt: Date.now(),
        details: eventDetails,
        menuItems: {},
        assignments: {},
        participants: {}
      };

      console.log('📋 Event data to save:', fullEventData);
      console.log('🔗 Firebase path:', `events/${newEventId}`);

      await set(newEventRef, fullEventData);
      console.log('✅ Event created successfully!');
      console.groupEnd();
      
      return newEventId;
    } catch (error) {
      console.error('❌ Error in createEvent:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מחזיר את כל האירועים של מארגן ספציפי
   */
  static async getEventsByOrganizer(organizerId: string): Promise<ShishiEvent[]> {
    try {
      const eventsRef = ref(database, 'events');
      const q = query(eventsRef, orderByChild('organizerId'), equalTo(organizerId));
      const snapshot = await get(q);
      
      if (snapshot.exists()) {
        const eventsData = snapshot.val();
        
        return Object.entries(eventsData)
          .map(([id, event]) => ({
            id,
            ...(event as Omit<ShishiEvent, 'id'>)
          }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * מאזין לשינויים באירוע ספציפי
   */
  static subscribeToEvent(
    eventId: string, 
    callback: (eventData: ShishiEvent | null) => void
  ): () => void {
    console.group('📖 FirebaseService.subscribeToEvent');
    console.log('📥 Input parameters:', { eventId });
    console.log('🔗 Event path:', `events/${eventId}`);
    
    const eventRef = ref(database, `events/${eventId}`);
    
    const onValueChange = async (snapshot: any) => {
      console.log('📡 Received data update for event:', eventId);
      
      if (snapshot.exists()) {
        // וידוא מבנה תקין לפני החזרת הנתונים
        await this.ensureEventStructure(eventId);
        
        const eventData = snapshot.val();
        console.log('📋 Current event data:', eventData);
        
        const fullEvent: ShishiEvent = {
          id: eventId,
          ...eventData
        };
        
        console.log('✅ Calling callback with event data');
        callback(fullEvent);
      } else {
        console.log('❌ Event not found');
        callback(null);
      }
    };

    console.log('🎧 Setting up listener...');
    onValue(eventRef, onValueChange, (error) => {
      console.error(`❌ Error subscribing to event ${eventId}:`, error);
      callback(null);
    });

    console.log('✅ Listener set up successfully');
    console.groupEnd();

    return () => {
      console.log('🔇 Unsubscribing from event:', eventId);
      off(eventRef, 'value', onValueChange);
    };
  }

  /**
   * מוחק אירוע ספציפי
   */
  static async deleteEvent(eventId: string): Promise<void> {
    console.group('🗑️ FirebaseService.deleteEvent');
    console.log('📥 Input parameters:', { eventId });
    
    try {
      await remove(ref(database, `events/${eventId}`));
      console.log('✅ Event deleted successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in deleteEvent:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מעדכן פרטי אירוע
   */
  static async updateEventDetails(eventId: string, updates: Partial<EventDetails>): Promise<void> {
    console.group('📝 FirebaseService.updateEventDetails');
    console.log('📥 Input parameters:', { eventId, updates });
    
    try {
      const detailsRef = ref(database, `events/${eventId}/details`);
      await update(detailsRef, updates);
      console.log('✅ Event details updated successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in updateEventDetails:', error);
      console.groupEnd();
      throw error;
    }
  }

  // ===============================
  // ניהול פריטי תפריט (Menu Items)
  // ===============================

  /**
   * מוסיף פריט חדש לתפריט
   */
  static async addMenuItem(
    eventId: string, 
    itemData: Omit<MenuItem, 'id'>
  ): Promise<string> {
    console.group('🍽️ FirebaseService.addMenuItem');
    console.log('📥 Input parameters:', { eventId, itemData });
    console.log('🔗 Event path:', `events/${eventId}`);
    
    try {
      console.log('🔧 Ensuring event structure...');
      await this.ensureEventStructure(eventId);
      console.log('✅ Event structure ensured');
      
      console.log('📝 Creating new item reference...');
      const newItemRef = push(ref(database, `events/${eventId}/menuItems`));
      const newItemId = newItemRef.key!;
      console.log('🆔 Generated item ID:', newItemId);
      
      // נקה ערכי undefined לפני השמירה
      const finalItemData = {
        ...itemData,
        id: newItemId,
        notes: itemData.notes || null // המר undefined ל-null או הסר לגמרי
      };
      
      // הסר שדות עם ערכי null/undefined
      Object.keys(finalItemData).forEach(key => {
        if (finalItemData[key as keyof typeof finalItemData] === undefined) {
          delete finalItemData[key as keyof typeof finalItemData];
        }
      });
      
      console.log('📋 Final item data to save:', finalItemData);
      console.log('💾 Saving to Firebase...');
      
      await set(newItemRef, finalItemData);
      console.log('✅ Menu item saved successfully!');
      console.groupEnd();
      
      return newItemId;
    } catch (error) {
      console.error('❌ Error in addMenuItem:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מוסיף פריט חדש ומשבץ אותו למשתמש (אופציונלי)
   */
  static async addMenuItemAndAssign(
    eventId: string,
    itemData: Omit<MenuItem, 'id'>,
    assignToUserId: string | null,
    assignToUserName: string
  ): Promise<string> {
    console.group('🍽️➕👤 FirebaseService.addMenuItemAndAssign');
    console.log('📥 Input parameters:', { eventId, itemData, assignToUserId, assignToUserName });
    console.log('🔗 Event path:', `events/${eventId}`);
    
    try {
      console.log('🔧 Ensuring event structure...');
      await this.ensureEventStructure(eventId);
      console.log('✅ Event structure ensured');
      
      console.log('📝 Creating new item reference...');
      const newItemRef = push(ref(database, `events/${eventId}/menuItems`));
      const newItemId = newItemRef.key!;
      console.log('🆔 Generated item ID:', newItemId);
      
      const updates: { [key: string]: any } = {};
      
      // הוספת הפריט
      const finalItemData: any = {
        ...itemData,
        id: newItemId
      };
      
      // נקה ערכי undefined
      if (!finalItemData.notes) {
        delete finalItemData.notes;
      }

      // אם יש שיבוץ, הוסף את פרטי השיבוץ לפריט
      if (assignToUserId) {
        console.log('👤 Adding assignment data to item...');
        finalItemData.assignedTo = assignToUserId;
        finalItemData.assignedToName = assignToUserName;
        finalItemData.assignedAt = Date.now();

        // יצירת שיבוץ נפרד
        console.log('📋 Creating separate assignment...');
        const newAssignmentRef = push(ref(database, `events/${eventId}/assignments`));
        const assignmentData: Omit<Assignment, 'id'> = {
          menuItemId: newItemId,
          userId: assignToUserId,
          userName: assignToUserName,
          quantity: itemData.quantity,
          notes: itemData.notes || '',
          status: 'confirmed',
          assignedAt: Date.now()
        };
        
        console.log('📋 Assignment data:', assignmentData);
        updates[`events/${eventId}/assignments/${newAssignmentRef.key}`] = assignmentData;
      }
      
      updates[`events/${eventId}/menuItems/${newItemId}`] = finalItemData;
      
      console.log('💾 Updates to apply:', updates);
      console.log('🚀 Applying updates to Firebase...');
      await update(ref(database), updates);
      console.log('✅ Menu item and assignment saved successfully!');
      console.groupEnd();
      
      return newItemId;
    } catch (error) {
      console.error('❌ Error in addMenuItemAndAssign:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מעדכן פריט תפריט
   */
  static async updateMenuItem(
    eventId: string,
    itemId: string,
    updates: Partial<MenuItem>
  ): Promise<void> {
    console.group('📝 FirebaseService.updateMenuItem');
    console.log('📥 Input parameters:', { eventId, itemId, updates });
    
    try {
      const itemRef = ref(database, `events/${eventId}/menuItems/${itemId}`);
      await update(itemRef, updates);
      console.log('✅ Menu item updated successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in updateMenuItem:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מוחק פריט תפריט
   */
  static async deleteMenuItem(eventId: string, itemId: string): Promise<void> {
    console.group('🗑️ FirebaseService.deleteMenuItem');
    console.log('📥 Input parameters:', { eventId, itemId });
    
    try {
      const updates: { [key: string]: null } = {};
      
      // מחיקת הפריט
      updates[`events/${eventId}/menuItems/${itemId}`] = null;
      
      // מחיקת כל השיבוצים הקשורים לפריט
      const assignmentsRef = ref(database, `events/${eventId}/assignments`);
      const q = query(assignmentsRef, orderByChild('menuItemId'), equalTo(itemId));
      const assignmentsSnapshot = await get(q);

      if (assignmentsSnapshot.exists()) {
        const assignments = assignmentsSnapshot.val();
        Object.keys(assignments).forEach(assignmentId => {
          updates[`events/${eventId}/assignments/${assignmentId}`] = null;
        });
      }
      
      await update(ref(database), updates);
      console.log('✅ Menu item and related assignments deleted successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in deleteMenuItem:', error);
      console.groupEnd();
      throw error;
    }
  }

  // ===============================
  // ניהול משתתפים (Participants)
  // ===============================

  /**
   * מצרף משתתף לאירוע
   */
  static async joinEvent(
    eventId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    console.group('👥 FirebaseService.joinEvent');
    console.log('📥 Input parameters:', { eventId, userId, userName });
    
    try {
      await this.ensureEventStructure(eventId);
      
      const participantRef = ref(database, `events/${eventId}/participants/${userId}`);
      const participantData = {
        name: userName,
        joinedAt: Date.now()
      };
      
      console.log('👤 Participant data:', participantData);
      console.log('💾 Saving participant to Firebase...');
      
      await set(participantRef, participantData);
      console.log('✅ Participant joined successfully!');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in joinEvent:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מסיר משתתף מהאירוע
   */
  static async leaveEvent(eventId: string, userId: string): Promise<void> {
    console.group('👋 FirebaseService.leaveEvent');
    console.log('📥 Input parameters:', { eventId, userId });
    
    try {
      const participantRef = ref(database, `events/${eventId}/participants/${userId}`);
      await remove(participantRef);
      console.log('✅ Participant left successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in leaveEvent:', error);
      console.groupEnd();
      throw error;
    }
  }

  // ===============================
  // ניהול שיבוצים (Assignments)
  // ===============================

  /**
   * יוצר שיבוץ חדש
   */
  static async createAssignment(
    eventId: string,
    assignmentData: Omit<Assignment, 'id'>
  ): Promise<string> {
    console.group('📋 FirebaseService.createAssignment');
    console.log('📥 Input parameters:', { eventId, assignmentData });
    
    try {
      await this.ensureEventStructure(eventId);
      
      // בדיקה שהפריט לא כבר משובץ
      const menuItemRef = ref(database, `events/${eventId}/menuItems/${assignmentData.menuItemId}`);
      const snapshot = await get(menuItemRef);
      
      if (snapshot.val()?.assignedTo) {
        throw new Error('מצטערים, מישהו אחר כבר הספיק לשבץ את הפריט הזה');
      }
      
      const newAssignmentRef = push(ref(database, `events/${eventId}/assignments`));
      const updates: { [key: string]: any } = {};
      
      // הוספת השיבוץ
      updates[`events/${eventId}/assignments/${newAssignmentRef.key}`] = assignmentData;
      
      // עדכון הפריט כמשובץ
      updates[`events/${eventId}/menuItems/${assignmentData.menuItemId}/assignedTo`] = assignmentData.userId;
      updates[`events/${eventId}/menuItems/${assignmentData.menuItemId}/assignedToName`] = assignmentData.userName;
      updates[`events/${eventId}/menuItems/${assignmentData.menuItemId}/assignedAt`] = Date.now();
      
      await update(ref(database), updates);
      console.log('✅ Assignment created successfully');
      console.groupEnd();
      
      return newAssignmentRef.key!;
    } catch (error) {
      console.error('❌ Error in createAssignment:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מעדכן שיבוץ קיים
   */
  static async updateAssignment(
    eventId: string,
    assignmentId: string,
    updates: { quantity: number; notes?: string }
  ): Promise<void> {
    console.group('📝 FirebaseService.updateAssignment');
    console.log('📥 Input parameters:', { eventId, assignmentId, updates });
    
    try {
      const assignmentRef = ref(database, `events/${eventId}/assignments/${assignmentId}`);
      await update(assignmentRef, {
        ...updates,
        updatedAt: Date.now()
      });
      console.log('✅ Assignment updated successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in updateAssignment:', error);
      console.groupEnd();
      throw error;
    }
  }

  /**
   * מבטל שיבוץ
   */
  static async cancelAssignment(
    eventId: string,
    assignmentId: string,
    menuItemId: string
  ): Promise<void> {
    console.group('❌ FirebaseService.cancelAssignment');
    console.log('📥 Input parameters:', { eventId, assignmentId, menuItemId });
    
    try {
      const updates: { [key: string]: null | number } = {};
      
      // מחיקת השיבוץ
      updates[`events/${eventId}/assignments/${assignmentId}`] = null;
      
      // הסרת השיבוץ מהפריט
      updates[`events/${eventId}/menuItems/${menuItemId}/assignedTo`] = null;
      updates[`events/${eventId}/menuItems/${menuItemId}/assignedToName`] = null;
      updates[`events/${eventId}/menuItems/${menuItemId}/assignedAt`] = null;
      
      await update(ref(database), updates);
      console.log('✅ Assignment cancelled successfully');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Error in cancelAssignment:', error);
      console.groupEnd();
      throw error;
    }
  }

  // ===================================
  // ניהול רשימות מוכנות (Preset Lists)
  // ===================================

  /**
   * מאזין לשינויים באוסף הרשימות המוכנות
   */
  static subscribeToPresetLists(
    callback: (lists: PresetList[]) => void
  ): () => void {
    const listsRef = ref(database, 'presetLists');
    const onValueChange = (snapshot: any) => {
      if (snapshot.exists()) {
        const listsData = snapshot.val();
        const listsArray: PresetList[] = Object.entries(listsData).map(([id, list]) => ({
          id,
          ...(list as Omit<PresetList, 'id'>)
        }));
        callback(listsArray);
      } else {
        callback([]);
      }
    };

    onValue(listsRef, onValueChange, (error) => {
      console.error('Error subscribing to preset lists:', error);
      callback([]);
    });

    return () => off(listsRef, 'value', onValueChange);
  }

  /**
   * יוצר רשימה מוכנה חדשה
   */
  static async createPresetList(listData: Omit<PresetList, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      toast.error('אין הרשאה ליצור רשימה');
      return null;
    }
    
    try {
      const newListRef = push(ref(database, 'presetLists'));
      const fullListData = {
        ...listData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: user.uid
      };
      await set(newListRef, fullListData);
      return newListRef.key;
    } catch (error) {
      console.error('Error creating preset list:', error);
      throw error;
    }
  }

  /**
   * מעדכן רשימה מוכנה קיימת
   */
  static async updatePresetList(listId: string, updates: Partial<PresetList>): Promise<boolean> {
    try {
      const listRef = ref(database, `presetLists/${listId}`);
      await update(listRef, { ...updates, updatedAt: Date.now() });
      return true;
    } catch (error) {
      console.error('Error updating preset list:', error);
      return false;
    }
  }

  /**
   * מוחק רשימה מוכנה
   */
  static async deletePresetList(listId: string): Promise<void> {
    try {
      await remove(ref(database, `presetLists/${listId}`));
    } catch (error) {
      console.error('Error deleting preset list:', error);
      throw error;
    }
  }

  // ===============================
  // פונקציות תחזוקה ואבחון
  // ===============================

  /**
   * מוודא עקביות נתונים באירוע
   */
  static async validateEventData(eventId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    console.group('🔍 FirebaseService.validateEventData');
    console.log('📥 Input parameters:', { eventId });
    
    const issues: string[] = [];
    
    try {
      const eventSnapshot = await get(ref(database, `events/${eventId}`));
      
      if (!eventSnapshot.exists()) {
        console.log('❌ Event does not exist');
        console.groupEnd();
        return { isValid: false, issues: ['האירוע לא קיים'] };
      }
      
      const eventData = eventSnapshot.val();
      
      // בדיקת מבנה בסיסי
      if (!eventData.details) issues.push('חסרים פרטי האירוע');
      if (!eventData.organizerId) issues.push('חסר מזהה מארגן');
      if (!eventData.organizerName) issues.push('חסר שם מארגן');
      
      // בדיקת עקביות שיבוצים
      const menuItems = eventData.menuItems || {};
      const assignments = eventData.assignments || {};
      
      Object.entries(assignments).forEach(([assignmentId, assignment]: [string, any]) => {
        const menuItem = menuItems[assignment.menuItemId];
        if (!menuItem) {
          issues.push(`שיבוץ ${assignmentId} מצביע על פריט שלא קיים: ${assignment.menuItemId}`);
        } else if (menuItem.assignedTo !== assignment.userId) {
          issues.push(`אי-עקביות בשיבוץ ${assignmentId}: המשתמש בפריט (${menuItem.assignedTo}) שונה מהמשתמש בשיבוץ (${assignment.userId})`);
        }
      });

      Object.entries(menuItems).forEach(([menuItemId, menuItem]: [string, any]) => {
        if(menuItem.assignedTo) {
          const assignmentExists = Object.values(assignments).some((a: any) => a.menuItemId === menuItemId && a.userId === menuItem.assignedTo);
          if (!assignmentExists) {
            issues.push(`פריט ${menuItemId} משובץ למשתמש ${menuItem.assignedToName} אך אין שיבוץ תואם`);
          }
        }
      });
      
      const isValid = issues.length === 0;
      console.log('🔍 Validation result:', { isValid, issues });
      console.groupEnd();
      
      return { isValid, issues };
    } catch (error) {
      console.error('❌ Error validating event data:', error);
      console.groupEnd();
      return { isValid: false, issues: ['שגיאה בבדיקת הנתונים'] };
    }
  }
}