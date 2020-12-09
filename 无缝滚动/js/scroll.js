"use strict";
class Scroll {
    /* 构造函数 */
    constructor(param) {
        //参数
        this.config = {
            visualEl: '',
            addEl: '',
            scrollEl: '',
            direction: 'y',
            speed: 50,
            hoverStop: false,
        };
        this.isRun = true;
        for (let name in param) {
            this.config[name] = param[name] || this.config[name];
        }
        if (!this.config.visualEl || !this.config.scrollEl || (this.config.direction == 'x' ? !this.config.addEl : false)) {
            console.error('缺少参数');
            return;
        }
        this.init();
    }
    /* 初始化 */
    init() {
        let _this = this;
        let timer = null;
        //可视盒子
        let box = document.querySelector(this.config.visualEl);
        //滚动元素
        let list_1 = document.querySelector(this.config.scrollEl);
        //克隆元素
        let list_2 = list_1.cloneNode(true);
        if (this.config.direction == 'x' && this.config.addEl) {
            let addEl = document.querySelector(this.config.addEl);
            //添加元素
            addEl.append(list_2);
            //设置宽度
            addEl.style.width = list_1.children.length * list_1.children[0].clientWidth * 2 + 'px';
        }
        else {
            //输出到页面
            box.append(list_2);
        }
        //执行速度
        let speed = (typeof this.config.speed == 'number') ? this.config.speed : 50;
        timer = setInterval(function () {
            _this.handleScroll(box, list_1, list_2);
        }, speed);
        if (this.config.hoverStop) {
            box.addEventListener('mouseover', () => {
                clearInterval(timer);
            });
            box.addEventListener('mouseout', () => {
                timer = setInterval(function () {
                    _this.handleScroll(box, list_1, list_2);
                }, speed);
            });
        }
    }
    /* 滚动 */
    handleScroll(box, list_1, list_2) {
        //参数
        let param = this.config;
        //滚动的方向
        let direction = this.config.direction;
        //滚动参数
        let directionParam = {
            'x': [
                'offsetWidth',
                'scrollLeft'
            ],
            'y': [
                'offsetHeight',
                'scrollTop'
            ]
        };
        if (param.direction.toLowerCase() == 'x' || param.direction.toLowerCase() == 'y') {
            if (list_2[directionParam[direction][0]] - box[directionParam[direction][1]] <= 0) {
                box[directionParam[direction][1]] -= list_1[directionParam[direction][0]];
            }
            else {
                box[directionParam[direction][1]]++;
            }
        }
    }
}
