/**
 * TODO:layerd对象声明文件
 */

// loading接口参数
export interface LoadingOptions {
    icon?: number; // loading图标
    content?: string; // 加载文字
}
// 提示框接口参数
export interface AlertOptions {
    time?: number; // 停留时间
    content: string; // 提示文字
}
// 确认框接口参数
export interface ConfirmOptions {
    title?: string, // 确认框标题
    content: string, // 确认框内容
}

// layerd 属性声明
export interface LayerdOptions {
    handleToast: (params?: LoadingOptions) => void;
    handleClose: () => void;
    handleConfirm: (params: ConfirmOptions, callBack?: () => void) => void;
    handleAlert: (params?: AlertOptions) => void;
}