// src/components/Events/UserMenuItemForm.tsx

import React, { useState, useEffect } from 'react';
import { X, ChefHat, Hash, MessageSquare, User as UserIcon, AlertCircle, Package } from 'lucide-react';
import { useStore, selectMenuItems } from '../../store/useStore';
import { FirebaseService } from '../../services/firebaseService';
import { ShishiEvent, MenuItem, MenuCategory } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface UserMenuItemFormProps {
  event: ShishiEvent;
  onClose: () => void;
  category?: MenuCategory;
  availableCategories?: string[];
}

interface FormErrors {
  name?: string;
  quantityRequired?: string; // Corrected from 'quantity'
}

export function UserMenuItemForm({ event, onClose, category, availableCategories }: UserMenuItemFormProps) {
  
  const { user: authUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [participantName, setParticipantName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: category || ('main' as MenuCategory),
    quantityRequired: 1, // Changed from 'quantity'
    unitType: 'units' as 'units' | 'grams' | 'servings', // New field
    notes: '',
  });

  const categoryOptions = [
    { value: 'starter', label: 'מנה ראשונה' },
    { value: 'main', label: 'מנה עיקרית' },
    { value: 'dessert', label: 'קינוח' },
    { value: 'drink', label: 'שתייה' },
    { value: 'equipment', label: 'ציוד כללי' },
    { value: 'other', label: 'אחר' }
  ];

  const unitTypeOptions = [
    { value: 'units', label: 'יחידות' },
    { value: 'grams', label: 'גרמים' },
    { value: 'servings', label: 'מנות (סועדים)' },
  ];

  useEffect(() => {
    if (authUser?.isAnonymous) {
      const participants = event.participants || {};
      const isParticipant = !!participants[authUser.uid];
      if (!isParticipant) {
        setShowNameInput(true);
      }
    }
  }, [authUser, event.participants]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם הפריט הוא שדה חובה';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'שם הפריט חייב להכיל לפחות 2 תווים';
    }

    if (formData.quantityRequired < 1) {
      newErrors.quantityRequired = 'הכמות חייבת להיות לפחות 1';
    } else if (formData.quantityRequired > 10000) {
      newErrors.quantityRequired = 'הכמות לא יכולה להיות יותר מ-10,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allMenuItems = selectMenuItems(useStore.getState());

    if (!authUser) {
      toast.error('יש להתחבר כדי להוסיף פריט');
      return;
    }

    if (!validateForm()) {
      toast.error('יש לתקן את השגיאות בטופס');
      return;
    }

    const eventMenuItems = allMenuItems.filter(item => item.eventId === event.id);
    const isDuplicate = eventMenuItems.some(
        item => item.name.trim().toLowerCase() === formData.name.trim().toLowerCase()
    );

    if (isDuplicate) {
        if (!window.confirm(`פריט בשם "${formData.name.trim()}" כבר קיים באירוע. האם להוסיף אותו בכל זאת?`)) {
            return;
        }
    }

    if (showNameInput && !participantName.trim()) {
      toast.error('יש להזין שם כדי להוסיף פריט');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalUserName = participantName.trim();

      if (showNameInput && finalUserName) {
        await FirebaseService.joinEvent(event.id, authUser.uid, finalUserName);
      } else {
        const existingParticipant = event.participants?.[authUser.uid];
        finalUserName = existingParticipant?.name || authUser.displayName || 'אורח';
      }

      // **THE FIX IS HERE:** Creating the correct data object for the service
      const newItemData: Omit<MenuItem, 'id' | 'totalAssignedQuantity'> = {
        name: formData.name.trim(),
        category: formData.category,
        quantityRequired: formData.quantityRequired, // Use the correct field name
        unitType: formData.unitType, // Use the correct field name
        notes: formData.notes.trim() || undefined,
        isRequired: false,
        createdAt: Date.now(),
        creatorId: authUser.uid,
        creatorName: finalUserName,
        eventId: event.id,
      };

      await FirebaseService.addMenuItemAndAssign(
        event.id,
        newItemData,
        authUser.uid,
        finalUserName
      );

      toast.success('הפריט נוסף ושובץ בהצלחה!');
      onClose();
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast.error(error.message || 'שגיאה בהוספת הפריט');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">הוסף פריט משלך</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {showNameInput && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">שם מלא *</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={participantName} onChange={(e) => setParticipantName(e.target.value)} placeholder="השם שיוצג לכולם" className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" disabled={isSubmitting} required />
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">שם הפריט *</label>
            <div className="relative">
              <ChefHat className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="לדוגמה: עוגת גבינה" className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} disabled={isSubmitting} required />
            </div>
            {errors.name && (<p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 ml-1" />{errors.name}</p>)}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה *</label>
            <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value as MenuCategory)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" disabled={isSubmitting} required>
              {categoryOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">כמות שאביא *</label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="number" min="1" max="10000" value={formData.quantityRequired} onChange={(e) => handleInputChange('quantityRequired', parseInt(e.target.value) || 1)} className={`w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.quantityRequired ? 'border-red-500' : 'border-gray-300'}`} disabled={isSubmitting} required />
              </div>
              {errors.quantityRequired && (<p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 ml-1" />{errors.quantityRequired}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">יחידת מידה *</label>
              <div className="relative">
                <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select value={formData.unitType} onChange={(e) => handleInputChange('unitType', e.target.value)} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" disabled={isSubmitting} required>
                  {unitTypeOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">הערות (אופציונלי)</label>
            <div className="relative">
              <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <textarea value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="לדוגמה: כשר, ללא גלוטן, טבעוני..." rows={3} className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" disabled={isSubmitting} />
            </div>
          </div>

          <div className="flex space-x-3 rtl:space-x-reverse">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
              {isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>מוסיף...</>) : ('הוסף ושבץ אותי')}
            </button>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}