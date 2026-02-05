# Instagram API 연동 가이드

현재 `instagram: {"followers":0,"posts":0,"views":0}` 로 나오는 이유는 **Instagram Graph API**가 요구하는 계정/ID 조건이 맞지 않기 때문입니다.

## 오류 원인

API 응답:
```text
Object with ID '2060956158019095' does not exist, cannot be loaded due to missing permissions,
or does not support this operation (error_subcode: 33)
```

- **Instagram Graph API**는 **일반 개인 계정 ID**가 아니라  
  **Facebook 페이지에 연결된 인스타그램 비즈니스/크리에이터 계정 ID**만 지원합니다.
- 사용 중인 `INSTAGRAM_USER_ID`가 위 조건에 맞는 ID가 아니거나,  
  토큰 권한/연결 상태 문제일 수 있습니다.

## 필요한 조건

1. 인스타그램 계정을 **비즈니스** 또는 **크리에이터** 계정으로 설정
2. 해당 인스타그램 계정을 **Facebook 페이지**에 연결
3. **올바른 Instagram 비즈니스 계정 ID** 사용 (Facebook 페이지를 통해 조회)
4. 액세스 토큰에 **instagram_basic**, **pages_show_list** 권한 포함

## 올바른 Instagram User ID 찾는 방법

1. [Meta for Developers](https://developers.facebook.com/) → **도구** → **Graph API 탐색기**
2. 앱 선택 후, **사용자 토큰** 발급  
   - 권한: `instagram_basic`, `pages_show_list`, `business_management` (가능하면)
3. 다음 호출로 **페이지 목록**과 연결된 **인스타그램 비즈니스 계정 ID** 확인:

   ```text
   GET /me/accounts?fields=instagram_business_account
   ```

4. 응답 예시:
   ```json
   {
     "data": [
       {
         "id": "페이지_ID",
         "instagram_business_account": {
           "id": "17841400000000000"   ← 이 값이 INSTAGRAM_USER_ID 로 사용할 ID
         }
       }
     ]
   }
   ```

5. `.env`의 **INSTAGRAM_USER_ID**를 위 `instagram_business_account.id` 값으로 변경  
   (토큰도 Graph API 탐색기에서 발급한 토큰 또는 같은 권한을 가진 토큰 사용)

## 토큰 권한

- **instagram_basic**: 프로필, 미디어 수 등
- **pages_show_list**: Facebook 페이지 목록 조회 → 인스타그램 비즈니스 계정 ID 확인용

장기 토큰은 [토큰 디버거](https://developers.facebook.com/tools/debug/accesstoken/)에서 만료일과 권한을 확인할 수 있습니다.

## 요약

| 항목 | 확인 사항 |
|------|------------|
| 계정 유형 | 인스타그램 **비즈니스** 또는 **크리에이터** |
| Facebook 연동 | 인스타그램이 **Facebook 페이지**에 연결됨 |
| INSTAGRAM_USER_ID | `/me/accounts?fields=instagram_business_account` 로 조회한 **instagram_business_account.id** |
| 토큰 권한 | instagram_basic, pages_show_list 포함 |

위 조건을 맞춘 뒤 `.env`를 수정하고 서버를 재시작하거나,  
`http://localhost:3000/api/update-all-stats` 를 호출해 다시 불러오면 됩니다.
