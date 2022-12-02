import { newcode_list ,data_list } from "./codeList"

export const sort_type = [
    "hills number",  // 0, data_list[i].length
    "data width",  // 1, newcode_list[i].end-newcode_list[i].start
    "start position", // 2, newcode_list[i].start
    "max value", // 3, newcode_list[i].max
    "data name" // 4, newcode_list[i].name
]

export var sort_order = [0, 2, 1]
export var re_sort_order = [0, 2, 1]

export function getReSortOrder(){
    let tmp = new Array(sort_order.length).fill(0);
    for(let i=0; i< sort_order.length; i++){
        tmp[sort_order[i]] = i;
    }
    re_sort_order = tmp;

    // console.log(sort_order, re_sort_order)
}

export function updateOrder(sort_list = null){
    if(sort_list === null)
        sort_list = sort_type.map((name, index) =>{
            return { name, index, ban:false, reverse:false};
        })
    let tmp_order = []
    for(let i=0; i<newcode_list.length; i++ ){
        tmp_order.push(i);
    }

    function cmp(a, b){
        for(let i=0; i<sort_list.length; i++){
            if(sort_list[i].ban) continue;
            let tmp; 
            switch(sort_list[i].index){
                case 0:
                    tmp = data_list[a].length - data_list[b].length;
                    break;
                case 1:
                    tmp = newcode_list[a].getEndTime()-newcode_list[a].getStartTime() 
                        - newcode_list[b].getEndTime()+newcode_list[b].getStartTime() ;
                    break;
                case 2:
                    tmp = newcode_list[a].getStartTime() - newcode_list[b].getStartTime();
                    break;
                case 3:
                    tmp = newcode_list[a].max - newcode_list[b].max;
                    break;
                case 4:
                    tmp = newcode_list[a].name > newcode_list[b].name;
                    break;
                default:
                    tmp = a-b; // 跑不到这句的
            }
            if(tmp === 0) continue;
            if(sort_list[i].reverse) return tmp;
            else return -tmp;
        }
        return a-b;
    }

    tmp_order.sort(cmp);
    sort_order = tmp_order;
    getReSortOrder();
}