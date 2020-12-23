<template>
  <div id="app">
      <EasyTable
        row-id="id"
        :data="tableData"
        :tableOptions="tableOptions"
        :page.sync="page"
        :page-size.sync="size"
        :total="total"
        :checkbox-config="{fetchVal: true, rowClick: true}"
        :radio-config="{selectedVal: selectedVal, fetchVal: true, rowClick: true}"
        @selected-change="select"
        @checked-change="handleChecked"
        @pagination="handleChangePage"
      />
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {},
  data() {
    return {
      page: 1,
      size: 10,
      total: 1000,
      selectedVal: -1,
      tableData: [{
            id: 10,
            date: '2016-05-02',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄',
            type: '1',
            img: require('@/assets/images/avatar.jpg'),
            status: 1,
          }, {
            id: 21,
            date: '2016-05-04',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1517 弄上海市普陀区金沙江路 1517 弄上海市普陀区金沙江路 1517 弄',
            type: 0,
            img: require('@/assets/images/avatar.jpg'),
            status: 1,
          }, {
            id: 33,
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄',
            type: false,
            img: require('@/assets/images/avatar.jpg'),
            status: 2,
          }, {
            id: 4,
            date: '2016-05-03',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1516 弄',
            type: '上海市普陀区金沙江路 1516 上海市普陀区金沙江路 1516',
            img: require('@/assets/images/avatar.jpg'),
            status: 0,
          }]
    }
  },
  computed: {
    tableOptions() {
      return [
        {
          title: '单选',
          type: 'radio',
        },
        {
          title: '日期',
          prop: 'date',
          merge: [
            {
              title: '名称',
              prop: 'name',
              merge: [
                {
                  title: '名称1',
                  prop: 'name',
                },
                {
                  title: '地址',
                  prop: 'address',
                  returnVal: (value) => {
                    return `详细地址：${value}`
                  }
                },
              ],
            },
            {
              title: '地址',
              prop: 'address',
            },
          ]
        },
        {
          title: '名称111',
          prop: 'type',
          renderHeader: () => {
            return (
              <span>
                  <span>自定义表头</span><sup>*</sup>
              </span>
            )
          },
          returnVal: (value) => {
            return `姓名: ${value}`
          }
        },
        {
          title: '图片',
          render: (h, data) => {
            return (
              <div >
                <img style="width: 50px; height: 50px" src={data.img} />
              </div>
            )
          }
        },
        {
          title: '地址',
          prop: 'address',
          omit: {
            effect: "light",
            rows: 2,
            direction: 'top'
          },
        },
        {
          title: '地址',
          prop: 'address',
          omit: 1,
        },
        {
          title: '状态',
          prop: 'status',
          enumType: {
            data: [
              {
                value: 0,
                label: '未开始',
                
              },
              {
                value: 1,
                label: '已开始',
              },
              {
                value: 2,
                label: '进行中',
              },
            ]
          },
        },
        {
          title: '状态2',
          prop: 'status',
          enumType: {
            // 自定义枚举参数
            params: {
              value: 'status',
              label: 'text',
            },
            data: [
              {
                status: 0,
                text: '未开始',
              },
              {
                status: 1,
                text: '已开始',
              },
              {
                status: 2,
                text: '进行中',
              },
            ],
          },
        },
      ]
    }
  },
  methods: {
    handleChangePage() {
      console.log(this.page);
      console.log(this.size);
    },
    handleChecked(data) {
      console.log('radio');
      console.log(data);
    },
    select(data) {
      console.log('selected');
      console.log(data);
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
