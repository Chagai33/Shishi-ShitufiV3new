// src/pages/EventPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, selectMenuItems, selectAssignments, selectParticipants } from '../store/useStore';
import { FirebaseService } from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { ShishiEvent, MenuItem as MenuItemType, Assignment as AssignmentType } from '../types';
import { Calendar, Clock, MapPin, ChefHat, User as UserIcon, AlertCircle, Edit, X, Search, ArrowRight, Trash2, MessageSquare, Hash, Plus } from 'lucide-react';
import { isEventFinished } from '../utils/dateUtils';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { UserMenuItemForm } from '../components/Events/UserMenuItemForm';



// Category names mapping
const categoryNames: { [key: string]: string } = {
    starter: 'מנה ראשונה',
    main: 'מנה עיקרית', 
    dessert: 'קינוחים',
    drink: 'משקאות',
    other: 'אחר'
};

// --- Component: CategorySelector ---
const CategorySelector: React.FC<{
  menuItems: MenuItemType[];
  assignments: AssignmentType[];
  onSelectCategory: (category: string) => void;
}> = ({ menuItems, assignments, onSelectCategory }) => {
  const categoryDetails: { [key: string]: { name: string; icon: string; color: string; glowClass: string } } = {
    starter: { name: 'מנות ראשונות', icon: '/Icons/2.gif', color: '#3498db', glowClass: 'glow-starter' },
    main: { name: 'מנות עיקריות', icon: '/Icons/1.gif', color: '#ff8a00', glowClass: 'glow-main' },
    dessert: { name: 'קינוחים', icon: '/Icons/3.gif', color: '#9b59b6', glowClass: 'glow-dessert' },
    drink: { name: 'משקאות', icon: '/Icons/4.gif', color: '#2ecc71', glowClass: 'glow-drink' },
    other: { name: 'אחר', icon: '/Icons/5.gif', color: '#95a5a6', glowClass: 'glow-other' },
  };
  const categoriesOrder = ['starter', 'main', 'dessert', 'drink', 'other'];

  const getCategoryProgress = (category: string) => {
    const itemsInCategory = menuItems.filter(item => item.category === category);
    const assignedItemsInCategory = itemsInCategory.filter(item => assignments.some(a => a.menuItemId === item.id));
    return { assigned: assignedItemsInCategory.length, total: itemsInCategory.length };
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">מה בא לך להביא לארוחה?</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesOrder.map(categoryKey => {
          const progress = getCategoryProgress(categoryKey);
          if (progress.total === 0) return null;
          const details = categoryDetails[categoryKey];
          const percentage = progress.total > 0 ? (progress.assigned / progress.total) * 100 : 0;
          return (
            <div key={categoryKey} onClick={() => onSelectCategory(categoryKey)} className="group relative category-card-2025 p-4 rounded-xl cursor-pointer text-center overflow-hidden">
              <div className={`aurora-glow ${details.glowClass}`}></div>
              <div className="relative z-10 flex flex-col items-center h-full">
                <img src={details.icon} alt={details.name} className="w-16 h-16 mx-auto mb-2 object-contain transition-transform duration-300 group-hover:scale-110" />
                <h3 className="text-lg font-bold text-neutral-800 mb-2">{details.name}</h3>
                <div className="flex-grow"></div>
                <div className="w-full mt-2">
                  <p className="text-center text-neutral-500 text-xs mb-2">{progress.assigned} / {progress.total} שובצו</p>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: details.color, 
                        transition: 'width 0.5s ease-in-out' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Component: MenuItemCard ---
const MenuItemCard: React.FC<{
    item: MenuItemType;
    assignment: AssignmentType | undefined;
    onAssign: () => void;
    onEdit: () => void;
    onCancel: () => void;
    isMyAssignment: boolean;
    isEventActive: boolean;
}> = ({ item, assignment, onAssign, onEdit, onCancel, isMyAssignment, isEventActive }) => {
    const assignedByOther = assignment && !isMyAssignment;

    const cardStyles = isMyAssignment
        ? 'bg-blue-50 border-info'
        : assignedByOther
        ? 'bg-green-50 border-success'
        : 'bg-white border-neutral-200';

    return (
        <div className={`border-2 flex flex-col rounded-xl ${cardStyles}`}>
            <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-neutral-800 text-base">{item.name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-current">{categoryNames[item.category]}</span>
                </div>
                <p className="text-sm text-neutral-500">כמות נדרשת: {item.quantity}</p>
                {item.creatorName && <p className="text-xs text-neutral-400 mt-1">נוצר ע"י: {item.creatorName}</p>}
                {item.notes && <p className="text-xs text-neutral-500 mt-2 italic">הערות: {item.notes}</p>}
            </div>
            <div className="border-t p-3">
                {assignment ? (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className={`font-semibold ${isMyAssignment ? 'text-info' : 'text-success'}`}>
                                {isMyAssignment ? 'השיבוץ שלי' : `שובץ ל: ${assignment.userName}`}
                            </span>
                            <span className="font-bold">{assignment.quantity}</span>
                        </div>
                        {assignment.notes && <p className="text-xs text-neutral-600 bg-neutral-100 p-2 rounded">הערה: {assignment.notes}</p>}
                        {isMyAssignment && isEventActive && (
                            <div className="flex space-x-2 rtl:space-x-reverse pt-2">
                                <button onClick={onEdit} className="flex-1 text-xs bg-neutral-200 hover:bg-neutral-300 py-1 rounded flex items-center justify-center">
                                  <Edit size={12} className="ml-1" /> ערוך
                                </button>
                                <button onClick={onCancel} className="flex-1 text-xs bg-red-100 text-error hover:bg-red-200 py-1 rounded flex items-center justify-center">
                                  <Trash2 size={12} className="ml-1" /> בטל שיבוץ
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    isEventActive ? (
                        <button onClick={onAssign} className="w-full bg-accent text-white py-2 text-sm rounded-lg hover:bg-accent/90 font-semibold transition-colors">שבץ אותי</button>
                    ) : (
                        <p className="text-sm text-center text-neutral-500">האירוע אינו פעיל</p>
                    )
                )}
            </div>
        </div>
    );
};

// --- Component: AssignmentModal ---
const AssignmentModal: React.FC<{ 
  item: MenuItemType; 
  eventId: string; 
  user: FirebaseUser; 
  onClose: () => void; 
  isEdit?: boolean; 
  existingAssignment?: AssignmentType; 
}> = ({ item, eventId, user, onClose, isEdit = false, existingAssignment }) => {
    const [quantity, setQuantity] = useState(existingAssignment?.quantity || item.quantity);
    const [notes, setNotes] = useState(existingAssignment?.notes || '');
    const [isLoading, setIsLoading] = useState(false);
    const [participantName, setParticipantName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('');
    const [useNewName, setUseNewName] = useState(false);
    
    useEffect(() => {
        const currentEvent = useStore.getState().currentEvent;
        const existingParticipant = currentEvent?.participants?.[user.uid];
        
        if (existingParticipant) {
            setCurrentUserName(existingParticipant.name);
            setShowNameInput(false);
        } else if (user.isAnonymous) {
            setShowNameInput(true);
        } else {
            setCurrentUserName(user.displayName || 'משתמש');
            setShowNameInput(false);
        }
    }, [user.uid, user.isAnonymous]);

    const handleSubmit = async () => {
        if (showNameInput && !participantName.trim()) { 
            toast.error("כדי להשתבץ, יש להזין שם מלא."); 
            return; 
        }
        if (useNewName && !participantName.trim()) {
            toast.error("יש להזין שם חדש.");
            return;
        }
        if (quantity <= 0) { toast.error("הכמות חייבת להיות גדולה מ-0."); return; }
        
        setIsLoading(true);
        try {
            let finalUserName = '';
            
            if (useNewName && participantName.trim()) {
                finalUserName = participantName.trim();
                await FirebaseService.joinEvent(eventId, user.uid, finalUserName);
            } else if (showNameInput && participantName.trim()) {
                finalUserName = participantName.trim();
                await FirebaseService.joinEvent(eventId, user.uid, finalUserName);
            } else {
                finalUserName = currentUserName;
            }
            
            if (isEdit && existingAssignment) {
                await FirebaseService.updateAssignment(eventId, existingAssignment.id, { quantity, notes: notes.trim() });
                toast.success("השיבוץ עודכן בהצלחה!");
            } else {
                await FirebaseService.createAssignment(eventId, {
                    menuItemId: item.id, userId: user.uid, userName: finalUserName,
                    quantity, notes: notes.trim(), status: 'confirmed', assignedAt: Date.now(),
                });
                toast.success(`שובצת בהצלחה לפריט: ${item.name}`);
            }
            onClose();
        } catch (error: any) { toast.error(error.message || "אירעה שגיאה."); } 
        finally { setIsLoading(false); }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b"><h2 className="text-lg font-semibold text-neutral-900">{isEdit ? 'עריכת שיבוץ' : 'שיבוץ פריט'}</h2><button onClick={onClose} className="text-neutral-500 hover:text-neutral-700"><X size={24} /></button></div>
                <div className="p-6">
                    <div className="bg-accent/10 p-4 rounded-lg mb-6 text-center"><p className="font-bold text-accent">{item.name}</p><p className="text-sm text-accent/80">כמות מוצעת: {item.quantity}</p></div>
                    <div className="space-y-4">
                        {currentUserName && !showNameInput && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">תירשם בשם:</p>
                                        <p className="text-blue-700 font-semibold">{currentUserName}</p>
                                    </div>
                                    <button
                                        onClick={() => setUseNewName(true)}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                                    >
                                        שנה שם
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {(showNameInput || useNewName) && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    {useNewName ? 'שם חדש*' : 'שם מלא*'}
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                    <input 
                                        type="text" 
                                        value={participantName} 
                                        onChange={e => setParticipantName(e.target.value)} 
                                        placeholder={useNewName ? "השם החדש שיוצג" : "השם שיוצג לכולם"} 
                                        className="w-full p-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" 
                                    />
                                </div>
                                {useNewName && (
                                    <div className="flex space-x-2 rtl:space-x-reverse mt-2">
                                        <button
                                            onClick={() => {
                                                setUseNewName(false);
                                                setParticipantName('');
                                            }}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                        >
                                            ביטול
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">כמות שאביא*</label>
                            <div className="relative">
                                <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)} 
                                    className="w-full p-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" 
                                    min="1" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">הערות (אופציונלי)</label>
                            <div className="relative">
                                <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-neutral-400" />
                                <textarea 
                                    value={notes} 
                                    onChange={e => setNotes(e.target.value)} 
                                    className="w-full p-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" 
                                    rows={3} 
                                    placeholder="לדוגמה: ללא גלוטן, טבעוני..." 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-neutral-50 px-6 py-4 flex justify-end space-x-3 rtl:space-x-reverse rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-200 text-neutral-800 hover:bg-neutral-300 font-medium">ביטול</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:bg-neutral-300 font-medium">{isLoading ? 'מעדכן...' : isEdit ? 'שמור שינויים' : 'אשר שיבוץ'}</button>
                </div>
            </div>
        </div>
    );
};

const NameModal: React.FC<{ onSave: (name: string) => void, isLoading: boolean, onClose: () => void }> = ({ onSave, isLoading, onClose }) => {
    const [name, setName] = useState('');
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">ברוכים הבאים!</h2>
                    <p className="text-neutral-600 mb-4">כדי להשתתף באירוע, אנא הזן את שמך.</p>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="השם שלך" className="w-full p-2 border border-neutral-300 rounded-lg mb-4 focus:ring-2 focus:ring-accent focus:border-transparent" />
                    <div className="flex space-x-3 rtl:space-x-reverse mt-6">
                        <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50">
                            ביטול
                        </button>
                        <button onClick={() => onSave(name)} disabled={!name.trim() || isLoading} className="flex-1 bg-accent text-white py-2 rounded-lg hover:bg-accent/90 disabled:bg-neutral-300">
                            {isLoading ? 'שומר...' : 'הצטרף לאירוע'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const EventPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [localUser, setLocalUser] = useState<FirebaseUser | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [isEventLoading, setIsEventLoading] = useState(true);
    
    const { currentEvent, setCurrentEvent, clearCurrentEvent, isLoading } = useStore();
    const menuItems = useStore(selectMenuItems);
    const assignments = useStore(selectAssignments);
    const participants = useStore(selectParticipants);
    const userCreatedItemsCount = useMemo(() => {
        if (!localUser) return 0;
        return menuItems.filter(item => item.creatorId === localUser.uid).length;
    }, [menuItems, localUser]);

    const MAX_USER_ITEMS = 3;
    const canAddMoreItems = userCreatedItemsCount < MAX_USER_ITEMS;

    const [modalState, setModalState] = useState<{ type: 'assign' | 'edit' | 'add-user-item'; item?: MenuItemType; assignment?: AssignmentType } | null>(null);
    const [itemToAssignAfterJoin, setItemToAssignAfterJoin] = useState<MenuItemType | null>(null);
    const [showNameModal, setShowNameModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'categories' | 'items'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) setLocalUser(user);
            else signInAnonymously(auth).catch(err => console.error("Anonymous sign-in failed:", err));
        });
        if (!eventId) return;

        setIsEventLoading(true);
        const unsubEvent = FirebaseService.subscribeToEvent(eventId, (eventData) => {
            setCurrentEvent(eventData);
            setIsEventLoading(false);
        });

        return () => { 
            unsubAuth(); 
            unsubEvent(); 
            clearCurrentEvent(); 
        };
    }, [eventId, setCurrentEvent, clearCurrentEvent]);

    const handleJoinEvent = useCallback(async (name: string) => {
        if (!eventId || !localUser || !name.trim()) return;
        setIsJoining(true);
        try {
            await FirebaseService.joinEvent(eventId, localUser.uid, name.trim());
            toast.success(`ברוך הבא, ${name.trim()}!`);
            setShowNameModal(false);
            if (itemToAssignAfterJoin) {
                setModalState({ type: 'assign', item: itemToAssignAfterJoin });
                setItemToAssignAfterJoin(null);
            }
        } catch (error) { toast.error("שגיאה בהצטרפות לאירוע."); } finally { setIsJoining(false); }
    }, [eventId, localUser, itemToAssignAfterJoin]);
    
    const handleAssignClick = (item: MenuItemType) => {
        if (!localUser) return;
        const isParticipant = participants.some(p => p.id === localUser.uid);
        if (localUser.isAnonymous && !isParticipant) {
            setItemToAssignAfterJoin(item);
            setShowNameModal(true);
        } else {
            setModalState({ type: 'assign', item });
        }
    };
    
    const handleCancelClick = async (assignment: AssignmentType) => {
    if (!eventId || !localUser) return;

    const item = menuItems.find(i => i.id === assignment.menuItemId);
    if (!item) {
        toast.error("הפריט לא נמצא");
        return;
    }

    const isCreator = item.creatorId === localUser.uid;

    if (isCreator) {
        // המשתמש הוא גם היוצר וגם המשבץ - מוחקים את הפריט
        if (window.confirm("פעולה זו תמחק גם את הפריט וגם את השיבוץ")) {
            try {
                await FirebaseService.deleteMenuItem(eventId, item.id);
                toast.success("הפריט והשיבוץ נמחקו");
            } catch (error) {
                toast.error("שגיאה במחיקת הפריט");
            }
        }
    } else {
        // המשתמש רק משובץ - מבטלים רק את השיבוץ
        if (window.confirm("האם לבטל את השיבוץ?")) {
            try {
                await FirebaseService.cancelAssignment(eventId, assignment.id, assignment.menuItemId);
                toast.success("השיבוץ בוטל");
            } catch (error) {
                toast.error("שגיאה בביטול השיבוץ");
            }
        }
    }
};
    
    const handleEditClick = (item: MenuItemType, assignment: AssignmentType) => setModalState({ type: 'edit', item, assignment });
    const handleBackToCategories = () => { setView('categories'); setSelectedCategory(null); setSearchTerm(''); };
    const handleCategoryClick = (category: string) => { setSelectedCategory(category); setView('items'); };
    
    const handleMyAssignmentsClick = () => { 
        if (view === 'items' && selectedCategory === 'my-assignments') {
            setView('categories');
            setSelectedCategory(null);
            setSearchTerm('');
        } else {
            setSelectedCategory('my-assignments');
            setView('items');
        }
    };
    
    const itemsToDisplay = useMemo(() => {
        let baseItems = menuItems;
        if (searchTerm) {
            baseItems = baseItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedCategory === 'my-assignments' && localUser) {
            baseItems = baseItems.filter(item => assignments.some(a => a.menuItemId === item.id && a.userId === localUser.uid));
        } else if (selectedCategory) {
            baseItems = baseItems.filter(item => item.category === selectedCategory);
        }
        const assignedItems = baseItems.filter(item => assignments.some(a => a.menuItemId === item.id));
        const availableItems = baseItems.filter(item => !assignments.some(a => a.menuItemId === item.id));
        return [...availableItems, ...assignedItems];
    }, [searchTerm, selectedCategory, localUser, menuItems, assignments]);

    if (isLoading || isEventLoading) {
        return <LoadingSpinner />;
    }

    if (!currentEvent) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
          <AlertCircle size={64} className="text-error" />
          <h1 className="mt-6 text-4xl font-bold text-neutral-800">אופס!</h1>
          <p className="mt-2 text-lg text-neutral-600">נראה שהאירוע שחיפשת לא קיים.</p>
          <Link
            to="/"
            className="mt-8 inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            חזור לדף הראשי
          </Link>
        </div>
      );
    }
    
    const participantName = participants.find(p => p.id === localUser?.uid)?.name || 'אורח';
    const isEventActive = currentEvent.details.isActive && !isEventFinished(currentEvent.details.date, currentEvent.details.time);

    if (!isEventActive) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
          <AlertCircle size={64} className="text-info" />
          <h1 className="mt-6 text-4xl font-bold text-neutral-800">האירוע אינו פעיל</h1>
          <p className="mt-2 text-lg text-neutral-600">לא ניתן לשבץ פריטים חדשים.</p>
          <Link
            to="/"
            className="mt-8 inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            חזור לדף הראשי
          </Link>
        </div>
      );
    }
    
    return (
        <div className="min-h-screen bg-background">
            <header className="bg-white shadow-sm p-3 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-lg text-accent">שישי שיתופי</h1>
                        <p className="text-xs text-neutral-500">ניהול ארוחות משותפות</p>
                    </div>
                    <div className="text-left">
                        <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                           {localUser && !localUser.isAnonymous ? (
                                <Link to="/dashboard" className="text-sm font-medium text-accent hover:underline">
                                    {participantName}
                                </Link>
                           ) : (
                                <a href="/login" className="text-sm font-medium text-accent hover:underline">
                                    {participantName}
                                </a>
                           )}
                           <UserIcon size={16} className="text-neutral-500"/>
                        </div>
                        <a 
                            href="https://www.linkedin.com/in/chagai-yechiel/"  
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            פותח על ידי חגי יחיאל
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-4 px-4">
                <div className="bg-white rounded-xl shadow-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-3">
                        <h1 className="text-xl font-bold text-neutral-900">{currentEvent.details.title}</h1>
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">
                            {assignments.length}/{menuItems.length} שובצו
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                        <p className="flex items-center"><Calendar size={14} className="ml-1.5 flex-shrink-0" /> {new Date(currentEvent.details.date).toLocaleDateString('he-IL')}</p>
                        <p className="flex items-center"><Clock size={14} className="ml-1.5 flex-shrink-0" /> {currentEvent.details.time}</p>
                        <p className="flex items-center"><MapPin size={14} className="ml-1.5 flex-shrink-0" /> {currentEvent.details.location}</p>
                        <p className="flex items-center"><UserIcon size={14} className="ml-1.5 flex-shrink-0" /> מארגן: {currentEvent.organizerName}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-3 mb-6">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className="flex-grow relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => { setSearchTerm(e.target.value); setView('items'); setSelectedCategory(null); }} 
                                placeholder="חפש פריט..." 
                                className="w-full pr-9 pl-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-1 focus:ring-accent focus:border-transparent text-sm" 
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')} 
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label="נקה חיפוש"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button onClick={handleMyAssignmentsClick} className={`px-3 py-1.5 text-sm font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap ${selectedCategory === 'my-assignments' ? 'bg-accent text-white' : 'bg-primary text-white hover:bg-primary/90'}`}>
                            השיבוצים שלי
                        </button>
                    </div>
                </div>

                {view === 'categories' ? (
    <>
        <CategorySelector menuItems={menuItems} assignments={assignments} onSelectCategory={handleCategoryClick} />
        <div className="max-w-4xl mx-auto px-4 mt-8">
            <div className="flex justify-center">
                <button
  onClick={() => {
    if (canAddMoreItems) {
      setModalState({ type: 'add-user-item', item: undefined, assignment: undefined });
    } else {
      toast.error(`הגעת למכסת ${MAX_USER_ITEMS} הפריטים שניתן להוסיף.`);
    }
  }}
  title={canAddMoreItems ? "הוסף פריט חדש לארוחה" : `הגעת למכסת ${MAX_USER_ITEMS} הפריטים`}
  className="bg-success text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors font-semibold text-sm flex items-center"
>
  <Plus size={22} className="inline-block ml-2" />
  הוסף פריט משלך ({userCreatedItemsCount}/{MAX_USER_ITEMS})
</button>
            </div>
        </div>
    </>
) : (
    <div>
        <button onClick={handleBackToCategories} className="flex items-center text-sm font-semibold text-accent hover:underline mb-4"><ArrowRight size={16} className="ml-1" />חזור לקטגוריות</button>
        <div className="flex items-center justify-between mb-4">
  <div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-bold text-neutral-800">
    {searchTerm ? 'תוצאות חיפוש' : selectedCategory === 'my-assignments' ? 'השיבוצים שלי' : categoryNames[selectedCategory!]}
  </h2>
  
</div>
  {/* --- השינוי --- */}
  {/* הכפתור בתוך הקטגוריה מקבל את העיצוב והטקסט של הכפתור החיצוני */}
  {selectedCategory && selectedCategory !== 'my-assignments' && (
    <button
      onClick={() => {
        if (canAddMoreItems) {
          setModalState({ type: 'add-user-item', category: selectedCategory as any });
        } else {
          toast.error(`הגעת למכסת ${MAX_USER_ITEMS} הפריטים שניתן להוסיף.`);
        }
      }}
      title={canAddMoreItems ? "הוסף פריט חדש לארוחה" : `הגעת למכסת ${MAX_USER_ITEMS} הפריטים שניתן להוסיף.`}
      className={`w-auto flex items-center justify-center text-white font-semibold py-1 px-2 rounded-lg shadow-lg transition-colors mt-4
        ${!canAddMoreItems 
          ? 'bg-neutral-400 cursor-not-allowed' 
          : 'bg-success hover:bg-success/90'
        }`}
    >
      הוסף פריט 
    </button>
  )}
</div>
        {itemsToDisplay.length > 0 ? (
            <div className="space-y-6">
                {(() => {
                    const availableItems = itemsToDisplay.filter(item => !assignments.some(a => a.menuItemId === item.id));
                    const assignedItems = itemsToDisplay.filter(item => assignments.some(a => a.menuItemId === item.id));
                    
                    return (
                        <>
                            {availableItems.length > 0 && (
                                <div>
                                    <h3 className="text-md font-semibold text-neutral-700 mb-3">פריטים פנויים</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {availableItems.map(item => {
                                            const assignment = assignments.find(a => a.menuItemId === item.id);
                                            return <MenuItemCard key={item.id} item={item} assignment={assignment} onAssign={() => handleAssignClick(item)} onEdit={() => handleEditClick(item, assignment!)} onCancel={() => handleCancelClick(assignment!)} isMyAssignment={localUser?.uid === assignment?.userId} isEventActive={isEventActive} />
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {assignedItems.length > 0 && (
                                <div className={availableItems.length > 0 ? 'pt-6 border-t' : ''}>
                                    <h3 className="text-md font-semibold text-neutral-700 mb-3">פריטים ששובצו</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {assignedItems.map(item => {
                                            const assignment = assignments.find(a => a.menuItemId === item.id);
                                            return <MenuItemCard key={item.id} item={item} assignment={assignment} onAssign={() => handleAssignClick(item)} onEdit={() => handleEditClick(item, assignment!)} onCancel={() => handleCancelClick(assignment!)} isMyAssignment={localUser?.uid === assignment?.userId} isEventActive={isEventActive} />
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
        ) : <p className="text-center text-neutral-500 py-8">לא נמצאו פריטים.</p>}
    </div>
)}
             </main>
             
            

            <div className="max-w-4xl mx-auto px-4 mt-8 mb-8">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                    <div className="flex justify-center mb-3">
                        <div className="bg-orange-100 rounded-full p-3">
                            <ChefHat className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">רוצה ליצור אירוע משלך?</h2>
                    <p className="text-gray-600 text-sm mb-4">זה לוקח דקה להירשם, וזה לגמרי בחינם.</p>
                    <Link
                        to="/login"
                        className="inline-block bg-orange-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-orange-600 transition-colors shadow hover:shadow-md text-sm"
                    >
                        הירשם עכשיו
                    </Link>
                </div>
            </div>

            {showNameModal && (<NameModal isLoading={isJoining} onSave={handleJoinEvent} onClose={() => setShowNameModal(false)} />)}


            {localUser && modalState?.type === 'assign' && modalState.item && (<AssignmentModal item={modalState.item} eventId={eventId!} user={localUser} onClose={() => setModalState(null)} />)}
            {localUser && modalState?.type === 'edit' && modalState.item && modalState.assignment && (<AssignmentModal item={modalState.item} eventId={eventId!} user={localUser} onClose={() => setModalState(null)} isEdit={true} existingAssignment={modalState.assignment} />)}
            {modalState?.type === 'add-user-item' && currentEvent && (
    <UserMenuItemForm
        event={currentEvent}
        onClose={() => setModalState(null)}
        category={modalState.category} // הוספנו את השורה הזו
    />
)}
        </div>
    );
};

export default EventPage;