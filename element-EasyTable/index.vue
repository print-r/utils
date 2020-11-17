<template>
  <div v-if="!reload">
    <el-table
      v-loading="loading"
      auto-resize
      resizable
      size="small"
      border
      style="width: 100%"
      v-on="$listeners"
      v-bind="$attrs"
      @select-all="handleSelectionChange"
      @selection-change="handleSelectionChange"
    >
      <template v-for=" (item, index) in tableOptions">
        <el-table-column
          v-if="item.type == 'selection' || item.type == 'index'"
          :key="index"
          :label="item.title"
          :type="item.type"
          align="center"
          :width="item.width || 54"
        />
        <el-table-column 
          v-else-if="item.type == 'expand'"
          :type="item.type"
          :key="index"
        >
        <template slot-scope="scope">
          <Render
            v-if="item.render"
            :row="scope.row" 
            :index="scope.$index" 
            :render="item.render" 
          />
        </template>
        </el-table-column>
        <el-table-column
          v-else
          :key="index"
          align="center"
          :label="item.title"
          :prop="item.prop"
          :width="item.width"
          :sortable="item.sortable"
        >
          <!-- 合并头 -->
          <template v-if="item.merge" >
            <el-table-column
              v-for="(val, key) in item.merge"
              :key="key"
              align="center"
              :width="val.width"
              :label="val.title"
              :prop="val.prop"
              :sortable="val.sortable"
            >
              <template slot-scope="scope">
                <template v-if="val.render">
                  <Render :row="scope.row" :index="scope.$index" :render="val.render" />
                </template>
                <template v-else>
                  <span>{{ scope.row[val.prop] }}</span>
                </template>
              </template>
            </el-table-column>
          </template>
          <!-- 普通表头 -->
          <template v-if="!item.merge" slot-scope="scope">
            <template v-if="item.render">
              <Render :row="scope.row" :index="scope.$index" :render="item.render" />
            </template>
            <template v-else>
              <span>{{ scope.row[item.prop] }}</span>
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <div class="pagination d-flex justify-content-flex-end">
      <el-pagination
        @size-change="handleChangeSize"
        @current-change="handleChangePage"
        :hide-on-single-page="true"
        :page-sizes="pageSizes"
        :current-page="page"
        :page-size="size"
        :layout="layout"
        :total="total"
        :background="background"
        >
      </el-pagination>
    </div>
  </div>
</template>
<script>
import Render from './components/render'
export default {

  name: '',

  components: {
    Render
  },

  props: {
    tableOptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0,
    },
    page: {
      type: Number,
      default: 1,
    },
    size: {
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
    background: {
      type: Boolean,
      default: false,
    }
  },

  data() {
    return {
      reload: false,
    }
  },

  // 计算属性
  computed: {},

  // 数据监听
  watch: {
    tableOptions(newVal, oldVal) {
      this.reload = true
      this.$nextTick(() => {
        this.reload = false
      })
    },
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
  destroyed() {},

  // 使用keep-alive缓存进入页面触发
  activated() {},

  // void
  methods: {
    // 全选
    handleSelectionChange(data) {
      this.$emit('selection-change', data)
    },
    // 切换每页条数
    handleChangeSize(size) {
      this.$emit('update:size', size);
      this.$emit('pagination');
    },
    // 切换页码
    handleChangePage(page) {
      this.$emit('update:page', page);
      this.$emit('pagination');
    },
  },

  // 进入路由前
  beforeRouteEnter(to, from, next) {
    next((vm) => {})
  },

  // 离开路由后
  beforeRouteLeave(to, from, next) {
    next()
  }
}
</script>
<style lang='scss' scoped>

</style>
