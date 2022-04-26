import React from 'react';

import { epochToJsDate, epochToJsDatewithTime, textAbstract } from '@/utils/utils';
import { Tooltip, List, Typography, Tag } from 'antd';
import { injectIntl, FormattedMessage, formatMessage } from 'umi';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
const { Title, Paragraph, Text } = Typography;

const formatQuestions = (label, value) => {
  if (!value) {
    return label;
  }
  return (<span>
    { label.split(value)
      .reduce((prev, current, i) => {
        if (!i) {
          return [current];
        }
        
        return prev.concat("__", current)
      }, [])
    }
  </span>);
};


export const colCourse2 = [
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-courses.table.course_name"
        defaultMessage="Course Name"
      />
    ),
    dataIndex: 'course_title',
    key: 'course_title',
    render: (name: string, course: any) => (
      <a key={course.course_id} href={`/course?course_id=${course.course_id}`}>{name}</a>
    )
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-courses.table.description"
        defaultMessage="Description"
      />
    ),
    dataIndex: 'description',
    key: 'description',
    render: (desc: string) => (
      <Tooltip placement="topLeft" title={desc}>
        <Paragraph>
          {textAbstract(desc, 50)}
        </Paragraph>
      </Tooltip>
    )
  },
  /* {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-courses.table.difficulty_level"
        defaultMessage="Difficulty level"
      />
    ),
    dataIndex: 'difficulty_level',
    key: 'difficulty_level',
  }, */
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-courses.table.requirements"
        defaultMessage="Requirements"
      />
    ),
    dataIndex: 'requirements',
    key: 'requirements',
    render: req => (
      <Tooltip placement="topLeft" title={req}>
      <Paragraph>
        {textAbstract(req, 50)}
      </Paragraph>
    </Tooltip>
    )
  },
  /* {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-courses.table.progress"
        defaultMessage="Progress"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-courses.table.expiry_date"
        defaultMessage="Expiry"
      />
    ),
    dataIndex: 'expiry_date',
    key: 'expiry_date',
    render: expiryDate => (
      epochToJsDate(expiryDate)
    )
  }, */
];

export const colActivities = [
  {
    title: 'Activity',
    dataIndex: 'activity',
    key: 'activity',
  },
  {
    title: 'Part Of',
    dataIndex: 'section',
    key: 'section',
  },
  {
    title: 'Start Date',
    dataIndex: 'start_date',
    key: 'start_date',
    render: date =>  {
      if(date){
        return epochToJsDate(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: 'Completion Date',
    dataIndex: 'end_date',
    key: 'end_date',
    render: date => {
      if(date){
        return epochToJsDate(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: 'Score',
    dataIndex: 'score_progress',
    key: 'score_progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } else {
        return "-"
      }
    }
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status'
  },
];


export const colSkills = [
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.skill"
        defaultMessage="Skill"
      />
    ),
    width: 325,
    dataIndex: 'skill',
    key: 'skill',
    sorter: true,
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.answered_questions"
        defaultMessage="Questions answered"
      />
    ),
    width: 200,
    dataIndex: 'answered_questions',
    key: 'answered_questions',
    sorter: true,
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.correct"
        defaultMessage="% Correct"
      />
    ),
    width: 140,
    dataIndex: 'correct',
    key: 'correct',
    sorter: true,
    render: correct =>  {
      if(correct){
        return `${correct}%`
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.progress"
        defaultMessage="Progress"
      />
    ),
    width: 140,
    dataIndex: 'progress',
    key: 'progress',
    sorter: true,
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.time_studied"
        defaultMessage="Time studied"
      />
    ),
    width: 160,
    dataIndex: 'time_studied',
    key: 'time_studied',
    sorter: true,
  },
];


export const colSubSkills = [
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.subskill"
        defaultMessage="SubSkill"
      />
    ),
    width: 325,
    dataIndex: 'subskill',
    key: 'subskill',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.subskill-answered_questions"
        defaultMessage="Questions answered"
      />
    ),
    width: 200,
    dataIndex: 'answered_questions',
    key: 'answered_questions',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.subskill-correct"
        defaultMessage="% Correct"
      />
    ),
    width: 140,
    dataIndex: 'correct',
    key: 'correct',
    render: correct =>  {
      if(correct){
        return `${correct}%`
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.subskill-progress"
        defaultMessage="Progress"
      />
    ),
    width: 140,
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.dashboard.my-skills.table.subskill-time_studied"
        defaultMessage="Time studied"
      />
    ),
    width: 160,
    dataIndex: 'time_studied',
    key: 'time_studied'
  }
]

export const colCourseTemp = [
  {
    title: () => (
      <FormattedMessage
        id="pages.courses.table.course_name"
        defaultMessage="Course Name"
      />
    ),
    dataIndex: 'course_name',
    key: 'course_name',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.courses.table.course_title"
        defaultMessage="Course Title"
      />
    ),
    dataIndex: 'course_title',
    key: 'course_title',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.courses.table.description"
        defaultMessage="Description"
      />
    ),
    dataIndex: 'description',
    key: 'description',
  }
]

export const colCourseReq = [
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.modal6.table.name"
        defaultMessage="Name"
      />
    ),
    dataIndex: 'course_name',
    key: 'course_name',
    render: (name, row) => {
      if(row.course_name){ return row.course_name} 
      if(row.section_name){ return row.section_name } 
      if(row.subsection_name){ return row.subsection_name } 
      
      if(row.exercise_id){ return row.exercise_num };
      
      return name;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.modal6.table.islock"
        defaultMessage="is_lock"
      />
    ),
    dataIndex: 'is_lock',
    key: 'is_lock',
    editable: true
  }
]

export const colCourseReq2 = [
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.modal6.table.name"
        defaultMessage="Name"
      />
    ),
    width: '50%',
    dataIndex: 'course_name',
    key: 'course_name',
    render: (name, row) => {
      if(row.course_name){ return row.course_name} 
      if(row.section_name){ return row.section_name } 
      if(row.subsection_name){ return row.subsection_name } 
      if(row.exercise_id){ return row.exercise_num } 
      
      return name;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.modal6.table.repeatable"
        defaultMessage="is_repeatable"
      />
    ),
    dataIndex: 'is_repeatable',
    key: 'is_repeatable',
    repeatable: true
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.modal6.table.gradeLock"
        defaultMessage="grade_locking"
      />
    ),
    dataIndex: 'grade_locking',
    key: 'grade_locking',
    editable: true
  }
]


export const colCourse = [
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.course.table.course_name"
          defaultMessage="Course Name"
        />
      ),
      dataIndex: 'course_name',
      key: 'course_name',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.courses.table.course_title"
          defaultMessage="Course Title"
        />
      ),
      dataIndex: 'course_title',
      key: 'course_title',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.course.table.description"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.course.table.difficulty_level"
          defaultMessage="Difficulty level"
        />
      ),
      dataIndex: 'difficulty_level',
      key: 'difficulty_level',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.course.table.requirements"
          defaultMessage="Requirements"
        />
      ),
      dataIndex: 'requirements',
      key: 'requirements',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.course.table.created_on"
          defaultMessage="Created Time"
        />
      ),
      dataIndex: 'created_on',
      key: 'created_on',
      render: createdOn => (
        epochToJsDate(createdOn)
      )
    },
];

export const colAdminCourse = [
  {
    title: () => (
      <FormattedMessage
        id="pages.courses.table.course_name"
        defaultMessage="COURSE NAME"
      />
    ),
    dataIndex: 'course_name',
    key: 'course_name',
    render: (name: string, course: any) => (
      <a key={course.course_id} href={`/admin/course?course_id=${course.course_id}`}>{name}</a>
    )
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.courses.table.course_title"
        defaultMessage="COURSE TITLE"
      />
    ),
    dataIndex: 'course_title',
    key: 'course_title',
    render: (course_title: string) => {
      return course_title;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.courses.table.description"
        defaultMessage="DESCRIPTION"
      />
    ),
    dataIndex: 'description',
    key: 'description',
    render: (desc: string) => (
      <Tooltip placement="topLeft" title={desc}>
      <Text>
        {textAbstract(desc, 150)}
      </Text>
    </Tooltip>
    )
  },
];


export const colTutorCourse = [
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.coursename"
        defaultMessage="COURSE NAME"
      />
    ),
    dataIndex: 'course_name',
    key: 'course_name',
    render: (name, course) => (
      <a key={course.course_id} href={`/tutor-course?course_id=${course.course_id}`}>{name}</a>
    )
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.description"
        defaultMessage="DESCRIPTION"
      />
    ),
    dataIndex: 'description',
    key: 'description',
    render: desc => (
      <Tooltip placement="topLeft" title={desc}>
      <Paragraph>
        {textAbstract(desc, 150)}
      </Paragraph>
    </Tooltip>
    )
  },
];

export const colCourseProgress = [
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.coursename"
        defaultMessage="COURSE NAME"
      />
    ),
    dataIndex: 'course_title',
    key: 'course_title',
    render: (name: string, course: any) => (
      <a key={course.course_id} href={`/progress-course?course_id=${course.course_id}`}>{name}</a>
    )
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.started"
        defaultMessage="STARTED"
      />
    ),
    dataIndex: 'started',
    key: 'started',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.update_on"
        defaultMessage="FINISHED"
      />
    ),
    dataIndex: 'end_on',
    key: 'end_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } 
      return "-";
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.progress"
        defaultMessage="PROGRESS"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`;
      } 
      return "-";
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.score"
        defaultMessage="SCORE"
      />
    ),
    dataIndex: 'score',
    key: 'score',
    render: score =>  {
      if(score){
        return `${score}%`;
      } 
      return "-";
    }
  }
];

export const colCourseProgress2 = [
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.name"
        defaultMessage="NAME"
      />
    ),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: "",
    dataIndex: 'value',
    key: 'value',
    width: 200,
    render: (value, item) => {
      if(value && (item.name === "Question" || item.name === "Answer" || item.name === "Correct Answer" || item.name === "Vraag" || item.name === "Antwoord" || item.name === "Goed antwoord" || item.name === "Juist antwoord")){
        return (
          <div style={{ width: "100%" }}>
            {
              (item.name === "Question" || item.name === "Vraag") &&
              <div>
                {
                  item.question_type === "MATCH" &&
                  <List.Item.Meta
                    title={value.join(", ")}
                  />
                }
                {
                  item.question_type !== "MATCH" &&
                  <List.Item.Meta
                    title={formatQuestions(value, "<ans>")}
                  />
                }
              </div>
            }
            {
              (item.name === "Answer" || item.name === "Antwoord") &&
              <div>
                {(item.question_type === "MATCH" || item.question_type === "MULRE") ? value.join(", ") : value} &nbsp; 
                { item.is_correct === true && 
                  <CheckCircleOutlined style={{ color: "green" }} />
                }
                { item.is_correct === false && 
                  <CloseCircleOutlined style={{ color: "red" }} />
                }
              </div>
            }
            {
              (item.name === "Correct Answer" || item.name === "Goed antwoord" || item.name === "Juist antwoord") &&
              <div>
                {(item.question_type === "MATCH" || item.question_type === "MULRE" || item.question_type === "FITBD") ? value.join(", ") : value} &nbsp; 
              </div>
            }
              
          </div>
        )
      }
      return;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.started"
        defaultMessage="STARTED"
      />
    ),
    dataIndex: 'started',
    key: 'started',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.update_on"
        defaultMessage="FINISHED"
      />
    ),
    dataIndex: 'update_on',
    key: 'update_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.progress"
        defaultMessage="PROGRESS"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.score"
        defaultMessage="SCORE"
      />
    ),
    dataIndex: 'score',
    key: 'score',
    render: score =>  {
      if(score){
        return `${score}%`
      } 
      return "-"
    }
  },
];

export const colTutorCourseProgress = [
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.name"
        defaultMessage="NAME"
      />
    ),
    dataIndex: 'name',
    key: 'name',
    render: (value, item) => {
      /* if(value && item.exercise_id) {
        return <a href={`/admin/exercise?exercise_id=${item.exercise_id}&student_id=6001dcfc1ede4656b03aac9d66b3fc26`}>{value}</a>;
      } */
      return value;
    }
  },
  {
    title: "",
    dataIndex: 'value',
    key: 'value',
    width: 200,
    render: (value, item) => {
      if(value && (item.name === "Question" || item.name === "Answer" || item.name === "Correct Answer" || item.name === "Vraag" || item.name === "Antwoord" || item.name === "Goed antwoord" || item.name === "Juist antwoord")){
        return (
          <div style={{ width: "100%" }}>
            {
              (item.name === "Question" || item.name === "Vraag") &&
              <div>
                {
                  item.question_type === "MATCH" &&
                  <List.Item.Meta
                    title={value.join(", ")}
                  />
                }
                {
                  item.question_type !== "MATCH" &&
                  <List.Item.Meta
                    title={formatQuestions(value, "<ans>")}
                  />
                }
              </div>
            }
            {
              (item.name === "Answer" || item.name === "Antwoord") &&
              <div>
                {(item.question_type === "MATCH" || item.question_type === "MULRE") ? value.join(", ") : value} &nbsp; 
                { item.is_correct === true && 
                  <CheckCircleOutlined style={{ color: "green" }} />
                }
                { item.is_correct === false && 
                  <CloseCircleOutlined style={{ color: "red" }} />
                }
              </div>
            }
            {
              (item.name === "Correct Answer" || item.name === "Goed antwoord" || item.name === "Juist antwoord") &&
              <div>
                {(item.question_type === "MATCH" || item.question_type === "MULRE" || item.question_type === "FITBD") ? value.join(", ") : value} &nbsp; 
              </div>
            }
              
          </div>
        )
      }
      return;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.started"
        defaultMessage="STARTED"
      />
    ),
    dataIndex: 'started',
    key: 'started',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.update_on"
        defaultMessage="FINISHED"
      />
    ),
    dataIndex: 'update_on',
    key: 'update_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.progress"
        defaultMessage="PROGRESS"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.score"
        defaultMessage="SCORE"
      />
    ),
    dataIndex: 'score',
    key: 'score',
    render: score =>  {
      if(score){
        return `${score}%`
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.time_studied"
        defaultMessage="TIME STUDIED"
      />
    ),
    dataIndex: 'time_studied',
    key: 'time_studied',
    render: time => {
      if(time){
        return time;
      } 
      return "-"
    }
  },
];

export const colTutorExerciseTries = [
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.name"
        defaultMessage="NAME"
      />
    ),
    dataIndex: 'name',
    key: 'name',
    width: 200,
    render: (value, item) => {
      return value;
    }
  },
  {
    title: "",
    dataIndex: 'value',
    key: 'value',
    render: (value, item) => {
      if(value && (item.name === "Question" || item.name === "Answer" || item.name === "Correct Answer" || item.name === "Vraag" || item.name === "Antwoord" || item.name === "Goed antwoord" || item.name === "Juist antwoord")){
        return (
          <div style={{ width: "100%" }}>
            {
              (item.name === "Question" || item.name === "Vraag") &&
              <div>
                {
                  item.question_type === "MATCH" &&
                  <List.Item.Meta
                    title={value.join(", ")}
                  />
                }
                {
                  item.question_type !== "MATCH" &&
                  <List.Item.Meta
                    title={formatQuestions(value, "<ans>")}
                  />
                }
              </div>
            }
            {
              (item.name === "Answer" || item.name === "Antwoord") &&
              <div>
                {(item.question_type === "MATCH" || item.question_type === "MULRE") ? value.join(", ") : value} &nbsp; 
                { item.is_correct === true && 
                  <CheckCircleOutlined style={{ color: "green" }} />
                }
                { item.is_correct === false && 
                  <CloseCircleOutlined style={{ color: "red" }} />
                }
              </div>
            }
            {
              (item.name === "Correct Answer" || item.name === "Goed antwoord" || item.name === "Juist antwoord") &&
              <div>
                {(item.question_type === "MATCH" || item.question_type === "MULRE" || item.question_type === "FITBD") ? value.join(", ") : value} &nbsp; 
              </div>
            }
              
          </div>
        )
      }
      return;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.started"
        defaultMessage="STARTED"
      />
    ),
    dataIndex: 'started_on',
    key: 'started_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.update_on"
        defaultMessage="FINISHED"
      />
    ),
    dataIndex: 'update_on',
    key: 'update_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.progress"
        defaultMessage="PROGRESS"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      if(progress){
        return `${progress}%`
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.score"
        defaultMessage="SCORE"
      />
    ),
    dataIndex: 'score',
    key: 'score',
    render: score =>  {
      if(score){
        return `${score}%`
      } 
      return "-"
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.student.progress-course.table.time_studied"
        defaultMessage="TIME STUDIED"
      />
    ),
    dataIndex: 'time_studied',
    key: 'time_studied',
    render: time => {
      if(time){
        return time;
      } 
      return "-"
    }
  },
];

export const colCourseDetailsTutor = [
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.course.table.name"
        defaultMessage="NAME"
      />
    ),
    dataIndex: 'name',
    key: 'name',
    render: (name, obj) => {
      
      if(obj.exercise_id && obj.exercise_number){
        return <a key={obj.exercise_id} href={`/admin/exercise?exercise_id=${obj.exercise_id}&course_id=${obj.course_id}`}>{name}</a>
      } 
      
      if(obj.section_id && obj.section_name){
        return <a key={obj.section_id} href={`/admin/section?section_id=${obj.section_id}&course_id=${obj.course_id}`}>{name}</a>
      } 
      
      if(obj.subsection_id && obj.subsection_name){
        return <a key={obj.subsection_id} href={`/admin/subsection?subsection_id=${obj.subsection_id}&section_id=${obj.section_id}&course_id=${obj.course_id}`}>{name}</a>
      } 
      return name;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.course.table.created_on"
        defaultMessage="CREATED ON"
      />
    ),
    dataIndex: 'created_on',
    key: 'created_on',
    render: date => {
      if(date){
        return epochToJsDate(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.course.table.description"
        defaultMessage="DESCRIPTION"
      />
    ),
    dataIndex: 'description',
    key: 'description',
    render: desc => (
      <Tooltip placement="topLeft" title={desc}>
        <Paragraph>
          {textAbstract(desc, 30)}
        </Paragraph>
      </Tooltip>
    )
  },
];

export const colVideo = [
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.videos.table.video_name"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'video_name',
      key: 'video_name',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.videos.table.url"
          defaultMessage="URL"
        />
      ),
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.videos.table.description"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.videos.table.created_on"
          defaultMessage="Created Time"
        />
      ),
      dataIndex: 'created_on',
      key: 'created_on',
      render: createdOn => (
        epochToJsDate(createdOn)
      )
    },
];

export const colSkillVideo = [
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.skills.table.skill"
        defaultMessage="Skill"
      />
    ),
    dataIndex: 'skill',
    key: 'skill',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.skills.table.videos"
        defaultMessage="Videos"
      />
    ),
    dataIndex: 'videos',
    key: 'videos',
    render: (videos: object) => {
      if (videos) {
        return (<div>
          {videos.map((video:any)=>
           <Tag color="#2db7f5">{video.video_name}</Tag> 
          )}
        </div>);
      }

      return "-"
    }
  }
];

export const colStudent = [
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.users.table.first_name"
        defaultMessage="First Name"
      />
    ),
    dataIndex: 'first_name',
    key: 'first_name',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.users.table.last_name"
        defaultMessage="Last Name"
      />
    ),
    dataIndex: 'last_name',
    key: 'last_name',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.users.table.username"
        defaultMessage="Username"
      />
    ),
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.users.table.email"
        defaultMessage="Email"
      />
    ),
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.users.table.roles"
        defaultMessage="Role"
      />
    ),
    dataIndex: 'roles',
    key: 'roles',
    render: (roles: any) => {
      return roles.map((role:any) => formatMessage({ id: `pages.user.role.${role.role_name}` })).join(", ")
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.users.table.created_on"
        defaultMessage="Created Time"
      />
    ),
    dataIndex: 'created_on',
    key: 'created_on',
    render: createdOn => (
      epochToJsDate(createdOn)
    )
  },
];


export const colUserGroup = [
  {
    title: () => (
      <FormattedMessage
          id="pages.manager.groups.table.user_group_name"
          defaultMessage="Name"
        />
    ),
    dataIndex: 'user_group_name',
      key: 'user_group_name',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.table.students"
        defaultMessage="Members"
      />
    ),
    dataIndex: 'students',
    key: 'students',
    render: stdnts => {
      if(stdnts === null || stdnts.length === 0){
        return <FormattedMessage
          id="pages.manager.groups.table.course.none"
          defaultMessage="None -"
         />;
      } else if(stdnts.length === 1){
          return stdnts[0].first_name +" "+ stdnts[0].last_name
      } else {
        return (
          <Tooltip placement="topLeft" title={
            <List
              size="small"
              dataSource={Object.keys(stdnts).map((k) => {return stdnts[k].first_name +" "+ stdnts[k].last_name})}
              renderItem={item => (
                <List.Item>
                  {item}
                </List.Item>
              )}
            />
          }>
            {stdnts.length}
          </Tooltip>
        )
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.table.tutors"
        defaultMessage="Tutor"
      />
    ),
    dataIndex: 'tutors',
    key: 'tutors',
    render: ttrs => {
      if(ttrs === null || ttrs.length === 0){
        return <FormattedMessage
          id="pages.manager.groups.table.course.none"
          defaultMessage="None -"
         />;
      } else if(ttrs.length === 1){
          return ttrs[0].first_name +" "+ ttrs[0].last_name
      } else {
        return (
          <Tooltip placement="topLeft" color="white" title={
            <List
              size="small"
              dataSource={Object.keys(ttrs).map((k) => {return ttrs[k].first_name +" "+ ttrs[k].last_name})}
              renderItem={item => (
                <List.Item>
                  {item}
                </List.Item>
              )}
            />
          }>
            {ttrs.length}
          </Tooltip>
        )
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.table.created_on"
        defaultMessage="Created Time"
      />
    ),
    dataIndex: 'created_on',
    key: 'created_on',
    render: createdOn => (
      epochToJsDate(createdOn)
    )
  }
];

export const colStudentTutorGroup = [
  {
    title: () => (
      <FormattedMessage
          id="pages.manager.groups.table.user_group_name"
          defaultMessage="Name"
        />
    ),
    dataIndex: 'user_group_name',
      key: 'user_group_name',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.table.courses"
        defaultMessage="Course"
      />
    ),
    dataIndex: 'courses',
    key: 'courses',
    render: crss => {
      if(crss === null || crss.length === 0){
        return <FormattedMessage
        id="pages.manager.groups.table.course.none"
        defaultMessage="None -"
       />;
      } else if(crss.length === 1){
          return crss[0].course_name
      } else {
        return (
          <Tooltip placement="topLeft" title={
            <List
              size="small"
              dataSource={Object.keys(crss).map((k) => {return crss[k].course_name})}
              renderItem={item => (
                <List.Item>
                  {item}
                </List.Item>
              )}
            />
          }>
            {crss.length}
          </Tooltip>
        )
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.groups.table.created_on"
        defaultMessage="Created Time"
      />
    ),
    dataIndex: 'created_on',
    key: 'created_on',
    render: createdOn => (
      epochToJsDate(createdOn)
    )
  }
];

export const colGroup = [
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.groups.table.user_group_name"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'user_group_name',
      key: 'user_group_name',
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.groups.table.courses"
          defaultMessage="Course"
        />
      ),
      dataIndex: 'courses',
      key: 'courses',
      render: crss => {
        if(crss === null || crss.length === 0){
          return <FormattedMessage
          id="pages.manager.groups.table.course.none"
          defaultMessage="None -"
         />;
        } else if(crss.length === 1){
            return crss[0].course_name
        } else {
          return (
            <Tooltip placement="topLeft" title={
              <List
                size="small"
                dataSource={Object.keys(crss).map((k) => {return crss[k].course_name})}
                renderItem={item => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            }>
              {crss.length}
            </Tooltip>
          )
        }
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.groups.table.students"
          defaultMessage="Members"
        />
      ),
      dataIndex: 'students',
      key: 'students',
      render: stdnts => {
        if(stdnts === null || stdnts.length === 0){
          return <FormattedMessage
          id="pages.manager.groups.table.course.none"
          defaultMessage="None -"
         />;
        } else if(stdnts.length === 1){
            return stdnts[0].first_name +" "+ stdnts[0].last_name
        } else {
          return (
            <Tooltip placement="topLeft" title={
              <List
                size="small"
                dataSource={Object.keys(stdnts).map((k) => {return stdnts[k].first_name +" "+ stdnts[k].last_name})}
                renderItem={item => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            }>
              {stdnts.length}
            </Tooltip>
          )
        }
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.groups.table.tutors"
          defaultMessage="Tutor"
        />
      ),
      dataIndex: 'tutors',
      key: 'tutors',
      render: ttrs => {
        if(ttrs === null || ttrs.length === 0){
          return <FormattedMessage
          id="pages.manager.groups.table.course.none"
          defaultMessage="None -"
         />;
        } else if(ttrs.length === 1){
            return ttrs[0].first_name +" "+ ttrs[0].last_name
        } else {
          return (
            <Tooltip placement="topLeft" color="white" title={
              <List
                size="small"
                dataSource={Object.keys(ttrs).map((k) => {return ttrs[k].first_name +" "+ ttrs[k].last_name})}
                renderItem={item => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            }>
              {ttrs.length}
            </Tooltip>
          )
        }
      }
    },
    {
      title: () => (
        <FormattedMessage
          id="pages.manager.groups.table.created_on"
          defaultMessage="Created Time"
        />
      ),
      dataIndex: 'created_on',
      key: 'created_on',
      render: createdOn => (
        epochToJsDate(createdOn)
      )
    },
];

export const colQuestions = [
  // {
  //   title: 'ID',
  //   dataIndex: 'question_id',
  //   key: 'question_id',
  // },
  {
    title: 'QUESTION TYPE',
    dataIndex: 'question_type',
    key: 'question_type',
  },
  {
    title: 'QUESTION CONTENT',
    dataIndex: 'question',
    key: 'question',
  },
  {
    title: 'QUESTION CHOICES',
    dataIndex: 'choices',
    key: 'choices',
    render: choices => (
      choices.join(", ")
    )
  },
  {
    title: 'CORRECT ANSWER',
    dataIndex: 'correct_answer',
    key: 'correct_answer',
    render: answer => (
      answer.join(", ")
    )
  },
  {
    title: 'TAGS',
    dataIndex: 'tags',
    key: 'tags',
    render: tags => (
      tags.join(", ")
    )
  },
  // {
  //   title: 'CREATED TIME',
  //   dataIndex: 'created_on',
  //   key: 'created_on',
  //   render: createdOn => (
  //     epochToJsDate(createdOn)
  //   )
  // },
];

export const colCourseVideo = [
  {
    title: <FormattedMessage
      id="pages.manager.courses.videos.table.name"
      defaultMessage="Name"
    />,
    dataIndex: 'name',
    width: 350,
    editable: false,
    render: (name: any, row: any) => {
      if(row.course_name){ return row.course_name} 
      if(row.section_name){ return row.section_name } 
      if(row.subsection_name){ return row.subsection_name } 
      
      if(row.exercise_id){
        return <><FormattedMessage
        id="pages.exercise"
        defaultMessage="Exercise"
      /> {row.exercise_number}</>;
      } 
      return name;
    }
  },
  {
    title: <FormattedMessage
      id="pages.manager.courses.videos.table.videos"
      defaultMessage="Videos"
    />,
    dataIndex: 'videos',
    width: 200,
    editable: true,
  },
  {
    title: '',
    dataIndex: 'operation',
  },
];

export const colCourseSubVideo = [
  {
    title: <FormattedMessage
      id="pages.manager.courses.videos.table.name"
      defaultMessage="Name"
    />,
    dataIndex: 'name',
    width: 300,
    render: (name, row) => {
      if(row.course_name){ return row.course_name} 
      if(row.section_name){ return row.section_name } 
      if(row.subsection_name){ return row.subsection_name } 
      
      if(row.exercise_id){
        return row.exercise_num;
      } 
      return name;
    }
  },
  {
    title: <FormattedMessage
      id="pages.manager.courses.videos.table.videos"
      defaultMessage="Videos"
    />,
    dataIndex: 'videos',
    key: 'videos',
    width: 200,
    render: (vid: object) => {
      if (vid) {
        return (<div>
          {vid.map((video:any)=>
           <Tag color="#2db7f5">{video.video_name}</Tag> 
          )}
        </div>);
      }

      return "-"
    }
  }
];

// Courses with Students Col
export const colCoursewithStudent = [
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.course.table.course_name"
        defaultMessage="Course Name"
      />
    ),
    dataIndex: 'course_name',
    key: 'course_name',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.course.table.description"
        defaultMessage="Description"
      />
    ),
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.course.table.difficulty_level"
        defaultMessage="Difficulty level"
      />
    ),
    dataIndex: 'difficulty_level',
    key: 'difficulty_level',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.course.table.requirements"
        defaultMessage="Requirements"
      />
    ),
    dataIndex: 'requirements',
    key: 'requirements',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.course.table.students"
        defaultMessage="Students"
      />
    ),
    dataIndex: 'students',
    key: 'students',
    render: (students: string | any[] | null) => {
      if(students === null || students.length === 0){
        return 0;
      } else {
        return students.length;
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.manager.course.table.created_on"
        defaultMessage="Created Time"
      />
    ),
    dataIndex: 'created_on',
    key: 'created_on',
    render: createdOn => (
      epochToJsDate(createdOn)
    )
  },
];

// Dashboard Tutor Groups
export const colTutorGroups = [

  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.name"
        defaultMessage="Name"
      />
    ),
    dataIndex: 'user_group_name',
    key: 'user_group_name',
    render: (user_group_name: React.ReactNode) => {
      return user_group_name;
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.progress"
        defaultMessage="Progress"
      />
    ),
    dataIndex: 'round_progress',
    key: 'round_progress',
    render: (progress: number) => {
      return (progress) ? `${progress}%` : "-";
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.age"
        defaultMessage="Age"
      />
    ),
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.least-performer"
        defaultMessage="Least Performer"
      />
    ),
    dataIndex: 'least_performer_student',
    key: 'least_performer_student',
    render: (least_performer_student: string | any[] | null) =>  {
      const leastStudent = least_performer_student;
      if(leastStudent === null || leastStudent.length === 0){
        return "-";
      } else {
        return `${leastStudent[0].first_name} ${leastStudent[0].middle_name} ${leastStudent[0].last_name}`;
      } 
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.next-class"
        defaultMessage="Next Class"
      />
    ),
    dataIndex: 'next_class',
    key: 'next_class',
    render: (next_class: number) => {
      return (next_class !== null && next_class) ? epochToJsDate(next_class) : "-";
    }
  },
];

export const colTutorGroupStudents = [

  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.name"
        defaultMessage="Name"
      />
    ),
    render: (student: { id: string; first_name: string; middle_name: string; last_name: string; }) => {
      return <a key={student.id} href={`/student-progress?student_id=${student.id}`}>{student.first_name} {student.middle_name} {student.last_name}</a>
    }
  },
  /*{
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.progress"
        defaultMessage="Progress"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: (progress: {progress: number}) =>  {
      return (progress) ? `${progress}%` : "-";
    }
  },*/
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.struggles-with"
        defaultMessage="Struggles With"
      />
    ),
    dataIndex: 'struggles_with',
    key: 'struggles_with',
    render: (struggles_with: string) => {
      return (struggles_with) ? struggles_with : "-";
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.last-active"
        defaultMessage="Last Active"
      />
    ),
    dataIndex: 'last_active',
    key: 'last_active',
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.mood"
        defaultMessage="Mood"
      />
    ),
    dataIndex: 'mood',
    key: 'mood',
  },
];

// Dashboard Tutor Students
export const colTutorStudents = [

  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.name"
        defaultMessage="Name"
      />
    ),
    render: (student: { id: string; first_name: string; middle_name: string; last_name: string; }) => {
      return <a key={student.id} href={`/student-progress?student_id=${student.id}`}>{student.first_name} {student.middle_name} {student.last_name}</a>
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.groups"
        defaultMessage="Groups"
      />
    ),
    dataIndex: 'groups',
    key: 'groups',
    render: (groups: string | any[] | null) =>  {
      if(groups === null || groups.length === 0){
        return 0;
      } else if(groups.length === 1){
          return groups[0].user_group_name
      } else {
        return (
          <Tooltip placement="topLeft" color="white" title={
            <List
              size="small"
              dataSource={Object.keys(groups).map((k) => {return groups[k].user_group_name})}
              renderItem={item => (
                <List.Item>
                  {item}
                </List.Item>
              )}
            />
          }>
          {groups.length}
          </Tooltip>
        )
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.struggles-with"
        defaultMessage="Struggles With"
      />
    ),
    dataIndex: 'struggles_with',
    key: 'struggles_with',
    render: (struggles_with: string) => {
      return (struggles_with) ? struggles_with : "-";
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.last-active"
        defaultMessage="Last Active"
      />
    ),
    dataIndex: 'last_active',
    key: 'last_active',
  },
  /* {
    title: () => (
      <FormattedMessage
        id="pages.tutor.table.mood"
        defaultMessage="Mood"
      />
    ),
    dataIndex: 'mood',
    key: 'mood',
  }, */
];

// Tutor Student Progress
export const colTutorStudentProgress = [
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.coursename"
        defaultMessage="COURSE NAME"
      />
    ),
    dataIndex: 'course_title',
    key: 'course_title',
    render: (name: string, course: any) => (
      <a key={course.course_id} href={`/student-progress-course?student_id=${course.account_id}&course_id=${course.course_id}`}>{name}</a>
    )
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.started"
        defaultMessage="STARTED"
      />
    ),
    dataIndex: 'started_on',
    key: 'started_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.update_on"
        defaultMessage="FINISHED"
      />
    ),
    dataIndex: 'end_on',
    key: 'end_on',
    render: date => {
      if(date){
        return epochToJsDatewithTime(date)
      } else {
        return "-"
      }
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.progress"
        defaultMessage="PROGRESS"
      />
    ),
    dataIndex: 'progress',
    key: 'progress',
    render: progress =>  {
      return (progress) ? `${progress}%` : "-";
    }
  },
  {
    title: () => (
      <FormattedMessage
        id="pages.tutor.courses.table.score"
        defaultMessage="SCORE"
      />
    ),
    dataIndex: 'score',
    key: 'score',
    render: score =>  {
      return (score) ? `${score}%` : "-";
    }
  }
];
