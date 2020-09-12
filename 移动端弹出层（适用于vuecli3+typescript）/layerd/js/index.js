"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vue_1 = __importDefault(require("vue"));
const loading_vue_1 = __importDefault(require("../loading.vue"));
const confirm_vue_1 = __importDefault(require("../confirm.vue"));
const alert_vue_1 = __importDefault(require("../alert.vue"));
/* TODO:

    弹出加载层
    this.$layerd.handleToast({
        content:'加载中'  // 非必填
        icon: 0, // 非必填，load图标
    })

    隐藏加载层
    this.$layerd.handleToast()

    弹出询问层
    this.$layerd.handleConfirm('活动结束',() => {
        //回调函数
    })

    弹出提示层
    this.$layerd.handleAlert({
        content:'密码错误'  //必填
        time:3000  // 非必填
    })

*/
class Layerd {
    /**
     * 弹出loading加载层
     * @param params [object] 参数对象
     */
    handleToast(params) {
        // 参数名称
        const param = ['icon', 'content'];
        // 删除组件
        this.handleRemoveDom('.layerd-loading');
        // 创建组件
        this.handleCreateDom(loading_vue_1.default).then(() => {
            // 参数赋值
            this.handleSetData(param, params);
        });
    }
    // 关闭loading加载层
    handleClose() {
        this.element.isShow = false;
    }
    /**
     * 确认框
     * @param params [object] 参数对象
     * @param callBack [function] 回调函数
     */
    handleConfirm(params, callBack) {
        // 参数名称
        const param = ['title', 'content'];
        // 删除组件
        this.handleRemoveDom('.layerd-confirm');
        // 创建组件
        this.handleCreateDom(confirm_vue_1.default).then(() => {
            // 参数赋值
            this.handleSetData(param, params);
        });
        // 回调函数
        if (typeof callBack === 'function') {
            // 执行回调
            this.element.callBack = callBack;
        }
    }
    /**
     * 提示框
     * @param params [object] 参数对象
     */
    handleAlert(params) {
        // 参数名称
        const param = ['content', 'time'];
        // 删除元素
        this.handleRemoveDom('.layerd-alert');
        // 创建组件
        this.handleCreateDom(alert_vue_1.default).then(() => {
            // 元素
            const el = document.querySelector('.layerd-alert .text');
            // 元素宽
            this.element.left = el.clientWidth / 2;
            // 元素高
            this.element.top = el.clientHeight / 2;
        });
        // 参数赋值
        this.handleSetData(param, params);
    }
    /**
     * 创建组件
     * @param component [object] vue组件
     */
    handleCreateDom(component) {
        return new Promise((resolve, reject) => {
            const domConstructor = vue_1.default.extend(component);
            // 创建组件
            const dom = new domConstructor({
                el: document.createElement('div'),
            });
            // 添加到页面
            document.body.appendChild(dom.$el);
            // 保存生成后的组件对象
            this.element = dom;
            resolve();
        });
    }
    /**
     * 删除组件
     * @param domName [string] 元素名称：类名、ID
     */
    handleRemoveDom(domName) {
        // 获取元素
        const dom = document.querySelector(domName);
        // 删除元素
        if (dom) {
            dom.remove();
        }
    }
    /**
     * TODO: 参数赋值必须在创建组件后
     * 参数赋值
     * @param params [Array] 参数名称
     * @param data [object] 数据参数
     */
    handleSetData(params, data) {
        if (data && JSON.stringify(data) !== '{}') {
            params.forEach((val) => {
                if (data[val] !== undefined && Boolean(data[val])) {
                    this.element[val] = data[val];
                }
            });
        }
    }
}
exports.default = new Layerd();
