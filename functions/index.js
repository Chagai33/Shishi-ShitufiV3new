const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.database();

// הגדרת ה-UID של מנהל-העל. מומלץ לשמור אותו כאן או במשתנה סביבה.
const SUPER_ADMIN_UID = "V2MYaKaCXVUblj0oK6v6AMmF8E42"; // <-- החלף ב-UID האמיתי שלך!

/**
 * Deletes a user account and all associated data.
 * This is a callable function invoked from the client-side.
 */
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to delete an account.'
    );
  }

  const uid = context.auth.uid;
  
  // --- שכבת הגנה חדשה ---
  if (uid === SUPER_ADMIN_UID) {
      console.warn(`Attempt to delete super-admin account (${uid}) was blocked.`);
      throw new functions.https.HttpsError(
        'permission-denied',
        'The super-admin account cannot be deleted.'
      );
  }
  // -------------------------

  try {
    await admin.auth().deleteUser(uid);
    console.log(`Successfully initiated deletion for user ${uid}`);
    return { result: `Successfully initiated deletion for user ${uid}` };
  } catch (error) {
    console.error(`Error deleting user ${uid}:`, error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while deleting the user.'
    );
  }
});


/**
 * Cleans up user data from the Realtime Database after a user is deleted.
 * This function is triggered by the deletion of a user in Firebase Authentication.
 */
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
    const uid = user.uid;
    console.log(`Starting cleanup for deleted user: ${uid}`);

    const updates = {};
    const eventsToDelete = [];

    // 1. Find all events organized by the user
    const eventsRef = db.ref('/events');
    const snapshot = await eventsRef.orderByChild('organizerId').equalTo(uid).once('value');
    
    if (snapshot.exists()) {
        snapshot.forEach(childSnapshot => {
            const eventId = childSnapshot.key;
            console.log(`Marking event ${eventId} for deletion.`);
            updates[`/events/${eventId}`] = null; // Mark the entire event for deletion
            eventsToDelete.push(eventId);
        });
    }

    // 2. Find all assignments made by the user in other events
    const allEventsSnapshot = await eventsRef.once('value');
    if (allEventsSnapshot.exists()) {
        allEventsSnapshot.forEach(eventSnapshot => {
            const eventId = eventSnapshot.key;
            if (eventsToDelete.includes(eventId)) {
                // Skip events that are already being deleted
                return;
            }

            const assignments = eventSnapshot.child('assignments').val();
            if (assignments) {
                for (const assignmentId in assignments) {
                    if (assignments[assignmentId].userId === uid) {
                        console.log(`Deleting assignment ${assignmentId} from event ${eventId}.`);
                        updates[`/events/${eventId}/assignments/${assignmentId}`] = null;

                        // Also un-assign the menu item
                        const menuItemId = assignments[assignmentId].menuItemId;
                        updates[`/events/${eventId}/menuItems/${menuItemId}/assignedTo`] = null;
                        updates[`/events/${eventId}/menuItems/${menuItemId}/assignedToName`] = null;
                        updates[`/events/${eventId}/menuItems/${menuItemId}/assignedAt`] = null;
                    }
                }
            }
        });
    }
    
    // 3. Delete the user's own record from the /users node
    updates[`/users/${uid}`] = null;
    
    // 4. Perform all database updates at once
    if (Object.keys(updates).length > 0) {
        try {
            await db.ref().update(updates);
            console.log(`Successfully cleaned up data for user ${uid}.`);
        } catch (error) {
            console.error(`Error during database cleanup for user ${uid}:`, error);
        }
    } else {
        console.log(`No database data to clean up for user ${uid}.`);
    }

    return null;
});