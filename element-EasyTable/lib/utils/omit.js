// 处理文字缩略
export default {
    // 返回方向
    getDirection() {
        return item => {
            let direction = 'bottom';
            if (typeof item == 'object') {
                return item.direction || direction
            }
            return direction;
        }
    },
    // 获取行数
    getRows() {
        return item => {
            let rows = 0;
            if (typeof item == 'object') {
                rows = !isNaN(item.rows) ? item.rows : 0;
            } else {
                rows = !isNaN(item) ? item : 0;
            }
            return rows
        }
    },
    // 设置缩略行
    setStyle() {
        return item => {
            let rows = this.getRows(item);
            if (rows > 0) {
                return `
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: ${rows};
                    overflow: hidden;
                `
            }
        }
    },
}