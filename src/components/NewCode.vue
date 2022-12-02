<template>
    <div id="code" ref="code" @click="updateHighlightList($event)"
        @mouseenter="enter" @mouseleave="leave" @mousemove="move"></div>
    <div id="float" v-show="is_hover" :style="float_position">{{name}}</div>
</template>

<style scoped>
#code{
    width: 100%;
    height: 100%;
    overflow-y: scroll;
}

#float{
    position: fixed;
    max-width: 220px;
    padding: 10px;
    background: #ff06;
}
</style>

<script>

import vegaEmbed from "vega-embed"

import { data_value, square_list  } from '../util/dataManager'
import { getDataName } from '../util/dataManager'
import { calculateInitPersistent, newcode_list, data_list, set1VisualCode, getMarksForDraw } from '../util/codeList'
import { CODE_PADDING, CODE_HEIGHT_WITH_MARGIN, CODE_WIDTH, user_parameters } from '../util/parameters'
import bus from "../util/eventBus"
import { color_for_highlight, getRandomColor } from "../util/colorMapping"
import { sort_order, re_sort_order, updateOrder } from '../util/sortForVisual'

export default{
    data(){
        return{
            name: " ",
            is_hover: false,
            float_position: {top:'0px', left:'0px'},
            scroll_y: 0,
            interactive_list: [],
            newcode:{
                "$schema":"https://vega.github.io/schema/vega/v5.json",
                "width": CODE_WIDTH+40, "height": 800,    
                "data": [],
                "marks": [{
                    //"type":"rect",
                    //"encode":{
                        // "update":{
                        //     "x": {"value": -5},
                        //     "width":{"value": 310},
                        //     "y":{"value": -5},
                        //     "height":{"value": 70},
                        //     "stroke": {"value": "rgb"},
                        //     "strokeWidth":{"signal": "a"}
                        // }
                    //}
                }],
                // "signals":[{
                //     "name": "a", "value": 2,
                //     "on":[{"events":"click","update":"2-a" }]
                // }
                // ]
            },   
        }
    },

    methods:{
        chart(){
            if(this.canvas){
                this.canvas.remove();
                this.canvas = undefined;
            }
            vegaEmbed("#code", this.newcode);
        },

        drawHighLightRect(){
            if(!this.canvas){
                this.canvas = document.querySelectorAll("canvas")[1];
                this.context = this.canvas.getContext('2d');
            }
            
            for(let i=0; i<this.interactive_list.length; i++){
                // let y_offset = this.interactive_list[i]*CODE_HEIGHT_WITH_MARGIN+2;
                let y_idx = re_sort_order[this.interactive_list[i]];
                
                let y_offset = y_idx*CODE_HEIGHT_WITH_MARGIN + 2;
                this.context.strokeStyle = color_for_highlight[this.interactive_list[i]][0];
                this.context.lineWidth = 2;
                this.context.strokeRect(2, y_offset, 316, 76);
            }
        },

        updateHighlightList(e){ // 点击选中visual code
            // 这个40是定义在App.vue中的main标签的padding值
            let y_idx = Math.floor((this.scroll_y + e.y - 40 - CODE_PADDING)/CODE_HEIGHT_WITH_MARGIN);
            if( y_idx >= newcode_list.length ) return;
            
            let y_offset = y_idx*CODE_HEIGHT_WITH_MARGIN+2;
            let flag = true;

            if(!this.canvas){
                this.canvas = document.querySelectorAll("canvas")[1];
                this.context = this.canvas.getContext('2d');
            }
            let data_idx = sort_order[y_idx];
            for(let i=0; i<this.interactive_list.length; i++){
                if(data_idx === this.interactive_list[i]){
                    flag = false;
                    this.interactive_list.splice(i, 1);
                    // white: 背景颜色 3:要比2大才能完全涂掉
                    this.context.strokeStyle = "white";
                    this.context.lineWidth = 3;
                    // 316 = CODE_WIDTH + 2*(CODE_PADDING-2)
                    //  76 = CODE_HEIGHT + 2*(CODE_PADDING-2)
                    this.context.strokeRect(2, y_offset, 316, 76);

                    delete(color_for_highlight[data_idx]);
                    break;
                }
            }

            if(flag){
                this.interactive_list.push(data_idx);
                // 这个color写个映射表用来区分
                // if(!(y_idx in color_for_highlight))
                color_for_highlight[data_idx] = getRandomColor();
                
                this.context.strokeStyle = color_for_highlight[data_idx][0];
                this.context.lineWidth = 2;
                this.context.strokeRect(2, y_offset, 316, 76);

                // console.log(data_list[y_idx]);
                console.log(this.newcode["data"][y_idx]);
            }

            bus.emit("clickForLine", this.interactive_list);
        },

        handleScroll(){// 监听滑动窗口的距离
            this.scroll_y = this.$refs.code.scrollTop;
            let y_idx = Math.floor((this.scroll_y + this.y - 40 - CODE_PADDING)/CODE_HEIGHT_WITH_MARGIN);
            if(y_idx < newcode_list.length){
                this.name = newcode_list[sort_order[y_idx]].name;
            }
            else{
                this.name = " ";
            }
        },

        updateNewCodeData(){ // 在更换数据集的时候调用
            newcode_list.splice(0, newcode_list.length);
            this.interactive_list.splice(0, this.interactive_list.length);
            for(let key in color_for_highlight){
                delete color_for_highlight[key];
            }
            square_list.splice(0, square_list.length);
            
            // 假设数据都以name进行排序过
            let name = "";
            let start_idx = 0, end_idx = 0;

            for(let i=0; i<data_value.length; i++){
                if(getDataName(i) !== name){
                    end_idx = i;
                    set1VisualCode(name, start_idx, end_idx);
                    start_idx = i;
                    name = getDataName(i);
                }
            }
            set1VisualCode(name, start_idx, data_value.length);

            return newcode_list.length;
        },

        getNewCodeJson(){
            this.newcode["data"].splice(0, this.newcode["data"].length);
            this.newcode["marks"].splice(0, this.newcode["marks"].length);

            for(let i=0; i<newcode_list.length;i++){
                let w1 = newcode_list[i].total_width;
                let w2 = newcode_list[i].start_width;
                let tmp_list = getMarksForDraw(re_sort_order[i], data_list[i], w1, w2);
                this.newcode["data"].push(tmp_list[0]);
                for(let i=0; i<tmp_list[1].length; i++){
                    this.newcode["marks"].push(tmp_list[1][i]);
                }
            }

            this.newcode["marks"].push({
                "type":"rect",
                "encode":{
                    "enter":{
                        "x": {"value": 0},
                        "width":{"value": CODE_WIDTH},
                        "y":{"value": CODE_HEIGHT_WITH_MARGIN * newcode_list.length},
                        "height":{"value": 10},
                        "fill": {"value": "white"}
                    }
                }
            });

            if(this.interactive_list.length > 0)
                bus.emit("clickForLine", this.interactive_list);
        },

        updateDataForDraw(pers = 0, init = false){ // 修改了 filter 或 映射通道调用
            data_list.splice(0, data_list.length);

            for(let i=0; i<newcode_list.length; i++){
                newcode_list[i].chooseDataDomain();
                data_list.push(newcode_list[i].getDataForDraw(pers));  
            }

            if(init) updateOrder(); // 排序

            this.getNewCodeJson(); 
        },
        enter(){
            this.is_hover = true;
        },
        leave(){
            this.is_hover = false;
        },
        move(event){
            let x_ = event.pageX + 15 + 'px';
            let y_ = event.pageY + 10 + 'px';
            this.float_position = { top: y_, left: x_ } ;
            this.y = event.pageY;
            let y_idx = Math.floor((this.scroll_y + this.y - 40 - CODE_PADDING)/CODE_HEIGHT_WITH_MARGIN);
            if(y_idx < newcode_list.length && y_idx >= 0){
                this.is_hover = true;
                this.name = newcode_list[sort_order[y_idx]].name;
            }
            else{
                this.is_hover = false;
            }
        }
            
    },

    created(){

        window.onload = (function(method){
            var drawHighLightRect = method;
            return function(){
                var cnt = 0;
                var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
                var target = document.querySelector("#code");
                // var config = {attributes:true, childList: true, characterData: true};
                var config = {childList:true };
                var observer = new MutationObserver(function(mutations){
                    mutations.forEach(function(mutation){
                        if(mutation.type === "childList"){
                            cnt++;
                        }
                        if(cnt % 3 === 0){
                            // 这里应该有一个draw high light
                            drawHighLightRect();
                        }
                    })
                });
                observer.observe(target, config);
            }
        })(this.drawHighLightRect);

        bus.on("updateNewCode", msg=>{       
            this.updateDataForDraw(user_parameters["persistent"], msg);
            this.chart();
        })

        bus.on("changeRectOpacity", msg=>{  
            for(let i=0; i<this.newcode["marks"].length-1; i++){
                if(this.newcode["marks"][i]["type"]==="rect"){
                    this.newcode["marks"][i]["encode"]["enter"]["opacity"] = {"value": msg};
                }
            }
            this.chart();
        })

        bus.on("changeLineOpacity", msg=>{  
            for(let i=0; i<this.newcode["marks"].length-1; i++){
                if(this.newcode["marks"][i]["type"]==="rule"){
                    this.newcode["marks"][i]["encode"]["enter"]["opacity"] = {"value": msg};
                }
            }
            this.chart();
        })

        bus.on("clearHighline", msg=>{
            for(let i=0; i<this.interactive_list.length; i++){
                let y_idx = re_sort_order[this.interactive_list[i]];
                
                let y_offset = y_idx*CODE_HEIGHT_WITH_MARGIN + 2;
                this.context.strokeStyle = "white";
                this.context.lineWidth = 3;
                this.context.strokeRect(2, y_offset, 316, 76);
            }
            this.interactive_list.splice(0, this.interactive_list.length);
            for(let key in color_for_highlight){
                delete color_for_highlight[key];
            }
            bus.emit("clickForLine", []);
        })

        bus.on("getHillAndDraw", msg=>{

            console.log("start coding.");
            this.updateNewCodeData();
            console.log("finish coding and start drawing.");
            user_parameters["persistent"] = calculateInitPersistent();
            bus.emit("showPersistent",user_parameters["persistent"]);
            this.updateDataForDraw(user_parameters["persistent"], true);
            this.chart();
            console.log("finish drawing");
        })

        bus.on("updateDataOrder", msg=>{
            this.getNewCodeJson();
            this.chart();
        })

        this.updateNewCodeData();
        this.updateDataForDraw();
    },

    mounted(){
        window.addEventListener('scroll', this.handleScroll, true);
        // console.log(newcode_list);
        this.chart();
    }
}
</script>