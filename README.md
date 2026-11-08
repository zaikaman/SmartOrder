# HE THONG QUAN LY DAT BAN VA GOI MON TRUC TUYEN - NHA HANG BEP VIET
### DO AN MON HOC CHUYEN DE J2EE (MICROSERVICES SPRING BOOT 3 & REACT 19)

---

## 1. TONG QUAN DE TAI

He thong quan ly dat ban va goi mon truc tuyen cho **Nha Hang Am Thuc Bep Viet** duoc thiet ke va xay dung theo mo hinh kien truc **Microservices** hien dai, phan tach ro rang giua Backend (Java 17 / Spring Boot 3.4) va Frontend (React 19 / TypeScript / Vite / Tailwind CSS).

He thong phuc vu day du 4 nhom doi tuong nguoi dung:
1. **Khach vang lai (Anonymous)**: Duyet thuc don 22 mon an am thuc Viet Nam theo danh muc, tra cuu so do ban trong theo khu vuc (Tang 1, Tang 2, VIP), quet ma QR tai ban de xem mon, tro chuyen va nho Tro ly AI tu van mam com gia dinh.
2. **Khach hang da dang nhap (CUSTOMER)**: Dang ky/dang nhap thuong hoac dang nhap 1-click bang Google OAuth2, dat ban truoc (chong trung khung gio), them mon vao gio hang va gui order, thanh toan truc tuyen qua cong VNPAY Sandbox, xem lich su don va tai hoa don PDF tieng Viet.
3. **Nhan vien nha hang (STAFF)**: Quan ly so do ban truc quan, tiep nhan va check-in khach, man hinh Bep KDS (Kitchen Order Board) dieu phoi tien do mon (Dang nau -> Da phuc vu -> Hoan tat).
4. **Quan tri vien (ADMIN)**: Toan quyen CRUD thuc don mon an (tai anh Cloudinary), quan ly so do ban va xuat anh PNG ma QR ban, quan ly tai khoan nguoi dung, xem bang dieu khien thong ke doanh thu va Top mon ban chay.

---

## 2. KIEN TRUC HE THONG & CONG DICH VU (PORTS MAPPING)

He thong duoc to chuc thanh 3 Backend Microservices doc lap va 1 Frontend Client:

| Thanh phan | Thu muc | Cong mac dinh | Chuc nang chinh |
|---|---|---|---|
| **Auth & User Service** | `backend/auth-user-service` | `8081` | Dang ky, dang nhap, Google OAuth2, cap phat & xac thuc JWT Token, quan ly phan quyen |
| **Catalog & Table Service** | `backend/catalog-table-service` | `8082` | CRUD thuc don, tai anh len Cloudinary, quan ly ban an, sinh ma QR (Google ZXing), Tro ly AI goi y mon an |
| **Booking & Order Service** | `backend/booking-order-service` | `8083` | Dat ban, goi mon, cap nhat trang thai Bep, thanh toan VNPAY Sandbox (HMAC-SHA512), gui email HTML qua Gmail SMTP, xuat hoa don PDF (OpenPDF), thong ke doanh thu |
| **Frontend Client** | `frontend` | `5173` | Giao dien nguoi dung React 19 + TypeScript + Vite + Tailwind CSS voi hon 14 man hinh |
| **Co so du lieu Cloud** | TiDB Cloud (Serverless) | `4000` | CSDL MySQL 8.0 Cloud mien phi (hoac H2 in-memory che do MySQL khi chay local) |

---

## 3. HUONG DAN CAI DAT & KHOI CHAY NHANH

### Yeu cau moi truong:
- **Node.js**: v18+ (khuyen dung v20 hoac v24)
- **Java JDK**: 17 LTS
- **Maven**: Da tich hop san Maven Wrapper (`mvnw.cmd` / `./mvnw`), khong can cai them Maven ben ngoai.

### Khoi chay toan bo he thong trong 1 cua so Terminal:
Tai thu muc goc cua du an `d:\DoAnJ2EE`:

```powershell
npm run start
```

Lenh tren se tu dong:
1. Giai phong cac cong `8081`, `8082`, `8083`, `5173` neu co tien trinh chiem dung (`clean-ports.js`).
2. Nap toan bo bien moi truong tu tep `.env`.
3. Khoi dong dong thoi ca 3 Spring Boot Microservices va may chu Frontend Vite.

Sau khi khoi dong xong, mo trinh duyet truy cap: **`http://localhost:5173`**

*(Nhan `Ctrl + C` de dung toan bo cac dich vu).*

---

## 4. TAI KHOAN MAU CO SAN (SEEDED ACCOUNTS)

He thong da khoi tao san 3 tai khoan tuong ung voi 3 vai tro de cham bai va trai nghiem:

| Vai tro | Ten dang nhap (`username`) | Mat khau (`password`) | Chuc nang trai nghiem |
|---|---|---|---|
| **Anonymous** | *(Khong can dang nhap)* | - | Xem thuc don, quet ma QR tai ban, tra cuu ban trong, AI goi y mam com |
| **Customer** | `customer` | `Customer@123` | Dat ban truoc, goi mon, thanh toan VNPAY, nhan email xac nhan, tai PDF hoa don |
| **Staff** | `staff` | `Staff@123` | Quan ly so do ban nhan vien (`/staff/tables`), man hinh Bep KDS (`/staff/orders`) |
| **Admin** | `admin` | `Admin@123` | Quan tri menu tai anh Cloudinary (`/admin/menu`), quan ly ban & QR (`/admin/tables`), thong ke doanh thu (`/admin/stats`), quan tri user (`/admin/users`) |

---

## 5. HUONG DAN KIEM THU THANH TOAN VNPAY SANDBOX

Khi thuc hien thanh toan don hang qua cong **VNPAY Sandbox**, he thong chuyen huong sang cong thanh toan test cua VNPAY. Su dung thong tin the thu nghiem sau:

- **Ngan hang**: NCB
- **So the**: `9704198526191432198`
- **Ten chu the**: `NGUYEN VAN A`
- **Ngay phat hanh**: `07/15`
- **Ma xac thuc OTP**: `123456`

Sau khi thanh toan thanh cong, VNPAY se tra ve trang ket qua tren he thong, don hang tu dong chuyen sang trang thai da thanh toan (`PAID`) va cho phep tai hoa don PDF ngay lap tuc.

---

## 6. KIEM TRA CHAT LUONG TOAN DU AN (AUTOMATED VERIFICATION)

Chay lenh sau tai thu muc goc de kiem tra toan bo Unit Test, Integration Test cua 3 Microservices va build kiem tra Frontend:

```powershell
npm run verify
```

---

## 7. HUONG DAN DEPLOY LEN CLOUD

### 7.1. Database Cloud: TiDB Cloud (Serverless)
- Dang ky tai khoan mien phi tai `https://tidbcloud.com`
- Tao Cluster Serverless khu vuc Singapore (ap-southeast-1).
- Lay thong tin Host, Port 4000, User va Password dien vao tep `.env`.

### 7.2. Frontend: Deploy len Vercel
1. Day ma nguon len GitHub.
2. Dang nhap Vercel, tao New Project va chon thu muc `frontend`.
3. Cau hinh Framework Preset: **Vite**.
4. Them cac bien moi truong:
   - `VITE_AUTH_API_URL`: URL cua Service 1 tren Cloud.
   - `VITE_CATALOG_API_URL`: URL cua Service 2 tren Cloud.
   - `VITE_ORDER_API_URL`: URL cua Service 3 tren Cloud.
   - `VITE_GOOGLE_CLIENT_ID`: Client ID Google OAuth2.
5. Bam **Deploy**.

### 7.3. Backend Microservices: Deploy qua Docker / Railway / Render / Heroku
Moi service deu da co san tệp `Dockerfile` multi-stage toi uu:
- `backend/auth-user-service/Dockerfile`
- `backend/catalog-table-service/Dockerfile`
- `backend/booking-order-service/Dockerfile`
- `backend/Procfile`

Tung service co the deploy doc lap len Railway hoac Render bang cach lien ket repository va chon Dockerfile tuong ung, sau do gan cac bien moi truong tu tệp `.env`.
