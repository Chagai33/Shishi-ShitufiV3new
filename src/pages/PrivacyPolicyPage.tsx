// src/pages/PrivacyPolicyPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => (
    <div className="legal-page-container">
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6"
      >
        <ArrowRight size={16} className="ml-1" />
        חזור לדף הבית
      </Link>
      
      <h1 className="text-3xl font-bold mb-4">מדיניות פרטיות לאפליקציית "שישי שיתופי"</h1>
      <p className="text-sm text-neutral-500 mb-6">תאריך עדכון אחרון: 13 באוגוסט 2025</p>

      <div className="prose">
        <p>אנו מכבדים את פרטיות המשתמשים שלנו ("<strong>אתה</strong>", "<strong>המשתמש</strong>") ומחויבים להגן עליה. מדיניות פרטיות זו מתארת איזה מידע אישי אנו אוספים, כיצד אנו משתמשים בו, עם מי אנו חולקים אותו, ומהן זכויותיך בנוגע למידע זה.</p>
        
        <h2>1. איזה מידע אנו אוספים?</h2>
        <p>אנו אוספים את סוגי המידע המינימליים הבאים:</p>
        <ul>
            <li><strong>עבור מנהלי אירועים:</strong> שם להצגה, כתובת דוא"ל וסיסמה מוצפנת.</li>
            <li><strong>עבור משתתפים (אורחים):</strong> שם להצגה. בעת כניסה ראשונה, מוקצה לך מזהה אנונימי וייחודי.</li>
            <li><strong>תוכן שנוצר על ידך:</strong> פרטי אירועים (כותרת, תאריך, מיקום), שמות פריטים והערות.</li>
        </ul>

        <h2>2. כיצד אנו משתמשים במידע?</h2>
        <p>השימוש במידע נועד אך ורק כדי לאפשר את תפקודה התקין של האפליקציה, להציג מי מביא כל פריט, ולאפשר למנהלים לנהל את האירועים.</p>

        <h2>3. שיתוף מידע עם צדדים שלישיים</h2>
        <p>אנו לא מוכרים או משתפים את המידע האישי שלך, למעט במקרים הבאים:</p>
        <ul>
            <li><strong>משתתפי האירוע:</strong> שמך להצגה והפריטים ששובצת אליהם יהיו גלויים לשאר המשתתפים באותו אירוע.</li>
            <li><strong>Google Firebase:</strong> האפליקציה בנויה על פלטפורמת Firebase של Google, המשמשת לאימות, אחסון נתונים ואבטחה. המידע שלך נשמר בשרתים של גוגל וכפוף למדיניות הפרטיות שלהם. שירותי Firebase עשויים לאסוף מזהים טכניים (כמו כתובת IP) לצורכי תפעול ואבטחה.</li>
        </ul>

        <h2>4. העברת נתונים בינלאומית</h2>
        <p>השימוש ב-Firebase כרוך בכך שהמידע שלך עשוי להיות מאוחסן בשרתים הממוקמים מחוץ לגבולות מדינת ישראל. אנו מסתמכים על כך שגוגל נוקטת באמצעי אבטחה העומדים בסטנדרטים בינלאומיים.</p>

        <h2>5. שמירת נתונים (Data Retention)</h2>
        <p>אנו שומרים מידע אישי רק למשך הזמן הנחוץ:</p>
        <ul>
            <li><strong>פרטי חשבון מנהל:</strong> יישמרו כל עוד החשבון פעיל. לאחר בקשת מחיקה, המידע יימחק תוך 180 יום.</li>
            <li><strong>מידע על אירועים:</strong> יישמר כל עוד האירוע קיים במערכת.</li>
        </ul>
        
        <h2>6. פרטיות ילדים</h2>
        <p>השירות אינו מיועד לשימוש על ידי ילדים מתחת לגיל 16. איננו אוספים ביודעין מידע אישי מילדים.</p>

        <h2>7. זכויות המשתמש</h2>
        <p>על פי חוק הגנת הפרטיות, אתה זכאי לעיין במידע האישי שלך, לבקש לתקן אותו או לבקש את מחיקתו. למימוש זכויות אלו, אנא פנה אלינו.</p>

        <h2>8. שינויים במדיניות הפרטיות</h2>
        <p>אנו שומרים לעצמנו את הזכות לעדכן מדיניות זו מעת לעת.</p>
        
        <hr className="my-8" />
        
        <h1 className="text-2xl font-bold mb-4" lang="en">Privacy Policy (English)</h1>
        
        <div lang="en">
          <h2>1. What Information Do We Collect?</h2>
          <p>We collect the following minimal types of information:</p>
          <ul>
            <li><strong>For Event Managers:</strong> Display name, email address, and an encrypted password.</li>
            <li><strong>For Participants (Guests):</strong> A display name. Upon first entry, you are assigned a unique anonymous identifier.</li>
            <li><strong>Content You Create:</strong> Event details (title, date, location), item names, and notes.</li>
          </ul>

          <h2>2. How Do We Use the Information?</h2>
          <p>The use of the information is solely to enable the proper functioning of the Application, to show who is bringing each item, and to allow managers to manage their events.</p>

          <h2>3. Sharing Information with Third Parties</h2>
          <p>We do not sell or share your personal information, except in the following cases:</p>
          <ul>
            <li><strong>Event Participants:</strong> Your display name and the items you are assigned to will be visible to other participants in that specific event.</li>
            <li><strong>Google Firebase:</strong> The Application is built on Google's Firebase platform, which is used for authentication, data storage, and security. Your information is stored on Google's servers and is subject to their privacy policy. Firebase services may collect technical identifiers (like IP addresses) for operational and security purposes.</li>
          </ul>

          <h2>4. International Data Transfer</h2>
          <p>Using Firebase involves your information potentially being stored on servers located outside the borders of the State of Israel. We rely on Google to employ security measures that meet international standards.</p>

          <h2>5. Data Retention</h2>
          <p>We retain personal information only for the necessary duration:</p>
          <ul>
            <li><strong>Manager Account Details:</strong> Will be kept as long as the account is active. Following a deletion request, the information will be deleted within 180 days.</li>
            <li><strong>Event Information:</strong> Will be kept as long as the event exists in the system.</li>
          </ul>

          <h2>6. Children's Privacy</h2>
          <p>The service is not intended for use by children under the age of 16. We do not knowingly collect personal information from children.</p>

          <h2>7. User Rights</h2>
          <p>Under the Privacy Protection Law, you are entitled to review your personal information, request its correction, or request its deletion. To exercise these rights, please contact us.</p>
          
          <h2>8. Changes to the Privacy Policy</h2>
          <p>We reserve the right to update this policy from time to time.</p>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;