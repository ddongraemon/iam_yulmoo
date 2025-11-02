// 보상형태 선택에 따른 보상금액 필드 활성화/비활성화
document.addEventListener('DOMContentLoaded', () => {
    // 시작일정 최소 날짜를 오늘로 설정
    const startDateInput = document.getElementById('startDate');
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;

    const compensationTypeSelect = document.getElementById('compensationType');
    const compensationAmountInput = document.getElementById('compensationAmount');
    const compensationNote = document.getElementById('compensationNote');

    compensationTypeSelect.addEventListener('change', () => {
        const selectedType = compensationTypeSelect.value;
        
        if (selectedType === '정액형(원)') {
            // 정액형 선택 시
            compensationAmountInput.disabled = false;
            compensationAmountInput.required = true;
            compensationAmountInput.min = '0';
            compensationAmountInput.max = '';
            compensationAmountInput.placeholder = '보상금액을 입력해 주세요.';
            compensationNote.textContent = '* 보상금액은 0 이상이어야 합니다';
            compensationNote.style.display = 'block';
        } else if (selectedType === '수익배분형(%)') {
            // 수익배분형 선택 시
            compensationAmountInput.disabled = false;
            compensationAmountInput.required = true;
            compensationAmountInput.min = '0';
            compensationAmountInput.max = '100';
            compensationAmountInput.placeholder = '수익배분 비율을 입력해 주세요. (0-100)';
            compensationNote.textContent = '* 수익배분은 0부터 100까지 입력 가능합니다';
            compensationNote.style.display = 'block';
        } else if (selectedType === '미정·협의가능') {
            // 미정·협의가능 선택 시
            compensationAmountInput.disabled = true;
            compensationAmountInput.required = false;
            compensationAmountInput.value = ''; // 내용 지우기
            compensationAmountInput.placeholder = '-'; // Placeholder를 - 로 표시
            compensationNote.style.display = 'none';
        } else {
            // 선택 안 함 (초기 상태)
            compensationAmountInput.disabled = true;
            compensationAmountInput.required = false;
            compensationAmountInput.value = '';
            compensationAmountInput.placeholder = '보상형태를 먼저 선택해주세요.';
            compensationNote.style.display = 'none';
        }
    });
});

// 폼 제출 처리
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    const form = e.target;

    // 버튼 비활성화
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>전송 중...</span>';

    // 필수 필드 검증
    const requiredFields = [
        { name: '캠페인 유형', value: form.campaignType.value, field: 'campaignType' },
        { name: '시작일정(희망일)', value: form.startDate.value, field: 'startDate' },
        { name: '보상형태', value: form.compensationType.value, field: 'compensationType' },
        { name: '이메일', value: form.email.value.trim(), field: 'email' },
        { name: '문의내용', value: form.message.value.trim(), field: 'message' }
    ];

    // 빈 필드 검증
    for (const field of requiredFields) {
        if (!field.value) {
            formMessage.textContent = `❌ ${field.name}을(를) 입력해주세요.`;
            formMessage.classList.add('error');
            
            // 버튼 활성화
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>메일 보내기</span>';
            return;
        }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.value.trim())) {
        formMessage.textContent = '❌ 올바른 이메일 주소를 입력해주세요.';
        formMessage.classList.add('error');
        
        // 버튼 활성화
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>메일 보내기</span>';
        return;
    }

    // 보상금액 검증
    const compensationType = form.compensationType.value;
    const compensationAmount = form.compensationAmount.value.trim();
    
    if (compensationAmount) {
        const amount = Number(compensationAmount);
        
        if (compensationType === '정액형(원)') {
            if (amount < 0) {
                formMessage.textContent = '❌ 보상금액은 0 이상이어야 합니다.';
                formMessage.classList.add('error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>메일 보내기</span>';
                return;
            }
        } else if (compensationType === '수익배분형(%)') {
            if (amount < 0 || amount > 100) {
                formMessage.textContent = '❌ 수익배분은 0부터 100까지 입력 가능합니다.';
                formMessage.classList.add('error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>메일 보내기</span>';
                return;
            }
        }
    }

    // brandUrl 처리: 값이 있고 프로토콜이 없으면 자동으로 http:// 추가
    let brandUrl = form.brandUrl.value.trim();
    if (brandUrl && !brandUrl.match(/^https?:\/\//i)) {
        brandUrl = 'http://' + brandUrl;
    }

    // 폼 데이터 수집
    const formData = {
        campaignType: form.campaignType.value,
        brandUrl: brandUrl,
        startDate: form.startDate.value,
        compensationType: form.compensationType.value,
        compensationAmount: form.compensationAmount.value,
        email: form.email.value.trim(),
        message: form.message.value.trim()
    };

    try {
        // API 요청
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // 성공 메시지
            formMessage.textContent = '✓ ' + data.message;
            formMessage.className = 'form-message success show';
            
            // 폼 초기화
            form.reset();

            // 3초 후 메시지 숨기기
            setTimeout(() => {
                formMessage.classList.remove('show');
            }, 5000);
        } else {
            // 에러 메시지
            formMessage.textContent = '✗ ' + (data.error || '전송 실패');
            formMessage.className = 'form-message error show';
        }
    } catch (error) {
        console.error('Error:', error);
        formMessage.textContent = '✗ 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        formMessage.className = 'form-message error show';
    } finally {
        // 버튼 다시 활성화
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>메시지 보내기</span>';
    }
});

// Back to top 버튼
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 입력 필드 실시간 검증
const emailInput = document.getElementById('email');
emailInput.addEventListener('blur', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value && !emailRegex.test(emailInput.value)) {
        emailInput.style.borderColor = '#f44336';
    } else {
        emailInput.style.borderColor = '';
    }
});

emailInput.addEventListener('input', () => {
    emailInput.style.borderColor = '';
});

