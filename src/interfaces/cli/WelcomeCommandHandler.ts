import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";

export class WelcomeCommandHandler implements CommandHandler {
  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const welcomeMessage = `
**PET BATTLE!**
🎮 **HƯỚNG DẪN NHANH:**

펫 **TẠO THÚ:**
• Dùng lệnh: *pet create <tên_thú> <loại>
• Các loài thú: dragon, fish, golem, bird, eel
• Các hệ nguyên tố: fire, water, earth, air, lightning
• Ví dụ: *pet create Rex dragon fire

📊 **THÔNG TIN THÚ:**
• *pet details <tên_thú>- Xem thông tin chi tiết và tất cả kỹ năng
• *pet list - Xem danh sách tất cả thú của bạn
• *pet rest - Cho phép thú nghỉ ngơi
• *pet select - Chọn thú xuất trận

⚔️ **CHIẾN ĐẤU:**
• *battle <@người_chơi> - Thách đấu người chơi khác
• Trận đấu có 10 vòng, thú sẽ tấn công nhau theo lượt
• Kỹ năng có thể gây hiệu ứng đặc biệt

📈 **CƠ CHẾ PHÁT TRIỂN:**
• thú lên cấp khi đạt đủ EXP (cấp × 100 EXP)
• Khi lên cấp, chỉ số HP, ATK, DEF, SPD sẽ tăng
• Mở khóa kỹ năng mới khi đạt cấp độ yêu cầu
• Tiến hóa ở cấp 10, 20, 60, 100

🌟 **BẮT ĐẦU NGAY:**
1. Tạo thú đầu tiên của bạn
2. Xem thông tin thú với *pet info hoặc *pet details
3. Thách đấu người chơi khác để kiểm tra sức mạnh
4. Thu thập nhiều thú với các hệ nguyên tố khác nhau
      `.trim();

      await message.reply(parseMarkdown(welcomeMessage));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Lỗi khi hiển thị hướng dẫn: ${error.message}`));
    }
  }
}