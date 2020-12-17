<template>
    <div class="_search">
        <div class="search-item" v-for="(item, index) in searchOptions" :key="index">
          <span v-if="!item.components" class="label font-size-14px white-space-nowrap font-color-grey4"
            >{{ item.text }}：</span
          >
          <SearchRender :item="item" @handleSearch="handleSearch" @handleSetValue="handleSetValue" />
        </div>
        <div class="search-item">
             <div
                class="button-base small"
                style="marginRight: 12px"
                @click="handleSearch"
              >
                搜索
              </div>
              <div
                class="button-base small success"
                @click="handleReset"
              >
                重置
              </div>
        </div>
    </div>
</template>
<script>
import SearchRender from './render';
export default {

    name:'',

    components: {
        SearchRender,
    },

    props: {
        options: {
            type: Array,
            required: true,
        },
        search: {
            type: Function,
            default: () => {},
        },
        repeatRequest: {
            type: Boolean,
            default: true,
        }
    },

    data() {
        return {
            searchOptions: [],
            oldParams: {},
        }
    },

    // 数据监听
    watch: {
        options: {
            handler(newVal, oldVal) {
                this.init();
            },
            immediate: true,
        }
    },

    // 计算属性
    computed: {
        rules() {
            return {
                text: {
                    target: 'el-input', // 元素名称
                    value: '', // 默认值
                    attrs: { // 属性
                        type: 'text',
                        clearable: 'clearable',
                    },
                    placeholder: '请输入', // 占位符
                    handler: [], // handler: [input, blur] TODO: 键盘事件参数示例： keyup.enter || keyup.13
                },
                number: {
                    target: 'el-input',
                    attrs: {
                        type: 'number',
                        clearable: 'clearable',
                    },
                    placeholder: '请输入',
                    handler: []
                },
                date: {
                    target: 'el-date-picker',
                    type: '',
                    attrs: {
                        'value-format': 'yyyy/MM/dd'
                    },
                    placeholder: '请选择',
                    handler: [], // 可填 change
                },
                dateRange: {
                    target: 'el-date-picker',
                    type: '',
                    attrs: {
                        'type': 'datetimerange',
                        'range-separator': '至',
                        'start-placeholder': '开始日期',
                        'end-placeholder': '结束日期',
                        'value-format': 'yyyy/MM/dd HH:mm:ss',
                    },
                    handler: [], // 可填 change
                },
                select: {
                    components: 'select', // 组件名称
                    target: '',
                    type: '',
                    value: '',
                    attrs: {},
                    placeholder: '请选择',
                    handler: [], // 可填 change
                    options: [], // 选项数据 TODO:参数示例 [{ value: true, label: '是' }],
                },
                selectSearch: {
                    components: 'selectSearch', // 组件名称
                    target: '',
                    type: '',
                    value: '',
                    attrs: {},
                    placeholder: '请选择',
                    request: {
                        api: '', // 请求的接口对象
                        requestParamName: '', // 请求参数名称
                    }, 
                    params: { // 参数名称
                        label: 'label',
                        value: 'value'
                    },
                    handler: [], // 可填 change
                    options: [], // 选项数据 TODO:参数示例 [{ value: true, label: '是' }],
                }
            }
        }
    },

    // void
    methods:{
        init() {
            this.searchOptions = [];
            this.options.forEach( v => {
                let rules = this.rules[v.type];
                this.searchOptions.push({
                    text: v.text,   
                    prop: v.prop,
                    value: v.value != void 0 ? v.value : '',
                    target: rules.target,
                    attrs: v.attrs || rules.attrs,
                    placeholder: v.placeholder || rules.placeholder,
                    handler: v.handler || rules.handler,
                    components: rules.components || '',
                    options: v.options || [],
                    selected: v.selected || '',
                    request: v.request || rules.request,
                    params: v.params || rules.params,
                })
                this.oldParams[v.prop] = v.value || '';
            })
        },
        handleSetValue(evt) {
            this.searchOptions.forEach( v => {
                if (v.prop == evt.prop) {
                    v.value = evt.value;
                }
            })
            evt.isAction && this.handleSearch();
        },
        handleSearch() {
            if (typeof this.search === 'function') {
                let params = {};
                this.searchOptions.forEach( v => {
                    params[v.prop] = v.value;
                })
                if (!this.repeatRequest && JSON.stringify(this.oldParams) == JSON.stringify(params))
                return
                this.oldParams = Object.assign({}, JSON.parse(JSON.stringify(params)));
                this.search(params);
            }
        },
        handleReset() {
            this.searchOptions.forEach( v => {
                v.value = '';
                v = Object.assign({}, v);
            })
            this.handleSearch();
        },
    },

    // 生命周期 - 创建之前
    beforeCreate() {},

    // 生命周期 - 创建完成
    created() {},

    // 生命周期 - 挂载之前
    beforeMount() {},

    // 生命周期 - 挂载完成
    mounted() {
        
    },

    // 生命周期 - 更新之前
    beforeUpdate() {},

    // 生命周期 - 更新完成
    updated() {},

    // 生命周期 - 销毁之前
    beforeDestroy() {},

    // 生命周期 - 销毁完成
    destroyed() {},

    // 使用keep-alive缓存进入页面触发
    activated() {},

    // 进入路由前
    beforeRouteEnter(to, from, next) {
        next( (vm) => {});
    },

    // 离开路由后
    beforeRouteLeave(to, from, next) {
        next();
    },
}
</script>
<style>
._search
{
    display: flex;
    flex-wrap: wrap;

    width: 100%;
}
.search-item
{
    display: flex;
    align-items: center;

    padding: 10px;
}
.search-item .label
{
    font-weight: 700;
}


input[type=number] {
    -moz-appearance:textfield;
}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

</style>