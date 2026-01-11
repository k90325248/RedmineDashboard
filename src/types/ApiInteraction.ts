/** API 交互錯誤 */
export interface ApiErrorData {
  /** 錯誤標題 */
  title: string;
  /** 錯誤描述 */
  description?: string;
}

/** API 回傳資訊 */
export interface ApiReturnData<T> {
  /** API 交互成功 */
  success: boolean;
  /** API 交互資料 */
  data?: T;
  /** API 交互錯誤 */
  error?: ApiErrorData;
}

/** API 使用者資訊回傳 */
export type ApiUserResult = ApiReturnData<{ user_data: any; api_key: string }>;
