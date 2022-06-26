import {useState, useEffect} from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import SelectedDigitsView from './components/SelectedDigitsView'
import AggregatedDigitView from './components/AggregatedDigitView'
import DigitSelector from './components/DigitSelector'
import ParameterView from './components/ParameterView'
import GraphVisualization from './components/GraphVisualization'
import _ from 'lodash';

function App({className}) {
    let [apiData, setApiData] = useState({});
    let [selectionHighlightedDigit, setSelectionHighlightedDigit] = useState();
    let [selection, setSelection] = useState({});
    let [aggregatedDigits, setAggregatedDigits] = useState([]);

    useEffect(() => {
        setSelection({});
    }, [apiData])


    return (
        <>
            <DigitSelector 
                setResponse={setApiData}
            />
            <div className={className}>
                    {apiData.data?
                        <GraphVisualization
                            selection={selection}
                            setSelection={setSelection}
                            digits={apiData.data.digits}
                            colorDomain={apiData.data.color_mapping}
                            bounds={apiData.data.bounds}
                            selectionHighlightedDigit={selectionHighlightedDigit}
                        />: <div className="visualization-placeholder" />}
                    <ParameterView    
                        selection={selection}
                        setSelection={setSelection}
                        setAggregatedDigits={setAggregatedDigits}
                    />
                    <AggregatedDigitView
                        className="aggregated-digits"
                        aggregatedDigits={aggregatedDigits}
                        setAggregatedDigits={setAggregatedDigits}
                    />
            </div>
            <div className="selection-container">                    
                <SelectedDigitsView
                    selection={selection}
                    setSelection={setSelection}
                    colorDomain={apiData.data? apiData.data.color_mapping:null}
                    setSelectionHighlightedDigit={setSelectionHighlightedDigit}    
                    length={_.keys(selection).length}
                />
            </div>
        </>
  );
}

const StyledApp = styled(App)`
    display: flex;
    flex-direction: row;
    .visualization-placeholder{
        width:800px;
        height:620px;
    }

    @media screen and (min-width: 800px) {
        .column {
            flex: 1;
        }
    }   }


`;

export default StyledApp;
    