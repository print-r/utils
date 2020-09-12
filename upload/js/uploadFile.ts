let uploadLoading:any;
//全局变量
declare const $:any;
declare const layer:any;
/**
 * 文件上传类
 */
 class UploadFile
 {
    /* 配置参数 */
    public static config:any = {
        url:'', /* 上传的路径 */
        el:'', /* 上传文件元素 */
        param:'file', /* 图片参数名 */
        data:{}, /* 上传时的需要携带的参数 */
        maxFile:0, /* 最大文件上传数（0不限制） */
        suffix:['jpg','png','gif','jpeg'], /* 允许的图片类型 */
        size:0, /* 上传文件大小(0不限制大小，1等于1M等于1024kb) */
        specs:[], /* 图片的尺寸（参数格式：500*500）空则不验证尺寸 */
        drag:{  /* 拖拽元素参数 */
            el:'', // 拖拽容器（图片显示容器）
            text:'拖放文件到此处上传',
            width:'100%', // 宽
            height:'100%', // 高
            border:'2px dashed #ccc', //边框线
            enterLineColor:'red', //进入目标元素边框线颜色
        }, 
        dragChildEl:{ /* 回显的图片样式  */
            width:'15%',
            spaceBetween:'10px' //元素间隔
        },
        isRepeat:true, /* 是否验证重复图片 */
        isDirectUpload:false, /* 是否直接上传文件 */
        successText:'success', /* 页面上传成功文字状态 */
        errorText:'error',/* 页面上传失败文字状态 */
    }
    /* 保存传入的文件 */
    public static files:Array<object> = [];
    /* 保存图片base64图片资源 */    
    public static baseFiles:Array<object> = [];
    /* 保存参数 */
    public param:any;
    /* 回显的元素 */
    public static element:any;
    /* 保存图片显示容器（未启用拖拽时） */
    public imgShowEl:any;
    /* 保存边框颜色 */
    public lineColor:string = '';
    /* 保存文件上传成功回调（文件直接上传时需要） */
    public success:any = function(){};
    /* 保存文件上传失败回调（文件直接上传时需要） */
    public error:any = function(){};
    /* 需要处理数据的参数 */
    readonly specialParams:Array<string> = ['drag','dragChildEl'];
    /* 验证是否可运行 */
    private isAction:Boolean = true;
    /* 保存执行状态 */
    private runStatus:Boolean = false;
    /* 构造函数 */
    constructor(param:any)
    {   
        let _this = this
        //保存数据
        this.param = param
        $(function(){
            //初始化
            _this.init()
        })
    }
     
    
    /* 初始化 */
    private init():void
    {
        let _this = this
        if(!$ && typeof $ != 'function')
        {
            this.isAction = false
            throw new Error('未引入jQuery');
            
        }
        if(!this.param)
        {
            this.isAction = false
            throw new Error('缺少参数');
        }
    
        //参数赋值
        for(let item in this.param)
        {
            if(_this.specialParams.filter( (val:string) => { return val == item }).length)
            {
                //保存拖拽元素参数
                for(let val in UploadFile.config[item])
                {
                    UploadFile.config[item][val] = this.param[item][val] || UploadFile.config[item][val]
                }
                continue;
            }
            UploadFile.config[item] = this.param[item] != undefined ? this.param[item] : UploadFile.config[item]
        }
        if(!UploadFile.config.el)
        {
            this.isAction = false
            throw new Error('缺少file元素');
        }
        //回显元素
        if(UploadFile.config.drag.el)
        {
            let tagName = <string> $(UploadFile.config.drag.el)[0].tagName;
            switch(tagName.toLowerCase())
            {
                case 'div':
                    UploadFile.element = 'div'
                break;
                case 'ul':
                case 'ol':
                    UploadFile.element = 'li'
                break;
                case 'dl':
                    UploadFile.element = 'dd'
                break;
            }
        }else
        {
            //创建元素
            this.imgShowEl = document.createElement('ul');
            //子元素
            UploadFile.element = 'li';
            if($(UploadFile.config.el).parent()[0].tagName.toLowerCase() == 'label')
            {
                //保存元素到页面
                $(UploadFile.config.el).parent().parent().append(this.imgShowEl)
            }else
            {
                //保存元素到页面
                $(UploadFile.config.el).parent().append(this.imgShowEl)
            }
        }
        //最大上传文件数量参数不为数字则不限制上传数量
        UploadFile.config.maxFile = isNaN(UploadFile.config.maxFile) ? 0 : ~~UploadFile.config.maxFile
        //设置元素属性
        $(UploadFile.config.el).attr('multiple','multiple')
        //绑定change事件
        $(document).unbind("change").on('change',UploadFile.config.el,function(e:any)
        {
            let cloneEl = $(UploadFile.config.el).clone().val('')
            /* 替换元素(可重复上传) */
            $(UploadFile.config.el).replaceWith(cloneEl)
            // 文件验证、保存
            _this._handleSaveFiles(e.target.files)
        })
        //初始化元素样式
        this._handleSetStyle();
        //绑定元素事件
        this._handle()
        //拖放上传
        this._handleDragUpload()
        //清空数据
        this.handleClearFile()
    }
    
    /**
     * 清除图片
     */
    public handleClearFile()
    {
        //动画隐藏
        $('.xy_drag').addClass('zoomOut');
        setTimeout(() => {
            //删除元素
            $('.xy_drag').remove()
            //删除文件数据
            UploadFile.files = []
            //删除预览数据
            UploadFile.baseFiles = []
            //显示文字
            $('.drag_text').text(UploadFile.config.drag.text)
        },400)
       
    }
    /**
     * 文件上传
     * @param callBack [function] 请求成功执行回调
     */
    public async handleUpload(callBack?:(res?:any) => void):Promise <void>
    {
        if(!this.isAction)
        {   
            throw new Error('参数有误');
        }
        // 判断是否有上传文件
        if(UploadFile.files.length)
        {
            if(!UploadFile.config.url) return(layer.msg('文件上传路径有误，请检查是否未填写路径'));
            
            if(this.runStatus) return (layer.msg('请勿重复提交，正在上传中...'));

            //loading层
            uploadLoading = layer.load(0, {
                shade:  [0.5,'#fff'],
            });
            typeof callBack == 'function' ? callBack(await this._handleSendUpload()) : await this._handleSendUpload();
            
        }else
        {
            layer.msg('请先选择图片');
        }
    }
    /**
     * 文件上传回调
     * @param success [function] 请求成功执行回调
     * @param error [function] 请求失败执行回调
     */
    public handleCallback(success:() => void,error:() => void):void
    {
        this.success = success
        this.error = error
    }
    /**
     * 发送请求
     */
    private _handleSendUpload():Promise <object|string>
    {
        let _this = this
        //改变状态
        this.runStatus = true;
        //实例化FormData
        let data = new FormData()
        if(UploadFile.config.isDirectUpload)
        {
            //直接上传
            data.append(UploadFile.config.param,<any>UploadFile.files[UploadFile.files.length - 1])
        }else
        {
            //file二进制文件参数（提交上传）
            UploadFile.files.forEach((val:any,key:number) => {
                data.append(UploadFile.config.param + '['+ key + ']',val)
            })
        }
       
        //请求携带参数
        let param = UploadFile.config.data
        //判断是否有携带参数
        if(JSON.stringify(param) != "{}")
        {
            if(typeof param == 'object')
            {
                //添加参数
                for(let item in param)
                {
                    data.append(item,param[item])
                }
            }
        }
       
        return new Promise((resolve:(res?:any) => void, reject:(e?:any) => void) => {
            
            $.ajax({
                url:UploadFile.config.url,
                type:'POST',
                data:data,
                processData: false,
                contentType: false,
                success:function(res:object|string)
                {
                    //改变页面状态
                    $('.uploadFileStatus').text(UploadFile.config.successText).css('color','green')
                    //返回结果
                    resolve(res)
                    //执行回调
                    typeof _this.success == 'function' && _this.success(res)
                },
                complete:function()
                {
                    //执行结束（改变状态）
                    _this.runStatus = false;
                    //关闭加载
                    layer.close(uploadLoading);
                },
                error:function(e:any)
                {
                    //改变页面状态
                    $('.uploadFileStatus').text(UploadFile.config.errorText).css('color','red')
                    //返回结果
                    reject(e)
                    //执行回调
                    typeof _this.error == 'function' && _this.error(e)
                } 
            })
        })
    }
    /* 元素绑定事件 */
    private _handle():void
    {
        let _this:any = this
        //图片预览、删除图片
        $(UploadFile.config.drag.el || this.imgShowEl).unbind("click").on('click','.drag_del,.drag_pre',function(this:Object){
            
            let handle = $(this).hasClass('drag_del') ? '_handleDelFile' : '_handlePreview'

             _this[handle]($(this).attr('data-index'))
        })
    }
    /* 元素样式 */
    private _handleSetStyle()
    {
        let style = UploadFile.config.dragChildEl;
        let drag = UploadFile.config.drag;
        let html = `
            <style>
                @-webkit-keyframes zoomIn {
                    from {
                    opacity: 0;
                    -webkit-transform: scale3d(0.3, 0.3, 0.3);
                    transform: scale3d(0.3, 0.3, 0.3);
                    }
                
                    50% {
                    opacity: 1;
                    }
                }
                
                @keyframes zoomIn {
                    from {
                    opacity: 0;
                    -webkit-transform: scale3d(0.3, 0.3, 0.3);
                    transform: scale3d(0.3, 0.3, 0.3);
                    }
                
                    50% {
                    opacity: 1;
                    }
                }
                
                .zoomIn 
                {
                    -webkit-animation-name: zoomIn;
                    animation-name: zoomIn;
                }
                @-webkit-keyframes zoomOut {
                    from {
                      opacity: 1;
                    }
                  
                    50% {
                      opacity: 0;
                      -webkit-transform: scale3d(0.3, 0.3, 0.3);
                      transform: scale3d(0.3, 0.3, 0.3);
                    }
                  
                    to {
                      opacity: 0;
                    }
                  }
                  
                  @keyframes zoomOut {
                    from {
                      opacity: 1;
                    }
                  
                    50% {
                      opacity: 0;
                      -webkit-transform: scale3d(0.3, 0.3, 0.3);
                      transform: scale3d(0.3, 0.3, 0.3);
                    }
                  
                    to {
                      opacity: 0;
                    }
                  }
                  
                  .zoomOut 
                  {
                    -webkit-animation-name: zoomOut;
                    animation-name: zoomOut;
                  }
                  

                .drag_clearfix::after,.drag_clearfix::before
                {
                    display:block;
                    content:'';
                    clear:both;
                }
                ${drag.el}
                {
                    position: relative;
                    width:${drag.width}px;
                    height:${drag.height}px;
                    border:${drag.border};
                    color:#ccc;
                }
                .pointer_none *
                {
                    pointer-events:none;
                }
                .drag_text
                {
                    position: absolute;
                    top:50%;
                    left:50%;
                    font-size:20px;
                    font-family: 'STKaiti';
                    transform:translate(-50%,-50%)
                }
                .xy_drag
                {
                    position:relative;
                    display:inline-block;
                    width: ${style.width}px;
                    margin:${style.spaceBetween};
                    box-shadow:6px 5px 8px #ccc;
                    background:#fff;
                    z-index:6;
                    border-radius: 5px;
                    overflow: hidden;
                    -webkit-animation-duration: .4s;
                    animation-duration: .4s;
                    animation-fill-mode:forwards;
                }
                .xy_drag:hover
                {
                    box-shadow:6px 5px 8px #999;
                }
                .xy_drag .drag_upload_file
                {
                    display:block;
                    width:100%;
                }
                .xy_drag .drag_desc
                {
                    padding:0 5px;
                    box-sizing:border-box;
                }
                .xy_drag .drag_file_name,.xy_drag .drag_file_size
                {
                    text-align:center;
                    font-size:12px;
                    height:30px;
                    line-height:30px;
                    overflow: hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                }
                .xy_drag .drag_file_size
                {
                    height:20px;
                    line-height:20px;
                }
                .xy_drag .drag_footer
                {
                    height:30px;
                }
                .xy_drag .drag_footer .uploadFileStatus
                {
                    float:left;
                    font-size:14px;
                    line-height: 25px;
                    margin-left:6%
                }
                .xy_drag .drag_footer .drag_footer_item
                {
                    float:right;
                    width:50%;
                }
                .xy_drag .drag_footer .drag_footer_item .drag_del
                {
                    width: 35%;
                    margin-left: 20%;
                }
                .xy_drag .drag_footer .drag_footer_item .drag_pre
                {
                    width: 30%;
                }
                .xy_drag .drag_footer .drag_footer_item .drag_pre,.xy_drag .drag_footer .drag_footer_item .drag_del
                {
                    cursor: pointer;
                    vertical-align: middle;
                }
            </style>
        `;
        $('head').append(html)
    }
    //拖拽上传
    private _handleDragUpload():void
    {
        let _this = this
        //保存拖拽元素
        let drag = UploadFile.config.drag;
        //保存定时器
        let timer = <any>'';
        if(drag.el)
        {
            //禁止浏览器打开文件    
            document.addEventListener('drop', function (e) {
                e.preventDefault()
            }, false)
            //文字元素
            let textEl = document.createElement('span');
            //显示文字
            $(drag.el).html($(textEl).addClass('drag_text').text(drag.text))
            
            //兼容谷歌火狐
            $(document).unbind("dragover").bind('dragover',drag.el,function(e:any){
                let event = e || window.event;  
                event.preventDefault();
                event.stopPropagation();
                event.originalEvent.dataTransfer.dropEffect = 'copy';

                clearTimeout(timer)

                if($('.xy_drag').length)
                {
                    $(drag.el).addClass('pointer_none')
                }

                timer = setTimeout(() => {
                    $(drag.el).removeClass('pointer_none')
                },500)

            })
            
            //进入目标元素
            $(drag.el).unbind("dragenter").bind('dragenter',function(e:any){
                //保存默认边框颜色
                _this.lineColor = _this.lineColor || $(drag.el).css('border-color');
                $(drag.el).css('border-color',drag.enterLineColor || 'red')
            })

             //离开目标元素
             $(drag.el).unbind("dragleave").bind('dragleave',function(e:any){
                $(drag.el).css('border-color',_this.lineColor || $(drag.el).css('border'))
            })

            //在目标元素释放文件
            $(drag.el).unbind("drop").bind('drop',function(e:any){
                let event = e || window.event;
                event.preventDefault();
                event.stopPropagation();
                //还原默认边框颜色
                $(drag.el).css('border-color',_this.lineColor || $(drag.el).css('border'))
                //保存文件
                let files = <any> e.originalEvent.dataTransfer.files;
                // 文件验证、保存
                _this._handleSaveFiles(files)
                //还原属性
                $(drag.el).removeClass('pointer_none')
            })
        }
    }
    /**
     * 图片预览
     * @param index [INT] 当前图片下标
     */
    private _handlePreview(index:number):void
    {
        //保存图集数据
        var data = <any> {
            "title": "", //相册标题
            "id": 0, //相册id
            "start": ~~index, //初始显示的图片序号，默认0
            "data":[]
        }
        //赋值
        data.data = UploadFile.baseFiles
        //弹出动画
        layer.photos({
            photos: data,
            shift: 5 //0-6的选择，指定弹出图片动画类型，默认随机（请注意，3.0之前的版本用shift参数）
        });
    }
    /**
     * 删除图片
     * @param index index [INT] 当前图片下标
     */
    private _handleDelFile(index:number):void
    {
        index = ~~index
        //删除文件源
        UploadFile.files.splice(index,1)
        //删除预览图集数据
        UploadFile.baseFiles.splice(index,1)
        //删除元素
        $('.xy_drag').eq(index).addClass('zoomOut')
        setTimeout(() => {
            $('.xy_drag').eq(index).remove()
            if(UploadFile.files.length <= 0)
            {
                //显示文字
                $('.drag_text').text(UploadFile.config.drag.text)
            }
            //重置元素下标
            if($('.xy_drag').length >= 1)
            {
                $('.xy_drag').each(function(key:number,val:object){
                    $(val).attr('data-index',key)
                    //重置下标
                    $(val).find('.drag_del,.drag_pre').attr('data-index',key)
                })
            }
        },400)
    }
    /**
     * 保存文件
     * @param files 文件数组对象
     */
    private _handleSaveFiles(files:Array<object>)
    {
        //图片上传最大数
        let maxFile = <number>UploadFile.config.maxFile
    
        if((UploadFile.files.length + files.length) <= maxFile || maxFile <= 0)
        {
            for(let file of files)
            {
                this._handleAsync(file)
            }
        }else
        {
            layer.msg('超出最大上传文件数量');
        }
    }
    /**
     * 异步保存文件
     * @param file 二进制文件
     */
    private async _handleAsync(file:any):Promise <void> 
    {
        //图片验证（返回false或者图片base64）
        let res:any = await this._handleCheckFile(file)
        //保存文件
        if(res !== false)
        {
            //保存文件数据
            UploadFile.files.push(file)
            //当前上传的下标
            let index = <number> UploadFile.files.length - 1
            //创建元素
            let el = <object> document.createElement(UploadFile.element)
            //设置元素下标
            $(el).attr('data-index',index).addClass('xy_drag zoomIn animated');
            //删除图标
            let delImg = 'data:image/jpeg;base64,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';
            //预览图标
            let preview = 'data:image/png;base64,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';
            //保存图集资源
            UploadFile.baseFiles.push({
                "alt": file.name,
                "pid": file.lastModified, //图片id
                "src": res, //原图地址
                "thumb": "" //缩略图地址
            })

            let hmtl = 
            `
                <img class="drag_upload_file" src="${res}" draggable="false"/>
                <div class="drag_desc">
                    <div class="drag_file_name">${file.name}</div>
                    <div class="drag_file_size">文件大小：${~~(file.size / 1024)}KB</div>
                    <div class="drag_footer drag_clearfix">
                        <div class="uploadFileStatus"></div>
                        <div class="drag_footer_item">
                            <img src="${delImg}" data-index="${index}" class="drag_del" />
                            <img src="${preview}" data-index="${index}" class="drag_pre" />
                        </div>
                    </div>
                </div>
            `;
            //回显图片
            $(UploadFile.config.drag.el || this.imgShowEl).append($(el).html(hmtl))
            //清除文字
            $('.drag_text').text('')
            //直接上传文件
            if(UploadFile.config.isDirectUpload)
            {
                this.handleUpload()
            }
        }
    
    }
    /**
     * 图片验证
     * @param file 二进制文件
     */
    private _handleCheckFile(file:any):Boolean|Object
    {
        //文件类型
        let type = <string> file.type;
        //判断图片是否重复
        let isRepeat = false;
        //保存图片base64
        let baseFile:string = '';
        if(type.indexOf('image/') == -1)
        {   
            layer.msg('请上传图片');
            return false;
        }
        //验证图片类型
        let check = UploadFile.config.suffix.length ? UploadFile.config.suffix.filter( (val:any) => file.name.toLowerCase().indexOf(val) != '-1') : [true]
        if(check.length <= 0)
        {
            layer.msg('允许上传的图片格式为：' + UploadFile.config.suffix.join('，'))
            return false;
        }
        //判断图片的大小
        if(!(file.size / 1024 / 1024 < UploadFile.config.size) && UploadFile.config.size != 0)
        {
            layer.msg('允许上传图片的大小不能超过' + UploadFile.config.size + 'M')
            return false;
        }
        //验证图片重复、尺寸
        return new Promise((resolve:() => void, reject:() => void) => {
            //实例化fileReader
            let fd = new FileReader();
            //转base64
            fd.readAsDataURL(file)
            //加载当前传入的file
            fd.onload = function () 
            {
                //保存图片资源
                baseFile = <string>this.result
                resolve()
            }
        }).then(() => {
            //判断图片是否重复
            return new Promise((resolve:() => void, reject:() => void) => {
                UploadFile.baseFiles.forEach( (val:any) => {
                    if(!isRepeat)
                    {
                        if(val.src == baseFile) isRepeat = true
                    }
                })
                isRepeat && UploadFile.config.isRepeat ? reject() : resolve()
            }).then(() => {
                //验证图片尺寸
                if(UploadFile.config.specs.length)
                {
                    return new Promise((resolve:() => void, reject:() => void) => {
                        let valid = false;
                        let _URL = window.URL || window.webkitURL;
                        let img = new Image();
                        img.onload = function() {
                            //图片尺寸验证
                            UploadFile.config.specs.forEach((val:string) => {
                                var size = <any> val.split('*');
                                //验证图片尺寸
                                if(img.width == size[0] && img.height == size[1])
                                {
                                    valid = true
                                }
                            })
                            valid ? resolve() : reject();
                        }
                            img.src = _URL.createObjectURL(file);
                        }).then(() => {
                            return baseFile;
                        }, () => {
                            layer.msg('允许上传的图片尺寸为：'+UploadFile.config.specs.join('，'));
                            return false;
                     });
                }
                return baseFile;
            },() => {
                // layer.msg('请勿重复上传图片');
                return false
            })
        });
    
    }
    
 }





