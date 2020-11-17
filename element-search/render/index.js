import components from '../components';
export default {
    name: 'render',
    render(h) {
        let _this = this;
        /* 引入组件 */
        if (this.item.components) {
            return h(components[this.item.components], {
                props: {
                    item: this.item,
                },
                on: {
                    handleSetValue: function(evt) {
                        let isAction = _this.item.handler.indexOf('change') !== -1;
                        _this.$emit('handleSetValue', {
                            prop: _this.item.prop,
                            value: evt,
                            isAction,
                        });
                    }
                }
            })
        } else {
            /* 创建组件 */
            let handler = {};
            let native = {};
            let isAction = false;
            if (this.item.handler instanceof Array) {
                this.item.handler.forEach(v => {
                    if (v == 'input' || v == 'change') {
                        isAction = true;
                        return;
                    }
                    if (v.indexOf('keyup') !== -1) {
                        let arr = v.split('.');
                        native[arr[0]] = (e) => {
                            if (arr[1] == e.key.toLowerCase() || arr[1] == e.keyCode) {
                                this.$emit('handleSearch');
                            }
                        }
                        return;
                    }
                    handler[v] = () => {
                        this.$emit('handleSearch');
                    }
                })
            }
            return h(this.item.target, {
                class: ['textField-filled-rounded'],
                props: {
                    value: this.item.value,
                },
                attrs: {
                    size: 'medium',
                    placeholder: `${this.item.placeholder}${this.item.text}`,
                    ...this.item.attrs
                },
                on: {
                    input: function(evt) {
                        _this.$emit('handleSetValue', {
                            prop: _this.item.prop,
                            value: evt,
                            isAction,
                        });
                    },
                    ...handler,
                },
                nativeOn: {
                    ...native,
                },
            });
        }
    },
    props: {
        item: {},
    },
};