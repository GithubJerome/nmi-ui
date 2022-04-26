import React, { useState } from 'react';
import { Input } from 'antd';
import { isNaN } from 'lodash';

export interface NumericInputProps {
  onChange: any;
  onEnterSubmit: any;
  autoFocus?: boolean;
  autoResize?: boolean;
  numEval?: boolean;
  answerKey?: number;
  exerciseItem?: object;
  exerciseId?: string;
  questionId?: string;
  className?: any;
}

const NumericInput: React.FC<NumericInputProps> = (props) => {
  const { exerciseId, questionId, autoFocus, autoResize, numEval } = props;
  const [inputValue, setInputValue] = useState<string>('');
  const [minWidth, setMinWidth] = useState<number>(65);

  const onChange = (e) => {
    const { value } = e.target;

    const reg = /^[0-9,.]*$/;
    if (!isNaN(value) || value === '' || value === '-') {
      if(numEval) {
        if(reg.test(value)) {
          setInputValue(value);
          props.onChange(e, props.answerKey)
        }
      } else {
        setInputValue(value);
        props.onChange(e, props.answerKey)
      }
    }

    if(autoResize) {
      const tempMinWidth = 65;
      if(value.length > 5) {
        const minComputation = tempMinWidth + ((value.length - 5) * 9);
        if(minComputation < 200) {
          setMinWidth(minComputation);
        }
      } else {
        setMinWidth(tempMinWidth);
      }
    }
  };

  const onKeyUp = (e:any) => {
    if (e.keyCode === 13) {
      props.onEnterSubmit(props.exerciseItem, {exercise_id: exerciseId, question_id: questionId })
    }
  }

  return (
    <>
      <Input 
        className={props.className} 
        autoFocus={autoFocus}
        placeholder="..." 
        value={inputValue}
        onChange={onChange} 
        onKeyUp={onKeyUp}
        style={{width: minWidth}}
      />
    </>
  );
}

export default NumericInput;
