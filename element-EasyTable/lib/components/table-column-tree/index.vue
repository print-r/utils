<template>
    <div>
        <el-table-column
            v-for="(val, key) in merge"
            :key="key"
            :width="val.width"
            :label="val.title"
            :prop="val.prop"
            :sortable="val.sortable"
            v-bind="{...$EasyTableOptions.tableColumnAttrs, ...val.attrs}"
        >
            <template slot-scope="scope">
                <template v-if="val.render">
                    <Render :row="scope.row" :index="scope.$index" :render="val.render" />
                </template>
                <template v-else>
                    <template v-if="getRows(val.omit || $EasyTableOptions.tableColumnAttrs.omit)">
                        <el-tooltip 
                            :placement="getDirection(val.omit || $EasyTableOptions.tableColumnAttrs.omit)"
                            :disabled="scope.row._disabled"
                            v-bind="{...val.omit, ...$EasyTableOptions.tableColumnAttrs.omit}"
                        >
                            <span slot="content">{{ handleSetValue(val, scope.row[val.prop], scope.row) }}</span>
                            <span 
                                :style="setStyle(val.omit || $EasyTableOptions.tableColumnAttrs.omit)"
                                @mouseenter="handleShowTips($event, scope.row, handleSetValue(val, scope.row[val.prop], scope.row), getRows(val.omit || $EasyTableOptions.tableColumnAttrs.omit))"
                            >
                            {{ handleSetValue(val, scope.row[val.prop], scope.row) }}
                            </span>
                        </el-tooltip>
                    </template>
                    <span v-else>{{ handleSetValue(val, scope.row[val.prop], scope.row) }}</span>
                </template>
            </template>
            <tableColumnTree 
                :merge="val.merge" 
                :handleSetValue="handleSetValue"
                :handleShowTips="handleShowTips"
            />
        </el-table-column>
    </div>
</template>
<script>
import Render from '../render'
import omitHandler from '../../utils/omit'
export default {

    name:'tableColumnTree',

    components: {
        Render,
    },

    props: {
        merge: {
            type: Array,
            default: () => []
        },
        handleSetValue: {
            type: Function,
            default: () => {}
        },
        handleShowTips: {
            type: Function,
            default: () => {}
        },
    },

    computed: {
        ...omitHandler,
    }
}
</script>
<style lang='scss' scoped>

</style>