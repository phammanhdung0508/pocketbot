export class PetErrors {
  static readonly NOT_FOUND = "Không tìm thấy thú cưng";
  static readonly LOW_ENERGY = (currentEnergy: number) => 
    `Thú cưng của bạn quá mệt để làm điều này! Năng lượng phải trên 50%. Năng lượng hiện tại: ${currentEnergy}%`;
  static readonly NO_PETS = "Bạn chưa có thú cưng nào. Hãy tạo một con với `*pet create <tên> <loài> <hệ>`";
}