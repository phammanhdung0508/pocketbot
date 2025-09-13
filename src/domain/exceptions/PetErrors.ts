export class PetErrors {
  static readonly NOT_FOUND = "Không tìm thấy thú";
  static readonly LOW_ENERGY = (currentEnergy: number) => 
    `thú của bạn quá mệt để làm điều này! Năng lượng phải trên 50%. Năng lượng hiện tại: ${currentEnergy}%`;
  static readonly NO_PETS = "Bạn chưa có thú nào. Hãy tạo một con với `*pet create <tên> <loài> <hệ>`";
}