<template>
    <div v-if="show" class="layerd-alert">
        <div class="text animated" :class="anima ? 'bounceInUp' : 'bounceOutDown'" :style="`margin-left:-${left}px;margin-top:-${top}px;`">{{content}}</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            left: 0,
            top: 0,
            content: '提示信息',
            time: 3000,
            show: true,
            anima: true,
        };
    },
    mounted() {
        let timer = '';
        this.$nextTick(() => {
            clearTimeout(timer);
            timer = setTimeout( () => {
                this.anima = false;
                setTimeout(() => {
                    this.show = false;
                }, 1000);
            }, this.time);
        });
    },
};
</script>

<style lang="scss" scoped>
    @import './css/alert.scss';
</style>