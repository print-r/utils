"use strict";
/**
 * @author cai
 * @date 2020-09-18
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Pagination = /** @class */ (function () {
    function Pagination(options) {
        // 布局可选参数
        this._layout = ['home', 'prev', 'pager', 'total', 'sizes', 'jumper', 'next', 'last'];
        this.options = {
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
            currentChange: function (index, pageSize) { },
        };
        this.element = null;
        this.pageNum = 0;
        this.showSelector = false;
        this.selectedIndex = 0;
        if (this.validate(options)) {
            this.init(options);
        }
    }
    // 初始化
    Pagination.prototype.init = function (options) {
        // 参数赋值
        this.setOptions(options);
        // 渲染
        this.render();
    };
    // 渲染
    Pagination.prototype.render = function () {
        var _this_1 = this;
        // 清空元素
        this.element.innerHTML = '';
        // 切换每页显示条数重新替换每页条数参数
        if (this.options.layout.indexOf('sizes') !== -1 && this.options.pageSizes instanceof Array) {
            if (!isNaN(this.options.pageSizes[this.selectedIndex])) {
                this.options.pageSize = this.options.pageSizes[this.selectedIndex];
            }
        }
        // 总页数
        this.pageNum = Math.ceil(this.options.total / this.options.pageSize);
        // 单页隐藏
        if (this.pageNum === 1 && this.options.singlePageHide)
            return;
        // 最大页码
        if (this.options.pageIndex > this.pageNum)
            this.options.pageIndex = this.pageNum;
        // 最小页码
        if (this.options.pageIndex <= 0)
            this.options.pageIndex = 1;
        var element = null;
        // 主体容器
        var container = this.createElement('div', '_page_container');
        // layout 渲染
        this.options.layout.split(',').forEach(function (v) {
            if (_this_1._layout.indexOf(v.trim()) !== -1) {
                element = _this_1[v.trim()]();
                element && container.appendChild(element);
            }
        });
        // 保存元素
        this.element.appendChild(container);
    };
    // 首页
    Pagination.prototype.home = function () {
        var _this_1 = this;
        // 禁用样式
        var disabled = this.options.pageIndex <= 1 ? ['_disabled_c'] : [];
        // 手势禁止
        if (this.options.pageIndex <= 1 && this.options.disabled)
            disabled.push('_disabled');
        var element = this.createElement('div', __spreadArrays(['_home', "_home_" + this.options.type], disabled));
        element.innerText = '首页';
        element.addEventListener('click', function () {
            if (_this_1.options.pageIndex > 1) {
                _this_1.handleChangePage(1);
            }
        });
        return element;
    };
    // 上一页
    Pagination.prototype.prev = function () {
        var _this_1 = this;
        // 禁用样式
        var disabled = this.options.pageIndex <= 1 ? ['_disabled_c'] : [];
        // 手势禁止
        if (this.options.pageIndex <= 1 && this.options.disabled)
            disabled.push('_disabled');
        var element = this.createElement('div', __spreadArrays(['_prev', "_prev_" + this.options.type], disabled, (this.options.prevText ? ['_prev_text'] : ['_iconfont', 'iconzuo'])));
        element.innerText = this.options.prevText || '';
        // 上一页事件
        element.addEventListener('click', function () {
            if (_this_1.options.pageIndex > 1) {
                _this_1.handleChangePage(_this_1.options.pageIndex - 1);
            }
        });
        return element;
    };
    // 页码
    Pagination.prototype.pager = function () {
        var _this = this, li, active;
        // 页码容器
        var ul = this.createElement('ul', ['_pages', "_pages_" + this.options.type]);
        // 区间值
        var between = this.getBetween();
        for (var i = 1; i <= this.pageNum; i++) {
            if (i >= between.min && i <= between.max) {
                active = i === this.options.pageIndex ? ["_active_" + this.options.type] : [];
                // 手势禁止
                if (i === this.options.pageIndex && this.options.disabled)
                    active.push('_disabled');
                li = this.createElement('li', __spreadArrays(["_pages_li_" + this.options.type], active));
                li.innerText = i.toString();
                li.setAttribute('data-index', i.toString());
                li.addEventListener('click', function () {
                    if (this.dataset.index != _this.options.pageIndex) {
                        _this.handleChangePage(Number(this.dataset.index));
                    }
                });
                ul.appendChild(li);
            }
        }
        return ul;
    };
    // 下一页
    Pagination.prototype.next = function () {
        var _this_1 = this;
        // 禁用下一页
        var disabled = this.options.pageIndex >= this.pageNum ? ['_disabled_c'] : [];
        // 手势禁止
        if (this.options.pageIndex >= this.pageNum && this.options.disabled)
            disabled.push('_disabled');
        // 下一页
        var element = this.createElement('div', __spreadArrays(['_next', "_next_" + this.options.type], disabled, (this.options.nextText ? ['_next_text'] : ['_iconfont', 'iconGroup-'])));
        // 下一页文字
        element.innerText = this.options.nextText || '';
        // 下一页事件
        element.addEventListener('click', function () {
            if (_this_1.options.pageIndex < _this_1.pageNum) {
                _this_1.handleChangePage(_this_1.options.pageIndex + 1);
            }
        });
        return element;
    };
    // 尾页
    Pagination.prototype.last = function () {
        var _this_1 = this;
        // 禁用下一页
        var disabled = this.options.pageIndex >= this.pageNum ? ['_disabled_c'] : [];
        // // 手势禁止
        if (this.options.pageIndex >= this.pageNum && this.options.disabled)
            disabled.push('_disabled');
        var element = this.createElement('div', __spreadArrays(['_last', "_last_" + this.options.type], disabled));
        element.innerText = '尾页';
        element.addEventListener('click', function () {
            if (_this_1.options.pageIndex < _this_1.pageNum) {
                _this_1.handleChangePage(_this_1.pageNum);
            }
        });
        return element;
    };
    // 输入框跳转
    Pagination.prototype.jumper = function () {
        var _this = this;
        // 容器
        var jumper = this.createElement('div', '_jumper');
        // 总页码
        var total = this.createElement('div', '_count');
        total.innerText = "\u5171 " + this.pageNum + " \u9875";
        jumper.appendChild(total);
        var text_1 = this.createElement('span');
        text_1.innerText = '前往';
        jumper.appendChild(text_1);
        var value = 0;
        // 输入框
        var input = this.createElement('input', '_jumper_input');
        input.type = 'number';
        input.value = this.options.pageIndex.toString();
        input.setAttribute('min', '1');
        input.setAttribute('max', this.pageNum.toString());
        var handle = ['blur', 'keydown'];
        handle.forEach(function (v) {
            input.addEventListener(v, function (e) {
                if (e.type === 'keydown' && e.keyCode !== 13) {
                    return;
                }
                value = ~~this.value;
                if (value < 1)
                    value = 1;
                if (value > _this.pageNum)
                    value = _this.pageNum;
                // @ts-ignore
                this.value = value;
                if (value !== _this.options.pageIndex)
                    _this.handleChangePage(value);
            });
        });
        jumper.appendChild(input);
        var text_2 = this.createElement('span');
        text_2.innerText = '页';
        jumper.appendChild(text_2);
        return jumper;
    };
    // 选择页码
    Pagination.prototype.sizes = function () {
        var _this_1 = this;
        var _this = this;
        var success = false;
        var mode = '';
        var lis = null;
        var active = [];
        var element = this.createElement('div', '_sizes');
        // 选择框容器
        var box = this.createElement('div', '_sizes_select_container');
        // 每页条数选择框
        var ul = this.createElement('ul', '_sizes_select');
        if (this.options.pageSizes instanceof Array) {
            // 渲染选择框
            this.options.pageSizes.forEach(function (v, key) {
                if (!isNaN(v)) {
                    success = true;
                    active = _this_1.selectedIndex === key ? ['_sizes_select_active'] : [];
                    lis = _this_1.createElement('li', __spreadArrays(['_sizes_select_li'], active));
                    lis.innerText = v + "\u6761/\u9875";
                    lis.addEventListener('click', function () {
                        _this.selectedIndex = key;
                        _this.handleChangePage(1);
                    });
                    ul.appendChild(lis);
                }
            });
        }
        else {
            return false;
        }
        if (!success)
            return false;
        box.appendChild(ul);
        element.appendChild(box);
        var text = this.createElement('div', '_sizes_text');
        text.innerText = this.options.pageSizes[this.selectedIndex] + "\u6761/\u9875";
        // 显示选择框、旋转icon
        text.addEventListener('click', function () {
            this.classList.add('_sizes_active');
            mode = _this.showSelector ? 'remove' : 'add';
            _this.showSelector = !_this.showSelector;
            i.classList[mode]('_sizes_icon_rotate');
            box.classList[mode]('_sizes_select_container_show');
        });
        var i = this.createElement('i', ['icon_down', '_iconfont', 'iconGroup-1']);
        text.appendChild(i);
        element.appendChild(text);
        return element;
    };
    // 总页数
    Pagination.prototype.total = function () {
        var element = this.createElement('div', '_count');
        element.innerText = "\u5171 " + this.options.total + " \u6761";
        return element;
    };
    // 页码变化
    Pagination.prototype.handleChangePage = function (index) {
        this.options.pageIndex = index;
        this.showSelector = false;
        // 回调
        typeof this.options.currentChange === 'function' && this.options.currentChange(index, this.options.pageSizes[this.selectedIndex]);
        // 重新渲染
        this.render();
    };
    // 计算区间值
    Pagination.prototype.getBetween = function () {
        // 最小下标
        var min = this.options.pageIndex - Math.floor(this.options.pageCount / 2);
        // 最小下标最大值
        if (min > this.pageNum - this.options.pageCount) {
            min = this.pageNum - this.options.pageCount + 1;
        }
        // 最小值
        if (min <= 1)
            min = 1;
        // 最大下标
        var max = this.options.pageIndex + Math.floor(this.options.pageCount / 2);
        // 最大下标最小值
        if (max < this.options.pageCount)
            max = this.options.pageCount;
        // 最大值
        if (max > this.pageNum)
            max = this.pageNum;
        return { min: min, max: max };
    };
    // 生成区间数组
    Pagination.prototype.generateArray = function (start, end) {
        return Array.from(new Array(end + 1).keys()).slice(start);
    };
    // 创建元素
    Pagination.prototype.createElement = function (tag, classList) {
        var dom = document.createElement(tag);
        if (classList) {
            if (classList instanceof Array) {
                classList.forEach(function (v) {
                    dom.classList.add(v);
                });
            }
            else {
                dom.classList.add(classList);
            }
        }
        return dom;
    };
    // 参数验证
    Pagination.prototype.validate = function (options) {
        if (!options)
            throw new Error('options of null');
        if (typeof options !== 'object')
            throw new Error('options not an object');
        if (!document.querySelector(options.element))
            throw new Error('element of null');
        if (!options.layout)
            throw new Error('layout of null');
        ['type', 'pageIndex', 'pageSize', 'pageCount', 'total'].forEach(function (v) {
            if (options[v]) {
                if (isNaN(options[v]))
                    throw new Error(v + " not an number");
                if (v === 'pageCount' && options[v] % 2 === 0)
                    throw new Error(v + " not an odd number");
            }
        });
        return true;
    };
    // 参数赋值
    Pagination.prototype.setOptions = function (options) {
        // 容器
        this.element = document.querySelector(options.element);
        for (var name_1 in options) {
            if (options[name_1] !== void 0) {
                this.options[name_1] = isNaN(options[name_1]) ? options[name_1] : +options[name_1];
            }
        }
    };
    return Pagination;
}());
