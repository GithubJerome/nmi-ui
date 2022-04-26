import React, { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import style from './index.less';

export interface QuestionBarProps {
  questions: any;
}

const QuestionBar: React.FC<QuestionBarProps> = (props) => {
  const { questions } = props;
  const [totalAnswered, setTotalAnswered] = useState<number>(1);

  useEffect(() => {
    const currentTotal = questions.length;
    setTotalAnswered(currentTotal);
  }, [questions]);

  return (
    <div className={style.questionBar}>
      { questions.filter((q:any) => q.answered === true).map((item:any) => {
        return <div key={item.course_question_id} className={style[`question${(item.is_correct) ? 'Success': 'Failed'}`]} style={{width: `${(100/totalAnswered).toFixed(2)}%`}} />
      })}
    </div>
  );
}

export default QuestionBar;
