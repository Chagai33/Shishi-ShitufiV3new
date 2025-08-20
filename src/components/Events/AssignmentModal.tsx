// src/components/Events/AssignmentModal.tsx

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { FirebaseService } from '../../services/firebaseService';
import { MenuItem, Assignment } from '../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { X, Hash, MessageSquare, User as UserIcon, Edit } from 'lucide-react';

// --- Updated Props interface ---
interface AssignmentModalProps {
  item: MenuItem;
  eventId: string;
  user: FirebaseUser;
  onClose: () => void;
  isEdit?: boolean;
  existingAssignment?: Assignment;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  item,
  eventId,
  user,
  onClose,
  isEdit = false,
  existingAssignment,
}) => {
  // --- New Logic and State ---
  const { assignments } = useStore();
  
  // Calculate remaining quantity
  const totalAssigned = item.totalAssignedQuantity || 0;
  const quantityInOtherAssignments = isEdit ? totalAssigned - (existingAssignment?.quantity || 0) : totalAssigned;
  const maxQuantityAllowed = item.quantityRequired - quantityInOtherAssignments;

  const [quantity, setQuantity] = useState(isEdit ? existingAssignment!.quantity : 1);
const [notes, setNotes] = useState(existingAssignment?.notes || item.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const unitTypeNames: { [key: string]: string } = {
    units: 'יחידות', grams: 'גרם', servings: 'מנות'
  };
  const unitLabel = unitTypeNames[item.unitType] || item.unitType;
  
  // Logic to determine if user needs to provide a name
  useEffect(() => {
    console.log('[AssignmentModal] useEffect for user name setup.');
    const currentEvent = useStore.getState().currentEvent;
    const existingParticipant = currentEvent?.participants?.[user.uid];
    
    if (existingParticipant) {
      console.log(`[AssignmentModal] Found existing participant: ${existingParticipant.name}`);
      setCurrentUserName(existingParticipant.name);
      setShowNameInput(false);
    } else if (user.isAnonymous) {
      console.log('[AssignmentModal] Anonymous user, showing name input.');
      setShowNameInput(true);
    } else {
      const name = user.displayName || 'אורח';
      console.log(`[AssignmentModal] Registered user, using name: ${name}`);
      setCurrentUserName(name);
      setShowNameInput(false);
    }
  }, [user.uid, user.isAnonymous, user.displayName]);

  // Main submission logic
  const handleSubmit = async () => {
    console.group('📋 [AssignmentModal] handleSubmit');
    
    // --- Validation ---
    if ((showNameInput || isEditingName) && !participantName.trim()) {
      toast.error("כדי להמשיך, יש להזין שם.");
      console.groupEnd();
      return;
    }
    if (quantity <= 0) {
      toast.error("הכמות חייבת להיות גדולה מ-0.");
      console.groupEnd();
      return;
    }
    if (quantity > maxQuantityAllowed) {
      toast.error(`הכמות המבוקשת חורגת מהכמות שנותרה (${maxQuantityAllowed} ${unitLabel}).`);
      console.groupEnd();
      return;
    }
    
    setIsLoading(true);
    try {
      let finalUserName = currentUserName;

      // Handle name update/creation
      const newName = isEditingName ? participantName.trim() : (showNameInput ? participantName.trim() : null);
      if (newName) {
        console.log(`[AssignmentModal] Joining/updating event with name: ${newName}`);
        await FirebaseService.joinEvent(eventId, user.uid, newName);
        finalUserName = newName;
      }
      
      console.log(`[AssignmentModal] Final user name for assignment: ${finalUserName}`);

      if (isEdit && existingAssignment) {
        // --- Edit Logic ---
        console.log('[AssignmentModal] Updating existing assignment...');
        await FirebaseService.updateAssignment(eventId, existingAssignment.id, {
          quantity,
          notes: notes.trim(),
          userName: finalUserName,
        });
        toast.success("השיבוץ עודכן בהצלחה!");
      } else {
        // --- Create Logic ---
        console.log('[AssignmentModal] Creating new assignment...');
        const assignmentData: Omit<Assignment, 'id' | 'eventId'> = {
          menuItemId: item.id,
          userId: user.uid,
          userName: finalUserName,
          quantity,
          notes: notes.trim(),
          status: 'confirmed',
          assignedAt: Date.now(),
        };
        await FirebaseService.createAssignment(eventId, assignmentData);
        toast.success(`שובצת בהצלחה ל- ${item.name}`);
      }
      onClose();
    } catch (error: any) {
      console.error("[AssignmentModal] Error during submission:", error);
      toast.error(error.message || "אירעה שגיאה.");
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">{isEdit ? 'עריכת שיבוץ' : 'שיבוץ פריט'}</h2>
          <button onClick={onClose} disabled={isLoading} className="text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="bg-accent/10 p-4 rounded-lg mb-6 text-center">
            <p className="font-bold text-accent">{item.name}</p>
            <p className="text-sm text-accent/80">
              נדרשים סה"כ: {item.quantityRequired} {unitLabel} (נותרו: {remainingQuantity})
            </p>
          </div>

          <div className="space-y-4">
            {/* Name display/edit section */}
            {!showNameInput && (
              isEditingName ? (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">שם חדש*</label>
                  <div className="relative">
                    <input type="text" value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="השם החדש שיוצג" className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent" />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">השיבוץ יירשם על שם:</p>
                      <p className="text-blue-700 font-semibold">{currentUserName}</p>
                    </div>
                    <button onClick={() => setIsEditingName(true)} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center"><Edit size={12} className="ml-1" /> שנה</button>
                  </div>
                </div>
              )
            )}
            {showNameInput && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">שם מלא*</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input type="text" value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="השם שיוצג לכולם" className="w-full p-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent" />
                </div>
              </div>
            )}

            {/* Quantity input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">כמות שאביא ({unitLabel})*</label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)} 
                  className="w-full p-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent"
                  min="1"
                  max={maxQuantityAllowed}
                />
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">הערות (אופציונלי)</label>
              <div className="relative">
                <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-neutral-400" />
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent" rows={3} placeholder="לדוגמה: ללא גלוטן, טבעוני..." />
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-neutral-100 px-6 py-4 flex justify-end space-x-3 rtl:space-x-reverse rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-medium transition-colors">ביטול</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:bg-neutral-300 font-medium transition-colors">{isLoading ? 'מעדכן...' : isEdit ? 'שמור שינויים' : 'אשר שיבוץ'}</button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;