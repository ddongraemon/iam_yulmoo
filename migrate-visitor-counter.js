// 방문자 카운터 데이터 마이그레이션 스크립트
require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateVisitorCounter() {
    try {
        console.log('🚀 방문자 카운터 데이터 마이그레이션 시작...');
        
        // 기존 JSON 파일 읽기
        const jsonFile = './visitor-counter.json';
        if (!fs.existsSync(jsonFile)) {
            console.log('❌ visitor-counter.json 파일이 없습니다.');
            return;
        }
        
        const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
        console.log('📄 기존 데이터:', jsonData);
        
        // 오늘 날짜 가져오기
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayDate = `${year}-${month}-${day}`;
        
        // Supabase에 데이터 삽입
        const { data, error } = await supabase
            .from('visitor_counter')
            .upsert({
                date: todayDate,
                total: jsonData.total || 0,
                today: jsonData.today || 0,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'date'
            });
        
        if (error) {
            console.error('❌ 마이그레이션 오류:', error);
            return;
        }
        
        console.log('✅ 마이그레이션 완료!');
        console.log(`📊 TOTAL: ${jsonData.total}명, TODAY: ${jsonData.today}명`);
        
        // 기존 JSON 파일 백업 후 삭제
        const backupFile = `./visitor-counter-backup-${Date.now()}.json`;
        fs.copyFileSync(jsonFile, backupFile);
        fs.unlinkSync(jsonFile);
        
        console.log(`💾 기존 파일 백업: ${backupFile}`);
        console.log('🗑️ 기존 JSON 파일 삭제 완료');
        
    } catch (error) {
        console.error('❌ 마이그레이션 중 오류:', error);
    }
}

// 마이그레이션 실행
migrateVisitorCounter();





