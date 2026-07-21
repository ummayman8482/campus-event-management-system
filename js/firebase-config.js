/* ============================================================
   CEMS - Firebase Configuration & Database Helpers
   ============================================================
   Initializes Firebase and provides helper functions for
   Firestore CRUD operations on registrations, messages,
   and events collections.
   ============================================================ */

/* Firebase Config */
const firebaseConfig = {
    apiKey: "AIzaSyAzmscKgRdRg6Pi0o9Xe7X8wjmW6G_jVgM",
    authDomain: "campus-event-management-198eb.firebaseapp.com",
    projectId: "campus-event-management-198eb",
    storageBucket: "campus-event-management-198eb.firebasestorage.app",
    messagingSenderId: "943756913133",
    appId: "1:943756913133:web:5fb84683d38184cda3dfe4",
    measurementId: "G-VDX52NXWKC"
};

/* Initialize Firebase */
firebase.initializeApp(firebaseConfig);

/* Firestore database reference */
const db = firebase.firestore();

/* ============================================================
   COLLECTION REFERENCES
   ============================================================ */
const registrationsRef = db.collection('registrations');
const messagesRef = db.collection('messages');
const eventsRef = db.collection('events');

/* ============================================================
   HELPER: Generate a short unique ID
   ============================================================ */
function generateId(prefix) {
    const num = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return prefix + '-' + num;
}

/* ============================================================
   REGISTRATIONS - CRUD Operations
   ============================================================ */

/**
 * Save a new registration to Firestore
 * @param {Object} data - Registration form data
 * @returns {Promise<Object>} - Saved document with ID
 */
async function saveRegistration(data) {
    const docData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        studentId: data.studentId,
        department: data.department,
        year: data.year,
        event: data.event,
        eventName: data.eventName,
        requirements: data.requirements || '',
        status: 'Confirmed',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await registrationsRef.add(docData);
    return { id: docRef.id, ...docData };
}

/**
 * Get all registrations from Firestore
 * @returns {Promise<Array>} - Array of registration objects
 */
async function getAllRegistrations() {
    const snapshot = await registrationsRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
            ? doc.data().createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A'
    }));
}

/**
 * Delete a registration by document ID
 * @param {string} docId - Firestore document ID
 * @returns {Promise<void>}
 */
async function deleteRegistration(docId) {
    return registrationsRef.doc(docId).delete();
}

/**
 * Update a registration status
 * @param {string} docId - Firestore document ID
 * @param {string} newStatus - New status value
 * @returns {Promise<void>}
 */
async function updateRegistrationStatus(docId, newStatus) {
    return registrationsRef.doc(docId).update({ status: newStatus });
}

/* ============================================================
   MESSAGES - CRUD Operations
   ============================================================ */

/**
 * Save a new contact message to Firestore
 * @param {Object} data - Contact form data
 * @returns {Promise<Object>} - Saved document with ID
 */
async function saveMessage(data) {
    const docData = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        subjectLabel: data.subjectLabel || data.subject,
        message: data.message,
        newsletter: data.newsletter || false,
        status: 'Unread',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await messagesRef.add(docData);
    return { id: docRef.id, ...docData };
}

/**
 * Get all messages from Firestore
 * @returns {Promise<Array>} - Array of message objects
 */
async function getAllMessages() {
    const snapshot = await messagesRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
            ? doc.data().createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A'
    }));
}

/**
 * Delete a message by document ID
 * @param {string} docId - Firestore document ID
 * @returns {Promise<void>}
 */
async function deleteMessage(docId) {
    return messagesRef.doc(docId).delete();
}

/**
 * Mark a message as read
 * @param {string} docId - Firestore document ID
 * @returns {Promise<void>}
 */
async function markMessageRead(docId) {
    return messagesRef.doc(docId).update({ status: 'Read' });
}

/* ============================================================
   EVENTS - CRUD Operations
   ============================================================ */

/**
 * Save a new event to Firestore
 * @param {Object} data - Event data
 * @returns {Promise<Object>} - Saved document with ID
 */
async function saveEvent(data) {
    const docData = {
        name: data.name,
        category: data.category,
        date: data.date,
        location: data.location,
        capacity: parseInt(data.capacity) || 0,
        registered: 0,
        status: data.status || 'Active',
        emoji: data.emoji || '📅',
        description: data.description || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await eventsRef.add(docData);
    return { id: docRef.id, ...docData };
}

/**
 * Get all events from Firestore
 * @returns {Promise<Array>} - Array of event objects
 */
async function getAllEvents() {
    const snapshot = await eventsRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
            ? doc.data().createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'N/A'
    }));
}

/**
 * Delete an event by document ID
 * @param {string} docId - Firestore document ID
 * @returns {Promise<void>}
 */
async function deleteEvent(docId) {
    return eventsRef.doc(docId).delete();
}

/**
 * Update an event
 * @param {string} docId - Firestore document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateEvent(docId, updates) {
    return eventsRef.doc(docId).update(updates);
}

/* ============================================================
   SEED DATA - Initial events if collection is empty
   ============================================================ */
async function seedEventsIfEmpty() {
    const snapshot = await eventsRef.limit(1).get();
    if (snapshot.empty) {
        const seedEvents = [
            { name: 'Annual Tech Summit 2026', category: 'Academic', date: 'March 15, 2026 • 10:00 AM', location: 'Main Auditorium', capacity: 300, registered: 180, status: 'Active', emoji: '🎤', description: 'Cutting-edge tech talks, workshops, and networking.' },
            { name: 'Student Art Exhibition', category: 'Cultural', date: 'April 2, 2026 • 2:00 PM', location: 'Gallery Hall', capacity: 150, registered: 70, status: 'Active', emoji: '🎨', description: 'Showcase of student artwork and installations.' },
            { name: 'Inter-Dept Sports Tournament', category: 'Sports', date: 'May 10, 2026 • 9:00 AM', location: 'Sports Complex', capacity: 500, registered: 300, status: 'Active', emoji: '⚽', description: 'Football, basketball, cricket, and athletics.' },
            { name: 'Spring Career Fair 2026', category: 'Academic', date: 'March 28, 2026 • 9:00 AM', location: 'Convention Center', capacity: 400, registered: 220, status: 'Active', emoji: '💼', description: 'Connect with top employers and explore opportunities.' },
            { name: 'Python Programming Workshop', category: 'Workshop', date: 'Feb 10 - Mar 10, 2026 • 3:00 PM', location: 'Computer Lab 3', capacity: 30, registered: 25, status: 'Ongoing', emoji: '💻', description: 'Hands-on Python fundamentals and web development.' },
            { name: 'Campus Music Night', category: 'Cultural', date: 'April 20, 2026 • 6:00 PM', location: 'Open Air Theatre', capacity: 600, registered: 180, status: 'Active', emoji: '🎵', description: 'Live performances by student bands and artists.' },
            { name: '24-Hour Hackathon Challenge', category: 'Academic', date: 'May 5, 2026 • 8:00 AM', location: 'Innovation Hub', capacity: 100, registered: 65, status: 'Active', emoji: '🏆', description: 'Build innovative solutions in 24 hours. $5K in prizes!' },
            { name: 'Mindfulness & Yoga Workshop', category: 'Workshop', date: 'March 22, 2026 • 7:00 AM', location: 'Wellness Center', capacity: 50, registered: 35, status: 'Active', emoji: '🧘', description: 'Meditation, breathing exercises, and yoga routines.' },
            { name: 'Annual Science Fair', category: 'Academic', date: 'January 20, 2026 • 10:00 AM', location: 'Science Block', capacity: 200, registered: 200, status: 'Past', emoji: '🔬', description: 'Research projects in physics, chemistry, and biology.' }
        ];

        const batch = db.batch();
        seedEvents.forEach(evt => {
            const ref = eventsRef.doc();
            batch.set(ref, { ...evt, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        });
        await batch.commit();
        console.log('[CEMS] Seeded', seedEvents.length, 'events into Firestore.');
    }
}

/* ============================================================
   DASHBOARD STATS
   ============================================================ */
async function getDashboardStats() {
    const [regSnap, msgSnap, evtSnap] = await Promise.all([
        registrationsRef.get(),
        messagesRef.get(),
        eventsRef.get()
    ]);

    return {
        totalRegistrations: regSnap.size,
        totalMessages: msgSnap.size,
        totalEvents: evtSnap.size,
        confirmedRegistrations: regSnap.docs.filter(d => d.data().status === 'Confirmed').length,
        unreadMessages: msgSnap.docs.filter(d => d.data().status === 'Unread').length
    };
}

/* Auto-seed events on load */
seedEventsIfEmpty().catch(err => console.warn('[CEMS] Seed check:', err.message));
