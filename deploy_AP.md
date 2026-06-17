# deploy_AP.md

`API.md` 기준으로 현재 OMO 앱에 연결해야 하는 API 적용 지점, 요청 JSON, 응답 JSON, 코드 수정 필요 지점을 정리한 문서입니다.

Base URL은 현재 `config.js`의 `https://omo.hjun.kr/api/v1`을 사용합니다. 모든 인증 API는 `features/api/client.ts`의 `apiFetch`를 통해 호출하고, Access Token 인증은 기본적으로 `Authorization: Bearer <accessToken>` 헤더를 붙입니다.

## 1. 공통 API 클라이언트

대상 파일: `features/api/client.ts`

사용 목적:

- 모든 API 요청의 Base URL, JSON 파싱, 에러 처리, Access Token 자동 첨부
- 상대 이미지 경로(`/uploads/...`)를 API 서버 origin 기준 URL로 변환
- 401 발생 시 Refresh Token으로 Access Token 재발급

수정 필요:

- `API.md`는 `/auth/refresh`를 Refresh Token Authorization 헤더로 호출해야 한다고 명시합니다.
- 현재 코드는 refreshToken을 body로 보냅니다.

정식 요청 형식:

```http
POST /auth/refresh
Authorization: Bearer <refreshToken>
```

정식 응답 형식:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

수정 방향:

- `refreshAuthTokens()`와 `refreshTokens()`에서 body `{ "refreshToken": "..." }` 제거
- `Authorization: Bearer ${refreshToken}` 헤더 사용

## 2. 회원가입 / 로그인 / 인증

대상 파일:

- `features/onboarding/api.ts`
- `features/auth/api.ts`
- `app/(onboarding)/email.tsx`
- `app/(onboarding)/email-verify.tsx`
- `app/(onboarding)/username.tsx`
- `app/(onboarding)/password.tsx`
- `app/(onboarding)/profile.tsx`
- `app/(onboarding)/body.tsx`
- `app/(onboarding)/login.tsx`
- `features/onboarding/store.ts`
- `features/auth/store.ts`

### 2.1 아이디 중복 확인

사용 위치:

- 회원가입 아이디 입력 화면
- 계정 아이디 변경 화면

API:

```http
GET /auth/check-login-id?loginId=user123
```

응답:

```json
{
  "available": true
}
```

현재 상태:

- `checkUsername()`과 `checkAccountIdAvailable()`가 명세와 맞게 호출 중입니다.

### 2.2 이메일 인증 코드 발송

사용 위치:

- 회원가입 이메일 입력 화면

요청:

```json
{
  "email": "user@example.com"
}
```

응답:

```json
{
  "pendingToken": "uuid"
}
```

현재 상태:

- `sendVerificationCode(email)`가 명세와 맞게 호출 중입니다.
- 응답 타입에 `verificationCode?`가 남아 있는데 정식 명세에는 없습니다. 개발용 응답을 계속 받을지 확인이 필요합니다.

### 2.3 이메일 인증 코드 확인

사용 위치:

- 회원가입 이메일 인증 코드 입력 화면

요청:

```json
{
  "pendingToken": "uuid",
  "code": "123456"
}
```

응답:

```json
{
  "verifiedToken": "uuid"
}
```

현재 상태:

- `verifyCode(pendingToken, code)` 호출 경로는 맞습니다.
- 현재 타입은 `email`, `emailVerified`, `emailVerificationToken`도 허용합니다. 정식 명세는 `verifiedToken`만 반환합니다.

수정 필요:

- `getVerifiedToken()`은 `response.verifiedToken`만 사용하도록 정리 가능
- 백엔드가 현재 `emailVerificationToken`을 반환한다면 API.md 또는 백엔드 응답 중 하나를 통일해야 합니다.

### 2.4 회원가입

사용 위치:

- 온보딩 마지막 제출

요청:

```json
{
  "loginId": "user123",
  "email": "user@example.com",
  "password": "Password1!",
  "nickname": "닉네임",
  "styleKeyword": "CASUAL",
  "height": 175,
  "weight": 70,
  "verifiedToken": "uuid"
}
```

응답:

```json
{
  "id": "uuid",
  "loginId": "user123",
  "nickname": "닉네임",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

현재 상태:

- `signUp()`가 명세에 맞는 JSON을 보냅니다.
- 가입 후 자동 로그인(`/auth/login`)을 추가 호출합니다. 이 흐름은 API.md에 금지되어 있지 않으므로 유지 가능합니다.

### 2.5 로그인

사용 위치:

- 로그인 화면

요청:

```json
{
  "loginId": "user123",
  "password": "Password1!"
}
```

응답:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

현재 상태:

- `mockLogin()` 이름만 mock이고 실제 `/auth/login`을 호출합니다.

수정 권장:

- 함수명을 `login()`으로 변경하면 혼동이 줄어듭니다.

### 2.6 로그아웃

사용 위치:

- 마이페이지 / 설정 / 계정 관련 액션

정식 요청:

```http
DELETE /auth/logout
Authorization: Bearer <refreshToken>
```

응답:

```http
204 No Content
```

현재 상태:

- `logout()`이 refreshToken을 body로 보냅니다.

수정 필요:

- body 제거
- Refresh Token을 Authorization 헤더로 전송

### 2.7 전체 기기 로그아웃

정식 요청:

```http
DELETE /auth/logout/all
Authorization: Bearer <accessToken>
```

응답:

```http
204 No Content
```

현재 상태:

- `logoutAll()`은 명세와 맞습니다.

### 2.8 내 프로필 조회

사용 위치:

- 로그인 직후
- 마이페이지
- 프로필 편집 초기값

응답:

```json
{
  "id": "uuid",
  "loginId": "user123",
  "nickname": "닉네임",
  "email": "user@example.com",
  "isEmailVerified": true,
  "styleKeyword": "CASUAL",
  "height": 175,
  "weight": 70,
  "bio": "소개글",
  "profileImage": "https://...",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

현재 상태:

- `fetchMyProfile()`가 명세와 맞게 호출 중입니다.

### 2.9 프로필 수정

사용 위치:

- 프로필 편집 화면

요청:

```json
{
  "nickname": "닉네임",
  "styleKeyword": "CASUAL",
  "height": 175,
  "weight": 70,
  "bio": "소개글",
  "profileImage": "https://..."
}
```

응답:

```json
{
  "id": "uuid",
  "loginId": "user123",
  "nickname": "닉네임",
  "email": "user@example.com",
  "isEmailVerified": true,
  "styleKeyword": "CASUAL",
  "height": 175,
  "weight": 70,
  "bio": "소개글",
  "profileImage": "https://...",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

현재 상태:

- `updateMyProfile()` 호출 형식은 명세와 맞습니다.

확인 필요:

- `profileImage`가 URL 문자열만 가능한지, 앱에서 로컬 이미지 파일 업로드가 필요한지 확인해야 합니다. API.md는 URL만 허용합니다.

### 2.10 아이디 / 비밀번호 변경 / 회원 탈퇴

아이디 변경 요청:

```json
{
  "newLoginId": "new_user123",
  "currentPassword": "Password1!"
}
```

아이디 변경 응답:

```http
204 No Content
```

비밀번호 변경 요청:

```json
{
  "currentPassword": "Password1!",
  "newPassword": "NewPassword1!"
}
```

비밀번호 변경 응답:

```http
204 No Content
```

회원 탈퇴 요청:

```json
{
  "password": "Password1!"
}
```

회원 탈퇴 응답:

```http
204 No Content
```

현재 상태:

- `changeLoginId()`, `changePassword()`, `withdrawAccount()` 호출 경로와 요청 JSON은 명세와 맞습니다.
- 아이디/비밀번호 변경 후 “모든 기기 강제 로그아웃”이 명세에 있으므로 성공 후 로컬 토큰을 지우고 로그인 화면으로 보내야 합니다. 현재 `changeLoginId()`는 currentId만 바꾸고 토큰을 유지합니다.

수정 필요:

- `changeLoginId()` 성공 후 `clearAuthSession()` 처리 여부 결정
- `changePassword()` 성공 후 `clearAuthSession()` 처리 여부 결정

## 3. 게시글 / 피드 / 북마크

대상 파일:

- `features/feed/api.ts`
- `features/feed/store.ts`
- `app/(tabs)/index.tsx`
- `components/feed/following-feed.tsx`
- `components/feed/trend-grid.tsx`
- `components/feed/post-card.tsx`
- `app/post-detail.tsx`
- `app/(tabs)/my.tsx`

### 3.1 게시글 작성

사용 위치:

- 업로드 화면 게시 버튼

요청:

```http
POST /posts
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

FormData:

```text
title=내 코디
description=오늘의 코디 설명
hashtags=캐주얼
hashtags=데이트
images=<File>
```

응답:

```json
{
  "id": "uuid",
  "title": "제목",
  "description": "내용",
  "viewCount": 0,
  "likeCount": 0,
  "bookmarkCount": 0,
  "trendScore": 0,
  "detectionStatus": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": "uuid",
    "nickname": "닉네임",
    "profileImage": "https://..."
  },
  "images": [
    {
      "id": "uuid",
      "imageUrl": "/uploads/filename.jpg",
      "order": 0
    }
  ],
  "hashtags": [
    {
      "id": "uuid",
      "name": "해시태그"
    }
  ],
  "detectedProducts": []
}
```

현재 상태:

- `createPost()`가 FormData로 명세에 맞게 전송합니다.

### 3.2 게시글 목록

사용 위치:

- 홈 트렌딩 탭
- 팔로잉 피드

요청:

```http
GET /posts?sort=trending&limit=20
GET /posts?sort=following&limit=20&cursor=<nextCursor>
```

응답:

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "제목",
      "description": "내용",
      "viewCount": 10,
      "likeCount": 3,
      "bookmarkCount": 1,
      "trendScore": 5.2,
      "detectionStatus": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "nickname": "닉네임",
        "profileImage": null
      },
      "images": [
        {
          "id": "uuid",
          "imageUrl": "/uploads/...",
          "order": 0
        }
      ],
      "hashtags": [
        {
          "id": "uuid",
          "name": "태그"
        }
      ],
      "detectedProducts": [],
      "isLiked": false,
      "isBookmarked": false
    }
  ],
  "nextCursor": "uuid 또는 null"
}
```

현재 상태:

- `fetchPosts()`는 명세 응답 `posts`를 지원합니다.
- 현재 반환 타입이 `FeedPost[]`만 반환해서 `nextCursor`를 버립니다.

수정 필요:

- 무한 스크롤이 필요하면 `fetchPosts()` 반환 타입을 `{ posts: FeedPost[]; nextCursor: string | null }`로 변경

### 3.3 게시글 상세

사용 위치:

- 게시글 상세 화면

요청:

```http
GET /posts/:id
```

응답:

```json
{
  "id": "uuid",
  "title": "제목",
  "description": "내용",
  "viewCount": 10,
  "likeCount": 3,
  "bookmarkCount": 1,
  "trendScore": 5.2,
  "detectionStatus": "COMPLETED",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": "uuid",
    "nickname": "닉네임",
    "profileImage": null
  },
  "images": [],
  "hashtags": [],
  "detectedProducts": [],
  "isLiked": false,
  "isBookmarked": false
}
```

현재 상태:

- `fetchPost()` 연결 완료

### 3.4 게시글 수정 / 삭제

게시글 수정 요청:

```http
PATCH /posts/:id
Content-Type: multipart/form-data
```

FormData:

```text
title=수정 제목
description=수정 내용
hashtags=태그1
hashtags=태그2
images=<File>
```

게시글 수정 응답:

```json
{
  "id": "uuid",
  "title": "수정 제목",
  "description": "수정 내용",
  "images": [],
  "hashtags": [],
  "detectedProducts": []
}
```

게시글 삭제 응답:

```json
{
  "id": "uuid",
  "title": "삭제된 게시글"
}
```

현재 상태:

- `updatePost()`, `deletePost()` API 함수는 준비되어 있습니다.
- 실제 수정 화면이 보이지 않습니다. 필요하면 게시글 편집 UI 연결이 필요합니다.

### 3.5 좋아요 / 북마크

좋아요 응답:

```json
{
  "liked": true
}
```

북마크 응답:

```json
{
  "bookmarked": true
}
```

현재 상태:

- `togglePostLike()`, `togglePostBookmark()` 연결 완료
- 함수가 응답 값을 버립니다.

수정 권장:

- 서버 응답의 `liked`, `bookmarked` 값을 사용해 UI 상태를 서버 기준으로 동기화

### 3.6 내 북마크 목록

사용 위치:

- 마이페이지 저장 탭

요청:

```http
GET /posts/bookmarks/me?limit=20&cursor=<nextCursor>
```

응답:

```json
{
  "bookmarks": [
    {
      "id": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "post": {
        "id": "uuid",
        "title": "제목",
        "description": "내용",
        "images": [],
        "hashtags": [],
        "detectedProducts": [],
        "isLiked": false,
        "isBookmarked": true
      }
    }
  ],
  "nextCursor": "uuid 또는 null"
}
```

현재 상태:

- `fetchMyBookmarks()`는 `bookmarks` 배열을 그대로 `mapPost()`에 넘깁니다.

수정 필요:

- 명세 응답은 `bookmarks[].post` 안에 게시글이 있습니다.
- `listItems(response).map((bookmark) => mapPost(bookmark.post))` 형태의 전용 매핑이 필요합니다.

## 4. 업로드 / 이미지 AI 상품 검색 / 감지 상품 수정

대상 파일:

- `features/upload/api.ts`
- `app/(tabs)/upload.tsx`
- `features/feed/api.ts`
- `components/upload/*`

### 4.1 이미지 상품 검색

사용 위치:

- 업로드 화면에서 이미지 선택 후 상품 핀 추천

요청:

```http
POST /ai/search
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>
```

FormData:

```text
image=<File>
```

응답:

```json
{
  "items": [
    {
      "category": "상의",
      "croppedImagePath": "/uploads/cropped-xxx.jpg",
      "products": [
        {
          "id": "uuid",
          "name": "상품명",
          "brand": "브랜드",
          "price": 59000,
          "category": "상의",
          "score": 0.92
        }
      ]
    }
  ]
}
```

현재 상태:

- `searchImageProducts()`는 `/ai/search`를 호출합니다.
- 현재 UI 핀 위치는 `positionX`, `positionY`, `x`, `y`가 없으면 임시 위치를 계산합니다.

확인 필요:

- API.md의 `/ai/search` 응답에는 감지 상품 `id`, `positionX`, `positionY`, `width`, `height`, `productId`, `productUrl`, `thumbnailUrl`이 없습니다.
- 그런데 업로드 게시 후 `updateDetectedProducts()`는 감지 상품 id를 필요로 합니다.

결정 필요:

- `/ai/search`가 감지 상품 id와 좌표를 반환하도록 백엔드를 확장할지
- 또는 `/posts` 작성 후 `/posts/:id/detect` 결과에서 감지 상품 id를 다시 조회하는 흐름으로 바꿀지

### 4.2 게시글 감지 요청

사용 위치:

- 업로드 완료 직후

요청:

```http
POST /posts/:id/detect
```

응답:

```json
{
  "detectionStatus": "PENDING"
}
```

현재 상태:

- `triggerPostDetection()` 호출 완료
- 업로드 화면에서 게시글 생성 직후 호출합니다.

확인 필요:

- `POST /posts`에서 이미지 첨부 시 이미 `detectionStatus: "PENDING"`이므로, 별도로 `/posts/:id/detect`를 호출해야 하는지 확인해야 합니다.

### 4.3 감지 상품 수정

사용 위치:

- 업로드 화면에서 AI가 찾은 상품을 수동 수정한 뒤 게시글에 연결

요청:

```json
{
  "items": [
    {
      "id": "감지상품 uuid",
      "productId": "연결할 product uuid",
      "isEdited": true
    }
  ]
}
```

응답:

```json
{
  "id": "uuid",
  "title": "제목",
  "description": "내용",
  "detectedProducts": []
}
```

현재 상태:

- `updateDetectedProducts(post.id, items)` 함수는 명세와 맞습니다.
- 단, 현재 `products`의 `id`는 `/ai/search` 결과에서 만든 임시 id일 수 있습니다.

수정 필요:

- 감지 상품 수정에 넘기는 `items[].id`가 실제 DB의 detectedProduct uuid인지 보장해야 합니다.

## 5. AI 코디 추천

대상 파일:

- `features/ai/api.ts`
- `features/ai/store.ts`
- `app/(tabs)/ai.tsx`
- `app/ai-results.tsx`
- `app/ai-detail.tsx`

### 5.1 AI 채팅 세션 생성

요청:

```http
POST /ai/chat/session
```

응답:

```json
{
  "sessionId": "uuid"
}
```

현재 상태:

- `createAiChatSession()` 준비 완료
- 실제 `requestRecommendations()` 흐름에서 세션 생성/재사용 방식 확인 필요

### 5.2 텍스트 기반 코디 추천

사용 위치:

- AI 탭에서 자연어 입력

요청:

```json
{
  "message": "친구 만나러가는데 꾸안꾸 추천해줘",
  "sessionId": "uuid"
}
```

응답:

```json
{
  "sessionId": "uuid 또는 null",
  "posts": [
    {
      "id": "uuid",
      "title": "제목",
      "description": "내용",
      "viewCount": 136,
      "likeCount": 4,
      "bookmarkCount": 0,
      "trendScore": 0,
      "detectionStatus": "COMPLETED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "nickname": "닉네임",
        "profileImage": "https://..."
      },
      "images": [
        {
          "id": "uuid",
          "imageUrl": "/uploads/snap-xxx.jpg",
          "order": 0
        }
      ],
      "hashtags": [
        {
          "id": "uuid",
          "name": "데일리룩"
        }
      ],
      "detectedProducts": [
        {
          "id": "uuid",
          "category": "반소매 티셔츠",
          "confidence": 0.95,
          "positionX": 0.3,
          "positionY": 0.2,
          "width": 0.15,
          "height": 0.25,
          "productId": "uuid 또는 null",
          "isEdited": false
        }
      ],
      "isLiked": false,
      "isBookmarked": false,
      "musinsaUrl": "https://... 또는 null"
    }
  ]
}
```

현재 상태:

- `requestAiChatRecommendations()` 요청/응답 구조가 대체로 명세와 맞습니다.

수정 필요:

- `ApiChatProduct` 타입은 `name`, `brand`, `imageUrl`, `price`, `purchaseUrl`을 요구하지만 API.md의 `detectedProducts`에는 이 필드가 없습니다.
- 상품 상세/구매 링크를 AI 결과에서 보여주려면 백엔드가 `detectedProducts`에 product 상세를 포함하거나, 프론트가 `productId`로 `/products/:id`를 추가 조회해야 합니다.

## 6. 유저 / 팔로우

대상 파일:

- `features/social/api.ts`
- `app/user-profile.tsx`
- `app/follow-list.tsx`
- `components/social/*`
- `features/feed/api.ts`

### 6.1 유저 공개 프로필

요청:

```http
GET /users/:id
```

응답:

```json
{
  "id": "uuid",
  "nickname": "닉네임",
  "profileImage": "https://...",
  "bio": "소개글",
  "styleKeyword": "CASUAL",
  "followersCount": 10,
  "followingsCount": 5,
  "postsCount": 3,
  "isFollowing": false
}
```

현재 상태:

- `fetchUserProfile()` 연결 완료

수정 필요:

- 현재 매핑은 `postCount`, `followingCount`, `followerCount`를 우선 사용합니다.
- 명세는 `postsCount`, `followingsCount`, `followersCount`입니다.
- `ApiUser` 타입과 매핑에 명세 필드를 추가해야 합니다.

### 6.2 유저 게시글 목록

요청:

```http
GET /users/:id/posts?limit=20&cursor=<nextCursor>
```

응답:

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "제목",
      "isLiked": false,
      "isBookmarked": false
    }
  ],
  "nextCursor": "uuid 또는 null"
}
```

현재 상태:

- `fetchMyPosts()`, `fetchUserPosts()` 연결 완료
- `nextCursor`를 버립니다.

수정 필요:

- 페이지네이션이 필요하면 반환 타입 변경

### 6.3 팔로우 / 언팔로우

팔로우 응답:

```json
{
  "following": true
}
```

언팔로우 응답:

```json
{
  "following": false
}
```

현재 상태:

- `follow()`, `unfollow()` 연결 완료

### 6.4 팔로워 / 팔로잉 목록

요청:

```http
GET /users/:id/followers?limit=20&cursor=<nextCursor>
GET /users/:id/followings?limit=20&cursor=<nextCursor>
```

응답:

```json
{
  "items": [
    {
      "id": "uuid",
      "nickname": "닉네임",
      "profileImage": "https://...",
      "bio": "소개글",
      "isFollowing": true,
      "followedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "nextCursor": "uuid 또는 null",
  "hasNext": true
}
```

현재 상태:

- `fetchFollowers()`, `fetchFollowing()` 연결 완료
- 현재 내 팔로워/팔로잉만 currentUserId 기준으로 조회합니다.

확인 필요:

- `follow-list` 화면에서 다른 유저의 팔로워/팔로잉 목록도 보여야 하는지 확인 필요

### 6.5 팔로우 상태

응답:

```json
{
  "isFollowing": true,
  "isFollower": false
}
```

현재 상태:

- `fetchFollowStatus()` 연결 완료

## 7. 상품 상세

대상 파일:

- `features/products/api.ts`
- `app/product-detail.tsx`
- `components/feed/product-card.tsx`
- `components/feed/products-sheet.tsx`
- `components/upload/pin-product-card.tsx`

요청:

```http
GET /products/:id
```

응답:

```json
{
  "id": "uuid",
  "name": "상품명",
  "brand": "브랜드",
  "price": 59000,
  "category": "상의",
  "images": [
    {
      "id": "uuid",
      "imageUrl": "https://...",
      "order": 0
    }
  ]
}
```

현재 상태:

- `fetchProduct()` 연결 완료

수정 권장:

- API.md에는 `thumbnailUrl`, `productUrl`, `priceWon`, `brandName`이 없습니다.
- 현재 앱은 이 필드들도 허용합니다. 정식 응답에 맞춰 `brand`, `price`, `images` 중심으로 UI를 구성하면 됩니다.
- 구매 링크 버튼이 필요하면 API.md에 `productUrl` 필드 추가가 필요합니다.

## 8. 신고

대상 파일:

- `features/feed/api.ts`
- `features/social/api.ts`
- `components/feed/post-card.tsx`
- `app/user-profile.tsx`
- `components/social/other-profile-header.tsx`

게시글 신고 요청:

```json
{
  "reason": "ETC",
  "description": "상세 사유"
}
```

게시글 신고 응답:

```json
{
  "reported": true
}
```

유저 신고 요청:

```json
{
  "reason": "ETC",
  "description": "상세 사유"
}
```

유저 신고 응답:

```json
{
  "reported": true
}
```

현재 상태:

- `reportPost()`, `reportUser()` 호출 경로와 요청 JSON은 명세와 맞습니다.
- 현재 UI는 대부분 `reason: "ETC"`로 바로 신고합니다.

수정 필요:

- 신고 사유 선택 UI가 필요하면 `SPAM`, `ABUSE`, `INAPPROPRIATE`, `ETC` 선택 모달 추가
- 상세 사유 입력을 받을지 확인 필요

## 9. 관리자 API

대상 API:

- `POST /posts/crawl/snap`
- `POST /products/crawl/start`
- `POST /products/embedding/retry`

현재 상태:

- 앱 화면에서 관리자 기능을 호출하는 코드가 없습니다.

확인 필요:

- 모바일 앱에 ADMIN 화면이 필요한지 확인해야 합니다.
- 필요 없다면 프론트 작업 범위에서 제외합니다.

## 10. 우선 수정해야 할 정확한 지점

1. `features/api/client.ts`
   - `/auth/refresh` 요청을 body 방식에서 `Authorization: Bearer <refreshToken>` 방식으로 수정

2. `features/auth/api.ts`
   - `refreshTokens()`도 Refresh Token 헤더 방식으로 수정
   - `logout()`도 body 대신 Refresh Token 헤더 방식으로 수정
   - `changeLoginId()`, `changePassword()` 성공 후 강제 로그아웃 처리 필요

3. `features/onboarding/api.ts`
   - `VerifyCodeResponse`를 API.md의 `{ "verifiedToken": "uuid" }` 기준으로 정리
   - 개발용 `verificationCode`, `emailVerificationToken` 유지 여부 확인

4. `features/feed/api.ts`
   - `fetchMyBookmarks()`가 `bookmarks[].post`를 매핑하도록 수정
   - `fetchPosts()`, `fetchUserPosts()`, `fetchMyPosts()`에서 `nextCursor` 유지 여부 결정
   - 좋아요/북마크 토글 응답을 UI 상태 업데이트에 활용

5. `features/upload/api.ts`, `app/(tabs)/upload.tsx`
   - `/ai/search` 응답에 실제 detectedProduct id와 좌표가 오는지 확인
   - 현재 임시 id를 `/posts/:id/detected-products`에 넘길 위험이 있음
   - `/posts` 작성 후 `/posts/:id/detect`를 별도 호출해야 하는지 확인

6. `features/ai/api.ts`
   - `/ai/chat`의 `detectedProducts`에 상품명/브랜드/가격/이미지/구매 링크가 포함되는지 확인
   - 포함되지 않는다면 `productId`로 `/products/:id` 추가 조회 필요

7. `features/social/api.ts`
   - 유저 프로필 카운트 필드를 `followersCount`, `followingsCount`, `postsCount`도 읽도록 수정

8. `features/products/api.ts`
   - 상품 구매 링크가 앱에 필요하면 API.md에 `productUrl` 추가 필요

## 11. 사용자에게 확인해야 할 질문

1. Refresh/Logout API는 `API.md`처럼 Refresh Token을 Authorization 헤더로 보내는 방식이 확정인가요?
   응

2. 회원가입 전 이메일 인증 응답은 최종적으로 `{ "verifiedToken": "uuid" }`만 반환하나요, 아니면 현재 코드처럼 `emailVerificationToken`도 반환하나요?
   저런 토큰은 반환되지 않아

3. `/ai/search` 응답에 실제 detectedProduct uuid와 좌표(`positionX`, `positionY`, `width`, `height`)가 포함되나요?
   응 포함돼

4. 업로드 플로우에서 `/posts` 작성 후 `/posts/:id/detect`를 반드시 한 번 더 호출해야 하나요, 아니면 `/posts` 작성만으로 감지가 자동 큐 등록되나요?
   직접 요청해야 해

5. AI 추천 결과의 `detectedProducts`에 상품명, 브랜드, 가격, 이미지, 구매 링크가 포함되나요? 포함되지 않는다면 프론트에서 `/products/:id`를 추가 조회해도 되나요?
   웅 해도 돼

6. 상품 상세 화면에 구매 링크 버튼이 필요한가요? 필요하면 `/products/:id` 응답에 `productUrl`을 추가해야 합니다.
   아니 필요 없어

7. 신고 기능은 지금처럼 즉시 `ETC`로 신고해도 되나요, 아니면 신고 사유 선택/상세 입력 UI가 반드시 필요한가요?
   해도 돼

8. 모바일 앱에 관리자용 크롤링/임베딩 재시도 화면이 필요한가요?
   야내 필요없어

9. 피드, 유저 게시글, 북마크, 팔로워/팔로잉 목록에 무한 스크롤을 구현해야 하나요? 필요하면 현재 버리는 `nextCursor`를 store와 화면까지 전달해야 합니다.
   무한 스크롤 해야해

10. 프로필 이미지는 URL 문자열만 수정하면 되나요, 아니면 앱에서 이미지 파일 업로드까지 지원해야 하나요?
    파일 업로드를 지원해야 해
