/**
 * 
 * @param {Object} _this 当前对象
 * @param {String} data 数据名
 * @param {Sting} classPrefix 图片懒加载的 [class | id] 前缀 TODO: 例如：.lazyImg_0, .lazyImg_1, .lazyImg_2 ... 则前缀为.lazyImg_
 * @param {String} paramName 被修改的参数名称[默认：show参数名] TODO: 例 {"id":40700, "imgShow":false, "pic":"//cdn.dusun.com.cn/20/pimg/20170330/40700/p1_200_200.jpg"} 则传入imgShow参数作为需要被修改的参数
 * @param {Number} delay 执行时间
 */ 
export function lazyImg(_this, data, classPrefix, paramName = 'show', delay = 200) {
  let timer = null;
  let name = '';
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      getTree(data.split('.'), _this.data).forEach( (v, k) => {
        if(!v[paramName]) {
          _this.createIntersectionObserver().relativeToViewport({
            bottom: 0,
          }).observe(`${classPrefix}${k}`, evt => {
            if (evt.intersectionRatio >= 1) {
              name = `${data}[${k}].${paramName}`;
              _this.setData({
                [name]: true,
              });
            }
          });
        }
      });
    }, delay);
  }
}

function getTree(arr, treeData, level = 0) {
  if (level == arr.length) {
    return treeData;
  }
  return getTree(arr, treeData[arr[level]], level + 1);
}
