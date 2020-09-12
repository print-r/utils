import Vue from 'vue';
import loading from '../loading.vue';
import confirm from '../confirm.vue';
import alert from '../alert.vue';

import { LoadingOptions , AlertOptions , ConfirmOptions } from '@/types/layerd';

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
    // 组件对象
    private element: any;
    /**
     * 弹出loading加载层
     * @param params [object] 参数对象
     */
    public handleToast(params?: LoadingOptions): void {
        // 参数名称
        const param = ['icon' , 'content'];
        // 删除组件
        this.handleRemoveDom('.layerd-loading');
        // 创建组件
        this.handleCreateDom(loading).then( () => {
            // 参数赋值
            this.handleSetData(param , params);
        });
    }
    // 关闭loading加载层
    public handleClose(): void {
        this.element.isShow = false;
    }
    /**
     * 确认框
     * @param params [object] 参数对象
     * @param callBack [function] 回调函数
     */
    public handleConfirm(params: ConfirmOptions, callBack?: () => void): void {
        // 参数名称
        const param = ['title' , 'content'];
        // 删除组件
        this.handleRemoveDom('.layerd-confirm');
        // 创建组件
        this.handleCreateDom(confirm).then( () => {
            // 参数赋值
            this.handleSetData(param , params);
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
    public handleAlert(params: AlertOptions): void {
        // 参数名称
        const param = ['content' , 'time'];
        // 删除元素
        this.handleRemoveDom('.layerd-alert');
        // 创建组件
        this.handleCreateDom(alert).then( () => {
            // 元素
            const el = document.querySelector('.layerd-alert .text');
            // 元素宽
            this.element.left = el!.clientWidth / 2;
            // 元素高
            this.element.top = el!.clientHeight / 2;
        });
        // 参数赋值
        this.handleSetData(param , params);
    }
    /**
     * 创建组件
     * @param component [object] vue组件
     */
    private handleCreateDom(component: any): Promise<void> {
        return new Promise( (resolve: () => void , reject: () => void) => {
            const domConstructor = Vue.extend(component);
            // 创建组件
            const dom: any = new domConstructor({   
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
    private handleRemoveDom(domName: string): void {
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
    private handleSetData<T extends object,K extends keyof T>(params: K[], data: T):void {
        if (data && JSON.stringify(data) !== '{}') {
            params.forEach( (val: K) => {
                if (data[val] !== undefined && Boolean(data[val])) {
                    this.element[val] = data[val];
                }
            });      
        }
    }
}

export default new Layerd();
