import _ from 'lodash';


export const colorDomain = [
    'red','yellow','green', 'purple', 'blue',
    'orange','black','pink','orange','black'
];

export function filter_data_with_bounds(data, bounds){
    let newSelection = {};
    let  digit_dict_is_in_bounds = (inst) => {
        return (
            inst.x >= bounds.min_x && inst.x <= bounds.max_x &&
            inst.y >= bounds.min_y && inst.y <= bounds.max_y 
        )
    }
    _.each(data, (digit_series, digit) => {
        let res = _.filter(digit_series, digit_dict_is_in_bounds);
        Object.assign(newSelection, _.keyBy(res, "idx"));
    })
    return newSelection
};

export function findBoxSize(elementCount, width, height){
    let curSize = 300;
    let elementsContainerCanFit;
    const border_and_margin = 5;
    do{
        curSize -= 2 ;
        elementsContainerCanFit = (
            Math.floor(height/(curSize+border_and_margin*2)) * 
            Math.floor(width /(curSize+border_and_margin*2))
  
        );
    }while(elementCount > elementsContainerCanFit)


    return curSize
};

export function makeSeriesGrid(bounds){
    let markSeriesGrid = [];
    let x_step = (bounds.max_x - bounds.min_x)/20; 
    let y_step = (bounds.max_y - bounds.min_y)/20; 
    _.each(_.range(
            bounds.min_x-x_step, 
            bounds.max_x+x_step, 
            x_step ), x => {
        _.each(_.range(
                bounds.min_y-y_step, 
                bounds.max_y+y_step, 
                y_step), y =>{
            markSeriesGrid.push(
                {x:x, y:y}
            )
        })
    });
    return markSeriesGrid
};


