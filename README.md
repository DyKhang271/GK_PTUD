# Gallery App - Thư Viện Ảnh Cá Nhân & Quản Lý Người Dùng

Dự án này là một ứng dụng Web Full-stack bao gồm Backend xây dựng bằng **FastAPI** (Python) và Frontend xây dựng bằng **ReactJS** (Vite). Ứng dụng cho phép người dùng đăng ký, đăng nhập, tải ảnh cá nhân lên, xem, sửa và xóa tác phẩm của bản thân. Đồng thời có phân hệ phân quyền **Admin** đặc biệt để quản lý và xóa những người dùng vi phạm.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY DỰ ÁN

Để chạy dự án, bạn cần mở **2 cửa sổ Terminal (Command Prompt/PowerShell)** để chạy song song Backend và Frontend.

### Yêu cầu trước khi chạy
- Máy tính đã cài đặt **Python** (version 3.8 trở lên).
- Máy tính đã cài đặt **Node.js** (version 18 trở lên).

### Bước 1: Chạy Backend (Cửa sổ Terminal 1)
Backend chịu trách nhiệm cung cấp API, xử lý Database và xác thực tài khoản.

1. Mở Terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện Python theo yêu cầu:
   ```bash
   pip install -r requirements.txt
   ```
3. Khởi động Server (chạy ở cổng `8000`):
   ```bash
   uvicorn main:app --reload
   ```
   *Lưu ý: Lệnh `--reload` giúp Server tự động cập nhật khi bạn sửa code Backend.*
   > Nếu lỗi **không có quyền admin** khi dùng `pip`, hãy khắc phục bằng cách thêm hậu tố `--user`:
   > ```bash
   > pip install -r requirements.txt --user
   > ```

### Bước 2: Chạy Frontend (Cửa sổ Terminal 2)
Frontend cung cấp giao diện hiển thị web.

1. Mở một Terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện Node.js:
   ```bash
   npm install
   ```
3. Khởi động giao diện Web (chạy ở cổng `5173`):
   ```bash
   npm run dev
   ```

   **Xử lý lỗi khi chạy npm / Vite (Lệnh bị chặn / Script cannot be loaded):**
   Mở PowerShell với quyền Administrator (Ctrl + Shift + Enter) hoặc chạy với scope CurrentUser:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Bước 3: Đăng nhập vào App
- Mở trình duyệt web của bạn và truy cập: [http://localhost:5173](http://localhost:5173)
- **Tài khoản Admin mặc định:** (Hệ thống tự tạo sẵn khi bạn lần đầu bật Backend)
  - Tên đăng nhập: `admin`
  - Mật khẩu: `Admin@123`

---

## 🛠️ HƯỚNG DẪN CHỈNH SỬA CODE THEO CHỨC NĂNG

Dưới đây là sơ đồ giúp bạn nhanh chóng tìm ra đoạn code cần sửa nếu muốn thay đổi giao diện (Frontend) hoặc thay đổi xử lý Logic/Database (Backend).

### 1. FRONTEND (`frontend/src/`) - Giao diện Web
- **Màu sắc, Font chữ, Custom CSS:** Mọi thứ liên quan đến "đẹp - xấu" nằm ở file `frontend/src/index.css`.
- **Trang Đăng Nhập / Đăng Ký:** Sửa tại `pages/Login.jsx` và `pages/Register.jsx` (Gồm cả Form nhập liệu và Check Regex email/mk).
- **Trang Chủ Hiển Thị Ảnh (Gallery):** Sửa tại `pages/Gallery.jsx`. Đây là nơi gọi API lấy danh sách ảnh để vẽ ra lưới ảnh.
- **Bảng Quản Lý Người Dùng (Của Admin):** Theo dõi giao diện liệt kê danh sách tại `pages/Users.jsx`.
- **Khung Avatar & Thanh Điều Hướng (Navbar):** Chỉnh sửa các nút đăng xuất, menu nút "Quản lý User" tại `components/Navbar.jsx`.
- **Thẻ hiển thị 1 bức ảnh (Photo Card):** Bạn muốn chỉnh thẻ ảnh bo góc, nút Xoá sửa ảnh ra sao thì sửa vào `components/PhotoCard.jsx`.
- **Cửa sổ Tải ảnh lên (Upload Modal):** Tính năng kéo thả ảnh, nhập mô tả nằm ở `components/UploadModal.jsx`. 
- **Cấu hình đường dẫn kết nối với Backend:** Sửa URL API ở file `api.js` (`const API_BASE_URL = 'http://localhost:8000';`).
- **Lưu trữ trạng thái Đăng nhập (Context):** Sửa các cơ chế lưu JWT Token và LocalStorage trong `context/AuthContext.jsx`.

### 2. BACKEND (`backend/`) - Code Xử lý Cốt Lõi
- **Cấu hình Database (Kết nối file gallery.db):** Chỉnh sửa tại `database.py`. Bảng Database được mã hóa cứng thành file `gallery.db` trong folder này.
- **Cấu hình Bảng và Cột Dữ Liệu:** Tính năng tạo bảng như users (id, name, email) hay photos (id, title, user_id) nằm tại `models.py`.
- **Cấu hình Dữ liệu In/Out (Gói tin Data):** Định dạng dữ liệu Pydantic trả về và nhận vào API quy định ở `schemas.py`.
- **Logic Xác Thực (JWT Token & Băm mật khẩu):** Toàn bộ cơ chế bảo mật Bcrypt mã hóa mật khẩu và Token nằm trong `utils.py`.
- **Setup Chung & Nạp Server ban đầu:** File chạy gốc chứa CORS Middleware, Mount thư mục Uploads ảnh và tự nạp tài khoản Admin tên `main.py`.

#### Các Router API Xử lý Chính:
- **API Đăng ký, Đăng Nhập, Quản lý User:** Chỉnh sửa các Endpoints cho user tại `routers/auth.py`. 
    - Tính năng Admin xoá user cũng nằm ở file này (`@router.delete("/users/{user_id}")`).
- **API Xử Lý Hình ảnh (Upload / Xem / Xóa hình):** Chỉnh sửa Upload File và Load ảnh tại `routers/photos.py`. 
    - Các file ảnh vật lý được lưu trữ ở thư mục `backend/uploads/`.
https://github.com/DyKhang271/GK_PTUD.git

---

## 🗄️ XEM TOÀN BỘ DỮ LIỆU NGƯỜI DÙNG TRONG DATABASE

Chạy lệnh sau trong PowerShell (tại thư mục gốc dự án) để xem danh sách tài khoản đã đăng ký:

```powershell
@'
import sqlite3
# Lưu ý: Điều chỉnh đường dẫn backend\gallery.db tương ứng với file db của bạn
conn = sqlite3.connect(r'backend\gallery.db')
cur = conn.cursor()

rows = cur.execute("SELECT id, username, email FROM users ORDER BY id").fetchall()
print(f"{'ID':<5} {'USERNAME':<20} {'EMAIL'}")
print("-" * 60)
for r in rows:
    print(f"{r[0]:<5} {r[1]:<20} {r[2]}")

conn.close()
'@ | python -
```

---

## 🌐 GITHUB – QUẢN LÝ MÃ NGUỒN

### Lần đầu: Tạo repo local và đẩy lên GitHub
Trong thư mục gốc dự án `GK`:
```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DyKhang271/GK_PTUD.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Lần sau: Cập nhật code lên GitHub
Khi bạn đã chỉnh sửa xong code và muốn lưu lại:
```powershell
git add .
git commit -m "update code"
git push
```

### Chuyển sang máy khác hoặc lỡ xóa mất thư mục project
Mở Terminal ở một thư mục khác (Ví dụ: `D:\HocTap`) và clone lại bằng lệnh:
```powershell
git clone https://github.com/DyKhang271/GK_PTUD.git
cd GK_PTUD
```

---

## 📝 GHI CHÚ

- **JWT secret:** `dev-secret-key-change-in-prod`
- **Database:** `./backend/gallery.db` (hoặc `photos.db` tùy phiên bản code của bạn)
- **Thư mục upload ảnh:** `./backend/uploads`
https://github.com/Luv210105/Project_GK.git cu Thiên