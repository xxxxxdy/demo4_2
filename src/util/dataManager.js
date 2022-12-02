export var data_value = [
    {"name": 1, "time": 13,  "count": -0.304},
    {"name": 1,"time": 40, "count": -0.805},
    {"name": 1,"time": 80, "count": -0.201},
    {"name": 1,"time": 120, "count": -0.508},
    {"name": 1, "time": 140,  "count": -0.304},
    {"name": 1,"time": 160, "count": -0.802},
    {"name": 1,"time": 180, "count": -0.200},
    {"name": 1,"time": 188, "count": -0.507},
    {"name": 2,"time": 50,  "count": -0.605},
    {"name": 2,"time": 99, "count": -0.202},
    {"name": 2,"time": 100, "count": -0.507},
    {"name": 2,"time": 150, "count": -0.401},
    {"name": 2,"time": 192, "count": -0.607},
    {"name": 3,"time": 50,  "count": -0.402},
    {"name": 3,"time": 80, "count": -0.899},
    {"name": 3,"time": 150, "count": -0.308},
    {"name": 3,"time": 159, "count": -0.601},
    {"name": 3,"time": 188, "count": -0.701},
];

export var data_type_name = ["name", "time", "count"];
export var data_value_line = 2; // 虽然是var 但是改不了
export var square_list = [];

export var data_field = {
    "x_is_date": false,
    "max_y": -Infinity,
    "min_y": Infinity,
    "max_x": -Infinity,
    "min_x": Infinity
};

// export const DATA_TYPE = 300;
export const DATA_TYPE = 400;
// export const DATA_TIME = 300;

export function getDataName(i){
    return data_value[i][data_type_name[0]];
}

export function getDataTime(i){
    return data_value[i][data_type_name[1]];
}

export function getDataValue(i){
    return data_value[i][data_type_name[data_value_line]];
}

export function calculateDataField(){
    data_field["max_x"] = -Infinity;
    data_field["min_x"] = Infinity;
    data_field["max_y"] = -Infinity;
    data_field["min_y"] = Infinity;

    for(let i=0; i < data_value.length; i++){
        if(getDataTime(i) > data_field["max_x"])
            data_field["max_x"] = getDataTime(i);
        if(getDataTime(i) < data_field["min_x"])
            data_field["min_x"] = getDataTime(i);
        if(getDataValue(i) > data_field["max_y"])
            data_field["max_y"] = getDataValue(i);
        if(getDataValue(i) < data_field["min_y"])
            data_field["min_y"] = getDataValue(i);
    }
}
