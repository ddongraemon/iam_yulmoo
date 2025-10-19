// 시간대 테스트 스크립트
function getTodayDate() {
    const now = new Date();
    // UTC 시간에 9시간을 더해서 한국시간(KST)으로 변환
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const year = kstTime.getUTCFullYear();
    const month = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 기존 방식 (로컬 시간)
function getTodayDateOld() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

console.log('=== 시간대 테스트 ===');
console.log('현재 시간:', new Date().toISOString());
console.log('로컬 시간 기준 날짜:', getTodayDateOld());
console.log('한국시간(KST) 기준 날짜:', getTodayDate());

// UTC 시간대별 테스트
console.log('\n=== UTC 시간대별 테스트 ===');
const testTimes = [
    { utc: '2025-10-19T15:00:00Z', desc: 'UTC 15:00 (한국시간 00:00)' },
    { utc: '2025-10-19T14:59:59Z', desc: 'UTC 14:59:59 (한국시간 23:59:59)' },
    { utc: '2025-10-19T15:00:01Z', desc: 'UTC 15:00:01 (한국시간 00:00:01)' }
];

testTimes.forEach(test => {
    const testDate = new Date(test.utc);
    const kstTime = new Date(testDate.getTime() + (9 * 60 * 60 * 1000));
    const year = kstTime.getUTCFullYear();
    const month = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstTime.getUTCDate()).padStart(2, '0');
    const kstDate = `${year}-${month}-${day}`;
    
    console.log(`${test.desc}: ${kstDate}`);
});
