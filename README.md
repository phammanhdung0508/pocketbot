# A. Pet Battle Bot

Đây là một bot được xây dựng bằng TypeScript và Node.js, tập trung vào một hệ thống chiến đấu và quản lý thú (pet). Bot cho phép người dùng tạo, chọn, và cho thú của mình tham gia vào các trận chiến theo lượt.

## Tính năng chính

- **Hệ thống chiến đấu Pet:** Các trận chiến theo lượt với logic tính sát thương, hiệu ứng trạng thái và kỹ năng.
- **Quản lý Pet:** Người dùng có thể tạo, xem danh sách, và cho pet nghỉ ngơi để hồi phục.
- **Hệ thống chỉ số và kỹ năng:** Mỗi loài pet có các chỉ số và kỹ năng riêng biệt.
- **Kiến trúc rõ ràng:** Dự án được cấu trúc theo các lớp Domain, Application, và Infrastructure để dễ dàng bảo trì và mở rộng.
- **Giao diện dòng lệnh (CLI):** Tương tác với bot thông qua các lệnh được định nghĩa sẵn.

## Cấu trúc thư mục

Dự án tuân theo một kiến trúc phân lớp để tách biệt các mối quan tâm:

```
src/
├── application/  # Chứa các use case và logic của ứng dụng
├── domain/       # Lõi nghiệp vụ (entities, enums, interfaces)
├── infrastructure/ # Triển khai các interface (repositories, services bên ngoài)
├── interfaces/   # Điểm vào của ứng dụng (command handlers)
└── shared/       # Các tiện ích dùng chung
```

## Yêu cầu

- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18.x trở lên)
- [npm](https://www.npmjs.com/) (thường đi kèm với Node.js)
- Bot đã được Deploy lên [Render](https://render.com/). Chỉ cần invite bot vào clan và sử dụng.
```
https://mezon.ai/developers/bot/install/1952273582008569856
```

## Cài đặt

1.  **Clone repository**
    ```bash
    git clone <URL_REPOSITORY_CUA_BAN>
    cd bot
    ```

2.  **Cài đặt dependencies**
    ```bash
    npm install
    ```

## Cấu hình

Dự án này sử dụng biến môi trường để quản lý cấu hình.

1.  Sao chép file `.env.example` thành một file mới tên là `.env`.
    ```bash
    cp .env.example .env
    ```

2.  Mở file `.env` và điền các giá trị cần thiết cho môi trường với Bot Token.

## Sử dụng

Dưới đây là các lệnh (scripts) có sẵn trong `package.json`:

-   **Chạy ở chế độ phát triển (Development)**
    Lệnh này sử dụng `ts-node` để chạy dự án trực tiếp từ mã nguồn TypeScript và tự động tải lại khi có thay đổi.
    ```bash
    npm run dev
    ```

-   **Biên dịch mã nguồn cho Production (Build)**
    Lệnh này biên dịch mã nguồn từ TypeScript sang JavaScript và đặt vào thư mục `dist`. Nó cũng sử dụng `tsc-alias` để sửa các đường dẫn alias.
    ```bash
    npm run build
    ```

-   **Chạy ứng dụng ở chế độ Production**
    Lệnh này chạy phiên bản JavaScript đã được biên dịch từ thư mục `dist`. Hãy chắc chắn bạn đã chạy `npm run build` trước đó.
    ```bash
    npm start
    ```


# B. Tổng quan về Pet Battle Bot

## 1. Ý Tưởng

Pet Battle Bot là một trò chơi giả lập cho phép bạn trở thành một nhà huấn luyện thú (pet). Ý tưởng cốt lõi là thu thập các loài pet khác nhau, mỗi loài có những chỉ số và kỹ năng độc đáo, và cho chúng tham gia vào các trận chiến theo lượt để khẳng định sức mạnh.

## 2. Logic Hoạt Động

Hiểu rõ logic hoạt động sẽ giúp bạn xây dựng chiến thuật tốt hơn.

### 2.1. Thuộc tính của Pet

Mỗi pet có các thuộc tính cơ bản quyết định sức mạnh của chúng trong trận đấu:

| Loài thú | Nguyên tố chính |
| :-- | :-- |
| **Dragon** | Lửa 🔥 |
| **Fish** | Nước 💧 |
| **Golem** | Đất 🪨 |
| **Bird** | Khí 💨 |
| **Eel** | Điện ⚡ |

- **Loài (Species):** Quyết định hình dáng và các chỉ số cơ bản của pet.
- **Nguyên tố (Element):** Như Lửa, Nước, Cỏ... Các nguyên tố có tính tương khắc, ảnh hưởng lớn đến sát thương gây ra và nhận vào. (Ví dụ: Lửa gây thêm sát thương cho Cỏ).
- **Tiến hóa (Evolve):** Thú sẽ tiến hóa theo mức levels 20, 40, 60, 100. Mỗi mức level sẽ cho phép mở khóa kĩ năng mới. Level 60 tiến hóa thêm một nguyên tố phụ và mở khóa hai kĩ năng đi kèm.
- **Các chỉ số chính:**
  - **HP (Health Points):** Sinh mệnh của pet. Khi HP về 0, pet sẽ thua.
  - **Attack (Tấn công):** Sức mạnh tấn công vật lý.
  - **Defense (Phòng thủ):** Khả năng chống chịu sát thương vật lý.
  - **Speed (Tốc độ):** Quyết định pet nào được ra đòn trước trong một lượt đấu.

### 2.2. Hệ Thống Chiến Đấu

- **Theo lượt (Turn-based):** Các trận đấu diễn ra theo từng lượt. Trong một lượt, pet có chỉ số `Speed` cao hơn sẽ được tấn công trước.
- **Sử dụng Kỹ năng (Skills):** Trong lượt của mình, pet sẽ sử dụng một kỹ năng đã học. Kỹ năng có thể gây sát thương, áp đặt hiệu ứng trạng thái (như làm chậm, độc, đốt, ...), hoặc tự buff cho bản thân.
- **Kết thúc trận đấu:** Trận đấu kết thúc khi HP của một trong hai pet về 0. Nếu HP cả hai vẫn chưa về 0 và quá 10 lượt sẽ được xem là hòa. 

### 2.3. Hồi Phục

Sau mỗi trận chiến, pet sẽ bị mất HP. Bạn cần cho pet nghỉ ngơi để hồi phục lại các chỉ số trước khi tham gia vào trận chiến tiếp theo.
- Cứ sau 60 phút pet sẽ hồi 100% Máu.

# 2.4 Khắc chế theo hệ.
| Nguyên tố | Mạnh chống | Yếu chống | Neutral |
| :-- | :-- | :-- | :-- |
| 🔥 **Lửa** | Khí (1.5x) | Nước (0.75x) | Đất, Điện |
| 💧 **Nước** | Lửa (1.5x) | Điện (0.75x) | Đất, Khí |
| 🪨 **Đất** | Điện (1.5x) | Khí (0.75x) | Lửa, Nước |
| 💨 **Khí** | Đất (1.5x) | Lửa (0.75x) | Nước, Điện |
| ⚡ **Điện** | Nước (1.5x) | Đất (0.75x) | Lửa, Khí |

## 3. Hướng Dẫn Sử Dụng Lệnh

Dưới đây là danh sách các lệnh bạn có thể sử dụng để tương tác với bot.

| Lệnh | Cách Dùng | Mô Tả | 
| --- | --- | --- |
| `*pet create` | `*pet create <tên_pet> <loài>` | Tạo một pet mới với tên và loài bạn chọn. |
| `*pet list` | `*pet list` | Hiển thị danh sách tất cả các pet. |
| `*pet details` | `*pet details <tên_pet>` | Xem thông tin chi tiết về một pet cụ thể (chỉ số, kỹ năng...). |
| `*pet select` | `*pet select <tên_pet>` | Chọn một pet làm pet chiến đấu chính của bạn. |
| `*pet battle` | `*pet battle @<đối_thủ>` | Bắt đầu một trận chiến với pet của người chơi khác. |
| `*pet rest` | `*pet rest <tên_pet>` | Cho một pet nghỉ ngơi để hồi phục HP. |
