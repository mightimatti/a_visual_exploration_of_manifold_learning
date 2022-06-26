import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import Select from 'react-select'
import * as axios from 'axios';
import _ from 'lodash';


const digitOption = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' }
]
const algorithmOptions = [
  { value: 'pca', label: 'Principal Component Analysis' },
  { value: 'lle', label: 'Locally Linear Embedding' },
  { value: 'mds', label: 'Multi-dimensional Scaling' },
  { value: 'isomap', label: 'Isomap Embedding' },
  // { value: 'tsne', label: 'T-distributed Stochastic Neighbour Embedding' },
]





function DigitSelector(props) {
    const {setResponse, className,} = props;
    const [digitsSelection, setDigitsSelection] = useState([]);
    const [methodSelection, setMethodSelection] = useState(algorithmOptions[0]);

    let getData = (digits, method) => {
        axios.get(
          'embedding/' + method, 
          {params: {'digits': _.join(digits, "")}}
        ).then(
            resp => setResponse(resp.data)
        );
    };
    return <div className={className}>
        <div className="selectContainer">
          <span>Digits</span>
            <Select
              isMulti
              placeholder="Specify digits to include"
              name="digitsSelect"
              closeMenuOnSelect={false}
              options={digitOption}
              value={digitsSelection}
              onChange={setDigitsSelection}
              className="multi-select"
              classNamePrefix="select"
            />
        </div>
        <div className="selectContainer">
          <span>Dimensionality Reduction Technique</span>
          <Select
            name="algorithmSelect"
            value={methodSelection}
            onChange={setMethodSelection}
            options={algorithmOptions}
            className="select"
            classNamePrefix="select"
          />
        </div>
        <div 
          className="submitButton" 
          onClick={
            () => getData(
                _.map(digitsSelection, "value"), 
                methodSelection.value
                )
            }
        >
            fetch embedding
        </div>
    </div>
}

const StyledView = styled(DigitSelector)`
  background-color: black;
  color: white;
  padding: .2em 2em 1em 2em;
  height: 5vh;
  
  .selectContainer{
    padding: 0 2%;
    width:35%;
    flex-direction: row;
  }

  .select, .multi-select{
    color:black
  }

  .submitButton{
    background-color: black;
    display: inline-block;
    cursor: pointer;
    padding: 8px;
    border: 2px solid black;
    border-radius: 8px;
    border-color: white;
  }
  display: flex;
`

export default StyledView;