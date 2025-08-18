// src/pages/TermsPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const TermsPage: React.FC = () => (
  <div className="legal-page-container">
    <div className="max-w-4xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6"
      >
        <ArrowRight size={16} className="ml-1" />
        חזור לדף הבית
      </Link>
      
      <h1 className="text-3xl font-bold mb-4">תנאי שימוש לאפליקציית "שישי שיתופי"</h1>
      <p className="text-sm text-neutral-500 mb-6">תאריך עדכון אחרון: 14 באוגוסט 2025</p>

      <div className="prose">
        <p>ברוכים הבאים ל"שישי שיתופי" (להלן: "<strong>האפליקציה</strong>" או "<strong>השירות</strong>"). השימוש באפליקציה, שירותיה ותכניה כפוף לתנאים המפורטים להלן ("<strong>תנאי השימוש</strong>"). אנא קרא אותם בעיון. שימושך באפליקציה, בכל דרך שהיא, מהווה הסכמה בלתי מסויגת לתנאים אלו. אם אינך מסכים לתנאי השימוש, כולם או חלקם, אינך רשאי לעשות שימוש באפליקציה.</p>

        <h2>1. הגדרת השירות</h2>
        <p>האפליקציה מספקת פלטפורמה לניהול ותיאום ארוחות שיתופיות קהילתיות (Potluck). השירות מאפשר למארגני אירועים ("<strong>מנהלים</strong>") ליצור אירועים, להגדיר רשימות פריטים נדרשים, ולשתף את האירוע עם חברי הקהילה ("<strong>משתתפים</strong>"). המשתתפים יכולים לצפות בפריטים, לשבץ את עצמם לפריטים קיימים ולהוסיף פריטים חדשים לרשימה.</p>

        <h2>2. כשרות משפטית וגיל שימוש</h2>
        <p>השימוש באפליקציה מותר אך ורק למשתמשים אשר גילם עולה על 16 שנים והם בעלי כשרות משפטית מלאה להתקשר בהסכם זה. בשימושך באפליקציה, הינך מצהיר ומאשר כי אתה עומד בתנאי גיל וכשרות אלו.</p>

        <h2>3. חשבונות משתמשים</h2>
        <ul>
          <li><strong>מנהלים:</strong> יצירת חשבון מנהל וניהול אירועים דורשים הרשמה באמצעות כתובת דוא"ל וסיסמה. המנהלים אחראים באופן בלעדי לשמירת סודיות פרטי ההתחברות שלהם ולכל פעולה שתתבצע בחשבונם.</li>
          <li><strong>משתתפים:</strong> ההשתתפות באירוע אינה דורשת הרשמה. משתמשים יכולים להצטרף באופן אנונימי. בעת שיבוץ ראשון לפריט, המשתתף יתבקש לספק שם להצגה שילווה את כל פעולותיו באותו אירוע.</li>
        </ul>

        <h2>4. קניין רוחני</h2>
        <ul>
          <li><strong>האפליקציה:</strong> כל זכויות הקניין הרוחני באפליקציה, לרבות קוד המקור, העיצוב, הלוגו, הממשק הגרפי, וכל חומר אחר הכלול בה (למעט תוכן משתמשים), שייכות באופן בלעדי למפתח האפליקציה, חגי יחיאל. אין להעתיק, לשכפל, להפיץ, לשנות או לעשות כל שימוש מסחרי באפליקציה או בחלק ממנה ללא אישור מפורש בכתב.</li>
          <li><strong>תוכן משתמשים (User-Generated Content):</strong> הינך האחראי הבלעדי לתוכן שאתה יוצר ומעלה לאפליקציה. בעצם העלאת כל תוכן, אתה מעניק למפתח האפליקציה רישיון עולמי, לא-בלעדי וללא תמלוגים להשתמש, להציג, לשכפל ולהפיץ תוכן זה, אך ורק לצורך תפעול ומתן השירותים באפליקציה.</li>
          <li><strong>אייקונים:</strong> האייקונים המשמשים באפליקציה נלקחו מאתר Flaticon.com. קרדיט: Icons by Flaticon.</li>
        </ul>

        <h2>5. שימוש נאות, הסרת תוכן והפסקת שירות</h2>
        <p>הנך מתחייב שלא להעלות לאפליקציה כל תוכן שהוא בלתי חוקי, פוגעני, מאיים, גזעני, מהווה לשון הרע או פוגע בפרטיות. מפתח האפליקציה שומר לעצמו את הזכות, לפי שיקול דעתו הבלעדי, להסיר לאלתר כל תוכן המפר תנאים אלו, וכן לחסום או להשעות גישה של משתמש לשירות, ללא הודעה מוקדמת.</p>

        <h2>6. שינויים, עדכונים והפסקת השירות</h2>
        <p>מפתח האפליקציה שומר לעצמו את הזכות המלאה, לפי שיקול דעתו הבלעדי, לשנות את האפליקציה ותכונותיה בכל עת, לרבות הוספה, גריעה או שינוי של פונקציונליות, ללא צורך במתן הודעה מוקדמת. הינך מסכים כי לא תהיה לך כל טענה או תביעה כלפי המפתח בגין ביצוע שינויים כאמור. תנאי שימוש אלו יחולו על כל גרסה מעודכנת. על שינויים מהותיים בתנאי השימוש תינתן הודעה סבירה. המשך שימושך באפליקציה לאחר עדכון יהווה הסכמה לתנאים המעודכנים. כמו כן, המפתח שומר לעצמו את הזכות להפסיק את פעילות האפליקציה, באופן מלא או חלקי.</p>

        <h2>7. הגבלת אחריות</h2>
        <ul>
            <li><strong>השירות ניתן "כפי שהוא" (As-Is):</strong> האפליקציה מסופקת לשימוש כפי שהיא, ללא כל התחייבות או אחריות לתקינותה, זמינותה או אמינותה.</li>
            <li><strong>תוכן גולשים:</strong> מפתח האפליקציה אינו נושא באחריות לתוכן שמועלה על ידי המשתמשים.</li>
            <li><strong>האירועים עצמם:</strong> מובהר בזאת באופן חד משמעי כי האפליקציה משמשת ככלי תיאום טכנולוגי בלבד. מפתח האפליקציה אינו צד לאירועים המאורגנים דרכה ואינו נושא בכל אחריות הקשורה אליהם, לרבות אך לא רק: איכות המזון, בטיחותו, התאמתו לדרישות תזונתיות (כגון אלרגיות או כשרות), וכל נזק ישיר או עקיף העלול להיגרם למשתתפים. האחריות המלאה על כל היבטי האירוע חלה באופן בלעדי על מארגן האירוע והמשתתפים בו.</li>
        </ul>

        <h2>8. סמכות שיפוט</h2>
        <p>על תנאי שימוש אלו יחולו דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל סכסוך תהא נתונה לבתי המשפט המוסמכים במחוז תל אביב-יפו.</p>

        <h2>9. יצירת קשר</h2>
        <p>
          בכל שאלה בנוגע לתנאי שימוש אלו, ניתן ליצור עמנו קשר באחת מהדרכים הבאות:
        </p>
        <ul>
            <li>
                באמצעות <a href="https://docs.google.com/forms/d/1V45Zzte9AJ9okw11Dhg0750xzt8T9t8Q0mGHjwg_BUc/preview" target="_blank" rel="noopener noreferrer">טופס יצירת הקשר</a>.
            </li>
            <li>
                דרך כתובת המייל: <a href="mailto:Shishi.Shitufi.App@gmail.com">Shishi.Shitufi.App@gmail.com</a>.
            </li>
        </ul>

        <hr className="my-8" />
        
        <h1 className="text-2xl font-bold mb-4" lang="en">Terms of Use (English)</h1>
        
        <div lang="en">
          <h2>1. Definition of the Service</h2>
          <p>The Application provides a platform for managing and coordinating community potluck meals. The service allows event organizers ("Managers") to create events, define lists of required items, and share the event with community members ("Participants"). Participants can view items, assign themselves to existing items, and add new items to the list.</p>

          <h2>2. Legal Capacity and Age of Use</h2>
          <p>Use of the Application is permitted only for users who are over 16 years of age and have full legal capacity to enter into this agreement. By using the Application, you declare and confirm that you meet these age and capacity requirements.</p>

          <h2>3. User Accounts</h2>
          <ul>
            <li><strong>Managers:</strong> Creating a Manager account and managing events require registration with an email address and password. Managers are solely responsible for maintaining the confidentiality of their login details and for any activity that occurs in their account.</li>
            <li><strong>Participants:</strong> Participation in an event does not require registration. Users can join anonymously. Upon first assigning an item, the participant will be asked to provide a display name that will accompany all their actions in that event.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <ul>
            <li><strong>The Application:</strong> All intellectual property rights in the Application, including source code, design, logo, graphic interface, and any other material contained therein (excluding User-Generated Content), belong exclusively to the application's developer, Chagai Yechiel. You may not copy, reproduce, distribute, modify, or make any commercial use of the Application or any part of it without express written permission.</li>
            <li><strong>User-Generated Content:</strong> You are solely responsible for the content you create and upload to the Application. By uploading any content, you grant the application developer a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute this content, solely for the purpose of operating and providing the Application's services.</li>
            <li><strong>Icons:</strong> Icons used in the application were taken from Flaticon.com. Credit: Icons by Flaticon.</li>
          </ul>

          <h2>5. Proper Use, Content Removal, and Service Termination</h2>
          <p>You undertake not to upload any content that is illegal, offensive, threatening, racist, defamatory, or violates privacy. The application developer reserves the right, at his sole discretion, to immediately remove any content that violates these terms, and to block or suspend a user's access to the service, without prior notice.</p>

          <h2>6. Changes, Updates, and Discontinuation of Service</h2>
          <p>The application developer reserves the full right, at his sole discretion, to change the Application and its features at any time, including adding, removing, or modifying functionality, without prior notice. You agree that you shall have no claim or demand against the developer for making such changes. These Terms of Use will apply to any updated version. Reasonable notice will be given for material changes to the Terms of Use. Your continued use of the Application after an update will constitute acceptance of the updated terms. The developer also reserves the right to discontinue the Application's activity, in whole or in part.</p>

          <h2>7. Limitation of Liability</h2>
          <ul>
            <li><strong>"As-Is" Service:</strong> The Application is provided for use "as is," without any warranty, express or implied, as to its correctness, availability, or reliability.</li>
            <li><strong>User Content:</strong> The application developer is not responsible for the content uploaded by users.</li>
            <li><strong>The Events Themselves:</strong> It is hereby clarified unequivocally that the Application serves as a technological coordination tool only. The application developer is not a party to the events organized through it and bears no responsibility related to them, including but not limited to: food quality, safety, suitability for dietary needs (such as allergies or kashrut), and any direct or indirect damage that may be caused to participants. Full responsibility for all aspects of the event lies exclusively with the event organizer and its participants.</li>
          </ul>

          <h2>8. Jurisdiction</h2>
          <p>These Terms of Use shall be governed by the laws of the State of Israel. The competent courts in the Tel Aviv-Jaffa district shall have exclusive jurisdiction in any dispute.</p>

          <h2>9. Contact</h2>
          <p>For any questions regarding these Terms of Use, you can contact us by:</p>
          <ul>
              <li>Using our <a href="https://docs.google.com/forms/d/e/1FAIpQLScliYWHohU4JSq1Xm3d_0auBCetq4BgoDp0vc7M9SCbIT6cbw/viewform" target="_blank" rel="noopener noreferrer">dedicated contact form</a>.</li>
              <li>Via email at: <a href="mailto:Shishi.Shitufi.App@gmail.com">Shishi.Shitufi.App@gmail.com</a>.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default TermsPage;