# deploy_APP.md

`API.md`와 `deploy_AP.md`에서 확인한 백엔드 명세를 실제 앱 코드에 반영한 내역입니다.

## 적용 완료

- Refresh Token API는 실제 서버 응답 기준으로 body `{ "refreshToken": "..." }` 방식으로 연결했습니다.
- 로그아웃 API도 실제 서버 응답 기준으로 body `{ "refreshToken": "..." }` 방식으로 연결했습니다.
- 아이디 변경과 비밀번호 변경 성공 후 서버 명세에 맞춰 로컬 세션을 비우고 로그인 화면으로 이동하도록 변경했습니다.
- 회원가입 전 이메일 인증 응답은 정식 `verifiedToken`만 사용하도록 정리했습니다.
- 가입 후 이메일 인증(`/auth/email/verify`)과 인증 메일 재발송(`/auth/email/resend`) API 함수를 연결했습니다.
- 로그인 API 함수명을 실제 동작에 맞게 `login()`으로 정리했습니다.
- 프로필 이미지 파일 업로드는 실제 서버 기준 `POST /auth/profile/image`에 FormData 필드명 `image`로 전송하도록 연결했습니다.
- 내 북마크 목록은 `bookmarks[].post` 구조를 정확히 매핑하도록 수정했습니다.
- 좋아요/북마크 토글은 서버가 반환한 `liked`, `bookmarked` 값을 UI 최종 상태로 반영합니다.
- 업로드 이미지 AI 검색 결과에서 실제 `detectedProductId`가 있을 때만 `/posts/:id/detected-products`에 연결 요청을 보내도록 변경했습니다.
- `/ai/search` 응답이 명세처럼 좌표나 감지상품 id 없이 와도 앱이 깨지지 않도록 기본 핀 위치와 안전한 매핑을 유지했습니다.
- 게시글 업로드 후에는 `/posts/:id/detect`를 호출하고, `GET /posts/:id`를 폴링해 `detectionStatus`가 `COMPLETED`가 된 게시글 응답을 사용합니다. 상품 매칭은 서버가 자동 수행하므로 프론트는 `detectedProducts[].productId`와 함께 내려온 필드를 매핑만 합니다.
- AI 추천의 `detectedProducts`에 상품 상세 필드가 없을 수 있는 상황을 타입에서 허용했습니다.
- AI 추천의 `detectedProducts`에 상품명/브랜드/가격/이미지가 부족하면 `productId`로 `/products/:id`를 추가 조회해 결과를 보강합니다.
- 실제 AI 추천/게시글 상세 응답에서는 `detectedProducts`에 상품명/브랜드/이미지/가격/구매 URL이 포함되고 `productId`가 `null`일 수 있어, 상품 상세 id가 없으면 카드 상세 이동을 막고 카드 정보만 표시하도록 수정했습니다.
- 유저 프로필 카운트는 명세 필드인 `postsCount`, `followingsCount`, `followersCount`를 우선 사용하도록 수정했습니다.
- 다른 유저 프로필의 팔로워/팔로잉 숫자를 누르면 해당 유저 기준 `/users/:id/followers`, `/users/:id/followings` API를 호출하도록 연결했습니다.
- 팔로잉 피드와 팔로우 목록 새로고침은 캐시를 건너뛰고 서버에 다시 요청하도록 변경했습니다.
- 피드 목록, 트렌드 그리드, 내 게시글, 저장 목록, 다른 유저 게시글, 팔로워/팔로잉 목록에서 `nextCursor` 기반 무한 스크롤을 구현했습니다.
- 게시글 신고와 유저 신고는 `SPAM`, `ABUSE`, `INAPPROPRIATE`, `ETC` 사유 선택 및 최대 500자 상세 사유 입력 후 API로 전송하도록 구현했습니다.
- 상품 상세 화면은 구매 링크 없이 `brand`, `price`, `images` 중심으로 표시하도록 정리했습니다.
- 게시글 작성/수정 FormData의 해시태그 필드는 실제 서버가 받는 `hashtags[]`로 변경했습니다.

## 검증

```text
npx tsc --noEmit
npm run lint
```

두 명령 모두 통과했습니다.

## 아직 백엔드 확인이 필요한 부분

- `/ai/search`가 실제 감지상품 uuid와 좌표를 반환하지 않으면 업로드 화면의 상품 핀은 프론트 기본 위치로 표시되고, 감지상품 수정 API는 호출하지 않습니다.
- `/posts` 작성만으로 감지 큐가 자동 등록되는지, 별도 `/posts/:id/detect` 호출이 필요한지는 서버 정책 확인이 필요합니다. 현재 앱은 안전하게 별도 호출을 시도하고 실패해도 게시 자체는 유지합니다.
- `POST /auth/profile/image`는 FormData 필드명이 `image`일 때 201로 프로필 객체를 반환합니다. `profileImage` 또는 `file` 필드는 400입니다.
- `GET /products/:id`는 실제 상품 id 후보와 감지상품 id로 호출했을 때 500을 반환했습니다. 상품 상세 화면은 `productId`가 실제로 내려오는 경우에만 접근하도록 막아두었습니다.
- 관리자 API(`/posts/crawl/snap`, `/products/crawl/start`, `/products/embedding/retry`)는 앱 범위에서 제외했습니다.

## 실서버 프로브

최신 원본 응답은 `reports/api-probe/latest.json`에 저장했습니다.

확인 계정:

```text
TestUser2
```

확인 완료:

- 로그인, refresh, 내 프로필, 아이디 중복 확인
- 로그아웃
- 피드 목록, 게시글 상세, 게시글 작성/수정/감지/감지상품 수정/삭제
- 좋아요/북마크 토글 및 원복
- 팔로우/언팔로우 및 원복
- 내 북마크, 유저 상세, 유저 게시글, 팔로워/팔로잉, 팔로우 상태
- AI 채팅 세션, AI 추천, 이미지 검색
