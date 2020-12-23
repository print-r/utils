import EasyTable from './lib/index.vue';

const install = (Vue, opts = {}) => {

    let params = ['tableAttrs', 'tableColumnAttrs', 'paginationAttrs'];

    params.forEach(key => {
        opts[key] = opts[key] || ''
    })

    Vue.prototype.$EasyTableOptions = opts;

    Vue.component(EasyTable.name, EasyTable);
};

if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    version: '0.1.5',
    install,
}