// firebaseDb.js
import { db } from "@/lib/auth"; // Assuming you have this file with Firebase initialization
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// =================== USER OPERATIONS ===================

/**
 * Add a new user to the database
 * @param {Object} userData - User data to add
 * @returns {Promise<string>} - ID of the newly created user
 */
export const addUser = async (userData) => {
  try {
    const userRef = collection(db, "users");

    // Step 1: Check for existing email
    const emailQuery = query(userRef, where("email", "==", userData.email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      throw new Error("Email already exists. Please use a different email.");
    }

    // Step 2: Add the user
    const newUserData = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(userRef, newUserData);
    const userId = docRef.id;

    // Step 3: Create empty attendance record
    const attendanceRef = collection(db, "attendances");
    const attendanceData = {
      userId: userId,
      attendances: [],
    };
    await addDoc(attendanceRef, attendanceData);

    return userId;
  } catch (error) {
    console.error("Error adding user: ", error);
    throw error;
  }
};

/**
 * Get all users from the database
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const userRef = collection(db, "users");
    const snapshot = await getDocs(userRef);

    return snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users: ", error);
    throw error;
  }
};

/**
 * Get a specific user by ID
 * @param {string} userId - ID of the user to fetch
 * @returns {Promise<Object>} - User object
 */
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return {
        _id: snapshot.id,
        ...snapshot.data(),
      };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user: ", error);
    throw error;
  }
};

/**
 * Update a user's information
 * @param {string} userId - ID of the user to update
 * @param {Object} userData - New user data
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

/**
 * Delete a user from the database
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

// =================== ATTENDANCE OPERATIONS ===================

/**
 * Add a new attendance record for a user
 * @param {string} userId - ID of the user
 * @param {Object} attendanceData - Attendance data
 * @returns {Promise<string>} - ID of the new attendance record
 */
export const addAttendance = async (userId, attendanceData) => {
  try {
    const attendanceRef = collection(db, "attendance");
    const newAttendanceData = {
      userId,
      ...attendanceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(attendanceRef, newAttendanceData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding attendance: ", error);
    throw error;
  }
};

/**
 * Get all attendance records for a specific user
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} - Array of attendance records
 */
export const getUserAttendance = async (userId) => {
  try {
    const attendanceRef = collection(db, "attendance");
    const q = query(attendanceRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching attendance: ", error);
    throw error;
  }
};

/**
 * Get attendance records for a specific user and date range
 * @param {string} userId - ID of the user
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Promise<Array>} - Array of attendance records
 */
export const getUserAttendanceByDateRange = async (
  userId,
  startDate,
  endDate
) => {
  try {
    const attendanceRef = collection(db, "attendance");
    const q = query(
      attendanceRef,
      where("userId", "==", userId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching attendance by date range: ", error);
    throw error;
  }
};

/**
 * Get attendance record for a specific user by their ID
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} - User's attendance object
 */
// Modified getAttendanceByUserId function to handle missing records
export const getAttendanceByUserId = async (userId) => {
  try {
    const attendanceRef = collection(db, "attendances");

    // Query attendance where userId matches
    const attendanceQuery = query(attendanceRef, where("userId", "==", userId));
    const attendanceSnapshot = await getDocs(attendanceQuery);

    if (attendanceSnapshot.empty) {
      // Return empty attendance structure instead of throwing an error
      return {
        userId: userId,
        attendances: [],
      };
    }

    // Assuming userId is unique, return the first (and only) document
    const attendanceDoc = attendanceSnapshot.docs[0];
    return {
      id: attendanceDoc.id,
      ...attendanceDoc.data(),
    };
  } catch (error) {
    console.error("Error fetching attendance: ", error);
    throw error;
  }
};

/**
 * Get attendance record for a specific user by their ID and a specific date
 * @param {string} userId - ID of the user
 * @param {string} date - Date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Object|null>} - Attendance record for that date or null if not found
 */
export const getAttendanceByUserIdAndDate = async (userId, date) => {
  try {
    // First get the user's attendance record
    const userAttendanceRecord = await getAttendanceByUserId(userId);

    // Look for the specific date in the attendances array
    const attendanceForDate = userAttendanceRecord.attendances.find(
      (record) => record.date === date
    );

    // If we don't find an attendance record for today, create a default "leave" record
    if (!attendanceForDate && date === new Date().toISOString().split("T")[0]) {
      return {
        _id: `temp_${userId}_${date}`,
        date: date,
        status: "leave",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefaultRecord: true, // Flag to indicate this is an auto-generated record
      };
    }

    return attendanceForDate || null;
  } catch (error) {
    console.error("Error fetching attendance by date: ", error);
    throw error;
  }
};

/**
 * Update daily attendance status for all users
 * Sets default status as "leave" for current day if no record exists
 * This should be run once daily via a scheduled job
 * @returns {Promise<void>}
 */
export const updateDailyAttendanceStatus = async () => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const users = await getAllUsers();
    const attendanceRef = collection(db, "attendances");

    // Process each user
    for (const user of users) {
      // Get user's attendance record
      const attendanceQuery = query(
        attendanceRef,
        where("userId", "==", user._id)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (!attendanceSnapshot.empty) {
        const attendanceDoc = attendanceSnapshot.docs[0];
        const attendanceData = attendanceDoc.data();

        // Check if an attendance record for today already exists
        const existingRecord = attendanceData.attendances.find(
          (record) => record.date === today
        );

        // If no record exists for today, create a default "leave" record
        if (!existingRecord) {
          const newRecord = {
            _id: `${user._id}_${today}`,
            date: today,
            status: "leave",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add the new record to the attendances array
          attendanceData.attendances.push(newRecord);

          // Update the document in Firestore
          await updateDoc(doc(db, "attendances", attendanceDoc.id), {
            attendances: attendanceData.attendances,
            updatedAt: serverTimestamp(),
          });

          console.log(
            `Created default "leave" attendance for user ${user._id} on ${today}`
          );
        }
      }
    }

    console.log("Daily attendance status update completed");
  } catch (error) {
    console.error("Error updating daily attendance status: ", error);
    throw error;
  }
};

/**
 * Update an attendance record
 * @param {string} attendanceId - ID of the attendance record
 * @param {Object} attendanceData - New attendance data
 * @returns {Promise<void>}
 */
// Modified updateAttendance function to create records if they don't exist
export const updateAttendance = async (payload) => {
  try {
    // Check if there's an existing attendance record
    const attendanceRef = collection(db, "attendances");
    const attendanceQuery = query(
      attendanceRef,
      where("userId", "==", payload.userId)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);

    if (attendanceSnapshot.empty) {
      // Create a new attendance record for this user
      const newAttendanceData = {
        userId: payload.userId,
        attendances: [
          {
            _id: payload._id || new Date().getTime().toString(),
            date: payload.date,
            status: payload.status,
            checkIn: payload.checkIn,
            checkOut: payload.checkOut,
            notes: payload.notes,
          },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "attendances"),
        newAttendanceData
      );
      return {
        ...newAttendanceData.attendances[0],
        id: docRef.id,
      };
    } else {
      // Get the existing attendance document
      const attendanceDoc = attendanceSnapshot.docs[0];
      const attendanceData = attendanceDoc.data();
      const attendances = attendanceData.attendances || [];

      // Find if we're updating an existing attendance entry
      const existingIndex = attendances.findIndex((a) =>
        a.date.startsWith(payload.date)
      );

      if (existingIndex >= 0) {
        // Update existing entry
        attendances[existingIndex] = {
          ...attendances[existingIndex],
          status: payload.status,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          notes: payload.notes,
          _id: payload._id || attendances[existingIndex]._id,
        };
      } else {
        // Add new entry
        attendances.push({
          _id: payload._id || new Date().getTime().toString(),
          date: payload.date,
          status: payload.status,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          notes: payload.notes,
        });
      }

      // Update the document
      await updateDoc(doc(db, "attendances", attendanceDoc.id), {
        attendances: attendances,
        updatedAt: serverTimestamp(),
      });

      // Return the updated/added entry
      const entryIndex =
        existingIndex >= 0 ? existingIndex : attendances.length - 1;
      return attendances[entryIndex];
    }
  } catch (error) {
    console.error("Error updating attendance: ", error);
    throw error;
  }
};

/**
 * Delete an attendance record
 * @param {string} attendanceId - ID of the attendance record
 * @returns {Promise<void>}
 */
export const deleteAttendance = async (attendanceId) => {
  try {
    const attendanceRef = doc(db, "attendance", attendanceId);
    await deleteDoc(attendanceRef);
  } catch (error) {
    console.error("Error deleting attendance: ", error);
    throw error;
  }
};

// =================== DATA SEEDING FUNCTIONS ===================

/**
 * Seed the database with initial user data
 * @param {Array} users - Array of user objects
 * @returns {Promise<void>}
 */
export const seedUsers = async (users) => {
  try {
    // For each user in the array, add to database
    for (const user of users) {
      const { _id, ...userData } = user;
      const userRef = doc(db, "users", _id);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users: ", error);
    throw error;
  }
};

/**
 * Seed the database with initial attendance data
 * @param {Array} attendanceData - Array of attendance objects
 * @returns {Promise<void>}
 */
export const seedAttendance = async (attendanceData) => {
  try {
    for (const userAttendance of attendanceData) {
      const { userId, attendances } = userAttendance;

      // Create or update the attendance document in the attendances collection
      const attendanceRef = collection(db, "attendances");
      const attendanceQuery = query(
        attendanceRef,
        where("userId", "==", userId)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);

      if (attendanceSnapshot.empty) {
        // Create new document if none exists
        await addDoc(attendanceRef, {
          userId,
          attendances,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Update existing document
        const attendanceDoc = attendanceSnapshot.docs[0];
        await updateDoc(doc(db, "attendances", attendanceDoc.id), {
          attendances,
          updatedAt: serverTimestamp(),
        });
      }

      // Also add individual attendance records for backwards compatibility
      for (const attendance of attendances) {
        const { _id, ...attendanceDetails } = attendance;
        const singleAttendanceRef = doc(db, "attendance", _id);
        await setDoc(singleAttendanceRef, {
          userId,
          ...attendanceDetails,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }

    console.log("Attendance records seeded successfully");
  } catch (error) {
    console.error("Error seeding attendance: ", error);
    throw error;
  }
};

// =================== DASHBOARD & REPORTING FUNCTIONS ===================

/**
 * Get attendance statistics for a specific user
 * @param {string} userId - ID of the user
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Promise<Object>} - Attendance statistics
 */
export const getUserAttendanceStats = async (userId, startDate, endDate) => {
  try {
    const attendanceRecords = await getUserAttendanceByDateRange(
      userId,
      startDate,
      endDate
    );

    const stats = {
      totalDays: attendanceRecords.length,
      present: 0,
      remote: 0,
      absent: 0,
      leave: 0,
      averageCheckInTime: null,
      averageCheckOutTime: null,
      totalWorkHours: 0,
    };

    let totalCheckInMinutes = 0;
    let totalCheckOutMinutes = 0;
    let workHourRecords = 0;

    attendanceRecords.forEach((record) => {
      // Count by status
      if (record.status === "present") stats.present++;
      else if (record.status === "remote") stats.remote++;
      else if (record.status === "absent") stats.absent++;
      else if (record.status === "leave") stats.leave++;

      // Calculate average check-in/out times
      if (record.checkIn && record.checkOut) {
        const checkInDate = new Date(record.checkIn);
        const checkOutDate = new Date(record.checkOut);

        // Minutes since midnight for check-in
        const checkInMinutes =
          checkInDate.getHours() * 60 + checkInDate.getMinutes();
        totalCheckInMinutes += checkInMinutes;

        // Minutes since midnight for check-out
        const checkOutMinutes =
          checkOutDate.getHours() * 60 + checkOutDate.getMinutes();
        totalCheckOutMinutes += checkOutMinutes;

        // Calculate work hours
        const workHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
        stats.totalWorkHours += workHours;

        workHourRecords++;
      }
    });

    // Calculate averages
    if (workHourRecords > 0) {
      // Convert average minutes back to time format
      const avgCheckInMinutes = Math.floor(
        totalCheckInMinutes / workHourRecords
      );
      const avgCheckInHours = Math.floor(avgCheckInMinutes / 60);
      const avgCheckInMins = avgCheckInMinutes % 60;
      stats.averageCheckInTime = `${avgCheckInHours
        .toString()
        .padStart(2, "0")}:${avgCheckInMins.toString().padStart(2, "0")}`;

      const avgCheckOutMinutes = Math.floor(
        totalCheckOutMinutes / workHourRecords
      );
      const avgCheckOutHours = Math.floor(avgCheckOutMinutes / 60);
      const avgCheckOutMins = avgCheckOutMinutes % 60;
      stats.averageCheckOutTime = `${avgCheckOutHours
        .toString()
        .padStart(2, "0")}:${avgCheckOutMins.toString().padStart(2, "0")}`;

      stats.totalWorkHours = parseFloat(stats.totalWorkHours.toFixed(2));
    }

    return stats;
  } catch (error) {
    console.error("Error calculating attendance stats: ", error);
    throw error;
  }
};

/**
 * Get team attendance overview for a specific date range
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @returns {Promise<Object>} - Team attendance overview
 */
export const getTeamAttendanceOverview = async (startDate, endDate) => {
  try {
    const users = await getAllUsers();
    const attendanceRef = collection(db, "attendance");
    const q = query(
      attendanceRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const snapshot = await getDocs(q);

    const attendanceRecords = snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));

    // Group attendance by user
    const attendanceByUser = {};
    attendanceRecords.forEach((record) => {
      if (!attendanceByUser[record.userId]) {
        attendanceByUser[record.userId] = [];
      }
      attendanceByUser[record.userId].push(record);
    });

    // Check if it's today's attendance
    const isTodayAttendance =
      startDate === endDate &&
      new Date(startDate).toDateString() === new Date().toDateString();

    let notMarkedToday = [];

    if (isTodayAttendance) {
      const markedTodayIds = new Set(attendanceRecords.map((r) => r.userId));
      notMarkedToday = users.filter((user) => !markedTodayIds.has(user._id));
    }

    // Initialize team stats
    const teamStats = {
      totalEmployees: users.length,
      presentPercentage: 0,
      remotePercentage: 0,
      absentPercentage: 0,
      leavePercentage: 0,
      averageWorkHours: 0,
      userStats: [],
      notMarkedToday: notMarkedToday.map((user) => ({
        userId: user._id,
        fullName: user.fullName,
        role: user.role,
      })),
    };

    let totalPresent = 0;
    let totalRemote = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalWorkHours = 0;
    let totalRecords = 0;

    // Calculate stats for each user
    for (const user of users) {
      const userAttendance = attendanceByUser[user._id] || [];

      let userPresent = 0;
      let userRemote = 0;
      let userAbsent = 0;
      let userLeave = 0;
      let userWorkHours = 0;

      userAttendance.forEach((record) => {
        if (record.status === "present") userPresent++;
        else if (record.status === "remote") userRemote++;
        else if (record.status === "absent") userAbsent++;
        else if (record.status === "leave") userLeave++;

        if (record.checkIn && record.checkOut) {
          const checkInDate = new Date(record.checkIn);
          const checkOutDate = new Date(record.checkOut);
          const workHours = (checkOutDate - checkInDate) / (1000 * 60 * 60);
          userWorkHours += workHours;
        }
      });

      // Add to team totals
      totalPresent += userPresent;
      totalRemote += userRemote;
      totalAbsent += userAbsent;
      totalLeave += userLeave;
      totalWorkHours += userWorkHours;
      totalRecords += userAttendance.length;

      // Add user stats to team stats
      teamStats.userStats.push({
        userId: user._id,
        fullName: user.fullName,
        role: user.role,
        totalDays: userAttendance.length,
        present: userPresent,
        remote: userRemote,
        absent: userAbsent,
        leave: userLeave,
        workHours: parseFloat(userWorkHours.toFixed(2)),
      });
    }

    // Calculate team percentages
    if (totalRecords > 0) {
      teamStats.presentPercentage = parseFloat(
        ((totalPresent / totalRecords) * 100).toFixed(2)
      );
      teamStats.remotePercentage = parseFloat(
        ((totalRemote / totalRecords) * 100).toFixed(2)
      );
      teamStats.absentPercentage = parseFloat(
        ((totalAbsent / totalRecords) * 100).toFixed(2)
      );
      teamStats.leavePercentage = parseFloat(
        ((totalLeave / totalRecords) * 100).toFixed(2)
      );
      teamStats.averageWorkHours = parseFloat(
        (totalWorkHours / totalRecords).toFixed(2)
      );
    }

    return teamStats;
  } catch (error) {
    console.error("Error calculating team attendance overview: ", error);
    throw error;
  }
};

// =================== HELPER FUNCTIONS ===================

/**
 * Check if a user exists in the database
 * @param {string} email - Email of the user to check
 * @returns {Promise<boolean>} - Whether the user exists
 */
export const checkUserExists = async (email) => {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking if user exists: ", error);
    throw error;
  }
};

/**
 * Get user by email
 * @param {string} email - Email of the user to fetch
 * @returns {Promise<Object|null>} - User object or null if not found
 */
export const getUserByEmail = async (email) => {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      _id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error fetching user by email: ", error);
    throw error;
  }
};
