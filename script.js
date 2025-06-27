// Format số với dấu phẩy phân cách (hỗ trợ số thập phân)
function formatNumber(num) {
    const parts = num.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
}

// Loại bỏ dấu phẩy và chuyển về số (hỗ trợ số thập phân)
function parseNumber(str) {
    return parseFloat(str.replace(/,/g, '')) || 0;
}

// Format tiền tệ Việt Nam
function formatCurrency(amount) {
    return formatNumber(Math.round(amount)) + ' VNĐ';
}

// Xử lý input số với dấu phẩy (hỗ trợ số thập phân)
function setupNumberInput(element) {
    element.addEventListener('focus', function() {
        if (this.value === '0' || this.placeholder === '0') {
            this.value = '';
        }
    });

    element.addEventListener('input', function() {
        let value = this.value;
        
        // Chỉ cho phép số, dấu chấm và dấu phẩy
        value = value.replace(/[^\d.,]/g, '');
        
        // Chỉ cho phép một dấu chấm
        const dotCount = (value.match(/\./g) || []).length;
        if (dotCount > 1) {
            value = value.substring(0, value.lastIndexOf('.'));
        }
        
        if (value === '') {
            this.value = '';
            return;
        }
        
        // Tách phần nguyên và phần thập phân
        const parts = value.split('.');
        if (parts[0]) {
            parts[0] = parts[0].replace(/,/g, ''); // Loại bỏ dấu phẩy cũ
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Thêm dấu phẩy mới
        }
        
        this.value = parts.join('.');
    });

    element.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = '';
        }
    });
}

// Xử lý input tiền tệ (chỉ số nguyên)
function setupCurrencyInput(element) {
    element.addEventListener('focus', function() {
        if (this.value === '0' || this.placeholder === '0') {
            this.value = '';
        }
    });

    element.addEventListener('input', function() {
        let value = this.value.replace(/[^\d]/g, '');
        if (value === '') {
            this.value = '';
            return;
        }
        this.value = formatNumber(value);
    });

    element.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = '';
        }
    });
}

// Biến để kiểm soát tính toán tự động
let autoCalculationEnabled = false;

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Setup number inputs
    document.querySelectorAll('.number-input').forEach(setupNumberInput);
    document.querySelectorAll('.currency-input').forEach(setupCurrencyInput);

    // Toggle productivity bonus
    document.getElementById('bonusType').addEventListener('change', function() {
        const productivityDiv = document.getElementById('productivityBonusDiv');
        if (this.value === 'productivity') {
            productivityDiv.style.display = 'block';
            productivityDiv.classList.add('fade-in');
        } else {
            productivityDiv.style.display = 'none';
        }
        
        // Tính toán lại nếu đã có dữ liệu cơ bản
        const basicSalary = document.getElementById('basicSalary').value;
        const workingDays = document.getElementById('workingDays').value;
        if (basicSalary && workingDays) {
            if (autoCalculationEnabled) {
                calculateSalaryQuiet(); // Tính toán không scroll
            }
        }
    });

    // Form submission
    document.getElementById('salaryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        autoCalculationEnabled = true; // Bật tính toán tự động sau khi nhấn nút
        calculateSalary();
    });

    // Real-time calculation (chỉ khi đã nhấn nút tính lương)
    document.querySelectorAll('input, select').forEach(element => {
        // Bỏ qua bonusType vì đã xử lý riêng ở trên
        if (element.id === 'bonusType') return;
        
        element.addEventListener('input', function() {
            if (autoCalculationEnabled) {
                const basicSalary = document.getElementById('basicSalary').value;
                const workingDays = document.getElementById('workingDays').value;
                if (basicSalary && workingDays) {
                    calculateSalaryQuiet(); // Tính toán không scroll
                }
            }
        });
    });

    // Xử lý riêng cho productivity bonus input
    document.getElementById('productivityBonus').addEventListener('input', function() {
        if (autoCalculationEnabled) {
            const basicSalary = document.getElementById('basicSalary').value;
            const workingDays = document.getElementById('workingDays').value;
            if (basicSalary && workingDays) {
                calculateSalaryQuiet(); // Tính toán không scroll
            }
        }
    });
});

function calculateSalary() {
    performCalculation();
    // Scroll to results khi nhấn nút
    const resultsDiv = document.getElementById('results');
    if (resultsDiv.style.display === 'block') {
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
}

function calculateSalaryQuiet() {
    // Tính toán mà không scroll
    performCalculation();
}

function performCalculation() {
    // Lấy giá trị từ form
    const basicSalary = parseNumber(document.getElementById('basicSalary').value);
    const workingDays = parseNumber(document.getElementById('workingDays').value);
    const holidayDays = parseNumber(document.getElementById('holidayDays').value);
    const annualLeave = parseNumber(document.getElementById('annualLeave').value);
    const paidLeave = parseNumber(document.getElementById('paidLeave').value);
    const regularOvertime = parseNumber(document.getElementById('regularOvertime').value);
    const sundayOvertime = parseNumber(document.getElementById('sundayOvertime').value);
    const nightShift = parseNumber(document.getElementById('nightShift').value);
    const bonusType = document.getElementById('bonusType').value;
    const productivityBonus = parseNumber(document.getElementById('productivityBonus').value);

    // Kiểm tra dữ liệu đầu vào
    if (!basicSalary || !workingDays) {
        return;
    }

    // Tính toán các khoản
    const dailyRate = basicSalary / 26;
    const hourlyRate = dailyRate / 8;

    // Thu nhập cơ bản
    const workingDaysPay = dailyRate * workingDays;
    const holidayPay = dailyRate * holidayDays;
    const annualLeavePay = dailyRate * annualLeave;
    const paidLeavePay = dailyRate * paidLeave;
    const regularOvertimePay = hourlyRate * regularOvertime * 1.5;
    const sundayOvertimePay = hourlyRate * sundayOvertime * 2;
    const nightShiftPay = (hourlyRate * 0.3 * nightShift) + (nightShift / 8 * 10000);
    
    // Thưởng chuyên cần: 700k/26*số ngày làm việc
    const attendanceBonus = (700000 / 26) * workingDays;
    
    // Trợ cấp nhà trọ: 200k/26*số ngày làm việc
    const housingAllowance = (200000 / 26) * workingDays;
    
    // Trợ cấp đi lại: 200k/26*số ngày làm việc
    const transportAllowance = (200000 / 26) * workingDays;
    
    // Thưởng hiệu suất/năng suất
    let performanceBonus = 0;
    if (bonusType === 'efficiency') {
        // Thưởng hiệu suất: 900k/26*số ngày làm việc
        performanceBonus = (900000 / 26) * workingDays;
    } else {
        // Thưởng năng suất: số tiền nhập vào
        performanceBonus = productivityBonus;
    }

    // Tổng thu nhập
    const totalIncome = workingDaysPay + holidayPay + annualLeavePay + paidLeavePay + 
                      regularOvertimePay + sundayOvertimePay + nightShiftPay + 
                      attendanceBonus + housingAllowance + transportAllowance + performanceBonus;

    // Khấu trừ
    const socialInsurance = basicSalary * 0.105;
    const unionFee = 30000;
    const totalDeductions = socialInsurance + unionFee;

    // Thực lãnh
    const netSalary = totalIncome - totalDeductions;

    // Hiển thị kết quả
    displayResults({
        workingDaysPay,
        holidayPay,
        annualLeavePay,
        paidLeavePay,
        regularOvertimePay,
        sundayOvertimePay,
        nightShiftPay,
        attendanceBonus,
        housingAllowance,
        transportAllowance,
        performanceBonus,
        totalIncome,
        socialInsurance,
        unionFee,
        totalDeductions,
        netSalary,
        bonusType
    });
}

function displayResults(calc) {
    // Thu nhập
    const incomeHTML = `
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-calendar-day me-1"></i>Ngày làm việc:</span>
                <span class="amount total-income small">${formatCurrency(calc.workingDaysPay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-glass-cheers me-1"></i>Ngày lễ:</span>
                <span class="amount total-income small">${formatCurrency(calc.holidayPay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-umbrella-beach me-1"></i>Phép năm:</span>
                <span class="amount total-income small">${formatCurrency(calc.annualLeavePay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-bed me-1"></i>Nghỉ hưởng lương:</span>
                <span class="amount total-income small">${formatCurrency(calc.paidLeavePay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-clock me-1"></i>Tăng ca thường:</span>
                <span class="amount total-income small">${formatCurrency(calc.regularOvertimePay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-sun me-1"></i>Tăng ca CN:</span>
                <span class="amount total-income small">${formatCurrency(calc.sundayOvertimePay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-moon me-1"></i>Ca đêm:</span>
                <span class="amount total-income small">${formatCurrency(calc.nightShiftPay)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-medal me-1"></i>Thưởng chuyên cần:</span>
                <span class="amount total-income small">${formatCurrency(calc.attendanceBonus)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-home me-1"></i>TC nhà trọ:</span>
                <span class="amount total-income small">${formatCurrency(calc.housingAllowance)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-bus me-1"></i>TC đi lại:</span>
                <span class="amount total-income small">${formatCurrency(calc.transportAllowance)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-award me-1"></i>${calc.bonusType === 'efficiency' ? 'Hiệu suất' : 'Năng suất'}:</span>
                <span class="amount total-income small">${formatCurrency(calc.performanceBonus)}</span>
            </div>
        </div>
        <hr class="my-2">
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <strong><span class="small">Tổng Thu Nhập:</span></strong>
                <strong><span class="amount total-income small">${formatCurrency(calc.totalIncome)}</span></strong>
            </div>
        </div>
    `;

    // Khấu trừ
    const deductionHTML = `
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-shield-alt me-1"></i>BHXH/BHYT/BHTN:</span>
                <span class="amount total-deduction small">${formatCurrency(calc.socialInsurance)}</span>
            </div>
        </div>
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <span class="small"><i class="fas fa-users me-1"></i>Phí công đoàn:</span>
                <span class="amount total-deduction small">${formatCurrency(calc.unionFee)}</span>
            </div>
        </div>
        <hr class="my-2">
        <div class="calculation-row">
            <div class="d-flex justify-content-between">
                <strong><span class="small">Tổng Khấu Trừ:</span></strong>
                <strong><span class="amount total-deduction small">${formatCurrency(calc.totalDeductions)}</span></strong>
            </div>
        </div>
    `;

    document.getElementById('incomeDetails').innerHTML = incomeHTML;
    document.getElementById('deductionDetails').innerHTML = deductionHTML;
    document.getElementById('netSalary').textContent = formatCurrency(calc.netSalary);

    // Hiện kết quả
    const resultsDiv = document.getElementById('results');
    resultsDiv.style.display = 'block';
    resultsDiv.classList.add('fade-in');
}
