<template>
    <div v-if="isShow" class="layerd-loading">
        <div class="load" ></div>
        <div class="content" >
            <img :src="icons[icon]" alt="">
            <div class="text">
                {{content}}
            </div>
        </div>
    </div>
</template>

<script>
export default  {
    data() {
        return{
            icon: 0,
            // 图标路径
            icons: [
                require('./images/timg.gif'),
            ],
            isShow: true,
            content: '',
        };
    },
    methods: {
        handleClose() {
            this.isShow = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    @import './css/loading.scss';
</style>