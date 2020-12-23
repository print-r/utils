<template>
  <div v-if="!reload">
    <el-table
      ref="easyTable"
      style="width: 100%"
      v-loading="loading"
      v-on="$listeners"
      v-bind="{...$EasyTableOptions.tableAttrs, ...$attrs}"
      :row-class-name="handleSetIndex"
      @select-all="handleSelectionChange"
      @selection-change="handleSelectionChange"
      @row-click="handleClick"
    >
      <template v-for=" (item, index) in tableOptions">
        <el-table-column
          v-if="item.type == 'selection' || item.type == 'index'"
          :key="index"
          :label="item.title"
          :type="item.type"
          :width="item.width || 54"
          v-bind="{...$EasyTableOptions.tableColumnAttrs, ...item.attrs}"
        />
        <el-table-column
          v-else-if="item.type == 'radio'"
          :key="index"
          :label="item.title"
          :width="item.width || 54"
          v-bind="{...$EasyTableOptions.tableColumnAttrs, ...item.attrs}"
        >
        <template slot-scope="scope">
          <el-radio 
            :class="{_radio: scope.row[radioConfig.field] == void 0}" 
            v-model="radio" :label="scope.row[$attrs['row-id']] || scope.$index"
          >
          {{ scope.row[radioConfig.field] }}
          </el-radio>
        </template>
        </el-table-column>
        <el-table-column 
          v-else-if="item.type == 'expand'"
          :type="item.type"
          :key="index"
          v-bind="{...$EasyTableOptions.tableColumnAttrs, ...item.attrs}"
        >
        <template slot-scope="scope">
          <Render
            v-if="item.render"
            :row="scope.row" 
            :render="item.render" 
          />
        </template>
        </el-table-column>
        <el-table-column
          v-else
          :key="index"
          :label="item.title"
          :prop="item.prop"
          :width="item.width"
          :sortable="item.sortable" 
          v-bind="{...$EasyTableOptions.tableColumnAttrs, ...item.attrs}"
        >
          <!-- 自定义表头 -->
          <template v-if="item.renderHeader">
            <template slot="header">
              <Render :render="item.renderHeader" />
            </template>
          </template>
          <!-- 合并头 -->
          <template v-if="item.merge" >
            <tableColumnTree 
              :merge="item.merge"
              :handleSetValue="handleSetValue"
              :handleShowTips="handleShowTips"
            />
          </template>
          <!-- 普通表头 -->
          <template v-if="!item.merge" slot-scope="scope">
            <template v-if="item.render">
              <Render :row="scope.row" :index="scope.$index" :render="item.render" />
            </template>
            <template v-else>
              <template v-if="getRows(item.omit || $EasyTableOptions.tableColumnAttrs.omit)">
                  <el-tooltip
                    :disabled="scope.row._disabled"
                    :placement="getDirection(item.omit || $EasyTableOptions.tableColumnAttrs.omit)"
                    v-bind="{...item.omit, ...$EasyTableOptions.tableColumnAttrs.omit}"
                  >
                    <span slot="content">{{ handleSetValue(item, scope.row[item.prop], scope.row) }}</span>
                    <span 
                      :style="setStyle(item.omit || $EasyTableOptions.tableColumnAttrs.omit)"
                      @mouseenter="handleShowTips($event, scope.row, handleSetValue(item, scope.row[item.prop], scope.row), getRows(item.omit || $EasyTableOptions.tableColumnAttrs.omit))"
                    >
                      {{ handleSetValue(item, scope.row[item.prop], scope.row) }}
                    </span>
                  </el-tooltip>
              </template>
              <span v-else>{{ handleSetValue(item, scope.row[item.prop], scope.row) }}</span>
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div :class="`align-${$EasyTableOptions.paginationAttrs.align || 'right'}`">
      <el-pagination
        :style="{marginTop: ($EasyTableOptions.paginationAttrs.marginTop || 50) + 'px'}"
        class="_pagination"
        v-bind="{...$EasyTableOptions.paginationAttrs, ...paginationAttrs}"
        @size-change="handleChangeSize"
        @current-change="handleChangePage"
        :hide-on-single-page="hideOnSinglePage"
        :page-sizes="$EasyTableOptions.paginationAttrs.pageSizes || pageSizes"
        :current-page="page"
        :page-size="pageSize"
        :layout="layout"
        :total="total"
        >
      </el-pagination>
    </div>
  </div>
</template>
<script>
import Render from './components/render'
import tableColumnTree from './components/table-column-tree'
import omitHandler from './utils/omit'
export default {

  name: 'EasyTable',

  components: {
    Render,
    tableColumnTree
  },

  props: {
    tableOptions: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    total: {
      type: Number,
      default: 0,
    },
    page: {
      type: Number,
      default: 1,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30, 40 ,50],
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    paginationAttrs: {
      type: Object,
      default: () => new Object,
    },
    hideOnSinglePage: {
      type: Boolean,
      default: true
    },
    checkboxConfig: {
      type: Object,
      default: () => new Object,
    },
    // TODO: row-id 必须存在
    radioConfig: {
      type: Object,
      default: () => new Object,
    }
  },

  data() {
    return {
      reload: false,
      radio: null,
      selectionList: [],
    }
  },

  // 计算属性
  computed: {
    ...omitHandler,
  },

  // 数据监听
  watch: {
    tableOptions() {
      this.reload = true;
      setTimeout(() => {
        this.reload = false;
      }, 50)
    },
    'radioConfig.selectedVal': {
      handler(newVal) {
        this.radio = newVal;
      },
      immediate: true,
    },
    radio(newVal) {
      this.handleCheckedChange(newVal);
    }
  },

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
  destroyed() {
    this.handleParamsInit();
  },

  // 使用keep-alive缓存进入页面触发
  activated() {},

  // void
  methods: {
    // set index 
    handleSetIndex({ row, rowIndex }) {
      row.$index = rowIndex;
    },
    // init params
    handleParamsInit() {
      this.radio = '';
      this.selectionList = [];
    },
    // 单选、全选
    handleSelectionChange(data) {
      this.selectionList = data;
      if (this.checkboxConfig.fetchVal && this.$attrs['row-id']) {
        let ids = [];
        data.some( v => {
          ids.push(v[this.$attrs['row-id']])
        })
        this.$emit('selected-change', ids)
        return 
      }
      this.$emit('selected-change', data)
    },
    // 切换每页条数
    handleChangeSize(size) {
      this.$emit('update:page-size', size);
      this.$emit('pagination');
    },
    // 切换页码
    handleChangePage(page) {
      this.$emit('update:page', page);
      this.$emit('pagination');
    },
    // 单选
    handleCheckedChange(val) {
      let data = val;
      if (this.$attrs['row-id']) {
        data = this.$attrs.data.filter( v => v[this.$attrs['row-id']] == val);
      }
      this.$emit('checked-change', 
        this.radioConfig.fetchVal && this.$attrs['row-id']
        ? data[0][this.$attrs['row-id']] 
        : this.$attrs.data[data] || data[0]
      );
    },
    // row-click
    handleClick(data) {
      if (!this.radioConfig.rowClick && !this.checkboxConfig.rowClick) return;
      // 单选 - radio
      if (this.radioConfig.rowClick) {
        if (this.$attrs['row-id']) {
          this.radio = data[this.$attrs['row-id']];
        } else {
          let index;
          this.$attrs.data.forEach( (v, k) => {
            if (v == data) {
              index = k;
            }
          })
          this.radio = index;
        }
      }
      // 单选 - checkbox
      if (this.checkboxConfig.rowClick) {
        let flag = this.selectionList.filter( v => v.$index == data.$index);
        this.$refs.easyTable.toggleRowSelection(data, !flag.length);
      }
    },
    // set value
    handleSetValue(item, val, row) {
        // 枚举
        if (item.enumType) { 
          return this.handleSetEnumValue(item, val)
        }
        // 自定义返回值
        if (item.returnVal && typeof item.returnVal == 'function' && this.handleCheckEmpty(val)) {
          return this.handleSetEmptyPlaceholder(item, item.returnVal(val, row));
        }
        return this.handleSetEmptyPlaceholder(item, val)
    },
    // set enum value
    handleSetEnumValue(item, val) {
      if (!item.enumType || !item.enumType.data || !(item.enumType.data instanceof Array) || !item.enumType.data.length) {
        return this.handleSetEmptyPlaceholder(item, val);
      }
      let value = '';
      item.enumType.data.forEach( v => {
        // 自定义参数
        if (item.enumType.params && item.enumType.params.label && item.enumType.params.value) {
          if (v[item.enumType.params.value] === val) {
            value = v[item.enumType.params.label]
          }
        } else {
          // 默认参数 label & value
          if (v.value === val) {
            value = v.label
          }
        }
      })
      return this.handleSetEmptyPlaceholder(item, value);
    },
    // set empty placeholder
    handleSetEmptyPlaceholder(item, val) {
      if (typeof val == 'number') return val;
      if (typeof val == 'string' && val.length) return val;
      if (item.emptyPlaceholder) return item.emptyPlaceholder;
      if (this.$EasyTableOptions.tableColumnAttrs && this.$EasyTableOptions.tableColumnAttrs.emptyPlaceholder) 
      return this.$EasyTableOptions.tableColumnAttrs.emptyPlaceholder;
    },
    // check empty
    handleCheckEmpty(val) {
      if (val != void 0 && val != null && val !== '') {
        return true
      }
      return false
    },
    // show Tips
    handleShowTips(e, item, val, rows) {
      if (!rows) {
        this.$set(this.$attrs.data[item.$index], '_disabled', true)
        return
      }
      let span = document.createElement('span');
          span.className = '__tips__',
          span.style.position = 'fixed';
          span.style.visibility = 'hidden';
          span.style.fontSize = window.getComputedStyle(e.target).fontSize;
          span.style.whiteSpace = 'nowrap';
          span.innerText = val;
          document.body.appendChild(span);
      let targetWidth = document.querySelector('.__tips__').offsetWidth;
          span.remove();
      let flag;
      if (targetWidth / e.target.offsetWidth >= rows) {
        flag = false;
      } else {
        flag = true;
      }
      this.$set(this.$attrs.data[item.$index], '_disabled', flag)
    }
  },

  // 进入路由前
  beforeRouteEnter(to, from, next) {
    next(() => {})
  },

  // 离开路由后
  beforeRouteLeave(to, from, next) {
    next()
  }
}
</script>
<style scoped>

.align-left {
  text-align: left;
}

.align-right {
  text-align: right;
}

.align-center {
  text-align: center;
}

/deep/ ._radio .el-radio__label {
  padding-left: 0 !important;
}

</style>
