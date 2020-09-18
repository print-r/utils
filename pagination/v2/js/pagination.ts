/**
 * @author cai
 * @date 2020-09-18
 */

interface IPagination {
    readonly _layout: string[]
    options: IPaginationOptions
    element: HTMLElement | null
    showSelector: boolean
    pageNum: number
    selectedIndex: number
    init: (options: IPaginationOptions) => void
    render: () => void
    home: () => HTMLElement
    prev: () => HTMLElement
    pager: () => HTMLElement
    next: () => HTMLElement
    last: () => HTMLElement
    sizes: ()=> HTMLElement | boolean
    total: () => HTMLElement
    getBetween: () => IBetween
    generateArray: (start: number, end: number) => number[]
    createElement: (tag: string, classList?: string | string[]) => HTMLElement
    handleChangePage: (index: number) => void
    validate: (options: IPaginationOptions) => boolean | undefined
    setOptions: (options: IPaginationOptions) => void
}

interface IBetween {
    min: number
    max: number
}

type Type = 1 | 2

interface IPaginationOptions {
    element: string | ''
    type: Type
    pageIndex: number
    pageSize: number
    pageSizes: number[]
    pageCount: number
    total: number
    layout: string | ''
    prevText: string | ''
    nextText: string | ''
    singlePageHide: boolean
    disabled: boolean
    currentChange: (index: number, pageSize?: number) => void
    [key: string]: any
}

class Pagination implements IPagination {

    // 布局可选参数
    readonly _layout = ['home', 'prev', 'pager', 'total', 'sizes', 'jumper', 'next', 'last'];
    
    options: IPaginationOptions = {
        // 容器
        element: '',

        // 样式类型
        type: 1,

        // 当前页
        pageIndex: 1,

        // 每页显示数量
        pageSize: 0,

        // 每页显示几条
        pageSizes: [],

        // 按钮数量
        pageCount: 9,

        // 总条数
        total: 0,

        // 页面布局
        layout: '',

        // 上一页文字
        prevText: '',

        // 下一页文字
        nextText: '',

        // 单页隐藏
        singlePageHide: true,

        // 是否禁用
        disabled: false,

        /**
         * @description 页码变化事件回调
         * @param index [number] 当前页码
         * @param pageSize [number] 每页显示条数 TODO: 只有使用sizes才有返回值
         */
        currentChange: (index: number, pageSize?: number) => {},
    };

    element = null;

    pageNum = 0;

    showSelector = false;

    selectedIndex  = 0;

    constructor(options: IPaginationOptions) {
        if (this.validate(options)) {
            this.init(options);
        }
    }

    // 初始化
    init(options: IPaginationOptions): void {
        // 参数赋值
        this.setOptions(options);
        // 渲染
        this.render();
    }

    // 渲染
    render(this: IPagination): void {
        // 清空元素
        (this as any).element.innerHTML = '';
        // 切换每页显示条数重新替换每页条数参数
        if (this.options.layout.indexOf('sizes') !== -1 && this.options.pageSizes instanceof Array) {
            if (!isNaN(this.options.pageSizes[this.selectedIndex])) {
                this.options.pageSize = this.options.pageSizes[this.selectedIndex];
            }
        }
        // 总页数
        this.pageNum = Math.ceil(this.options.total / this.options.pageSize);
        // 单页隐藏
        if (this.pageNum === 1 && this.options.singlePageHide) return;
        // 最大页码
        if (this.options.pageIndex > this.pageNum) this.options.pageIndex = this.pageNum;
        // 最小页码
        if (this.options.pageIndex <= 0) this.options.pageIndex = 1;
        let element = null;
        // 主体容器
        let container = this.createElement('div', '_page_container');
        // layout 渲染
        this.options.layout.split(',').forEach((v: string) => {
            if (this._layout.indexOf(v.trim()) !== -1) {
                element = (this as any)[v.trim()]();
                element && container.appendChild(element);
            }
        });
        // 保存元素
        (this as any).element.appendChild(container);
    }

    // 首页
    home(): HTMLElement {
        // 禁用样式
        let disabled = this.options.pageIndex <= 1 ? ['_disabled_c'] : [];
        // 手势禁止
        if (this.options.pageIndex <= 1 && this.options.disabled) disabled.push('_disabled');
        let element = this.createElement('div', ['_home' ,`_home_${this.options.type}`, ...disabled]) as HTMLLIElement;
        element.innerText = '首页';
        element.addEventListener('click', () => {
            if (this.options.pageIndex > 1) {
                this.handleChangePage(1);
            }
        });
        return element;
    }

    // 上一页
    prev(): HTMLElement {
        // 禁用样式
        let disabled = this.options.pageIndex <= 1 ? ['_disabled_c'] : [];
        // 手势禁止
        if (this.options.pageIndex <= 1 && this.options.disabled) disabled.push('_disabled');
        let element = this.createElement('div', ['_prev', `_prev_${this.options.type}` , ...disabled, ...(this.options.prevText ? ['_prev_text'] : ['_iconfont', 'iconzuo'])]) as HTMLLIElement;
        element.innerText = this.options.prevText || '';
        // 上一页事件
        element.addEventListener('click', () => {
            if (this.options.pageIndex  > 1) {
                this.handleChangePage(this.options.pageIndex - 1);
            }
        });
        return element;
    }

    // 页码
    pager(): HTMLElement {
        let _this = this,
        li,
        active;
        // 页码容器
        let ul = this.createElement('ul', ['_pages', `_pages_${this.options.type}`]);
        // 区间值
        let between = this.getBetween();
        for(let i = 1; i <= this.pageNum; i++) {
            if (i >= between.min && i <= between.max) {
                active = i === this.options.pageIndex ? [`_active_${this.options.type}`] : [];
                // 手势禁止
                if (i === this.options.pageIndex && this.options.disabled) active.push('_disabled');
                li = this.createElement('li', [`_pages_li_${this.options.type}`, ...active]) as HTMLLIElement;
                li.innerText = i.toString();
                li.setAttribute('data-index', i.toString());
                li.addEventListener('click', function(this: HTMLElement){
                    if ((this as any).dataset.index != _this.options.pageIndex) {
                        _this.handleChangePage(Number(this.dataset.index));
                    }
                });
                ul.appendChild(li);
            }
        }
        return ul;
    }

    // 下一页
    next(): HTMLElement {
        // 禁用下一页
        let disabled = this.options.pageIndex >= this.pageNum ? ['_disabled_c'] : [];
        // 手势禁止
        if (this.options.pageIndex >= this.pageNum && this.options.disabled) disabled.push('_disabled');
        // 下一页
        let element = this.createElement('div', ['_next', `_next_${this.options.type}`, ...disabled, ...(this.options.nextText ? ['_next_text'] : ['_iconfont', 'iconGroup-'])]) as HTMLLIElement;
        // 下一页文字
        element.innerText = this.options.nextText || '';
        // 下一页事件
        element.addEventListener('click', () => {
            if (this.options.pageIndex < this.pageNum) {
                this.handleChangePage(this.options.pageIndex + 1);
            }
        });
        return element;
    }

    // 尾页
    last(): HTMLElement {
        // 禁用下一页
        let disabled = this.options.pageIndex >= this.pageNum ? ['_disabled_c'] : [];
        // // 手势禁止
        if (this.options.pageIndex >= this.pageNum && this.options.disabled) disabled.push('_disabled');
        let element = this.createElement('div', ['_last', `_last_${this.options.type}` ,...disabled]) as HTMLLIElement;
        element.innerText = '尾页';
        element.addEventListener('click', () => {
            if (this.options.pageIndex < this.pageNum) {
                this.handleChangePage(this.pageNum);
            }
        });
        return element;
    }

    // 输入框跳转
    jumper(): HTMLElement {
        let _this = this;
        // 容器
        let jumper = this.createElement('div', '_jumper');
        // 总页码
        let total = this.createElement('div', '_count');
        total.innerText = `共 ${this.pageNum} 页`;
        jumper.appendChild(total);
        let text_1 = this.createElement('span');
        text_1.innerText = '前往';
        jumper.appendChild(text_1);
        let value = 0;
        // 输入框
        let input = this.createElement('input', '_jumper_input') as HTMLInputElement;
        input.type = 'number';
        input.value = this.options.pageIndex.toString();
        input.setAttribute('min', '1');
        input.setAttribute('max', this.pageNum.toString());
        let handle = ['blur', 'keydown'];
        handle.forEach( (v: string) => {
            input.addEventListener(v, function(this: HTMLInputElement, e:any) {
                if (e.type === 'keydown' && e.keyCode !== 13) {
                    return;
                }
                value = ~~this.value;
                if (value < 1)  value = 1;
                if (value > _this.pageNum) value = _this.pageNum;
                // @ts-ignore
                this.value = value;
                if (value !== _this.options.pageIndex) _this.handleChangePage(value);
            });
        });
        jumper.appendChild(input);
        let text_2 = this.createElement('span');
        text_2.innerText = '页';
        jumper.appendChild(text_2);
        return jumper;
    }

    // 选择页码
    sizes(): HTMLElement | boolean {
        let _this = this;
        let success = false;
        let mode = '';
        let lis = null;
        let active = [];
        let element = this.createElement('div', '_sizes');
        // 选择框容器
        let box = this.createElement('div', '_sizes_select_container');
        // 每页条数选择框
        let ul = this.createElement('ul', '_sizes_select');
        if (this.options.pageSizes instanceof Array) {
            // 渲染选择框
            this.options.pageSizes.forEach( (v: number, key: number) => {
                if (!isNaN(v)) {
                    success = true;
                    active = this.selectedIndex === key ? ['_sizes_select_active'] : [];
                    lis = this.createElement('li', ['_sizes_select_li', ...active]);
                    lis.innerText = `${v}条/页`;
                    lis.addEventListener('click', function() {
                        _this.selectedIndex = key;
                        _this.handleChangePage(1);
                    });
                    ul.appendChild(lis);
                }
            })
        } else {
            return false;
        }
        if (!success) return false;
        box.appendChild(ul);
        element.appendChild(box);
        let text = this.createElement('div', '_sizes_text')
        text.innerText = `${this.options.pageSizes[this.selectedIndex]}条/页`;
        // 显示选择框、旋转icon
        text.addEventListener('click', function() {
            this.classList.add('_sizes_active');
            mode = _this.showSelector ? 'remove' : 'add';
            _this.showSelector = !_this.showSelector;
            (i as any).classList[mode]('_sizes_icon_rotate');
            (box as any).classList[mode]('_sizes_select_container_show');
        });
        let i = this.createElement('i', ['icon_down', '_iconfont', 'iconGroup-1']);
        text.appendChild(i);
        element.appendChild(text);
        return element;
    }

    // 总页数
    total(): HTMLElement {
        let element = this.createElement('div', '_count');
        element.innerText = `共 ${this.options.total} 条`;
        return element;
    }

    // 页码变化
    handleChangePage(index: number): void {
        this.options.pageIndex = index;
        this.showSelector = false;
        // 回调
        typeof this.options.currentChange === 'function' && this.options.currentChange(index, this.options.pageSizes[this.selectedIndex]);
        // 重新渲染
        this.render();
    }

    // 计算区间值
    getBetween(): IBetween {
        // 最小下标
        let min = this.options.pageIndex - Math.floor(this.options.pageCount / 2);
        // 最小下标最大值
        if (min > this.pageNum - this.options.pageCount) {
            min = this.pageNum - this.options.pageCount  + 1;
        }
        // 最小值
        if (min <= 1) min = 1;
        // 最大下标
        let max = this.options.pageIndex + Math.floor(this.options.pageCount / 2);
        // 最大下标最小值
        if (max < this.options.pageCount) max = this.options.pageCount;
        // 最大值
        if (max > this.pageNum) max = this.pageNum;
        return {min, max};
    }
    
    // 生成区间数组
    generateArray(start: number, end: number) {
        return (Array as any).from((new Array(end + 1) as any).keys()).slice(start);
    }

    // 创建元素
    createElement(tag: string, classList?: string | string[]): HTMLElement {
        let dom = document.createElement(tag);
        if (classList) {
            if (classList instanceof Array) {
                classList.forEach( v => {
                    dom.classList.add(v);
                });
            } else {
                dom.classList.add(classList);
            }
        }
        return dom;
    }

    // 参数验证
    validate(options: IPaginationOptions): boolean | undefined {

        if (!options) throw new Error('options of null');

        if (typeof options !== 'object') throw new Error('options not an object');

        if (!document.querySelector(options.element)) throw new Error('element of null');

        if (!options.layout) throw new Error('layout of null');

        ['type', 'pageIndex', 'pageSize', 'pageCount', 'total'].forEach( v => {
            if (options[v]) {
                if (isNaN(options[v])) throw new Error(`${v} not an number`);
                if (v === 'pageCount' && options[v] % 2 === 0) throw new Error(`${v} not an odd number`);
            }
        });

        return true;
    }

    // 参数赋值
    setOptions(options: IPaginationOptions): void {
        // 容器
        this.element = document.querySelector(options.element) as never;
        for (let name in options) {
            if (options[name] !== void 0) {
                this.options[name] = isNaN(options[name]) ? options[name] : +options[name];
            }
        }
    }
    
}