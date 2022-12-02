<template>
    <div class="encode">
        <div class="fold-allow" id="encode-allow" @click="makeEncodeFold"></div>
        <h4 style="display:inline-block" @click="makeEncodeFold"> encode </h4>
        <input type="button" id="reset" value="reset" @click="resetEncoding">
        <input type="button" id="update" value="update" @click="startUpdateNewCode">

        <div class="rect" v-show="encode_fold">
            <div style="font-weight: bold">rectangle</div>
            width:
            <select class="rect-width" @change="setRectWidth">
                <option>area</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>none</option>
            </select>
            <br>
            height:
            <select class="rect-height" @change="setRectHeight">
                <option>none</option>
                <option>area</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
            </select>
            <br>
            position:
            <select class="rect-pos" @change="setRectPos">
                <option>top</option>
                <option>width</option>
                <option>area</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>none</option>
            </select>
            <br>
            color:
            <select class="rect-color" @change="setRectColor">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
        </div>

        <div class="line" v-show="encode_fold">
            <div style="font-weight: bold">horizontal line</div>
            width:
            <select class="line1-width" @change="setLine1Width">
                <option>width</option>
                <option>top</option>
                <option>area</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>none</option>
            </select>
            <br>
            y-position:
            <select class="line1-height" @change="setLine1Pos">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            stroke-width:
            <select class="line1-stroke" @change="setLine1StrokeWidth">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            stroke-dash:
            <select class="line1-strokeDash" @change="setLine1StrokeDash">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            color:
            <select class="line1-color" @change="setLine1Color">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
        </div>

        <div class="line" v-show="encode_fold">
            <div style="font-weight: bold">vertical line</div>
            height:
            <select class="line2-height" @change="setLine2Height">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            stroke-width:
            <select class="line2-stroke" @change="setLine2Stroke">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>
            <br>
            color:
            <select class="line2-color" @change="setLine2Color">
                <option>none</option>
                <option>width</option>
                <option>top</option>
                <option>max</option>
                <option>min</option>
                <option>persistent</option>
                <option>area</option>
            </select>

        </div>
    </div>

    <div class="sort">
        <div class="fold-allow" id="sort-allow"  @click="makeSortFold"></div>
        <h4 style="display:inline-block"  @click="makeSortFold"> sort rule &nbsp&nbsp </h4>
        <div style="display:inline-block" v-show="sort_fold"> drag for priority</div>
        <MySwitch v-model="on_line_order" v-show="!sort_fold" checked-info="on-line" unchecked-info="off-line"/>
        <draggable v-model="sort_list" v-show="sort_fold" item-key="index" @change="newSort">
            <template #item="{element}">
                <li :key="element.index">
                    <div style="display:inline-block" position="relative" >
                        {{ element.name }}
                        <MySwitch class="ban" v-model="element.ban" checked-info="ban" @click="newSort"/>
                        <MySwitch class="reverse" v-model="element.reverse" checked-info="reverse" @click="newSort" :disabled="element.ban"/>
                    </div>
                </li>
            </template>
        </draggable>
    </div>

    <div class="param">
        <h4> parameters </h4>
        coarse persistent:
        <div id="pers_val">{{coarse_per}}</div>
        <br>
        <input type="range" class="persistent" id="coarse" min="0" :max="coarse_max"
        :step="coarse_step" v-model="coarse_per" @input="changePersistent">
        <br>
        fine persistent:
        <div id="pers_val">{{fine_per}}</div>
        <br>
        <input type="range" class="persistent" id="fine" min="0" :max.sync="fine_max"
        :step="fine_step" v-model="fine_per" @input="changePersistent">
        
        <br>
        rect-opacity: 
        <input type="range" class="opacity" id="rect" min="0" max="1"
            step="0.01" v-model="rect_opacity" @input="changeRectOpacity">
        <br>
        line-opacity: 
        <input type="range" class="opacity" id="line" min="0" max="1"
            step="0.01" v-model="line_opacity" @input="changeLineOpacity">

        <br>
        <button @click="setHighlineEmpty">clear canvas</button>

        <br>
        global time:
        <input type="checkbox" class="globalx" @change="changeGlobalX" checked>

        <br>
        global value:
        <input type="checkbox" class="globaly" @change="changeGlobalY" checked>

    </div>
    
</template>

<style scoped>
.encode, .param, .sort{
    position: relative;
    border: 2px solid black;
    padding-left: 10px;
    margin-right: 1rem;
    margin-bottom: 1rem;
}

.fold-allow{
    position: relative;
    width: 20px;
    height: 20px;
    display: inline-block;
    transition: all 0.3s;
}

.fold-allow:before{
    content: '';
    width: 6px;
    border: 1px solid rgb(80, 79, 79);
    position: absolute;
    transform: rotateZ(45deg);
    top: 6.5px;
    left: 6px;
}
.fold-allow:after{
    content: '';
    width: 6px;
    border: 1px solid rgb(80, 79, 79);
    position: absolute;
    transform: rotateZ(-45deg);
    top: 11.5px;
    left: 6px;
}

.ban{
    position: absolute;
    right: 90px;
}

.reverse{
    position: absolute;
    right: 10px;
}

#reset{
    position: absolute;
    right: 7rem;
    top: 1rem;
    height: 2rem;
    width: 4rem;
    color: red;
}

#update{
    position: absolute;
    right: 2rem;
    top: 1rem;
    height: 2rem;
    width: 4rem;
}

.rect, .line{
    position: relative;
    margin-bottom: 1rem;
    margin-right: 1rem;
    padding-left: 1rem;
    border: 2px solid aqua;
}

select{
    position: absolute;
    width: 7rem;
    right: 1rem;
}

#pers_val{
    color: red;
    display: inline;
}

.opacity{
    position: absolute;
    right: 1rem;
    margin-bottom: 0.5rem;
}

.persistent{
    position: absolute;
    left: 1rem;
    right: 6rem;
    margin-bottom: 0.5rem;
}

</style>

<script>

import { mapping_relationship, user_parameters } from '../util/parameters'
import bus from '../util/eventBus'
import Draggable from 'vuedraggable'
import MySwitch from './MySwitch.vue'
import { sort_type, updateOrder } from '../util/sortForVisual'

export default{
    components:{
        Draggable, MySwitch
    },
    data(){
        return{
            encode_fold: false,
            sort_fold: false,
            coarse_max: 1.2,
            coarse_step:0.05,
            coarse_per: 0,
            fine_max: 0.1,
            fine_step:0.005,
            fine_per: 0,
            rect_opacity: user_parameters["rect_opacity"],
            line_opacity: user_parameters["line_opacity"],
            on_line_order: false,
            sort_list:sort_type.map((name, index) =>{
                return { name, index, ban:false, reverse:false};
            })
        }
    },

    methods:{
        newSort(){
            updateOrder(this.sort_list);
            bus.emit("updateDataOrder", null);
        },

        makeEncodeFold(){
            this.encode_fold = !this.encode_fold;
            if(this.encode_fold){
                document.querySelector('#encode-allow').style.transform = "rotateZ(90deg)";
            }
            else{
                document.querySelector('#encode-allow').style.transform = "rotateZ(0deg)";
            }
        },

        makeSortFold(){
            this.sort_fold = !this.sort_fold;
            if(this.sort_fold){
                document.querySelector('#sort-allow').style.transform = "rotateZ(90deg)";
            }
            else{
                document.querySelector('#sort-allow').style.transform = "rotateZ(0deg)";
            }
        },

        resetEncoding(flag = true){
            this.rect_width.value = this.rect_width.options[0].value;
            mapping_relationship["rect"]["width"] = this.rect_width.value;
            this.rect_height.value = this.rect_height.options[0].value;
            mapping_relationship["rect"]["height"] = this.rect_height.value;
            this.rect_pos.value = this.rect_pos.options[0].value;
            mapping_relationship["rect"]["x"] = this.rect_pos.value;
            this.rect_color.value = this.rect_color.options[0].value;
            mapping_relationship["rect"]["fill"] = this.rect_color.value;
            this.line1_width.value = this.line1_width.options[0].value;
            mapping_relationship["line1"]["width"] = this.line1_width.value;
            this.line1_y.value = this.line1_y.options[0].value;
            mapping_relationship["line1"]["y"] = this.line1_y.value;
            this.line1_strokeWidth.value = this.line1_strokeWidth.options[0].value;
            mapping_relationship["line1"]["strokeWidth"] = this.line1_strokeWidth.value;
            this.line1_strokeDash.value = this.line1_strokeDash.options[0].value;
            mapping_relationship["line1"]["strokeDash"] = this.line1_strokeDash.value;
            this.line1_color.value = this.line1_color.options[0].value;
            mapping_relationship["line1"]["stroke"] = this.line1_color.value;
            this.line2_height.value = this.line2_height.options[0].value;
            mapping_relationship["line2"]["height"] = this.line2_height.value;
            this.line2_strokeWidth.value = this.line2_strokeWidth.options[0].value;
            mapping_relationship["line2"]["strokeWidth"] = this.line2_strokeWidth.value;
            this.line2_color.value = this.line2_color.options[0].value;
            mapping_relationship["line2"]["stroke"] = this.line2_color.value;

            if(flag)    this.startUpdateNewCode();
        },
        startUpdateNewCode(){
            bus.emit("updateNewCode", false);
            // console.log(mapping_relationship);
        },
        setRectWidth(){
            mapping_relationship["rect"]["width"] = this.rect_width.value;
        },
        setRectHeight(){
            mapping_relationship["rect"]["height"] = this.rect_height.value;
        },
        setRectPos(){
            mapping_relationship["rect"]["x"] = this.rect_pos.value;
        },
        setRectColor(){
            mapping_relationship["rect"]["fill"] = this.rect_color.value;
        },
        setLine1Width(){
            mapping_relationship["line1"]["width"] = this.line1_width.value;
        },
        setLine1Pos(){
            mapping_relationship["line1"]["y"] = this.line1_y.value;
        },
        setLine1StrokeWidth(){
            mapping_relationship["line1"]["strokeWidth"] = this.line1_strokeWidth.value;
        },
        setLine1StrokeDash(){
            mapping_relationship["line1"]["strokeDash"] = this.line1_strokeDash.value;
        },
        setLine1Color(){
            mapping_relationship["line1"]["stroke"] = this.line1_color.value;
        },
        setLine2Height(){
            mapping_relationship["line2"]["height"] = this.line2_height.value;
        },
        setLine2Stroke(){
            mapping_relationship["line2"]["strokeWidth"] = this.line2_strokeWidth.value;
        },
        setLine2Color(){
            mapping_relationship["line2"]["stroke"] = this.line2_color.value;
        },
        changePersistent(){
            user_parameters["persistent"] = Number(this.coarse_per) + Number(this.fine_per);
            bus.emit("updateNewCode", this.on_line_order);
        },
        changeRectOpacity(){
            user_parameters["rect_opacity"] = this.rect_opacity;
            bus.emit("changeRectOpacity", this.rect_opacity);
        },
        changeLineOpacity(){
            user_parameters["line_opacity"] = this.line_opacity;
            bus.emit("changeLineOpacity", this.line_opacity);
        },
        setHighlineEmpty(){
            bus.emit("clearHighline", null);
        },
        changeGlobalX(){
            user_parameters["global_time"] = !user_parameters["global_time"];
            bus.emit("updateNewCode", false);
        },
        changeGlobalY(){
            user_parameters["global_value"] = !user_parameters["global_value"];
            bus.emit("updateNewCode", false);
        }
    },

    created(){
        bus.on("updateDataset", msg=>{
            this.resetEncoding(false);
            this.sort_list = sort_type.map((name, index) =>{
                return { name, index, ban:false, reverse:false};
            })
            bus.emit("getHillAndDraw", null);
        })

        bus.on("updatePersistentRange", msg=>{
            this.coarse_max = msg[0];
            this.coarse_step = this.coarse_max/100;
            this.fine_max = msg[1]/2;
            this.fine_step = this.fine_max/100;
        })

        bus.on("showPersistent", msg=>{
            this.coarse_per = Math.floor(msg/this.fine_max)*this.fine_max;
            this.fine_per = Math.floor((msg-this.coarse_per)/this.fine_step)*this.fine_step;
        })
    },

    mounted(){
        this.rect_width = document.querySelector(".rect-width");
        this.rect_height = document.querySelector(".rect-height");
        this.rect_pos = document.querySelector(".rect-pos");
        this.rect_color = document.querySelector(".rect-color");
        this.line1_width = document.querySelector(".line1-width");
        this.line1_y = document.querySelector(".line1-height");
        this.line1_strokeWidth = document.querySelector(".line1-stroke");
        this.line1_strokeDash = document.querySelector(".line1-strokeDash");
        this.line1_color = document.querySelector(".line1-color");
        this.line2_height = document.querySelector(".line2-height");
        this.line2_strokeWidth = document.querySelector(".line2-stroke");
        this.line2_color = document.querySelector(".line2-color");
    }
}
</script>