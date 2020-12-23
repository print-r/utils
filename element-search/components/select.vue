<template>
    <div class="_select" >
         <span>{{ item.text }}：</span>
          <el-select
            class="textField-filled-rounded"
            size="small"
            v-model="selected"
            clearable
            :placeholder="item.placeholder"
          >
            <el-option
              v-for="value in item.options"
              :key="value.value"
              :label="value.label"
              :value="value.value"
            >
            </el-option>
          </el-select>
    </div>
</template>
<script>
export default {

    name:'',

    components: {},

    props: {
        item: {
            type: Object,
            required: true,
        }
    },

    data() {
        return {
            selected: this.item.value,
        }
    },

    // 数据监听
    watch: {
        selected(newVal, oldVal) {
            this.$emit('handleSetValue', newVal)
        },
        'item.value': {
            handler: function(newVal, oldVal) {
                this.selected = newVal;
            }
        }
    },

    // 计算属性
    computed: {},

    // void
    methods:{},

    // 生命周期 - 创建之前
    beforeCreate() {},

    // 生命周期 - 创建完成
    created() {},

    // 生命周期 - 挂载之前
    beforeMount() {},

    // 生命周期 - 挂载完成
    mounted() {},

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
<style lang='scss' scoped>
    ._select
    {
        display: flex;
        align-items: center;

        font-weight: 700;
    }
</style>