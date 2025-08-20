// src/components/Events/MenuItemCard.tsx

import React from 'react';
import { MenuItem, Assignment } from '../../types';
import { Edit, Trash2, Users, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';

// --- START OF CHANGES: Updated Props interface ---
interface MenuItemCardProps {
  item: MenuItem;
  // מקבלים מערך של כל השיבוצים לפריט זה
  assignments: Assignment[]; 
  // מקבלים את מזהה המשתמש הנוכחי כדי לזהות את השיבוצים שלו
  myUserId?: string; 
  onAssign: () => void;
  // הפונקציות מקבלות כעת את השיבוץ הספציפי שיש לערוך/לבטל
  onEdit: (assignment: Assignment) => void; 
  onCancel: (assignment: Assignment) => void;
  isEventActive: boolean;
}
// --- END OF CHANGES: Updated Props interface ---

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  assignments,
  myUserId,
  onAssign,
  onEdit,
  onCancel,
  isEventActive,
}) => {
  // --- START OF NEW LOGIC ---

  // מילון שמות לקטגוריות ויחידות
  const categoryNames: { [key: string]: string } = {
    starter: 'מנה ראשונה', main: 'מנה עיקרית', dessert: 'קינוחים', 
    drink: 'שתייה', other: 'אחר', equipment: 'ציוד'
  };

  const unitTypeNames: { [key: string]: string } = {
    units: 'יחידות', grams: 'גרם', servings: 'סועדים'
  };

  // חישובים הנגזרים מהמודל החדש
  const totalAssignedQuantity = item.totalAssignedQuantity || 0;
  const remainingQuantity = item.quantityRequired - totalAssignedQuantity;
  const isFullyAssigned = remainingQuantity <= 0;
  
  // מציאת השיבוץ של המשתמש הנוכחי
  const myAssignment = myUserId ? assignments.find(a => a.userId === myUserId) : undefined;
  
  const progressPercentage = item.quantityRequired > 0 
    ? (totalAssignedQuantity / item.quantityRequired) * 100 
    : 100;

  // --- END OF NEW LOGIC ---

  return (
    <div className={`bg-white rounded-xl shadow-md border-2 flex flex-col transition-all duration-300 ${myAssignment ? 'border-blue-400' : 'border-gray-200'}`}>
      
      {/* חלק עליון עם פרטי הפריט */}
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-gray-800 text-base">{item.name}</h4>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${myAssignment ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-gray-50 text-gray-600'}`}>
            {categoryNames[item.category] || 'לא ידוע'}
          </span>
        </div>
        {item.isRequired && (
          <div className="flex items-center text-red-600 text-xs font-bold mb-2">
            <AlertCircle size={14} className="ml-1" />
            פריט חובה
          </div>
        )}
        <p className="text-sm text-gray-500">
          נדרש: {item.quantityRequired} {unitTypeNames[item.unitType] || item.unitType}
        </p>
        {item.creatorName && <p className="text-xs text-gray-400 mt-1">נוצר ע"י: {item.creatorName}</p>}
        {item.notes && <p className="text-xs text-gray-500 mt-2 italic">הערות: {item.notes}</p>}
      </div>

      {/* מד התקדמות ורשימת משתתפים */}
      <div className="px-4 pb-3 space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{totalAssignedQuantity}</span>
            <span>{item.quantityRequired}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }} />
          </div>
        </div>

        {/* Assignments List */}
        {assignments.length > 0 && (
          <div className="space-y-2 max-h-24 overflow-y-auto pr-2">
            {assignments.map(assignment => (
              <div key={assignment.id} className={`flex justify-between items-center text-sm p-1.5 rounded ${assignment.userId === myUserId ? 'bg-blue-100' : ''}`}>
                <span className="font-semibold text-gray-700">{assignment.userName}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-bold text-blue-800">{assignment.quantity} {unitTypeNames[item.unitType]}</span>
                  {assignment.userId === myUserId && isEventActive && (
                    <div className="flex space-x-1 rtl:space-x-reverse">
                      <button onClick={() => onEdit(assignment)} className="text-gray-500 hover:text-blue-600"><Edit size={14} /></button>
                      <button onClick={() => onCancel(assignment)} className="text-gray-500 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* חלק תחתון עם כפתור פעולה */}
      <div className="bg-gray-50 border-t p-3 rounded-b-xl">
        {isEventActive ? (
          isFullyAssigned ? (
            <div className="flex items-center justify-center text-sm font-semibold text-green-700">
              <CheckCircle size={16} className="ml-2" />
              הפריט שובץ במלואו
            </div>
          ) : (
            <button onClick={onAssign} className="w-full bg-orange-500 text-white py-2 text-sm rounded-lg hover:bg-orange-600 font-semibold transition-colors flex items-center justify-center">
              <PlusCircle size={16} className="ml-2" />
              שבץ אותי
            </button>
          )
        ) : (
          <p className="text-sm text-center text-gray-500">האירוע אינו פעיל</p>
        )}
      </div>
    </div>
  );
};

export default MenuItemCard;