export default {
    functional: true,
    props: {
        row: {
            type: Object,
            default: () => {},
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
        evt.props.row.$index = evt.props.index;
        return evt.props.render(h, evt.props.row);
    }
};