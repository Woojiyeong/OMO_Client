import type { SocialUser } from './types';

export const MOCK_FOLLOWING: SocialUser[] = [
  { id: 'u01', name: '김민지', keyword: 'minimalist', bio: '데일리 미니멀 코디' },
  { id: 'u02', name: '이서준', keyword: 'street', bio: '스트릿 패션 즐기는 직장인' },
  { id: 'u03', name: '박소연', keyword: 'lovely', bio: '오늘도 러블리하게 ♡' },
  { id: 'u04', name: '최도윤', keyword: 'casual', bio: '데일리 캐주얼룩 공유' },
  { id: 'u05', name: '정하늘', keyword: 'formal', bio: '오피스 코디 전문' },
  { id: 'u06', name: '강유나', keyword: 'minimalist', bio: '톤온톤 좋아하는 사람' },
  { id: 'u07', name: '한지호', keyword: 'street', bio: 'OOTD 매일 업로드' },
  { id: 'u08', name: '서다은', keyword: 'lovely', bio: '핑크 빼면 시체' },
  { id: 'u09', name: '오태경', keyword: 'casual', bio: '청바지 마니아' },
  { id: 'u10', name: '윤지아', keyword: 'formal', bio: '셔츠 100벌 보유' },
  { id: 'u11', name: '임수빈', keyword: 'street', bio: '스니커즈 컬렉터' },
  { id: 'u12', name: '배준영', keyword: 'minimalist', bio: '검정 흰색 회색만 입어요' },
];

export const MOCK_FOLLOWERS: SocialUser[] = [
  { id: 'u02', name: '이서준', keyword: 'street', bio: '스트릿 패션 즐기는 직장인' },
  { id: 'u04', name: '최도윤', keyword: 'casual', bio: '데일리 캐주얼룩 공유' },
  { id: 'u07', name: '한지호', keyword: 'street', bio: 'OOTD 매일 업로드' },
  { id: 'u11', name: '임수빈', keyword: 'street', bio: '스니커즈 컬렉터' },
  { id: 'u13', name: '권나래', keyword: 'lovely', bio: '하늘하늘 원피스 좋아함' },
  { id: 'u14', name: '문성현', keyword: 'formal', bio: '슈트 입은 30대' },
  { id: 'u15', name: '백지수', keyword: 'casual', bio: '편한 옷이 최고' },
  { id: 'u16', name: '신은우', keyword: 'minimalist', bio: '미니멀 라이프 추구' },
  { id: 'u17', name: '조현우', keyword: 'street', bio: '오버사이즈 매니아' },
  { id: 'u18', name: '이채영', keyword: 'lovely', bio: '리본 디테일 ❤️' },
  { id: 'u19', name: '황민기', keyword: 'casual', bio: '편안함이 곧 멋' },
  { id: 'u20', name: '류지원', keyword: 'formal', bio: '클래식이 최고' },
];
