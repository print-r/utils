export default {
    functional: true,
    props: {
        row: {
            type: Object,
            default: () => new Object,
        },
        render: {
            type: Function,
            default: () => {},
        },
        index: {
            type: Number,
            default: 0,
        },
    },
    render: (h, evt) => {
        return evt.props.render.call(evt.parent, h, evt.props.row);
    }
};