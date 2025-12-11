const { getFirestoreDb, getFirebaseAdmin } = require("../config/firebase");
const { generateAccessToken, generateRefreshToken } = require("../middlewares/jwt");
const { validateUser, sanitizeUserData, getDefaultUserData } = require("../schemas/userSchema");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
require("dotenv").config();

const COLLECTION_NAME = process.env.FIREBASE_USERS_COLLECTION || "users";

// Helper function để map Firestore document
const mapUserDoc = (doc) => {
    if (!doc || !doc.exists) return null;
    return {
        id: doc.id,
        ...doc.data(),
    };
};

// Helper function để hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Helper function để so sánh password
const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Helper function để build user payload
const buildUserPayload = (data, includeTimestamps = true) => {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const user = {
        userName: data.userName,
    };

    // Password (đã được hash trước khi gọi hàm này)
    if (data.password !== undefined) user.password = data.password;
    
    // RefreshToken
    if (data.refreshToken !== undefined) user.refreshToken = data.refreshToken;

    if (!includeTimestamps) return user;

    return {
        ...user,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
};

// Tạo user mới
const createUser = async (data) => {
    // Validate data
    const validation = validateUser(data, false);
    if (!validation.isValid) {
        throw new Error(`Validation error: ${validation.errors.join(", ")}`);
    }

    // Sanitize data
    const sanitizedData = sanitizeUserData(data);
    const { userName, password } = sanitizedData;

    const db = getFirestoreDb();

    // Kiểm tra nếu người dùng đã tồn tại
    const existingUserQuery = await db
        .collection(COLLECTION_NAME)
        .where("userName", "==", userName)
        .limit(1)
        .get();

    if (!existingUserQuery.empty) {
        throw new Error("Người dùng đã tồn tại");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Build payload
    const userData = buildUserPayload(
        {
            userName,
            password: hashedPassword,
        },
        true
    );

    // Tạo user trong Firestore
    const docRef = await db.collection(COLLECTION_NAME).add(userData);
    const created = await docRef.get();
    return mapUserDoc(created);
};

// Login
const login = async (user) => {
    const { userName, password } = user;

    const db = getFirestoreDb();

    // Tìm user theo userName
    const userQuery = await db
        .collection(COLLECTION_NAME)
        .where("userName", "==", userName)
        .limit(1)
        .get();

    if (userQuery.empty) {
        throw new Error("Invalid credentials!");
    }

    const userDoc = userQuery.docs[0];
    const userData = mapUserDoc(userDoc);

    // Kiểm tra password
    const isPasswordCorrect = await comparePassword(password, userData.password);

    if (!isPasswordCorrect) {
        throw new Error("Invalid credentials!");
    }

    // Tạo tokens (không có role nữa, dùng "user" mặc định)
    const accessToken = generateAccessToken(userData.id, "user");
    const newRefreshToken = generateRefreshToken(userData.id);

    // Cập nhật refreshToken
    await db.collection(COLLECTION_NAME).doc(userData.id).update({
        refreshToken: newRefreshToken,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Trả về userData (không có password và refreshToken)
    const { password: pwd, refreshToken, ...safeUserData } = userData;

    return { userData: safeUserData, accessToken, newRefreshToken };
};

// Lấy danh sách users
const getUsers = async (page = 1, limit, fields, sort) => {
    try {
        const db = getFirestoreDb();
        const pageLimit = limit || parseInt(process.env.DEFAULT_LIMIT, 10) || 20;
        const pageNumber = Number(page) > 0 ? Number(page) : 1;
        const offset = (pageNumber - 1) * pageLimit;

        let query = db.collection(COLLECTION_NAME);

        // Xử lý search fields - Firestore không hỗ trợ regex
        // Chỉ hỗ trợ tìm kiếm đơn giản với where và >=, <=
        if (fields && Object.keys(fields).length > 0) {
            const firstField = Object.keys(fields)[0];
            const searchValue = fields[firstField];
            if (searchValue) {
                // Tìm kiếm không phân biệt hoa thường với range query
                const lowerValue = searchValue.toLowerCase();
                query = query
                    .where(firstField, ">=", lowerValue)
                    .where(firstField, "<=", lowerValue + "\uf8ff");
            }
        }

        // Sorting - Firestore yêu cầu index cho mỗi field được sort
        if (sort) {
            const sortFields = sort.split(",");
            const firstSort = sortFields[0];
            const fieldName = firstSort.startsWith("-") ? firstSort.substring(1) : firstSort;
            const direction = firstSort.startsWith("-") ? "desc" : "asc";
            query = query.orderBy(fieldName, direction);
        } else {
            query = query.orderBy("createdAt", "desc");
        }

        // Pagination
        if (offset > 0) {
            query = query.offset(offset);
        }
        query = query.limit(pageLimit);

        // Execute query
        const snapshot = await query.get();
        const totalSnapshot = await db.collection(COLLECTION_NAME).count().get();
        const total = totalSnapshot.data().count;

        // Map và loại bỏ password, refreshToken
        let users = snapshot.docs.map((doc) => {
            const user = mapUserDoc(doc);
            if (user) {
                delete user.password;
                delete user.refreshToken;
            }
            return user;
        });

        // Filter thêm nếu có nhiều fields search (client-side filtering)
        if (fields && Object.keys(fields).length > 1) {
            users = users.filter((user) => {
                for (const key in fields) {
                    if (fields[key] && user[key]) {
                        const userValue = String(user[key]).toLowerCase();
                        const searchValue = String(fields[key]).toLowerCase();
                        if (!userValue.includes(searchValue)) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }

        return {
            success: true,
            forms: users,
            total,
        };
    } catch (error) {
        console.error("Error in getUsers:", error);
        throw new Error("Failed to retrieve users");
    }
};

// Lấy user theo ID
const getUser = async (userId) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
    if (!doc.exists) return null;

    const user = mapUserDoc(doc);
    if (user) {
        delete user.password;
        delete user.refreshToken;
    }
    return user;
};

// Lấy user theo ID (cho admin)
const getUserById = async (id) => {
    const user = await getUser(id);
    if (!user) {
        throw new Error("Không tìm thấy người dùng");
    }
    return user;
};

// Xóa user
const deleteUser = async (userId) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();

    if (!doc.exists) {
        throw new Error("Không tìm thấy người dùng để xóa");
    }

    const user = mapUserDoc(doc);
    await db.collection(COLLECTION_NAME).doc(userId).delete();
    return user;
};

// Cập nhật user (user tự cập nhật)
const updateUser = async (userId, dataUpdate) => {
    const { userName } = dataUpdate;
    const db = getFirestoreDb();
    const admin = getFirebaseAdmin();

    // Kiểm tra userName trùng lặp
    if (userName) {
        const existingUserQuery = await db
            .collection(COLLECTION_NAME)
            .where("userName", "==", userName)
            .limit(1)
            .get();

        if (!existingUserQuery.empty && existingUserQuery.docs[0].id !== userId) {
            throw new Error("Tên người dùng đã tồn tại");
        }
    }

    // Kiểm tra user có tồn tại không
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
    if (!doc.exists) {
        throw new Error("Không tìm thấy người dùng để cập nhật");
    }

    // Build update data
    const updateData = {
        ...dataUpdate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Cập nhật
    await db.collection(COLLECTION_NAME).doc(userId).update(updateData);

    // Lấy lại user đã cập nhật
    const updated = await db.collection(COLLECTION_NAME).doc(userId).get();
    const user = mapUserDoc(updated);
    if (user) {
        delete user.password;
        delete user.refreshToken;
    }
    return user;
};

// Cập nhật user (admin)
const updateUserByAdmin = async (userId, dataUpdate) => {
    const { userName } = dataUpdate;
    const db = getFirestoreDb();

    // Kiểm tra userName trùng lặp
    if (userName) {
        const existingUserQuery = await db
            .collection(COLLECTION_NAME)
            .where("userName", "==", userName)
            .limit(1)
            .get();

        if (!existingUserQuery.empty && existingUserQuery.docs[0].id !== userId) {
            throw new Error("Tên người dùng đã tồn tại");
        }
    }

    // Kiểm tra user có tồn tại không
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
    if (!doc.exists) {
        throw new Error("Không tìm thấy người dùng để cập nhật");
    }

    // Build update data
    const updateData = {
        ...dataUpdate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Cập nhật
    await db.collection(COLLECTION_NAME).doc(userId).update(updateData);

    // Lấy lại user đã cập nhật
    const updated = await db.collection(COLLECTION_NAME).doc(userId).get();
    const user = mapUserDoc(updated);
    if (user) {
        delete user.password;
        delete user.refreshToken;
    }
    return user;
};

// Đổi mật khẩu (admin)
const changePasswordByAdmin = async (userId, newPassword) => {
    const db = getFirestoreDb();

    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
    if (!doc.exists) {
        throw new Error("User not found");
    }

    // Hash password mới
    const hashedPassword = await hashPassword(newPassword.password);

    // Cập nhật password
    await db.collection(COLLECTION_NAME).doc(userId).update({
        password: hashedPassword,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Lấy lại user
    const updated = await db.collection(COLLECTION_NAME).doc(userId).get();
    return mapUserDoc(updated);
};

// Đổi mật khẩu (user tự đổi)
const changePasswordByUser = async (userId, password) => {
    const db = getFirestoreDb();

    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();
    if (!doc.exists) {
        throw new Error("Không tìm thấy người dùng");
    }

    const user = mapUserDoc(doc);

    // Kiểm tra password hiện tại
    const isPasswordCorrect = await comparePassword(password.currentPassword, user.password);

    if (!isPasswordCorrect) {
        throw new Error("Mật khẩu hiện tại không đúng");
    }

    // Hash password mới
    const hashedPassword = await hashPassword(password.newPassword);

    // Cập nhật password
    await db.collection(COLLECTION_NAME).doc(userId).update({
        password: hashedPassword,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Lấy lại user
    const updated = await db.collection(COLLECTION_NAME).doc(userId).get();
    return mapUserDoc(updated);
};

// Xóa nhiều users
const deleteMultipleUsers = async (ids) => {
    const db = getFirestoreDb();
    const batch = db.batch();

    const deletePromises = ids.map((id) => {
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        return batch.delete(docRef);
    });

    await batch.commit();

    return {
        deletedCount: ids.length,
    };
};

// Lấy user theo refreshToken
const getUserByRefreshToken = async (userId, refreshToken) => {
    const db = getFirestoreDb();
    const doc = await db.collection(COLLECTION_NAME).doc(userId).get();

    if (!doc.exists) return null;

    const user = mapUserDoc(doc);
    if (user && user.refreshToken === refreshToken) {
        return user;
    }
    return null;
};

// Logout - xóa refreshToken
const logout = async (refreshToken) => {
    const db = getFirestoreDb();
    const admin = getFirebaseAdmin();

    // Tìm user có refreshToken này
    const userQuery = await db
        .collection(COLLECTION_NAME)
        .where("refreshToken", "==", refreshToken)
        .limit(1)
        .get();

    if (!userQuery.empty) {
        const userId = userQuery.docs[0].id;
        await db.collection(COLLECTION_NAME).doc(userId).update({
            refreshToken: "",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
};

// Tạo password reset token (đã loại bỏ vì không có passwordResetToken field)
// const createPasswordResetToken = async (userNameOrEmail) => {
//     throw new Error("Password reset functionality not available");
// };

// Reset password với token (đã loại bỏ vì không có passwordResetToken field)
// const resetPassword = async (token, newPassword) => {
//     throw new Error("Password reset functionality not available");
// };

module.exports = {
    createUser,
    login,
    getUser,
    getUsers,
    getUserById,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    deleteMultipleUsers,
    changePasswordByAdmin,
    changePasswordByUser,
    getUserByRefreshToken,
    logout,
    // createPasswordResetToken, // Đã loại bỏ
    // resetPassword, // Đã loại bỏ
};

