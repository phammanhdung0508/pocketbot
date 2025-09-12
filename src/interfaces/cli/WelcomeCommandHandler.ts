import { CommandHandler } from "./CommandHandler";
import { ChannelMessage } from "mezon-sdk";
import { TextChannel } from "mezon-sdk/dist/cjs/mezon-client/structures/TextChannel";
import { Message } from "mezon-sdk/dist/cjs/mezon-client/structures/Message";
import { parseMarkdown } from "../../shared/utils/parseMarkdown";

export class WelcomeCommandHandler implements CommandHandler {
  async handle(channel: TextChannel, message: Message, channelMsg?: ChannelMessage): Promise<void> {
    try {
      const welcomeMessage = `
🌟 **CHÀO MỪNG ĐẾN VỚI THẾ GIỚI THÚ CƯNG CHIẾN ĐẤU!** 🌟

Chào mừng bạn đến với trò chơi nuôi dưỡng và chiến đấu thú cưng đầy thú vị! 
Hãy cùng khám phá thế giới của những chú thú cưng chiến đấu với các kỹ năng độc đáo!

🎮 **HƯỚNG DẪN NHANH:**

펫 **TẠO THÚ CƯNG:**
• Dùng lệnh: *pet create <tên> <loài> <hệ>
• Các loài thú cưng: dragon, fish, golem, bird, eel
• Các hệ nguyên tố: fire, water, earth, air, lightning
• Ví dụ: *pet create Rex dragon fire

📊 **THÔNG TIN THÚ CƯNG:**
• *pet info - Xem thông tin cơ bản của thú cưng
• *pet details - Xem thông tin chi tiết và tất cả kỹ năng
• *pet skills - Xem danh sách kỹ năng của thú cưng

⚡ **CHĂM SÓC THÚ CƯNG:**
• *pet feed - Cho thú cưng ăn để giảm đói
• *pet play - Chơi với thú cưng để tăng EXP
• *pet train - Huấn luyện để tăng chỉ số

⚔️ **CHIẾN ĐẤU:**
• *battle <@người_chơi> - Thách đấu người chơi khác
• Trận đấu có 3 vòng, mỗi vòng thú cưng sẽ tấn công
• Kỹ năng có thể gây hiệu ứng đặc biệt (đốt, đóng băng, tê liệt...)

📈 **CƠ CHẾ PHÁT TRIỂN:**
• Thú cưng lên cấp khi đạt đủ EXP (cấp × 100 EXP)
• Khi lên cấp, chỉ số HP, ATK, DEF, SPD sẽ tăng
• Mở khóa kỹ năng mới khi đạt cấp độ yêu cầu
• Tiến hóa ở cấp 10, 25 và 50

💡 **MẸO HỮU ÍCH:**
• Quản lý năng lượng và độ đói của thú cưng
• Học kỹ năng phù hợp với hệ nguyên tố của thú cưng
• Kết hợp các hệ nguyên tố để tạo hiệu ứng tốt nhất
• Mỗi loài thú cưng có bộ kỹ năng đặc trưng riêng

🌟 **BẮT ĐẦU NGAY:**
1. Tạo thú cưng đầu tiên của bạn
2. Chăm sóc và huấn luyện để tăng chỉ số
3. Thách đấu người chơi khác để kiểm tra sức mạnh
4. Thu thập nhiều thú cưng với các hệ nguyên tố khác nhau

Chúc bạn có những trải nghiệm thú vị trong thế giới thú cưng chiến đấu!
      `.trim();

      await message.reply(parseMarkdown(welcomeMessage));
    } catch (error: any) {
      await message.reply(parseMarkdown(`Lỗi khi hiển thị hướng dẫn: ${error.message}`));
    }
  }
}