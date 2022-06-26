import React, {useState, useMemo,  useEffect} from 'react';
import styled from 'styled-components'; 
import Select, {components} from 'react-select';  
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import axios from 'axios';

const {Option} = components;

const aggregationOptions = [
    {"label":"average Image(monochrome)", 
        "value": "avg_m"}, 
    ,{"label":"average Image(color, normalized)",
        "value": "avg_c"}, 
    {"label":"average Image(color, saturating)",
        "value": "avg_c_s"},

]




function ParameterView(props) {
    const {className, selection, setSelection, setAggregatedDigits} = props;
    const [methodSelection, setMethodSelection] = useState(null);

    const getAggregation = () => {
        const params = new URLSearchParams(
            { digits: _.keys(selection) }
        );
        axios.get(
            `/aggregation/${methodSelection.value}?${params}`
                ).then(
            resp => setAggregatedDigits((digits) =>{
                return [
                    ...digits,
                    resp.data
                ]
            })
            );
    };

    return <div className={className}>
        <ReactTooltip html={true} />
        {/*add View of stats. Explained Variance, instances being visualized*/}
        <div className="button" onClick={() => {setSelection({})}}>reset selection</div>
        {/*Dropdown of available aggregation views*/}
        <div className="selectContainer">
            <span>
                Aggregation Technique
                <i 
                    data-tip={
                        '<p>Please select the method you would like to aggregate the current selection by. Options include:</p><br/>                        <strong>average Image(monochrome)</strong><p>All selected digits are overlayed into a single 24x24 pixel image.</p><strong>average Image(color, saturating)</strong><p>An average image is calculated for all classes represented in the current selection, tinted in the color of that class and added to the overall aggregation. Common  regions tend to become bright, as pixel values are added</p><strong>average Image(color, normalized)</strong><p>An average image is calculated for all classes represented in the current selection, tinted in the color of that class and added to the overall aggregation.</p><p>Same as above, but Luminance is maintained, as images are aggregated to not saturate(blow out) pixels .</p>'}
                    className="bi 2x bi-info-circle">
                </i>
            </span>
            <Select
                name="algorithmSelect"
                value={methodSelection}
                onChange={setMethodSelection}
                options={aggregationOptions}
                className="select"
                classNamePrefix="select"
            />
          <div 
            className="button" 
            onClick={ getAggregation }
          >
              aggregate selection
          </div>
        </div>
    </div>;

}

const StyledView = styled(ParameterView)`
    background-color: black;
    max-width: 20vw;
    color: white;

    flex-base: width;

    .selectContainer > .select{
        color: black
    }
    .selectContainer > .bi{
        margin-left: auto;
        color: 57white;    
    }

  .button{
    background-color:black;
    display: inline-block;
    cursor: pointer;
    padding: 8px;
    border: 2px solid black;
    border-radius: 8px;
    border-color: white;
  }


`

export default StyledView;
