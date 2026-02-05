# Supabase 팝업 `version` 컬럼 추가 가이드

## 1. `version` 컬럼이 하는 일

- **용도:** admin에서 팝업을 **끄고 다시 켤 때**, “24시간 동안 보지 않기”를 **초기화**해서 팝업이 다시 뜨게 하는 데 쓰입니다.
- **동작:**
  - Admin에서 **팝업 ON**으로 저장할 때마다 서버가 이 값을 **새 숫자로 갱신**합니다.
  - 메인 페이지에서 설정을 불러올 때 **지금 서버의 version**과 **예전에 저장해 둔 version**을 비교합니다.
  - **서로 다르면** → “이번에는 새로 켠 팝업이구나”라고 보고, 24시간 보지 않기를 무시하고 **팝업을 다시 띄웁니다.**

즉, “관리자가 다시 켠 팝업”과 “사용자가 24시간 안 보기 한 팝업”을 구분하기 위한 **버전 번호**입니다.

---

## 2. 이미 `popup_settings` 테이블이 있을 때 (컬럼만 추가)

처음에 `supabase_popup_settings.sql`로 테이블만 만들고, **`version` 컬럼은 아직 없다**면 아래만 실행하면 됩니다.

### 2-1. Supabase 대시보드 접속

1. [https://supabase.com](https://supabase.com) 로그인
2. 해당 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2-2. 새 쿼리에서 아래 SQL 실행

**실행할 SQL (한 줄):**

```sql
ALTER TABLE popup_settings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;
```

**의미:**
- `ALTER TABLE popup_settings`  
  → `popup_settings` 테이블 구조를 변경한다.
- `ADD COLUMN`  
  → 새 컬럼을 추가한다.
- `IF NOT EXISTS`  
  → 같은 이름 컬럼이 이미 있으면 에러 없이 무시한다. (이미 추가했을 때 다시 실행해도 안전)
- `version`  
  → 컬럼 이름.
- `INTEGER DEFAULT 0`  
  → 정수형이고, 값을 안 넣으면 `0`으로 둔다.

### 2-3. 실행 방법

1. SQL Editor에서 **New query** 선택
2. 위 SQL을 복사해 붙여넣기
3. **Run** (또는 Ctrl+Enter) 클릭
4. 아래에 “Success. No rows returned” 같은 메시지가 나오면 **정상 적용**된 것입니다.

### 2-4. 적용 여부 확인 (선택)

**Table Editor**에서 확인하려면:

1. 왼쪽 **Table Editor** 클릭
2. **popup_settings** 테이블 선택
3. 컬럼 목록에 **version**이 있고, 기존 행의 값이 `0`으로 보이면 됩니다.

**SQL로 확인하려면:**

```sql
SELECT id, enabled, version FROM popup_settings WHERE id = 1;
```

`version` 컬럼이 보이고, 값이 `0` 또는 숫자면 정상입니다.

---

## 3. 아직 `popup_settings` 테이블이 없을 때 (처음부터 만들 때)

테이블을 **아직 한 번도 안 만들었다**면, `supabase_popup_settings.sql` 전체를 실행하는 방식이 좋습니다. 그 파일 안에 이미 다음이 들어 있습니다.

- `CREATE TABLE popup_settings ...`  
  → 테이블 생성
- `ALTER TABLE popup_settings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;`  
  → `version` 컬럼 추가
- `INSERT INTO popup_settings ... ON CONFLICT (id) DO NOTHING;`  
  → 기본 행 한 개 넣기 (이미 있으면 무시)

그래서 **처음 설정**이라면:

1. SQL Editor → New query
2. `supabase_popup_settings.sql` 파일 **전체 내용** 복사 후 붙여넣기
3. Run

이렇게 한 번만 실행하면 테이블 + `version` 컬럼 + 기본 행까지 한 번에 만들어집니다.

---

## 4. 정리

| 상황 | 할 일 |
|------|--------|
| **이미 `popup_settings` 테이블만 있음** | SQL Editor에서 `ALTER TABLE popup_settings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;` **한 번만** 실행 |
| **테이블이 아직 없음** | `supabase_popup_settings.sql` **전체**를 SQL Editor에 붙여넣고 Run |
| **이미 `version` 컬럼 추가한 적 있음** | 아무 것도 안 해도 됨. 같은 `ALTER`를 다시 실행해도 `IF NOT EXISTS` 때문에 에러 나지 않음 |

이렇게 하면 admin에서 off 후 다시 on 했을 때, 24시간 보지 않기를 무시하고 팝업이 다시 뜨는 기능이 정상 동작합니다.
