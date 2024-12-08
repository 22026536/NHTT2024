function calculateTicketPrice(seatType, dayOfWeek, showTime) {
    let basePrice = 0;

    // Xác định giá cơ bản dựa trên loại ghế
    switch (seatType) {
        case '0':
            basePrice = 30000;
            break;
        case '1':
            basePrice = 40000;
            break;
        case '2':
            basePrice = 50000;
            break;
        default:
            throw new Error('Loại ghế không hợp lệ');
    }

    // Chuyển đổi dayOfWeek từ chuỗi thành số tương ứng
    const dayMap = {
        Monday: 2,
        Tuesday: 3,
        Wednesday: 4,
        Thursday: 5,
        Friday: 6,
        Saturday: 7,
        Sunday: 8
    };

    const dayNumber = dayMap[dayOfWeek];
    if (!dayNumber) {
        throw new Error('Ngày không hợp lệ');
    }

    // Tăng giá theo ngày trong tuần
    if (dayNumber >= 2 && dayNumber <= 5) {
        basePrice += 5000; // Thứ 2 - Thứ 5: +5k
    } else if (dayNumber >= 6 && dayNumber <= 8) {
        basePrice += 10000; // Thứ 6 - Chủ Nhật: +10k
    }

    // Tăng giá theo khung giờ
    const hour = parseInt(showTime.split(':')[0]); // Lấy giờ từ chuỗi "hh:mm"
    if (hour >= 18 && hour <= 23) {
        basePrice += 10000; // Khung giờ 18h - 23h: +10k
    } else {
        basePrice += 5000; // Các khung giờ khác: +5k
    }

    return basePrice;
}

export default calculateTicketPrice;