// 문항·판정 데이터는 웹앱 것을 그대로 쓴다.
// 복사본을 두면 문항을 고칠 때 웹과 미니앱이 갈라지고, 보정값(임계값)도
// 따로 놀게 된다. 두 파일 모두 외부 의존성이 없는 순수 데이터라 그대로
// 가져올 수 있다.
export * from "../../chinilpa-test/app/questions";
export * from "../../chinilpa-test/app/types";
