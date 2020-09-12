<template>
    <div v-if="show" class="layerd-confirm">
        <div class="toast animated" :class="anima ? 'zoomIn' : 'zoomOut'">
            <div class="content">
                <div class="tips">{{title}}</div>
                <div class="text">{{content}}</div>
            </div>
            <div class="btn" @click="handleHide">确认</div>
        </div>
        <div class="shade"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            title: '提示', // 提示框标题
            show: true,
            anima: true,
            top: 0,
            content: '提示内容', // 文字内容
            callBack: null, // 回调方法
        };
    },
    methods: {
        handleHide() {
            // 关闭动画
            this.anima = false;
            setTimeout(() => {
                // 执行回调
                if (typeof this.callBack === 'function') {
                    this.callBack();
                }
                // 隐藏组件
                this.show = false;
            }, 150);
        },
    },
};
</script>

<style lang="scss" scoped>
    @import './css/confirm.scss';
</style>