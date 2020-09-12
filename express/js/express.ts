// jquery 
declare const $: any;
// 地区数据
declare const expressData: any;
// 选中类型
type Type = 'lately' | 'hot' | 'abc' | 'def' | 'ghj' | 'klm' | 'npq' | 'rst' | 'wxy' | 'z';
// 快递数据参数
interface Params
{
    gs_mc: string, // 快递名称
    gs_bm: string, // 快递拼音名称
    hot?: boolean // 热门
    index?: number; // 下标
}
// Express 对象开放的属性、函数
interface ExpressOptions
{
    handleReset:() => void; // 重置
    handleSavelatelyData: () => void; // 保存最近使用记录
}

/**
 * 选择快递公司模块
 */
class Express
{
    // 类型 (默认显示最近使用)
    private type: Type = 'lately';
    // 保存定时器
    private static timer: any = null;
    // 绑定的元素
    private static element: HTMLInputElement = null as any;
    // 当前选中值
    private static currentData: any = {};
    // 是否执行过
    private static isRun = true;
    // 保存数据结构
    private expressData: any = {
        lately:[],
        hot:[],
        abc:[],
        def:[],
        ghj:[],
        klm:[],
        npq:[],
        rst:[],
        wxy:[],
        z:[]
    };
    
    // 构造函数
    constructor(element: string){
        if(element)
        {
           // 保存绑定元素
           Express.element = document.querySelector(element);
           // 添加元素
           this.handleAppend().then(() => {
               // 初始化
               this.init();
           })
        }else
        {
            throw Error('需要传入绑定的元素id或者类名');
        }
    }

    // 重置
    public handleReset(): void
    {
        // 清空值
        Express.element.value = '';
        // 清空选中值
        Express.currentData = {};
        // 重置显示状态
        Express.isRun = true;
        // 滚动到左边
        $('.ex_cate').scrollLeft(0);
        // 默认参数
        this.type = 'lately';
        // 获取所有分类
        let childs: NodeListOf<HTMLLIElement> = document.querySelectorAll('.ex_cate_container li');
        // 排他
        childs.forEach( (item: HTMLElement,index: number) => {
            if(index)
            {
                item.classList.remove('ex_active');
            }else
            {
                item.classList.add('ex_active');
            }
        })
        // 隐藏最外层模块
        $('express').hide();
        // 显示默认模块
        $('.ex_main').show();
        // 隐藏搜索模块
        $('.ex_search').hide();
        // 获取数据
        this.handleGetData();
    }

    // 保存最近使用数据
    public handleSavelatelyData(): void
    {
        // 本地存在数据
        if(localStorage.getItem('expressData'))
        {
            // 转换为对象
            let data = JSON.parse(localStorage.getItem('expressData'));
            let mode = 'push';
            // 数据验证
            data.forEach( (val: any,key: number) => {
                if(val.gs_id == Express.currentData.gs_id)
                {
                    // 数组开头添加
                    mode = 'unshift';
                    // 删除数据
                    data.splice(key,1);
                }
            })
            if(JSON.stringify(Express.currentData) != '{}')
            {
                // 保存数据
                data[mode](Express.currentData);
                // 保存本地
                localStorage.setItem('expressData', JSON.stringify(data));
            }
        }else
        {
            if(JSON.stringify(Express.currentData) != '{}') localStorage.setItem('expressData', JSON.stringify([Express.currentData]));
        }
    }
    
    // 初始化
    private init(): void
    {
        // 事件绑定
        this.handle();
        // 数据初始化
        this.handleInitData();
        // 获取数据
        this.handleGetData();
    }

    // 保存值到输入框
    private static handleSaveValue(this: any,event: Event): void
    {
        event.stopPropagation();
        // 保存选中值
        Express.currentData = expressData[this.dataset.index];
        // 重置显示状态
        Express.isRun = true;
        // 赋值
        Express.element.value = this.tagName == 'LI' ? this.children[0].innerText : this.innerText;
        // 隐藏模块
        $('express').hide();
    }

    // 搜索
    private static handleSearch(): void
    {
        let _this: any = Express.element;
        // 保存数据结构
        let html: any[] = [];
        // 保存元素
        let element: any = '';
        // 显示/隐藏默认模块
        $('.ex_main')[_this.value ? 'hide' : 'show']();
        // 显示/隐藏搜索模块
        $('.ex_search')[!_this.value ? 'hide' : 'show']();
        if(_this.value)
        {
            clearInterval(Express.timer);
            // 执行搜索
            Express.timer = setTimeout(() => {
                // 搜索类型
                let searchType = /[\u4e00-\u9fa5]/g.test(_this.value) ? 'gs_mc' : 'gs_bm';
                // gs_bm 拼音
                expressData.forEach((val: any,index: number) => {
                    // 模糊匹配
                    if(_this.value.toLocaleLowerCase() == val[searchType].substr(0,_this.value.length))
                    {
                        // 用jq创建元素
                        element = $(`<li data-index=${index}><span>${val.gs_mc}</span><span>${val.gs_bm}</span></li>`);
                        // 绑定事件
                        element[0].addEventListener('click', Express.handleSaveValue);
                        // 保存元素
                        html.push(element);
                    }
                });
                if(html.length)
                {
                    // 滚动到顶部
                    $('.ex_search_container').scrollTop(0);
                    // 隐藏空数据
                    $('.ex_tips').eq(1).hide();
                    // 渲染数据
                    $('.ex_search_container ul').html(html);
                }else
                {
                    $('.ex_search_container ul').html('');
                    $('.ex_tips').eq(1).show();
                }
            },500);
        }
    }

    // 数据验证
    private static handleChange(): void
    {
        // 元素值
        let value = Express.element.value;
        if(value)
        {
            // 搜索类型
            let searchType = /[\u4e00-\u9fa5]/g.test(value) ? 'gs_mc' : 'gs_bm';
            // 保存匹配到的值
            let data:any = '';

            for(let val of expressData)
            {
                // 模糊匹配
                if(value.toLocaleLowerCase() == val[searchType].substr(0,value.length))
                {
                    data = val;
                    break;
                }
                
            }
            // 判断是否匹配到
            if(data)
            {
                // 保存值
                Express.currentData = data;
                // 表单值赋值
                Express.element.value = data.gs_mc;
            }else
            {
                // 没匹配到用上次选过的值
                Express.element.value = JSON.stringify(Express.currentData) == '{}' ? '' : Express.currentData.gs_mc;
                // 重新搜索
                Express.element.value && Express.handleSearch();
            }
        }
    }

    // 添加元素到页面
    private handleAppend(): Promise<void>
    {
        return new Promise((resolve: () => void,reject: () => void) => {
            let lis = '';
            let lis_n = '';
            for (let name in this.expressData) 
            {
                lis_n = name == 'lately' ? '最近使用' : name == 'hot' ? '热门' : name;
                lis += `
                    <li data-name="${name}" class="${this.type == name ? 'ex_active' : ''}">${lis_n.toUpperCase()}</li>
                `;
            }
            let html = `
                <express>
                <div class="ex_title">
                    温馨提示：可直接输入快递公司或快递公司拼音
                </div>
                <section class="ex_main">
                    <div class="ex_cate">
                        <ul class="ex_cate_container">
                            ${lis}
                        </ul>
                    </div>
                    <div class="ex_list_container">
                        <ul class="ex_list">
                            
                        </ul>
                        <span class="ex_tips">暂无数据</span>
                    </div>
                </section>
                <section class="ex_search">
                    <div class="ex_search_container">
                        <ul>
                        
                        </ul>
                        <span class="ex_tips">暂无数据</span>
                    </div>
                </section>
            </express> 
            
            `;
            // 添加元素到页面
            $('body').append(html);
            
            resolve();
        })
    }

    // 事件绑定
    private handle(): void
    {
        let _this = this;
        // 当前终端
        let ua = typeof window === 'object' ? window.navigator.userAgent : '';
        // android终端
        let isAndroid = ua.indexOf('Android') > -1 || ua.indexOf('Adr') > -1; 
        // ios终端
        let isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); 
        // 获取所有分类
        let childs: NodeListOf<HTMLLIElement> = document.querySelectorAll('.ex_cate_container li');
        // 绑定事件
        childs.forEach((item: HTMLLIElement) => {
            item.addEventListener('click',function(){
                if(!this.classList.contains('ex_active'))
                {
                    // 排他
                    childs.forEach( val => {
                        val.classList.remove('ex_active');
                    })
                    // 添加选中类
                    this.classList.add('ex_active');
                    // 修改参数
                    _this.type = this.dataset.name as Type;
                    // 滚动到顶部
                    $('.ex_list_container').scrollTop(0);
                    // 获取数据
                    _this.handleGetData();
                }
            })
        });
        if (isiOS) 
        {
            // 键盘收起重新定位
            window.addEventListener('focusout', (event: Event) => {
                setTimeout(() => {
                    // 离顶部位置
                    let top = $(Express.element).offset().top + $(Express.element).outerHeight(true) + 'px';
                    // 修改元素位置
                    $('express').css({
                        top
                    });
                },100)
            });
        }
        if(isAndroid){
            const innerHeight = window.innerHeight;
            window.addEventListener('resize', () => {
              const newInnerHeight = window.innerHeight;
              if (innerHeight < newInnerHeight) {
                setTimeout(() => {
                    // 离顶部位置
                    let top = $(Express.element).offset().top + $(Express.element).outerHeight(true) + 'px';
                    // 修改元素位置
                    $('express').css({
                        top
                    });
                },100)
              }
            });
        }
        // 显示元素
        Express.element.addEventListener('click', this.handleShow);
        // 显示元素
        document.querySelector('express').addEventListener('click', this.handleShow);
        // 隐藏元素
        document.addEventListener('click', this.handleHide);
        // 搜索
        Express.element.addEventListener('input', Express.handleSearch);
    }

    // 初始化数据
    private handleInitData(): void
    {
        // 获取最近使用数据
        if(localStorage.getItem('expressData')) this.expressData['lately'] = JSON.parse(localStorage.getItem('expressData'))
        // 基本数据
        expressData.forEach( (val: Params,index: number) => {
            // 添加下标
            val.index = index;
            for(let name in this.expressData)
            {
                if(name == 'lately' || name == 'hot') continue;
                // 筛选数据
                if(name.indexOf(val.gs_bm[0]) != -1)
                {
                    // 保存数据
                    this.expressData[name].push(val);
                }
            }
            // 保存热门数据
            if(val.hot)
            {
                this.expressData['hot'].push(val);
            }
        })
    }

    // 获取数据
    private handleGetData():void
    {
        // 保存dom树结构
        let html: HTMLElement[] = [];
        // 获取最近使用数据
        if(localStorage.getItem('expressData')) this.expressData['lately'] = JSON.parse(localStorage.getItem('expressData'));
        // 判断是否有数据
        if(this.expressData[this.type].length)
        {
            // 隐藏tips
            $('.ex_tips').eq(0).hide();
            this.expressData[this.type].forEach((val: Params) => {
                html.push(this.handleCreateElement(val));
            })
            // 渲染数据
            $('.ex_list').html(html);
        }else
        {
            // 显示tips
            $('.ex_tips').eq(0).show();
            $('.ex_list').html('');
        }
    }

    /**
     * 创建元素
     * @param item [object] 数据对象
     */
    private handleCreateElement(item: Params): HTMLElement
    {
        // 创建父元素
        let element: HTMLElement = document.createElement('li');
        // 创建子元素
        let span: HTMLElement = document.createElement('span');
        // 绑定事件
        span.addEventListener('click', Express.handleSaveValue);
        // 元素文字
        span.innerText = item.gs_mc;
        // 元素属性
        span.setAttribute('data-index', item.index.toString());
        // 保存子元素到父元素
        $(element).html(span);

        return element;
    }
    

    // 显示模块
    private handleShow(event: Event): void
    {
        event.stopPropagation();

        if(!Express.isRun) return

        // 离顶部位置
        let top = $(Express.element).offset().top + $(Express.element).outerHeight(true) + 'px';
        // 离左边位置
        let left = $(Express.element).offset().left + 'px';
        // 修改元素位置
        $('express').css({
            display:'block',
            top,
            left
        });
        
        // 空数据显示默认模块
        if(!Express.element.value)
        {
            // 显示默认模块
            $('.ex_main').show();
            // 隐藏搜索模块
            $('.ex_search').hide(); 
        }

        Express.isRun = false;

    }

    // 隐藏模块
    private handleHide(event: Event): void
    {
        // 阻止冒泡        
        event.stopPropagation();

        if(Express.isRun) return
        
        // 隐藏模块
        $('express').hide();
        // 验证数据
        Express.handleChange(); 

        Express.isRun = true;

    }
}

