# Pet Battle Bot

Đây là một bot được xây dựng bằng TypeScript và Node.js, tập trung vào một hệ thống chiến đấu và quản lý thú cưng (pet). Bot cho phép người dùng tạo, chọn, và cho thú cưng của mình tham gia vào các trận chiến theo lượt.

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
