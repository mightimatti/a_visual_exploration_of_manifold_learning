import React, {useRef, useState, useEffect} from 'react';
import styled from 'styled-components'; 
import _ from 'lodash';
import {colorDomain, findBoxSize} from './utilities';

const StledContainer = styled.div`
    padding: 2px;
    margin: 1px;
    margin-right: auto;
    background-color: ${({color}) => color};

`;

function SelectedDigitsView(props ) {
    const {
        className, 
        selection,
        setSelection, 
        colorDomain,
        setSelectionHighlightedDigit
    } = props;

    const [dimensions, setDimensions] = useState(0)
    const ref = useRef()

    let cur_height =  ref.current? ref.current.clientHeight : null;
    let cur_width =  ref.current? ref.current.clientWidth : null;

    let elementCount = _.size(selection);
    let boxSize = findBoxSize(
        elementCount, 
        cur_width, 
        cur_height
    );

    let elements = _.map(
        _.sortBy(selection, ['cls','x', 'y']),
        (value, key) => 
            <StledContainer
                key={key}
                color={colorDomain[value.cls]}
            >
                <img
                    onMouseEnter={() => setSelectionHighlightedDigit(value)}
                    onMouseLeave={ () => setSelectionHighlightedDigit() }
                    onContextMenu={ (e) => {
                        setSelection(state => {
                            let newState = Object.assign({}, state);
                            delete newState[value.idx];
                            return newState;
                        }); 
                        setSelectionHighlightedDigit(null);
                        e.preventDefault()
                    }}  
                    width={boxSize + 'px'} 
                    height={boxSize+ 'px'} 
                    src={'/img?idx='+value.idx} />
            </StledContainer>
        );

    return <div ref={ref} className={className}>
        {elements}
    </div>;
}

const StyledView = styled(SelectedDigitsView)`
    background-color: black;
    display: flex;
    flex-flow: column;
    flex-wrap: wrap;
    width: 100vw;
    overflow-x: auto;
    height: 25vh ;
    img{
        cursor: pointer;
    }
    
`

export default StyledView;
