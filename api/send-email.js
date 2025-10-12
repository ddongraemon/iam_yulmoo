const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { campaignType, brandUrl, startDate, compensationType, compensationAmount, email, message } = req.body;

    // 필수 필드 검증
    if (!campaignType || !startDate || !compensationType || !email || !message) {
        return res.status(400).json({ error: '필수 필드를 모두 입력해주세요.' });
    }

    // 브랜드 URL이 있는 경우 형식 검증
    if (brandUrl && brandUrl.trim()) {
        try {
            new URL(brandUrl);
        } catch (error) {
            return res.status(400).json({ error: '올바른 URL 형식을 입력해주세요.' });
        }
    }

    // 보상금액이 있는 경우 검증
    if (compensationAmount !== undefined && compensationAmount !== null && compensationAmount !== '') {
        const amount = Number(compensationAmount);
        
        if (compensationType === '정액형(원)') {
            if (amount < 0) {
                return res.status(400).json({ error: '보상금액은 0 이상이어야 합니다.' });
            }
        } else if (compensationType === '수익배분형(%)') {
            if (amount < 0 || amount > 100) {
                return res.status(400).json({ error: '수익배분은 0부터 100까지 입력 가능합니다.' });
            }
        }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: '올바른 이메일 주소를 입력해주세요.' });
    }

    try {
        // Nodemailer 설정 (Gmail 예시)
        // 환경 변수에서 이메일 설정을 가져옵니다
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Vercel 환경 변수에 설정
                pass: process.env.EMAIL_PASS  // Gmail 앱 비밀번호
            }
        });

        // 날짜 포맷팅
        const formattedDate = new Date(startDate).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 메일 옵션
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'iamyulmoo@naver.com',
            replyTo: email,
                   subject: `[율무인데요 ${campaignType} 문의] 브랜드 링크 문의`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #ff6b9d; border-bottom: 2px solid #ff6b9d; padding-bottom: 10px;">새로운 ${campaignType} 문의가 도착했습니다</h2>
                    
                    <div style="background-color: #fff5f8; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff6b9d;">
                        <p style="margin: 8px 0;"><strong style="color: #333;">📢 캠페인 유형:</strong> <span style="color: #ff6b9d; font-weight: 600;">${campaignType}</span></p>
                        ${brandUrl && brandUrl.trim() ? `<p style="margin: 8px 0;"><strong style="color: #333;">🔗 브랜드·제품 링크:</strong> <a href="${brandUrl}" target="_blank" style="color: #9370db;">${brandUrl}</a></p>` : ''}
                        <p style="margin: 8px 0;"><strong style="color: #333;">📅 시작일정:</strong> ${formattedDate}</p>
                        <p style="margin: 8px 0;"><strong style="color: #333;">💰 보상형태:</strong> ${compensationType}</p>
                        ${compensationAmount && compensationAmount > 0 ? `<p style="margin: 8px 0;"><strong style="color: #333;">💵 보상금액:</strong> ${Number(compensationAmount).toLocaleString('ko-KR')}원</p>` : ''}
                        <p style="margin: 8px 0;"><strong style="color: #333;">✉️ 이메일:</strong> <a href="mailto:${email}" style="color: #9370db;">${email}</a></p>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong style="color: #333;">📝 문의 내용:</strong></p>
                        <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 12px;">
                        <p>이 메일은 율무인데요 웹사이트의 문의 폼을 통해 발송되었습니다.</p>
                        <p>답장하시려면 위의 이메일 주소로 직접 회신해주세요.</p>
                    </div>
                </div>
            `
        };

        // 메일 발송
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ 
            success: true, 
            message: '문의가 성공적으로 전송되었습니다!' 
        });

    } catch (error) {
        console.error('Email send error:', error);
        return res.status(500).json({ 
            error: '메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' 
        });
    }
};

