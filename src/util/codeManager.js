import { data_field, getDataTime, getDataValue, square_list } from './dataManager'
import { CODE_WIDTH, mapping_relationship, user_parameters } from './parameters';
import { Hill } from './hillManager'

export class VisualCode{
    constructor(name, start, end){ // 不包括 end
        this.name = name;
        this.start = start;
        this.end = end;
        this.max = -Infinity;
        this.min = Infinity;
        this.top_hill_idx = -1;
        this.hill_list = [];
    }

    set1Hill(left, top, right, max_value, min_value){
        this.hill_list.push(new Hill(left, top, right, max_value, min_value));
        if(max_value > this.max){
            this.max = max_value;
            this.top_hill_idx = this.hill_list.length-1;
        }
        if(min_value < this.min){
            this.min = min_value;
        }
    }

    getStartTime(){
        return getDataTime(this.start);
    }

    getEndTime(){
        return getDataTime(this.end-1);
    }

    makePersistent(bottom_list){
        // min peak list, sort by value from higher to lower
        bottom_list.sort(function(a, b){
            return getDataValue(b) - getDataValue(a);
        })
        // console.log(bottom_list);

        for(let i=0; i<bottom_list.length; i++){
            let le = -1, ri = -1;
            for(let j=0; j<this.hill_list.length; j++){
                if(this.hill_list[j].persistent === -1){
                    if(getDataTime(this.hill_list[j].top) < getDataTime(bottom_list[i])){
                        le = j;
                    }
                    else{
                        ri = j;
                        break;
                    }
                }
            }

            let hill_idx = -1;
            if(le !== -1){
                if(ri !== -1){
                    if(getDataValue(this.hill_list[le].top) < getDataValue(this.hill_list[ri].top)){
                        hill_idx = le;
                    }
                    else{
                        hill_idx = ri;
                    }
                }
                else{
                    hill_idx = le;
                }
            }
            else if(ri !== -1){
                hill_idx = ri;
            }

            if(hill_idx !== -1){
                this.hill_list[hill_idx].setPersistent(getDataValue(bottom_list[i]));
            }
        }
    }

    checkHill(){
        for(let i=0; i<this.hill_list.length; i++){
            if(this.hill_list[i].persistent < 0){
                this.hill_list[i].setPersistent(this.min);
            }
        }
    }

    caculateAreaSum(){
        for(let i=0; i<this.hill_list.length; i++){
            let st = this.hill_list[i].left, en = this.hill_list[i].right;

            for( st += 1; st <= en; st++){
                this.hill_list[i].sum += square_list[st];
            }
            
        }
    }

    chooseDataDomain(){
        this.total_width = CODE_WIDTH, this.start_width = 0;
        if(user_parameters["global_time"]){
          
            this.start_time = data_field["min_x"];
            this.total_time = data_field["max_x"] - this.start_time;
            this.start_width = CODE_WIDTH * (getDataTime(this.start)-this.start_time)/this.total_time;
            this.total_width = CODE_WIDTH * (getDataTime(this.end-1)-getDataTime(this.start))/this.total_time;    
        }
        else{
            this.start_time = getDataTime(this.start);
            this.total_time = getDataTime(this.end-1) - this.start_time;   
        }
        if(user_parameters["global_value"]){
            this.min_range = data_field["min_y"];
            this.value_range = data_field["max_y"] - this.min_range;
        }
        else{
            this.min_range = this.min;
            this.value_range = this.max - this.min;
        }

    }

    getJsonValueAs1Hill(todo_hills, top_idx){
        let hill_json = {"end_idx":this.hill_list[todo_hills[todo_hills.length-1]].right};

        for(let key in mapping_relationship["line1"]){
            if(mapping_relationship["line1"][key]!=="none"){
                hill_json[mapping_relationship["line1"][key]] = 0;
            }
        }
        for(let key in mapping_relationship["line2"]){
            if(mapping_relationship["line2"][key]!=="none"){
                hill_json[mapping_relationship["line2"][key]] = 0;
            }
        }
        for(let key in mapping_relationship["rect"]){
            if(mapping_relationship["rect"][key]!=="none"){
                hill_json[mapping_relationship["rect"][key]] = 0;
            }
        }
        for(let key in hill_json){
            switch(key){
                // normalize
                case "left": 
                    hill_json[key] = (getDataTime(this.hill_list[todo_hills[0]].left)-this.start_time)/this.total_time;
                    break;
                case "right": 
                    hill_json[key] = (getDataTime(this.hill_list[todo_hills[todo_hills.length-1]].right)-this.start_time)/this.total_time;
                    break;
                case "top":
                    hill_json[key] = (getDataTime(this.hill_list[top_idx].top)-getDataTime(this.hill_list[todo_hills[0]].left))/
                        (getDataTime(this.hill_list[todo_hills[todo_hills.length-1]].right)-getDataTime(this.hill_list[todo_hills[0]].left));
                    break;
                case "area":
                case "avg":
                    let sum_area = 0;
                    for(let i=0; i<todo_hills.length; i++){
                        sum_area += this.hill_list[todo_hills[i]].sum;
                    }
                    hill_json[key] = (sum_area/(getDataTime(this.hill_list[todo_hills[todo_hills.length-1]].right) -
                        getDataTime(this.hill_list[todo_hills[0]].left)) - this.min_range)/this.value_range;
                    break;
                case "width":
                    hill_json[key] = (getDataTime(this.hill_list[todo_hills[todo_hills.length-1]].right) -
                        getDataTime(this.hill_list[todo_hills[0]].left))/this.total_time;
                    break;
                case "max":
                    hill_json[key] = (this.hill_list[top_idx].max_value - this.min_range)/this.value_range;
                    break;
                case "min":
                    let min_hills_value = Infinity;
                    for(let i=0; i<todo_hills.length; i++){
                        if(min_hills_value > this.hill_list[todo_hills[i]].min_value){
                            min_hills_value = this.hill_list[todo_hills[i]].min_value;
                        }
                    }
                    hill_json[key] = (min_hills_value - this.min_range)/this.value_range;
                    break;
                case "persistent":
                    hill_json[key] = this.hill_list[top_idx].persistent/this.value_range;
                    break;
                default:
                    // pass
                    break;
            }
        }

        return hill_json;
    }

    getDataForDraw(persistent = 0){
        var data_list = [];
        
        let todo_hills = [], filter_hills = [];
        let filter_min = 0, min_idx = 0;
        for(let i=0; i<this.hill_list.length; i++){
            // 这里可能需要一个filter函数，如果有其他filter条件的话
            if(this.hill_list[i].persistent < persistent){
                filter_hills.push(i);
                let tmp_min = getDataValue(this.hill_list[i].right);
                if(tmp_min <= filter_min){
                    filter_min = tmp_min;
                    min_idx = filter_hills.length;
                }
            } 
            else{
                if(todo_hills.length > 0){ // 之前的未处理
                    let top_idx = todo_hills[todo_hills.length-1];

                    for(let j =0; j<min_idx;j++) todo_hills.push(filter_hills[j]);
                    data_list.push(this.getJsonValueAs1Hill(todo_hills, top_idx));
                    todo_hills.splice(0, todo_hills.length);
                    for(let j =min_idx; j<filter_hills.length;j++) todo_hills.push(filter_hills[j]);
                    todo_hills.push(i);
                    
                    filter_hills.splice(0, filter_hills.length);
                    filter_min = getDataValue(this.hill_list[i].right);
                    min_idx = 0;
                }
                else{
                    // todo_hills.concat(filter_hills).push(i);
                    // concat返回的是一个新数组
                    // todo_hills.push.apply(filter_hills);
                    for(let j =0; j<filter_hills.length;j++) todo_hills.push(filter_hills[j]);
                    todo_hills.push(i);
                    filter_hills.splice(0, filter_hills.length);
                    filter_min = getDataValue(this.hill_list[i].right);
                    min_idx = 0;
                }
            }
        }
        // 最后可能全都是filter_hills或者多一个todo_hills
        if(todo_hills.length < 1){
            data_list.push(this.getJsonValueAs1Hill(filter_hills, this.top_hill_idx));
        }
        else{
            let top_idx = todo_hills[todo_hills.length-1];
            data_list.push(this.getJsonValueAs1Hill(todo_hills.concat(filter_hills), top_idx));
        }

        return data_list;
    } 
}
