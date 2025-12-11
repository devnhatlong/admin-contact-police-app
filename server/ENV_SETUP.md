# Environment Variables Setup

## Vấn đề: JWT_SECRET không được định nghĩa

Lỗi `"secretOrPrivateKey must have a value"` xảy ra khi `JWT_SECRET` không được set trong file `.env`.

## Giải pháp:

### 1. Tạo hoặc cập nhật file `.env` trong thư mục `server/`

Thêm dòng sau vào file `.env`:

```env
JWT_SECRET=your-secret-key-here-minimum-32-characters-long
```

### 2. Ví dụ file `.env` đầy đủ:

```env
# Server Configuration
PORT=8888

# JWT Configuration (BẮT BUỘC)
JWT_SECRET=your-very-long-and-secure-secret-key-here-change-this-in-production

# MongoDB Configuration (nếu vẫn dùng)
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password

# Firebase Configuration
FIREBASE_DB_URL=your-firebase-database-url
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_USERS_COLLECTION=users
FIREBASE_COMMUNES_COLLECTION=communes
FIREBASE_CONTACTS_COLLECTION=contacts

# Default Settings
DEFAULT_LIMIT=20
SECONDARY_PASSWORD=master117
```

### 3. Tạo JWT_SECRET ngẫu nhiên:

Bạn có thể tạo một secret key ngẫu nhiên bằng cách:

**Trên Windows (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Hoặc sử dụng Node.js:**
```javascript
require('crypto').randomBytes(64).toString('hex')
```

### 4. Sau khi thêm JWT_SECRET:

1. Lưu file `.env`
2. Khởi động lại server: `npm start` hoặc `npm run dev`

## Lưu ý:

- **KHÔNG** commit file `.env` lên git (đã có trong `.gitignore`)
- Sử dụng secret key mạnh (ít nhất 32 ký tự)
- Mỗi môi trường (dev, production) nên có secret key khác nhau

