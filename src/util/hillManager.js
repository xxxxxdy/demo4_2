export class Hill{
    constructor(left, top, right, max_value, min_value){ // 包括 right
        this.left = left;
        this.right = right;
        this.top = top;
        this.min_value = min_value;
        this.max_value = max_value;
        this.persistent = -1;
        this.sum = 0;
    }

    setPersistent(kill_value){
        this.persistent = this.max_value - kill_value;
    }

}
