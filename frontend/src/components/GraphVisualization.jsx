import React, {useState, useMemo, useRef} from 'react';
import styled from 'styled-components'; 
import {XYPlot,
HorizontalGridLines,
MarkSeries,
HorizontalRectSeries,
DiscreteColorLegend,
Hint,
XAxis,
YAxis
} from 'react-vis'
import _ from 'lodash'

import {filter_data_with_bounds, makeSeriesGrid} from './utilities';




function GraphVisualization({className, digits, selection, setSelection, colorDomain, bounds, selectionHighlightedDigit}) {
    let [highlighted, setHighlighted] = useState();
    let [legendHighlighted, setLegendHighlighted] = useState(null);
    const [selectionRectangle, setSelectionRectangle] = useState(false);
    const [closestGridDot,setClosestGridDot]  = useState();
    const ref = useRef()
    
    var markSeriesGrid = useMemo(
        () => makeSeriesGrid(bounds),
        [bounds]
    );

    function onMouseDown(e) {
        setSelectionRectangle({
            x0 : closestGridDot.x,
            y0 : closestGridDot.y,
            x : closestGridDot.x,
            y : closestGridDot.y
        });
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!selectionRectangle) {
            return;
        }
        setSelectionRectangle(state =>
            Object.assign({}, state, {
                x : closestGridDot.x,
                y : closestGridDot.y
            })
        )
    }

    function onMouseUp(e) {
        let bounds = {
            min_x: _.min([selectionRectangle.x0, selectionRectangle.x]),
            min_y: _.min([selectionRectangle.y0, selectionRectangle.y]),
            max_x: _.max([selectionRectangle.x0, selectionRectangle.x]),
            max_y: _.max([selectionRectangle.y0, selectionRectangle.y]),
            
        }
        // console.log("bounds", bounds)
        setSelection(state =>{
            return Object.assign(
                {}, 
                state, 
                filter_data_with_bounds(digits, bounds)
            )
        })
        // console.debug(selection);
        setSelectionRectangle(false);
        // console.groupEnd();
    };

    function markseriesFromData(data, key){
        // const [mouseIsDown, setMouseIsDown] = useState(false);
        return <MarkSeries 
            key={'series_' +  key}
            className="digit-series"
            onValueMouseOver={
                (datapoint) => setHighlighted(datapoint) 
            }
            onValueMouseOut={
                () => {setHighlighted(null)}
            }
            onValueClick={
                (datapoint, {event}) =>{
                    setSelection(state => {
                        let newState = Object.assign({}, state);
                        newState[datapoint.idx] = datapoint;
                        return newState
                    })
                }
            }
            onValueRightClick={
                (datapoint, {event}) =>{
                    setSelection(state => {
                        let newState = Object.assign({}, state);
                        delete newState[datapoint.idx];
                        return newState
                    })
                    event.preventDefault();
                }
            }
            data={data} 
            size={legendHighlighted !== null && legendHighlighted != key ? 0.5 : 3}
            color={colorDomain[key]}
        />
    }
    let collectedMarkSeries = useMemo(
        () =>_.map(digits, markseriesFromData),
        [digits, legendHighlighted]
    )

    let legendEntries = _.map(_.keys(digits), (key) => {
        return {
            'title': key,
            'color': colorDomain[key]
        }
    })

    let addClassToSelection = (index) =>{
            setSelection(state => {
                let newState = Object.assign({}, state);
                // newState[datapoint.idx] = datapoint;
                // return newState
                _.each(digits[index], (elem) =>{
                    newState[elem.idx] = elem
                })
                return newState
            })
    }

    return <div className={className} ref={ref}>
        <XYPlot
            className={"visualization"}
            onMouseLeave={
                () => {setHighlighted(null)}
            }
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            width={780}
            height={620}
        >

            <MarkSeries 
                color="transparent"
                data={markSeriesGrid}
                onNearestXY={datapoint => setClosestGridDot({
                    x:datapoint.x, 
                    y:datapoint.y, 
                })}
            />
            {
                selectionRectangle?
                <HorizontalRectSeries
                    data={[selectionRectangle]}
                />:
                null

            }
            {highlighted?
                <Hint
                    value={{x:highlighted.x,
                    y:highlighted.y}}
                    align={
                        {horizontal: null, vertical: null}
                    }>
                    <img 
                        className={"digit-hint"} 
                        src={'/img?idx='+highlighted.idx}
                    />
                </Hint> : 
                null
            }
            {selection && !selectionHighlightedDigit?
                <MarkSeries 
                            className="highlighted-series" 
                            stroke="black"
                            color="transparent"
                            data={_.values(selection)}
                            size={5}
                />:
                    null
                }
            {collectedMarkSeries}
            {selection && !selectionHighlightedDigit?
                null:
                <MarkSeries 
                    className="highlighted-series" 
                    stroke="black"
                    color="transparent"
                    data={[selectionHighlightedDigit]}
                    size={8}
                    style={{strokeWidth : "3px"}}
                />
            }
            <HorizontalGridLines />
            <XAxis tickTotal={8}/>
            <YAxis tickTotal={8}/>
        </XYPlot>
        <DiscreteColorLegend
            className="legend"
            onItemClick={(item, index) => {
                addClassToSelection(item.title)
            }}
            onItemMouseEnter={(item, index) => {
                setLegendHighlighted(item.title)
            }}
            onItemMouseLeave={(item, index) => {
                setLegendHighlighted(null)
            }}
            items={legendEntries}
            width={20}
            height={560}
        />
        </div>;
}

const StyledView = styled(GraphVisualization)`
    cursor: crosshair;
    position: relative;
    display: flex;
    flex-base: width;
    
    
    .digit-hint{
    border: 2px solid white;
    }

    .digit-series{
        cursor: pointer;
    }
    .legend{
        padding-top: 60px;        
        border-left: 2px solid;
        padding-left: 12px;
        margin-right: 8px;
        font-family: courier;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: -60px;        

    }
`

export default StyledView;
