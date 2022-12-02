import { getDataTime, getDataValue, square_list  } from './dataManager'
import { VisualCode } from './codeManager'
import { CODE_HEIGHT, CODE_WIDTH, mapping_relationship, mapping_default, 
    CODE_HEIGHT_WITH_MARGIN, MAX_STROKEWIDTH, STROKEDASH_LENGTH, MAX_STROKEWIDTH2, 
    user_parameters, CODE_PADDING, MIN_STROKEWIDTH, MIN_STROKEDASH, MAX_STROKEDASH2, 
    MIN_LINE2_HEIGHT, MIN_RECT_HEIGHT } from './parameters';


export function calculateInitPersistent(){
    if(newcode_list.length < 1) return 0;
    let min_distant = newcode_list[0].max - newcode_list[0].min;
    for(let i=1; i<newcode_list.length; i++){
        let distant = newcode_list[i].max - newcode_list[i].min;
        if(min_distant > distant) min_distant = distant;
    }
    return min_distant*0.8;
}

export function set1VisualCode(name, start_idx, end_idx){
    if(end_idx - start_idx <= 1) {
        if(name !== "") console.log("data", name, "is too short to draw");
        for(let i=0; i<end_idx-start_idx; i++){
            square_list.push(0);
        }
        return;
    }
    // 假设数据按时间从小到大排序

    var code = new VisualCode(name, start_idx, end_idx); 
    
    let left = start_idx, top = start_idx, right = start_idx;
    let this_value = getDataValue(start_idx);
    let min_value = this_value, max_value = this_value;
    let before_value, after_value = getDataValue(start_idx+1);
    let min_value_list = [];
    // if(this_value < after_value) min_value_list.push(start_idx);

    let before_time = 0, this_time = getDataTime(start_idx);
    square_list.push(0);

    for(let i=start_idx+1; i<end_idx-1; i++){
        before_value = this_value;
        this_value = after_value;
        after_value = getDataValue(i+1);
        if(this_value >= after_value && this_value > before_value){
            top = i;
            max_value = this_value;
        }
        else if(this_value < after_value && this_value <= before_value){
            right = i;
            if(min_value > this_value) min_value = this_value;
            min_value_list.push(i);
            code.set1Hill(left, top, right, max_value, min_value);
            // 下一个Hill
            left = i; top = i;
            max_value = this_value; min_value = this_value;
        }
        before_time = this_time;
        this_time = getDataTime(i);
        square_list.push((this_value+before_value)*(this_time-before_time)/2);
    }

    before_value = this_value;
    this_value = after_value;
    if(this_value > before_value){
        code.set1Hill(left, end_idx-1, end_idx-1, this_value, min_value);
    }
    else{
        if(min_value > this_value) min_value = this_value;
        // min_value_list.push(end_idx-1);
        code.set1Hill(left, top, end_idx-1, max_value, min_value);
    }

    before_time = this_time;
    this_time = getDataTime(end_idx-1);

    square_list.push((this_value+before_value)*(this_time-before_time)/2);

    code.makePersistent(min_value_list);
    code.checkHill();
    code.caculateAreaSum();

    newcode_list.push(code);
};

export function getMarksForDraw(idx, data_list, total_width = CODE_WIDTH, start_width = 0){
    var data_1code = {"name": "hill"+idx, "values": []};
    for(let i=0; i<data_list.length; i++){
        data_1code["values"].push({});
    }
    
    // 生成marks格式
    var marks_1code = [];
    let y_offset = idx*CODE_HEIGHT_WITH_MARGIN + CODE_PADDING;
    let base_width = total_width / data_list.length;

    var marks_line1 = {"type":"rule", "from": {"data": "hill"+idx}, "encode":{ "enter":{} }};
    // line1 width 
    let x = CODE_PADDING + start_width;
    let x2 = x;
    if(mapping_relationship["line1"]["width"] === "none"){
        for(let i=0; i<data_list.length; i++){
            x2 += base_width;
            data_1code["values"][i]["l1x_draw"] = x;
            data_1code["values"][i]["l1x2_draw"] = x2;
            x = x2;
        }
    }
    else{
        let sum = 0;
        let min_width = base_width * 0.2;
        let width_key = mapping_relationship["line1"]["width"];
        for(let i=0; i<data_list.length; i++){
            sum += data_list[i][width_key];
        }
        if(sum < 0.000001){
            for(let i=0; i<data_list.length; i++){
                x2 += base_width;
                data_1code["values"][i]["l1x_draw"] = x;
                data_1code["values"][i]["l1x2_draw"] = x2;
                x = x2;
            }
        }
        else{
            let unit_length = total_width*0.8/sum;
            for(let i=0; i<data_list.length; i++){
                let this_width = data_list[i][width_key]*unit_length+min_width;
                x2 += this_width;
                data_1code["values"][i]["l1x_draw"] = x;
                data_1code["values"][i]["l1x2_draw"] = x2;
                if(this_width < base_width) base_width=this_width;
                x = x2;
            }
        }
    }
    marks_line1["encode"]["enter"]["x"]={"field": "l1x_draw"};
    marks_line1["encode"]["enter"]["x2"]={"field": "l1x2_draw"};
    // line1 stroke width
    let max_l1sw = 0;
    if(mapping_relationship["line1"]["strokeWidth"] === "none"){
        marks_line1["encode"]["enter"]["strokeWidth"]={"value": mapping_default["line1"]["strokeWidth"]};
    }
    else{
        let sw_key = mapping_relationship["line1"]["strokeWidth"];
        for(let i=0; i<data_list.length; i++){
            let this_l1sw = data_list[i][sw_key]*MAX_STROKEWIDTH + MIN_STROKEWIDTH;
            if(this_l1sw > max_l1sw) max_l1sw=this_l1sw;
            data_1code["values"][i]["l1sw_draw"] = this_l1sw;
        }
        marks_line1["encode"]["enter"]["strokeWidth"]={"field": "l1sw_draw"};
    }
    // line1 stroke dash
    if(mapping_relationship["line1"]["strokeDash"] === "none"){
        marks_line1["encode"]["enter"]["strokeDash"]={"value": mapping_default["line1"]["strokeDash"]};
    }
    else{
        let sw_key = mapping_relationship["line1"]["strokeDash"];
        for(let i=0; i<data_list.length; i++){
            let pre_sw_length = STROKEDASH_LENGTH * data_list[i][sw_key];
            if(pre_sw_length < MIN_STROKEDASH){
                let pre_sw2_length = MIN_STROKEDASH * (1-data_list[i][sw_key])/data_list[i][sw_key];
                if(pre_sw2_length > MAX_STROKEDASH2){
                    data_1code["values"][i]["l1sd_draw"] = [MIN_STROKEDASH, MAX_STROKEDASH2];
                }
                else{
                    data_1code["values"][i]["l1sd_draw"] = [MIN_STROKEDASH, pre_sw2_length];
                }
            }
            else{
                data_1code["values"][i]["l1sd_draw"] = [pre_sw_length, STROKEDASH_LENGTH - pre_sw_length];
            }
        }
        marks_line1["encode"]["enter"]["strokeDash"]={"field": "l1sd_draw"};
    }
    // line1 y position
    if(mapping_relationship["line1"]["y"] === "none"){
        marks_line1["encode"]["enter"]["y"]={"value": mapping_default["line1"]["y"] + y_offset};
    }
    else{
        let this_offset = y_offset + max_l1sw/2, this_height = CODE_HEIGHT - max_l1sw;
        let y_key = mapping_relationship["line1"]["y"];
        for(let i=0; i<data_list.length; i++){
            data_1code["values"][i]["l1y_draw"] = (1-data_list[i][y_key])*this_height + this_offset;
        }
        marks_line1["encode"]["enter"]["y"]={"field": "l1y_draw"};
    }
    marks_line1["encode"]["enter"]["y2"]=marks_line1["encode"]["enter"]["y"];
    // line1 else
    marks_line1["encode"]["enter"]["stroke"]={"value": mapping_default["line1"]["stroke"]};
    marks_line1["encode"]["enter"]["opacity"] = {"value": user_parameters["line_opacity"]};
    marks_1code.push(marks_line1);

    var marks_line2 = {"type":"rule", "from": {"data": "hill"+idx}, "encode":{ "enter":{} }};
    marks_line2["encode"]["enter"]["x"] = marks_line1["encode"]["enter"]["x2"];
    marks_line2["encode"]["enter"]["x2"] = marks_line1["encode"]["enter"]["x2"];
    // line2 height
    if(mapping_relationship["line2"]["height"] === "none"){
        // 此处偷懒
        marks_line2["encode"]["enter"]["y"]={"value": mapping_default["line2"]["y"] + y_offset};
        marks_line2["encode"]["enter"]["y2"]={"value": mapping_default["line2"]["y2"] + y_offset};
    }
    else{
        let height_key = mapping_relationship["line2"]["height"];
        let half_min_dis = MIN_LINE2_HEIGHT/2;
        for(let i=0; i<data_list.length; i++){
            let half_dis = data_list[i][height_key]*(CODE_HEIGHT-MIN_LINE2_HEIGHT)/2 + half_min_dis;
            data_1code["values"][i]["l2y_draw"] = y_offset + CODE_HEIGHT/2 - half_dis;
            data_1code["values"][i]["l2y2_draw"] = y_offset + CODE_HEIGHT/2 + half_dis;
        }
        marks_line2["encode"]["enter"]["y"]={"field": "l2y_draw"};
        marks_line2["encode"]["enter"]["y2"]={"field": "l2y2_draw"};
    }
    // line2 stroke width
    if(mapping_relationship["line2"]["strokeWidth"] === "none"){
        marks_line2["encode"]["enter"]["strokeWidth"]={"value": mapping_default["line2"]["strokeWidth"]};
    }
    else{
        let sw_key = mapping_relationship["line2"]["strokeWidth"];
        for(let i=0; i<data_list.length; i++){
            data_1code["values"][i]["l2sw_draw"] = data_list[i][sw_key]*MAX_STROKEWIDTH2+MIN_STROKEWIDTH ;
        }
        marks_line2["encode"]["enter"]["strokeWidth"]={"field": "l2sw_draw"};
    }
    // line2 else
    marks_line2["encode"]["enter"]["stroke"]={"value": mapping_default["line2"]["stroke"]};
    marks_line2["encode"]["enter"]["opacity"] = {"value": user_parameters["line_opacity"]};
    marks_1code.push(marks_line2);
    
    var marks_rect = {"type":"rect", "from": {"data": "hill"+idx}, "encode":{"enter":{}}};
    // rect width // 有点问题，base width是局部的，要写成全局的话需要拆开来写
    if(mapping_relationship["rect"]["width"] === "none"){
        let width = base_width*mapping_default["rect"]["width"];
        for(let i=0; i<data_list.length; i++){
            data_1code["values"][i]["rwidth_draw"] = width; 
        }
    }
    else{
        let width_key = mapping_relationship["rect"]["width"];
        let min_width = base_width * 0.2;
        if(mapping_relationship["rect"]["width"] === "area"){
            for(let i=0; i<data_list.length; i++){
                let area = data_list[i][width_key] * 
                    (data_1code["values"][i]["l1x2_draw"]-data_1code["values"][i]["l1x_draw"]);
                if(area < min_width){
                    data_1code["values"][i]["rwidth_draw"] = min_width;
                }
                else{
                    data_1code["values"][i]["rwidth_draw"] = area;
                }
            }
        }
        else{
            let increase_width = base_width * 0.8;
            for(let i=0; i<data_list.length; i++){
                data_1code["values"][i]["rwidth_draw"] = min_width +
                    increase_width * data_list[i][width_key]; 
            }
        }
    }
    marks_rect["encode"]["enter"]["width"]={"field":"rwidth_draw"};
    // rect height
    if(mapping_relationship["rect"]["height"] === "none"){
        marks_rect["encode"]["enter"]["y"]={"value":y_offset}; 
        marks_rect["encode"]["enter"]["y2"]={"value":y_offset + mapping_default["rect"]["height"]}; 
    }
    else{
        let height_key = mapping_relationship["rect"]["height"];
        let half_min_dis = MIN_RECT_HEIGHT/2;
        for(let i=0; i<data_list.length; i++){
            let half_dis = data_list[i][height_key]*(CODE_HEIGHT-MIN_RECT_HEIGHT)/2 + half_min_dis;
            data_1code["values"][i]["ry_draw"] = y_offset + CODE_HEIGHT/2 - half_dis;
            data_1code["values"][i]["ry2_draw"] = y_offset + CODE_HEIGHT/2 + half_dis;
        }
        marks_rect["encode"]["enter"]["y"]={"field": "ry_draw"};
        marks_rect["encode"]["enter"]["y2"]={"field": "ry2_draw"};
    }
    // rect position
    if(mapping_relationship["rect"]["x"] === "none"){
        for(let i=0; i<data_1code["values"].length; i++){
            data_1code["values"][i]["rx_draw"] = data_1code["values"][i]["l1x_draw"] + 0.5 *
            (data_1code["values"][i]["l1x2_draw"] - data_1code["values"][i]["l1x_draw"] - data_1code["values"][i]["rwidth_draw"]);
        }
    }
    else{
        let x_key = mapping_relationship["rect"]["x"];
        for(let i=0; i<data_1code["values"].length; i++){
            data_1code["values"][i]["rx_draw"] = data_1code["values"][i]["l1x_draw"] + data_list[i][x_key] *
            (data_1code["values"][i]["l1x2_draw"] - data_1code["values"][i]["l1x_draw"] - data_1code["values"][i]["rwidth_draw"]);
        }
        // if(data_list[0][x_key]>1){
        //     console.log(data_list);
        // }
    }
    marks_rect["encode"]["enter"]["x"]={"field": "rx_draw"};
    // rect else
    marks_rect["encode"]["enter"]["fill"]={"value": mapping_default["rect"]["fill"]};
    marks_rect["encode"]["enter"]["opacity"] = {"value": user_parameters["rect_opacity"]};
    marks_1code.push(marks_rect);

    return [data_1code, marks_1code];
}

export var newcode_list = [];
export var data_list = [];