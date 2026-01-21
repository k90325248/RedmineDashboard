/** API 交互錯誤 */
export interface ApiErrorData {
  /** 錯誤代碼 */
  code: number;
  /** 錯誤標題 */
  message: string;
}

/** API 回傳錯誤 */
export interface ApiReturnErrorData<T> {
  /** API 交互成功 */
  success: false;
  /** API 交互資料 */
  data?: T;
  /** API 交互錯誤 */
  error: ApiErrorData;
  /** 中斷 */
  abort?: boolean;
}
/** API 回傳成功 */
export interface ApiReturnSuccessData<T> {
  /** API 交互成功 */
  success: true;
  /** API 交互資料 */
  data: T;
}

export type ApiReturnData<T> = ApiReturnSuccessData<T> | ApiReturnErrorData<T>;
