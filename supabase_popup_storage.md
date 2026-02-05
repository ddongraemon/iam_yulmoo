# 팝업 이미지 업로드용 Storage 버킷 설정

admin에서 **파일 업로드**로 팝업 이미지를 쓰려면 Supabase Storage 버킷이 필요합니다.

1. **Supabase 대시보드** → **Storage** → **New bucket**
2. 버킷 이름: **`popup`** (소문자)
3. **Public bucket** 체크 (팝업 이미지를 누구나 볼 수 있게)
4. **Create bucket** 클릭
5. 버킷 생성 후 **RLS 정책** 추가 (아래 둘 중 하나 선택):
   - **방법 A (권장)**  
     대시보드 → **SQL Editor** → 새 쿼리에서 **`supabase_popup_storage_policies.sql`** 파일 내용 전체 붙여넣기 → Run.
   - **방법 B**  
     Storage → **popup** 버킷 → **Policies** → New policy → "For full customization"로 INSERT/UPDATE/SELECT 각각 anon 허용 (bucket_id = 'popup').
6. 저장

이렇게 하면 서버/서버리스에서 `popup` 버킷에 이미지를 업로드하고, 업로드된 이미지 URL을 팝업 설정에 저장해 사용할 수 있습니다.
