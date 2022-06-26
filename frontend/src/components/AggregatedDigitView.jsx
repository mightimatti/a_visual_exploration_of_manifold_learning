import React, {useRef, useState, useEffect} from 'react';
import styled from 'styled-components'; 
import _ from 'lodash';
import {colorDomain, findBoxSize} from './utilities';
import ReactTooltip from "react-tooltip";

const StyledDigitAggregationContainer = styled.div`
    width:45%;
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
`;


const StyledDigitAggregation = styled.div`
    padding: 2px;
    margin: 1px;
    margin-bottom: auto;
    border: 1px solid black;
    text-align: right;
    .remove-icon{
        margin-right: 1px;
        cursor: pointer;
        border-radius: 4px;

    }
`;

const  DigitContainer = ({id, method, width, height, removeCB, instanceCount}) => {
    return <StyledDigitAggregation >
        <ReactTooltip html={true} />
        <div onClick={removeCB} className="remove-icon">x</div>
        <img src={`aggregatedImages/${id}`}
             width={width}
             height={height}
            data-tip={`<div id="digitTooltip">
                <span>instances: ${instanceCount}</span>
                <br/>
                <span>method: ${method}</span>
            </div>`}
        />

    </StyledDigitAggregation>
}

function AggregatedDigitView(props ) {
    const {
        className,
        aggregatedDigits,
        setAggregatedDigits,
        selection,
        setSelection,
        setSelectionHighlightedDigit
    } = props;

    const ref = useRef()

    let cur_height =  ref.current? ref.current.clientHeight : null;
    let cur_width =  ref.current? ref.current.clientWidth : null;

    let elementCount = _.size(aggregatedDigits);
    let boxSize = findBoxSize(
        elementCount, 
        cur_width, 
        cur_height
    );


    return <StyledDigitAggregationContainer ref={ref}>
        <ReactTooltip html={true}/>
        {aggregatedDigits?
            aggregatedDigits.map((digitObj, ind) =>
                <DigitContainer
                    {...digitObj}
                    key={digitObj.id}
                    // set box dimensions based on calculation of utility function
                    width={boxSize*0.9 + 'px'}
                    height={boxSize*0.9+ 'px'}
                    // add a callback to enable the remove button in top corner
                    // It is neccessary to return a new object and access the
                    // current `aggregatedDigits` at every call, which is why
                    // this callback uses more complex logic than might seem
                    // neccessary at first
                    removeCB={() => {
                            setAggregatedDigits(aggD =>
                                [..._.filter(aggD, (x) => x.id != digitObj.id)]
                            )
                        }
                    }
                />) :
            <div>aggregation goes here</div>
        }

    </StyledDigitAggregationContainer>;
}

const StyledView = styled(AggregatedDigitView)`

    
`

export default StyledView;
